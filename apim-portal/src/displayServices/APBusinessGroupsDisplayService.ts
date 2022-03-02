import APEntityIdsService, { IAPEntityIdDisplay, TAPEntityId, TAPEntityIdList } from '../utils/APEntityIdsService';
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
  APSExternalSystemList,
  APSExternalSystem
} from '../_generated/@solace-iot-team/apim-server-openapi-browser';

// TODO: create this type based on primereact TreeNode, replacing data:any with data: TAPBusinessGroupDisplay
export type TAPBusinessGroupTreeNodeDisplay = {
  key: string;
  label: string;
  data: TAPBusinessGroupDisplay;
  children: TAPBusinessGroupTreeNodeDisplayList;
}
export type TAPBusinessGroupTreeNodeDisplayList = Array<TAPBusinessGroupTreeNodeDisplay>;

export type TAPBusinessGroupDisplay = IAPEntityIdDisplay & IAPSearchContent & {
  apsBusinessGroupResponse: APSBusinessGroupResponse;
  apExternalReference?: APSExternalReference & {
    externalSystemDisplayName: string;
  },
  apBusinessGroupParentEntityId?: TAPEntityId;
  apBusinessGroupChildrenEntityIdList: TAPEntityIdList;
}
export type TAPBusinessGroupDisplayList = Array<TAPBusinessGroupDisplay>;

class APBusinessGroupsDisplayService {
  private readonly BaseComponentName = "APBusinessGroupsDisplayService";

  private create_EmptyApsBusinessGroup(apBusinessGroupParentEntityId: TAPEntityId | undefined): APSBusinessGroupResponse {
    const bg: APSBusinessGroupResponse = {
      businessGroupId: '',
      displayName: '',
      description: '',
      businessGroupChildIds: [],
    };
    if(apBusinessGroupParentEntityId !== undefined) {
      bg.businessGroupParentId = apBusinessGroupParentEntityId.id
    }
    return bg;
  }

  public create_EmptyObject(apBusinessGroupParentEntityId: TAPEntityId | undefined): TAPBusinessGroupDisplay {
    return this.create_ApBusinessGroupDisplay_From_ApiEntities({
      apsBusinessGroupResponse: this.create_EmptyApsBusinessGroup(apBusinessGroupParentEntityId),
      externalSystemDisplayName: undefined,
      apParentBusinessGroupEntityId: apBusinessGroupParentEntityId,
      apBusinessGroupChildrenEntityIdList: []
    });
  }

  public isDeleteAllowed(apBusinessGroupDisplay: TAPBusinessGroupDisplay): boolean {
    if(apBusinessGroupDisplay.apBusinessGroupParentEntityId === undefined) return false; // this is the root
    if(apBusinessGroupDisplay.apExternalReference !== undefined) return false;
    if(apBusinessGroupDisplay.apsBusinessGroupResponse.businessGroupChildIds.length > 0) return false;
    return true;
  }

  public isAddChildAllowed(apBusinessGroupDisplay: TAPBusinessGroupDisplay): boolean {
    if(apBusinessGroupDisplay.apExternalReference !== undefined) return false;
    return true;
  }

  public isEditAllowed(apBusinessGroupDisplay: TAPBusinessGroupDisplay): boolean {
    if(apBusinessGroupDisplay.apExternalReference !== undefined) return false;
    return true;
  }

  public getSourceDisplayString(apBusinessGroupDisplay: TAPBusinessGroupDisplay): string {
    if(apBusinessGroupDisplay.apExternalReference !== undefined) return apBusinessGroupDisplay.apExternalReference.externalSystemDisplayName;
    else return '-';
  }

  private create_ApBusinessGroupTreeNodeDisplay_From_ApBusinessGroupDisplay(apBusinessGroupDisplay: TAPBusinessGroupDisplay): TAPBusinessGroupTreeNodeDisplay {
    // const funcName = 'create_ApBusinessGroupTreeNodeDisplay_From_ApBusinessGroupDisplay';
    // const logName = `${this.BaseComponentName}.${funcName}()`;
    const tnDisplay: TAPBusinessGroupTreeNodeDisplay = {
      key: apBusinessGroupDisplay.apEntityId.id,
      label: apBusinessGroupDisplay.apEntityId.displayName,
      data: apBusinessGroupDisplay,
      children: []
    };
    // console.log(`${logName}: key = ${tnDisplay.key}`);
    return tnDisplay;
  }

