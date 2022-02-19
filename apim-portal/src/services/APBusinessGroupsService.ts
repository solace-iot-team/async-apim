import { IAPEntityIdDisplay } from '../utils/APEntityIdsService';
import APSearchContentService, { IAPSearchContent } from '../utils/APSearchContentService';
import { 
  APSBusinessGroupResponse,
  ApsBusinessGroupsService,
  ListAPSBusinessGroupsResponse,
  APSBusinessGroupCreate,
  APSBusinessGroupUpdate,
  APSExternalReference,
  ApsExternalSystemsService,
  ListAPSExternalSystemsResponse,
  APSExternalSystemList
} from '../_generated/@solace-iot-team/apim-server-openapi-browser';

export type TAPBusinessGroupDisplay = IAPEntityIdDisplay & IAPSearchContent & {
  apsBusinessGroupResponse: APSBusinessGroupResponse;
  apExternalRefernce?: APSExternalReference & {
    externalSystemDisplayName: string;
  },
}
export type TAPBusinessGroupDisplayList = Array<TAPBusinessGroupDisplay>;

class APBusinessGroupsService {
  private readonly BaseComponentName = "APBusinessGroupsService";

  private create_EmptyApsBusinessGroup(): APSBusinessGroupResponse {
    return {
      businessGroupId: '',
      displayName: '',
      description: '',
      businessGroupChildIds: [],
    };
  }

  public create_EmptyObject(): TAPBusinessGroupDisplay {
    return this.create_ApBusinessGroupDisplay_From_ApiEntities(
      this.create_EmptyApsBusinessGroup(),
    );
  }

  protected create_ApBusinessGroupDisplay_From_ApiEntities(apsBusinessGroupResponse: APSBusinessGroupResponse, externalSystemDisplayName?: string): TAPBusinessGroupDisplay {
    const base: TAPBusinessGroupDisplay = {
      apEntityId: {
        id: apsBusinessGroupResponse.businessGroupId,
        displayName: apsBusinessGroupResponse.displayName
      },
      apsBusinessGroupResponse: apsBusinessGroupResponse,
      apSearchContent: ''
    };
    if(apsBusinessGroupResponse.externalReference !== undefined && externalSystemDisplayName !== undefined) {
      base.apExternalRefernce = {
        ...apsBusinessGroupResponse.externalReference,
        externalSystemDisplayName: externalSystemDisplayName
      }
    }
    return APSearchContentService.add_SearchContent<TAPBusinessGroupDisplay>(base);
  }

  // public generateGlobalSearchContent(apProductDisplay: TAPApiProductDisplay): string {
  //   return Globals.generateDeepObjectValuesString(apProductDisplay).toLowerCase();
  // }

  // public getApApiDisplayNameListAsString(displayNameList: Array<string> ): string {
  //   if(displayNameList.length > 0) return displayNameList.join(', ');
  //   else return '';
  // }

  private getExternalSystemDisplayName = (apsExternalSystemList: APSExternalSystemList, externalReference?: APSExternalReference): string | undefined => {
    if(externalReference === undefined) return undefined;
    const found = apsExternalSystemList.find( (x) => {
      return x.externalSystemId === externalReference?.externalSystemId;
    });
    if(found) return found.displayName;
    return undefined;
  }

  public async listApBusinessGroupSystemDisplay({ organizationId}: {
    organizationId: string;
  }): Promise<TAPBusinessGroupDisplayList> {

    // const funcName = 'listApBusinessGroupSystemDisplay';
    // const logName = `${this.BaseComponentName}.${funcName}()`;

    const listResponse: ListAPSBusinessGroupsResponse = await ApsBusinessGroupsService.listApsBusinessGroups({
      organizationId: organizationId
    });
    // get all external systems
    const extSystemsListResponse: ListAPSExternalSystemsResponse = await ApsExternalSystemsService.listApsExternalSystems({
      organizationId: organizationId
    });
    const list: TAPBusinessGroupDisplayList = [];
    for(const apsBusinessGroupResponse of listResponse.list) {
      list.push(this.create_ApBusinessGroupDisplay_From_ApiEntities(apsBusinessGroupResponse, this.getExternalSystemDisplayName(extSystemsListResponse.list, apsBusinessGroupResponse.externalReference)));
    }
    return list;
  }

