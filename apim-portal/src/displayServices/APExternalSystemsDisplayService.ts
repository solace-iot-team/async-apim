import { IAPEntityIdDisplay } from '../utils/APEntityIdsService';
import APSearchContentService, { IAPSearchContent } from '../utils/APSearchContentService';
import { 
  APSExternalSystem, 
  ApsExternalSystemsService, 
  APSExternalSystemUpdate, 
  ListAPSExternalSystemsResponse 
} from '../_generated/@solace-iot-team/apim-server-openapi-browser';
import APBusinessGroupsDisplayService, { 
  TAPBusinessGroupDisplayList 
} from './APBusinessGroupsDisplayService';

export type TAPExternalSystemDisplay = IAPEntityIdDisplay & IAPSearchContent & {
  apsExternalSystem: APSExternalSystem;
  apBusinessGroupExternalDisplayList: TAPBusinessGroupDisplayList;
}
export type TAPExternalSystemDisplayList = Array<TAPExternalSystemDisplay>;

class APExternalSystemsDisplayService {
  private readonly BaseComponentName = "APExternalSystemsDisplayService";

  private create_EmptyApsExternalSystem(): APSExternalSystem {
    return {
      displayName: '',
      externalSystemId: '',
      description: '',
    };
  }

  public create_EmptyObject(): TAPExternalSystemDisplay {
    return this.create_ApExternalSystemDisplay_From_ApiEntities(
      this.create_EmptyApsExternalSystem(),
      []
    );
  }

  protected create_ApExternalSystemDisplay_From_ApiEntities(apsExternalSystem: APSExternalSystem, apBusinessGroupDisplayList: TAPBusinessGroupDisplayList): TAPExternalSystemDisplay {
    const base: TAPExternalSystemDisplay = {
      apEntityId: {
        id: apsExternalSystem.externalSystemId,
        displayName: apsExternalSystem.displayName
      },
      apsExternalSystem: apsExternalSystem,
      apBusinessGroupExternalDisplayList: apBusinessGroupDisplayList,
      apSearchContent: ''
    };
    return APSearchContentService.add_SearchContent<TAPExternalSystemDisplay>(base);
  }

  // ********************************************************************************************************************************
  // API calls
  // ********************************************************************************************************************************

  public async listApExternalSystemDisplay_ByCapability_InteractiveImportBusinessGroups({ organizationId}: {
    organizationId: string;
  }): Promise<TAPExternalSystemDisplayList> {
    // TODO: switch on once implemented
    // const all = await this.listApExternalSystemDisplay({ 
    //   organizationId: organizationId
    // });
    // return  all.filter( (x: TAPExternalSystemDisplay) => {
    //   return x.apsExternalSystem.capabilityList.include('interactiveImportBusinessGroupCapability');
    // });
    return [];
  }

  public async apiGetList_ApExternalSystemDisplay({ organizationId}: {
    organizationId: string;
  }): Promise<TAPExternalSystemDisplayList> {

    // const funcName = 'apiGetList_ApExternalSystemDisplay';
    // const logName = `${this.BaseComponentName}.${funcName}()`;

    const response: ListAPSExternalSystemsResponse = await ApsExternalSystemsService.listApsExternalSystems({
      organizationId: organizationId
    });
    const list: TAPExternalSystemDisplayList = [];
    for(const apsExternalSystem of response.list) {
      // console.log(`${logName}: apsExternalSystem.externalSystemId=${apsExternalSystem.externalSystemId}, apsExternalSystem.displayName=${apsExternalSystem.displayName}`);
      const apBusinessGroupDisplayList: TAPBusinessGroupDisplayList = await APBusinessGroupsDisplayService.apsGetList_ApBusinessGroupSystemDisplay_By_ExternalSystem({
        organizationId: organizationId,
        externalSystemId: apsExternalSystem.externalSystemId
      });
      list.push(this.create_ApExternalSystemDisplay_From_ApiEntities(apsExternalSystem, apBusinessGroupDisplayList));
    }
    // alert(`${logName}: see console log`);
    return list;
  }
  
  public async apiGet_ApExternalSystemDisplay({ organizationId, externalSystemId }: {
    organizationId: string;
    externalSystemId: string;
  }): Promise<TAPExternalSystemDisplay> {
    // const funcName = 'apiGet_ApExternalSystemDisplay';
    // const logName = `${this.BaseComponentName}.${funcName}()`;

    const apsExternalSystem: APSExternalSystem = await ApsExternalSystemsService.getApsExternalSystem({
      organizationId: organizationId,
      externalSystemId: externalSystemId
    });
    const apBusinessGroupDisplayList: TAPBusinessGroupDisplayList = await APBusinessGroupsDisplayService.apsGetList_ApBusinessGroupSystemDisplay_By_ExternalSystem({
      organizationId: organizationId,
      externalSystemId: apsExternalSystem.externalSystemId
    });
    // alert(`${logName}: apBusinessGroupDisplayList = ${JSON.stringify(apBusinessGroupDisplayList)}`);
    return this.create_ApExternalSystemDisplay_From_ApiEntities(apsExternalSystem, apBusinessGroupDisplayList);
  }

  public async apiCreate_ApExternalSystemDisplay({ organizationId, apExternalSystemDisplay }: {
    organizationId: string;
    apExternalSystemDisplay: TAPExternalSystemDisplay
  }): Promise<void> {
    await ApsExternalSystemsService.createApsExternalSystem({
      organizationId: organizationId,
      requestBody: apExternalSystemDisplay.apsExternalSystem
    });
  }

  public async apiUpdate_ApExternalSystemDisplay({ organizationId, apExternalSystemDisplay }: {
    organizationId: string;
    apExternalSystemDisplay: TAPExternalSystemDisplay
  }): Promise<void> {
    const patch: APSExternalSystemUpdate = {
      displayName: apExternalSystemDisplay.apsExternalSystem.displayName,
      description: apExternalSystemDisplay.apsExternalSystem.description,
    }
    await ApsExternalSystemsService.updateApsExternalSystem({
      organizationId: organizationId,
      externalSystemId: apExternalSystemDisplay.apEntityId.id,
      requestBody: patch
    });
  }

  public async apiDelete_ApExternalSystemDisplay({ organizationId, externalSystemId }: {
    organizationId: string;
    externalSystemId: string;
  }): Promise<void> {
    await ApsExternalSystemsService.deleteApsExternalSystem({
      organizationId: organizationId,
      externalSystemId: externalSystemId
    });
  }
}

export default new APExternalSystemsDisplayService();