  private generate_ApBusinessGroupTreeNodeDisplay_From_ApBusinessGroupDisplay(apBusinessGroupDisplay: TAPBusinessGroupDisplay, referenceApBusinessGroupDisplayList: TAPBusinessGroupDisplayList): TAPBusinessGroupTreeNodeDisplay {
    const funcName = 'generate_ApBusinessGroupTreeNodeDisplay_From_ApBusinessGroupDisplay';
    const logName = `${this.BaseComponentName}.${funcName}()`;
    const thisTreeNode: TAPBusinessGroupTreeNodeDisplay = this.create_ApBusinessGroupTreeNodeDisplay_From_ApBusinessGroupDisplay(apBusinessGroupDisplay);
    for(const childId of apBusinessGroupDisplay.apsBusinessGroupResponse.businessGroupChildIds) {
      // find it and add it
      const found: TAPBusinessGroupDisplay | undefined = referenceApBusinessGroupDisplayList.find( (x) => {
        return x.apEntityId.id === childId;
      });
      if(found === undefined) throw new Error(`${logName}: cannot find childId in apBusinessGroupDisplayList, childId=${childId}, apBusinessGroupDisplayList=${JSON.stringify(referenceApBusinessGroupDisplayList, null, 2)}`);
      // recurse into child
      const childTreeNodeDisplay: TAPBusinessGroupTreeNodeDisplay = this.generate_ApBusinessGroupTreeNodeDisplay_From_ApBusinessGroupDisplay(found, referenceApBusinessGroupDisplayList);
      thisTreeNode.children.push(childTreeNodeDisplay);
    }
    return thisTreeNode;
  }

  public generate_ApBusinessGroupTreeNodeDisplayList_From_ApBusinessGroupDisplayList(referenceApBusinessGroupDisplayList: TAPBusinessGroupDisplayList): TAPBusinessGroupTreeNodeDisplayList {
    const list: TAPBusinessGroupTreeNodeDisplayList = [];
    for(const apBusinessGroupDisplay of referenceApBusinessGroupDisplayList) {
      if(apBusinessGroupDisplay.apsBusinessGroupResponse.businessGroupParentId === undefined) {
        const masterTreeNode: TAPBusinessGroupTreeNodeDisplay = this.generate_ApBusinessGroupTreeNodeDisplay_From_ApBusinessGroupDisplay(apBusinessGroupDisplay, referenceApBusinessGroupDisplayList);
        // // find all the children
        // for(const childId of apBusinessGroupDisplay.apsBusinessGroupResponse.businessGroupChildIds) {
        //   // find it and add it
        //   const found = apBusinessGroupDisplayList.find( (x) => {
        //     return x.apEntityId.id === childId;
        //   });
        //   if(found === undefined) throw new Error(`${logName}: cannot find childId in apBusinessGroupDisplayList, childId=${childId}, apBusinessGroupDisplayList=${JSON.stringify(apBusinessGroupDisplayList, null, 2)}`);
        //   // create child display list
        // masterTreeNode.children.push(this.create_ApBusinessGroupTreeNode_From_ApBusinessGroupDisplay(found));
        list.push(masterTreeNode);
      }
    }
    return list;
  }

  public find_root_ApBusinessGroupDisplay({completeApOrganizationBusinessGroupDisplayList}: {
    completeApOrganizationBusinessGroupDisplayList: TAPBusinessGroupDisplayList;
  }): TAPBusinessGroupDisplay {
    const funcName = 'find_root_ApBusinessGroupDisplay';
    const logName = `${this.BaseComponentName}.${funcName}()`;

    const rootApBusinessGroupDisplay: TAPBusinessGroupDisplay | undefined = completeApOrganizationBusinessGroupDisplayList.find( (x) => {
      return x.apBusinessGroupParentEntityId === undefined;
    });
    if(rootApBusinessGroupDisplay === undefined) throw new Error(`${logName}: rootApBusinessGroupDisplay === undefined`);
    return rootApBusinessGroupDisplay;
  }

