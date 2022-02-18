import { IAPEntityIdDisplay } from '../utils/APEntityIdsService';
import APSearchContentService, { IAPSearchContent } from '../utils/APSearchContentService';
import { 
  APSBusinessGroupExternalResponseList,
  ApsBusinessGroupsService,
  APSExternalSystem, 
  ApsExternalSystemsService, 
  APSExternalSystemUpdate, 
  ListAPSBusinessGroupsExternalSystemResponse, 
  ListAPSExternalSystemsResponse 
} from '../_generated/@solace-iot-team/apim-server-openapi-browser';

export type TAPExternalSystemDisplay = IAPEntityIdDisplay & IAPSearchContent & {
  apsExternalSystem: APSExternalSystem;
  apsBusinessGroupExternalResponseList: APSBusinessGroupExternalResponseList;
}
export type TAPExternalSystemDisplayList = Array<TAPExternalSystemDisplay>;

class APExternalSystemsService {
  private readonly BaseComponentName = "APExternalSystemsService";

  private create_EmptyApsExternalSystem(): APSExternalSystem {
    return {
      displayName: '',
      externalSystemId: ''
    };
  }

  public create_EmptyObject(): TAPExternalSystemDisplay {
    return this.create_ApExternalSystemDisplay_From_ApiEntities(
      this.create_EmptyApsExternalSystem(),
      []
    );
  }

  protected create_ApExternalSystemDisplay_From_ApiEntities(apsExternalSystem: APSExternalSystem, apsBusinessGroupExternalResponseList: APSBusinessGroupExternalResponseList): TAPExternalSystemDisplay {
    const base: TAPExternalSystemDisplay = {
      apEntityId: {
        id: apsExternalSystem.externalSystemId,
        displayName: apsExternalSystem.displayName
      },
      apsExternalSystem: apsExternalSystem,
      apsBusinessGroupExternalResponseList: apsBusinessGroupExternalResponseList,
      apSearchContent: ''
    };
    return APSearchContentService.add_SearchContent<TAPExternalSystemDisplay>(base);
  }

  // public generateGlobalSearchContent(apProductDisplay: TAPApiProductDisplay): string {
  //   return Globals.generateDeepObjectValuesString(apProductDisplay).toLowerCase();
  // }

  // public getApApiDisplayNameListAsString(displayNameList: Array<string> ): string {
  //   if(displayNameList.length > 0) return displayNameList.join(', ');
  //   else return '';
  // }

  public async listApExternalSystemDisplay({ organizationId}: {
    organizationId: string;
  }): Promise<TAPExternalSystemDisplayList> {

    // const funcName = 'listApExternalSystemDisplay';
    // const logName = `${this.BaseComponentName}.${funcName}()`;

    const response: ListAPSExternalSystemsResponse = await ApsExternalSystemsService.listApsExternalSystems({
      organizationId: organizationId
    });
    const list: TAPExternalSystemDisplayList = [];
    for(const apsExternalSystem of response.list) {
      // TODO: use APBusinessGroupsService for this
      const listBusinessGroupsResponse: ListAPSBusinessGroupsExternalSystemResponse = await ApsBusinessGroupsService.listApsBusinessGroupsByExternalSystem({
        organizationId: organizationId,
        externalSystemId: apsExternalSystem.externalSystemId
      });  
      list.push(this.create_ApExternalSystemDisplay_From_ApiEntities(apsExternalSystem, listBusinessGroupsResponse.list));
    }
    return list;
  }
  
  public async getApExternalSystemDisplay({ organizationId, externalSystemId }: {
    organizationId: string;
    externalSystemId: string;
  }): Promise<TAPExternalSystemDisplay> {
    const apsExternalSystem: APSExternalSystem = await ApsExternalSystemsService.getApsExternalSystem({
      organizationId: organizationId,
      externalSystemId: externalSystemId
    });
    // TODO: use APBusinessGroupsService for this
    const listBusinessGroupsResponse: ListAPSBusinessGroupsExternalSystemResponse = await ApsBusinessGroupsService.listApsBusinessGroupsByExternalSystem({
      organizationId: organizationId,
      externalSystemId: externalSystemId
    });
    return this.create_ApExternalSystemDisplay_From_ApiEntities(apsExternalSystem, listBusinessGroupsResponse.list);
  }

  public async createApExternalSystemDisplay({ organizationId, apExternalSystemDisplay }: {
    organizationId: string;
    apExternalSystemDisplay: TAPExternalSystemDisplay
  }): Promise<void> {
    await ApsExternalSystemsService.createApsExternalSystem({
      organizationId: organizationId,
      requestBody: apExternalSystemDisplay.apsExternalSystem
    });
  }

  public async updateApExternalSystemDisplay({ organizationId, apExternalSystemDisplay }: {
    organizationId: string;
    apExternalSystemDisplay: TAPExternalSystemDisplay
  }): Promise<void> {
    const patch: APSExternalSystemUpdate = {
      displayName: apExternalSystemDisplay.apsExternalSystem.displayName
    }
    await ApsExternalSystemsService.updateApsExternalSystem({
      organizationId: organizationId,
      externalSystemId: apExternalSystemDisplay.apEntityId.id,
      requestBody: patch
    });
  }

  public async deleteApExternalSystemDisplay({ organizationId, externalSystemId }: {
    organizationId: string;
    externalSystemId: string;
  }): Promise<void> {
    await ApsExternalSystemsService.deleteApsExternalSystem({
      organizationId: organizationId,
      externalSystemId: externalSystemId
    });
  }
}

export default new APExternalSystemsService();