  public async listApBusinessGroupSystemDisplayByExternalSystem({ organizationId, externalSystemId }: {
    organizationId: string;
    externalSystemId: string;
  }): Promise<TAPBusinessGroupDisplayList> {

    // const funcName = 'listApBusinessGroupSystemDisplay';
    // const logName = `${this.BaseComponentName}.${funcName}()`;

    const listResponse: ListAPSBusinessGroupsResponse = await ApsBusinessGroupsService.listApsBusinessGroupsByExternalSystem({
      organizationId: organizationId,
      externalSystemId: externalSystemId
    });
    const list: TAPBusinessGroupDisplayList = [];
    for(const apsBusinessGroupResponse of listResponse.list) {
      list.push(this.create_ApBusinessGroupDisplay_From_ApiEntities(apsBusinessGroupResponse));
    }
    return list;
  }

  public async getApBusinessGroupDisplay({ organizationId, businessGroupId }: {
    organizationId: string;
    businessGroupId: string;
  }): Promise<TAPBusinessGroupDisplay> {
    const apsBusinessGroupResponse: APSBusinessGroupResponse = await ApsBusinessGroupsService.getApsBusinessGroup({
      organizationId: organizationId,
      businessgroupId: businessGroupId
    })
    return this.create_ApBusinessGroupDisplay_From_ApiEntities(apsBusinessGroupResponse);
  }

  public async getApBusinessGroupDisplayByExternalReference({ organizationId, externalReferenceId }: {
    organizationId: string;
    externalReferenceId: string;
  }): Promise<TAPBusinessGroupDisplay> {
    const apsBusinessGroupResponse: APSBusinessGroupResponse = await ApsBusinessGroupsService.getApsBusinessGroupByExternalReference({
      organizationId: organizationId,
      externalReferenceId: externalReferenceId
    })
    return this.create_ApBusinessGroupDisplay_From_ApiEntities(apsBusinessGroupResponse);
  }

  public async createApBusinessGroupDisplay({ organizationId, apBusinessGroupDisplay }: {
    organizationId: string;
    apBusinessGroupDisplay: TAPBusinessGroupDisplay
  }): Promise<void> {
    const create: APSBusinessGroupCreate = {
      businessGroupId: apBusinessGroupDisplay.apEntityId.id,
      displayName: apBusinessGroupDisplay.apEntityId.displayName,
      description: apBusinessGroupDisplay.apsBusinessGroupResponse.description,
      businessGroupParentId: apBusinessGroupDisplay.apsBusinessGroupResponse.businessGroupParentId,
      externalReference: apBusinessGroupDisplay.apsBusinessGroupResponse.externalReference,
    }
    await ApsBusinessGroupsService.createApsBusinessGroup({
      organizationId: organizationId,
      requestBody: apBusinessGroupDisplay.apsBusinessGroupResponse
    })
  }

  public async updateApBusinessGroupDisplay({ organizationId, apBusinessGroupDisplay }: {
    organizationId: string;
    apBusinessGroupDisplay: TAPBusinessGroupDisplay
  }): Promise<void> {
    const patch: APSBusinessGroupUpdate = {
      displayName: apBusinessGroupDisplay.apEntityId.displayName,
      description: apBusinessGroupDisplay.apsBusinessGroupResponse.description,
      externalReference: apBusinessGroupDisplay.apsBusinessGroupResponse.externalReference
    }
    await ApsBusinessGroupsService.updateApsBusinessGroup({
      organizationId: organizationId,
      businessgroupId: apBusinessGroupDisplay.apEntityId.id,
      requestBody: patch
    });
  }

  public async deleteApBusinessGroupDisplay({ organizationId, businessGroupId }: {
    organizationId: string;
    businessGroupId: string;
  }): Promise<void> {
    await ApsBusinessGroupsService.deleteApsBusinessGroup({
      organizationId: organizationId,
      businessgroupId: businessGroupId
    });
  }
}

export default new APBusinessGroupsService();