  public find_ApBusinessGroupDisplay_by_id({apBusinessGroupDisplayList, businessGroupId }: {
    apBusinessGroupDisplayList: TAPBusinessGroupDisplayList;
    businessGroupId: string;
  }): TAPBusinessGroupDisplay {
    const funcName = 'find_ApBusinessGroupDisplay_by_id';
    const logName = `${this.BaseComponentName}.${funcName}()`;

    const found = apBusinessGroupDisplayList.find( (x) => {
      return x.apEntityId.id === businessGroupId;
    });
    if(found === undefined) throw new Error(`${logName}: found === undefined`);
    return found;
  }

  protected create_ApBusinessGroupDisplay_From_ApiEntities({apsBusinessGroupResponse, externalSystemDisplayName, apParentBusinessGroupEntityId, apBusinessGroupChildrenEntityIdList}: {
    apsBusinessGroupResponse: APSBusinessGroupResponse;
    externalSystemDisplayName?: string;
    apParentBusinessGroupEntityId?: TAPEntityId;
    apBusinessGroupChildrenEntityIdList: TAPEntityIdList;
  }): TAPBusinessGroupDisplay {
    const base: TAPBusinessGroupDisplay = {
      apEntityId: {
        id: apsBusinessGroupResponse.businessGroupId,
        displayName: apsBusinessGroupResponse.displayName
      },
      apsBusinessGroupResponse: apsBusinessGroupResponse,
      apSearchContent: '',
      apBusinessGroupParentEntityId: apParentBusinessGroupEntityId,
      apBusinessGroupChildrenEntityIdList: APEntityIdsService.sort_byDisplayName(apBusinessGroupChildrenEntityIdList)
    };
    if(apsBusinessGroupResponse.externalReference !== undefined && externalSystemDisplayName !== undefined) {
      base.apExternalReference = {
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

  private async getApBusinessGroupEntityId(organizationId: string, businessGroupId: string): Promise<TAPEntityId> {
    const apsBusinessGroupResponse: APSBusinessGroupResponse = await ApsBusinessGroupsService.getApsBusinessGroup({
      organizationId: organizationId,
      businessgroupId: businessGroupId
    });
    return {
      id: apsBusinessGroupResponse.businessGroupId,
      displayName: apsBusinessGroupResponse.displayName
    }
  }

  private async getApBusinessGroupEntityIdList(organizationId: string, businessGroupIdList: Array<string>): Promise<TAPEntityIdList> {
    const entityIdList: TAPEntityIdList = [];
    for(const id of businessGroupIdList) {
      const apsBusinessGroupResponse: APSBusinessGroupResponse = await ApsBusinessGroupsService.getApsBusinessGroup({
        organizationId: organizationId,
        businessgroupId: id
      });
      entityIdList.push({
        id: apsBusinessGroupResponse.businessGroupId,
        displayName: apsBusinessGroupResponse.displayName
      });
    }
    return entityIdList;
  }

  public async apsGetList_ApBusinessGroupSystemDisplayList({ organizationId}: {
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
      list.push(this.create_ApBusinessGroupDisplay_From_ApiEntities({
        apsBusinessGroupResponse: apsBusinessGroupResponse,
        externalSystemDisplayName: this.getExternalSystemDisplayName(extSystemsListResponse.list, apsBusinessGroupResponse.externalReference),
        apParentBusinessGroupEntityId: apsBusinessGroupResponse.businessGroupParentId !== undefined ? await this.getApBusinessGroupEntityId(organizationId, apsBusinessGroupResponse.businessGroupParentId) : undefined,
        apBusinessGroupChildrenEntityIdList: await this.getApBusinessGroupEntityIdList(organizationId, apsBusinessGroupResponse.businessGroupChildIds)
      }));
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
      list.push(this.create_ApBusinessGroupDisplay_From_ApiEntities({
        apsBusinessGroupResponse: apsBusinessGroupResponse,
        externalSystemDisplayName: undefined,
        apParentBusinessGroupEntityId: apsBusinessGroupResponse.businessGroupParentId !== undefined ? await this.getApBusinessGroupEntityId(organizationId, apsBusinessGroupResponse.businessGroupParentId) : undefined,
        apBusinessGroupChildrenEntityIdList: await this.getApBusinessGroupEntityIdList(organizationId, apsBusinessGroupResponse.businessGroupChildIds)
      }));
    }
    return list;
  }

  public async getRootApBusinessGroupEntityId({organizationId}:{
    organizationId: string
  }): Promise<TAPEntityId> {
    const apsBusinessGroupResponse: APSBusinessGroupResponse = await ApsBusinessGroupsService.getApsBusinessGroup({
      organizationId: organizationId,
      businessgroupId: organizationId
    });
    return {
      id: apsBusinessGroupResponse.businessGroupId,
      displayName: apsBusinessGroupResponse.displayName
    }
  }

  public async getRootApBusinessGroupDisplay({organizationId}:{
    organizationId: string
  }): Promise<TAPBusinessGroupDisplay> {
    return await this.getApBusinessGroupDisplay({ 
      organizationId: organizationId,
      businessGroupId: organizationId
    });
  }

  public async getApBusinessGroupDisplay({ organizationId, businessGroupId }: {
    organizationId: string;
    businessGroupId: string;
  }): Promise<TAPBusinessGroupDisplay> {
    const apsBusinessGroupResponse: APSBusinessGroupResponse = await ApsBusinessGroupsService.getApsBusinessGroup({
      organizationId: organizationId,
      businessgroupId: businessGroupId
    });
    // external system display name
    let externalSystemDisplayName: string | undefined;
    if(apsBusinessGroupResponse.externalReference !== undefined) {
      const apsExternalSystem: APSExternalSystem = await ApsExternalSystemsService.getApsExternalSystem({
        organizationId: organizationId,
        externalSystemId: apsBusinessGroupResponse.externalReference.externalSystemId
      });
      externalSystemDisplayName = apsExternalSystem.displayName;
    }
    return this.create_ApBusinessGroupDisplay_From_ApiEntities({
      apsBusinessGroupResponse: apsBusinessGroupResponse,
      externalSystemDisplayName: externalSystemDisplayName,
      apParentBusinessGroupEntityId: apsBusinessGroupResponse.businessGroupParentId !== undefined ? await this.getApBusinessGroupEntityId(organizationId, apsBusinessGroupResponse.businessGroupParentId) : undefined,
      apBusinessGroupChildrenEntityIdList: await this.getApBusinessGroupEntityIdList(organizationId, apsBusinessGroupResponse.businessGroupChildIds)
    });
  }

  public async getApBusinessGroupDisplayByExternalReference({ organizationId, externalReferenceId }: {
    organizationId: string;
    externalReferenceId: string;
  }): Promise<TAPBusinessGroupDisplay> {
    const apsBusinessGroupResponse: APSBusinessGroupResponse = await ApsBusinessGroupsService.getApsBusinessGroupByExternalReference({
      organizationId: organizationId,
      externalReferenceId: externalReferenceId
    });
    return this.create_ApBusinessGroupDisplay_From_ApiEntities({
      apsBusinessGroupResponse: apsBusinessGroupResponse,
      externalSystemDisplayName: undefined,
      apParentBusinessGroupEntityId: apsBusinessGroupResponse.businessGroupParentId !== undefined ? await this.getApBusinessGroupEntityId(organizationId, apsBusinessGroupResponse.businessGroupParentId) : undefined,
      apBusinessGroupChildrenEntityIdList: await this.getApBusinessGroupEntityIdList(organizationId, apsBusinessGroupResponse.businessGroupChildIds)
    });
  }

  public async createApBusinessGroupDisplay({ organizationId, apBusinessGroupDisplay }: {
    organizationId: string;
    apBusinessGroupDisplay: TAPBusinessGroupDisplay
  }): Promise<void> {
    const funcName = 'createApBusinessGroupDisplay';
    const logName = `${this.BaseComponentName}.${funcName}()`;

    if(apBusinessGroupDisplay.apsBusinessGroupResponse.businessGroupParentId === undefined) throw new Error(`${logName}: apBusinessGroupDisplay.apsBusinessGroupResponse.businessGroupParentId === undefined`);
    const create: APSBusinessGroupCreate = {
      businessGroupParentId: apBusinessGroupDisplay.apsBusinessGroupResponse.businessGroupParentId,
      businessGroupId: apBusinessGroupDisplay.apEntityId.id,
      displayName: apBusinessGroupDisplay.apEntityId.displayName,
      description: apBusinessGroupDisplay.apsBusinessGroupResponse.description,
      externalReference: apBusinessGroupDisplay.apsBusinessGroupResponse.externalReference,
    }
    await ApsBusinessGroupsService.createApsBusinessGroup({
      organizationId: organizationId,
      requestBody: create
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

export default new APBusinessGroupsDisplayService();
