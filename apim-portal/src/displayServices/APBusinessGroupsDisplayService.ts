import APAdminPortalApiProductsDisplayService from '../admin-portal/displayServices/APAdminPortalApiProductsDisplayService';
import APEntityIdsService, { IAPEntityIdDisplay, TAPEntityId, TAPEntityIdList } from '../utils/APEntityIdsService';
import APSearchContentService, { IAPSearchContent } from '../utils/APSearchContentService';
import { Globals } from '../utils/Globals';
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
  APSExternalSystem,
  APSUserIdList,
  APSBusinessGroupResponseList
} from '../_generated/@solace-iot-team/apim-server-openapi-browser';
import { TAPMemberOfBusinessGroupTreeTableNodeList } from './APUsersDisplayService/APMemberOfService';

// TODO: create this type based on primereact TreeNode, replacing data:any with data: TAPBusinessGroupDisplay
export type TAPBusinessGroupTreeNodeDisplay = {
  key: string;
  label: string;
  data: TAPBusinessGroupDisplay;
  children: TAPBusinessGroupTreeNodeDisplayList;
}
export type TAPBusinessGroupTreeNodeDisplayList = Array<TAPBusinessGroupTreeNodeDisplay>;

export type TAPTreeTableExpandedKeysType = {
  [key: string]: boolean;
}

/** Id & display names for referencing in UI */
export type TAPBusinessGroupDisplayReference = IAPEntityIdDisplay & {
  apExternalBusinessGroupReference?: TAPEntityId;
}

export type TAPBusinessGroupAssetReference = {
  apApiProductReferenceEntityIdList: TAPEntityIdList;
}

export type TAPBusinessGroupDisplay = IAPEntityIdDisplay & IAPSearchContent & {
  apsBusinessGroupResponse: APSBusinessGroupResponse;
  apExternalReference?: APSExternalReference & {
    externalSystemDisplayName: string;
  },
  apBusinessGroupParentEntityId?: TAPEntityId;
  apBusinessGroupChildrenEntityIdList: TAPEntityIdList;
  apMemberUserEntityIdList: TAPEntityIdList;
  apBusinessGroupAssetReference: TAPBusinessGroupAssetReference;
}
export type TAPBusinessGroupDisplayList = Array<TAPBusinessGroupDisplay>;

class APBusinessGroupsDisplayService {
  private readonly BaseComponentName = "APBusinessGroupsDisplayService";

  public nameOf(name: keyof TAPBusinessGroupDisplay) {
    return name;
  }
  public nameOf_ApEntityId(name: keyof TAPEntityId) {
    return `${this.nameOf('apEntityId')}.${name}`;
  }

  private create_EmptyApsBusinessGroupResponse(apBusinessGroupParentEntityId: TAPEntityId | undefined): APSBusinessGroupResponse {
    const bg: APSBusinessGroupResponse = {
      businessGroupId: Globals.getUUID(),
      displayName: '',
      description: '',
      businessGroupChildIds: [],
      members: []
    };
    if(apBusinessGroupParentEntityId !== undefined) {
      bg.businessGroupParentId = apBusinessGroupParentEntityId.id
    }
    return bg;
  }

  public create_ApBusinessGroupDisplayReference({ businessGroupEntityId, externalBusinessGroupEntityId }:{
    businessGroupEntityId: TAPEntityId;
    externalBusinessGroupEntityId?: TAPEntityId;
  }): TAPBusinessGroupDisplayReference {
    return {
      apEntityId: businessGroupEntityId,
      apExternalBusinessGroupReference: externalBusinessGroupEntityId
    };
  }

  public create_EmptyObject(apBusinessGroupParentEntityId: TAPEntityId | undefined): TAPBusinessGroupDisplay {
    return this.create_ApBusinessGroupDisplay_From_ApiEntities({
      apsBusinessGroupResponse: this.create_EmptyApsBusinessGroupResponse(apBusinessGroupParentEntityId),
      externalSystemDisplayName: undefined,
      apParentBusinessGroupEntityId: apBusinessGroupParentEntityId,
      apBusinessGroupChildrenEntityIdList: [],
      apApiProductReferenceEntityIdList: [],
    });
  }

  public create_ApBusinessGroupTreeNodeDisplayList_ExpandedKeys({ apBusinessGroupTreeNodeDisplayList }: {
    apBusinessGroupTreeNodeDisplayList: TAPBusinessGroupTreeNodeDisplayList;
  }): TAPTreeTableExpandedKeysType {
    let expandedKeys: TAPTreeTableExpandedKeysType = {};
    apBusinessGroupTreeNodeDisplayList.forEach( (x) => {
      expandedKeys[x.key] = true;
      const childrenExpandedKeys: TAPTreeTableExpandedKeysType = this.create_ApBusinessGroupTreeNodeDisplayList_ExpandedKeys({ apBusinessGroupTreeNodeDisplayList: x.children });
      expandedKeys = {
        ...expandedKeys,
        ...childrenExpandedKeys
      };
    });
    return expandedKeys;
  }

  public create_ApMemberOfBusinessGroupTreeTableNodeList_ExpandedKeys({ apMemberOfBusinessGroupTreeTableNodeList }: {
    apMemberOfBusinessGroupTreeTableNodeList: TAPMemberOfBusinessGroupTreeTableNodeList;
  }): TAPTreeTableExpandedKeysType {
    let expandedKeys: TAPTreeTableExpandedKeysType = {};
    apMemberOfBusinessGroupTreeTableNodeList.forEach( (x) => {
      expandedKeys[x.key] = true;
      const childrenExpandedKeys: TAPTreeTableExpandedKeysType = this.create_ApMemberOfBusinessGroupTreeTableNodeList_ExpandedKeys({ apMemberOfBusinessGroupTreeTableNodeList: x.children });
      expandedKeys = {
        ...expandedKeys,
        ...childrenExpandedKeys
      };
    });
    return expandedKeys;
  }


  public isDeleteAllowed(apBusinessGroupDisplay: TAPBusinessGroupDisplay): boolean {
    if(apBusinessGroupDisplay.apBusinessGroupParentEntityId === undefined) return false; // this is the root
    if(apBusinessGroupDisplay.apExternalReference !== undefined) return false;
    if(apBusinessGroupDisplay.apsBusinessGroupResponse.businessGroupChildIds.length > 0) return false;
    if(apBusinessGroupDisplay.apMemberUserEntityIdList.length > 0) return false;
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
    if(apBusinessGroupDisplay.apBusinessGroupParentEntityId === undefined) return  'Organization';
    if(apBusinessGroupDisplay.apExternalReference !== undefined) return apBusinessGroupDisplay.apExternalReference.externalSystemDisplayName;
    else return 'Configured';
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
    for(const childEntityId of apBusinessGroupDisplay.apBusinessGroupChildrenEntityIdList) {
      // find it and add it
      const found: TAPBusinessGroupDisplay | undefined = referenceApBusinessGroupDisplayList.find( (x) => {
        return x.apEntityId.id === childEntityId.id;
      });
      if(found === undefined) throw new Error(`${logName}: cannot find childId in apBusinessGroupDisplayList, groupId=${apBusinessGroupDisplay.apEntityId.id}, childId=${childEntityId.id}, apBusinessGroupDisplayList=${JSON.stringify(referenceApBusinessGroupDisplayList, null, 2)}`);
      // recurse into child
      const childTreeNodeDisplay: TAPBusinessGroupTreeNodeDisplay = this.generate_ApBusinessGroupTreeNodeDisplay_From_ApBusinessGroupDisplay(found, referenceApBusinessGroupDisplayList);
      thisTreeNode.children.push(childTreeNodeDisplay);
    }
    return thisTreeNode;
  }

  public generate_ApBusinessGroupTreeNodeDisplayList_From_ApBusinessGroupDisplayList(referenceApBusinessGroupDisplayList: TAPBusinessGroupDisplayList): TAPBusinessGroupTreeNodeDisplayList {
    const funcName = 'generate_ApBusinessGroupTreeNodeDisplayList_From_ApBusinessGroupDisplayList';
    const logName = `${this.BaseComponentName}.${funcName}()`;

    if(referenceApBusinessGroupDisplayList.length === 0) return [];
    
    // get the toplevel group === organization
    const topLevelGroup: TAPBusinessGroupDisplay | undefined = referenceApBusinessGroupDisplayList.find( (x) => {
      return x.apBusinessGroupParentEntityId === undefined;
    });
    if(topLevelGroup === undefined) throw new Error(`${logName}: topLevelGroup === undefined`);

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

  private create_ApMemberUserEntityIdList_From_ApiEntities({ apsMemberUserIdList }: {
    apsMemberUserIdList: APSUserIdList;
  }): TAPEntityIdList {
    return apsMemberUserIdList.map( (userId: string) => {
      return {
        id: userId,
        displayName: userId
      };
    });
  }

  protected create_ApBusinessGroupDisplay_From_ApiEntities({
    apsBusinessGroupResponse, 
    externalSystemDisplayName, 
    apParentBusinessGroupEntityId, 
    apBusinessGroupChildrenEntityIdList,
    apApiProductReferenceEntityIdList,
  }: {
    apsBusinessGroupResponse: APSBusinessGroupResponse;
    externalSystemDisplayName?: string;
    apParentBusinessGroupEntityId?: TAPEntityId;
    apBusinessGroupChildrenEntityIdList: TAPEntityIdList;
    apApiProductReferenceEntityIdList: TAPEntityIdList;
  }): TAPBusinessGroupDisplay {
    const base: TAPBusinessGroupDisplay = {
      apEntityId: {
        id: apsBusinessGroupResponse.businessGroupId,
        displayName: apsBusinessGroupResponse.displayName
      },
      apsBusinessGroupResponse: apsBusinessGroupResponse,
      apSearchContent: '',
      apBusinessGroupParentEntityId: apParentBusinessGroupEntityId,
      apBusinessGroupChildrenEntityIdList: APEntityIdsService.sort_byDisplayName(apBusinessGroupChildrenEntityIdList),
      apMemberUserEntityIdList: this.create_ApMemberUserEntityIdList_From_ApiEntities({ apsMemberUserIdList: apsBusinessGroupResponse.members }),
      apBusinessGroupAssetReference: {
        apApiProductReferenceEntityIdList: apApiProductReferenceEntityIdList
      }
    };
    if(apsBusinessGroupResponse.externalReference !== undefined && externalSystemDisplayName !== undefined) {
      base.apExternalReference = {
        ...apsBusinessGroupResponse.externalReference,
        externalSystemDisplayName: externalSystemDisplayName
      }
    }
    return APSearchContentService.add_SearchContent<TAPBusinessGroupDisplay>(base);
  }

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

  private get_ApBusinessGroupEntityId_From_ApsBusinessGroupResponseList({ apsBusinessGroupResponseList, businessGroupId }: {
    apsBusinessGroupResponseList: APSBusinessGroupResponseList;
    businessGroupId: string;
  }): TAPEntityId {
    const funcName = 'get_ApBusinessGroupEntityId_From_ApsBusinessGroupResponseList';
    const logName = `${this.BaseComponentName}.${funcName}()`;
    const found: APSBusinessGroupResponse | undefined = apsBusinessGroupResponseList.find( (apsBusinessGroupResponse: APSBusinessGroupResponse) => {
      return apsBusinessGroupResponse.businessGroupId === businessGroupId;
    });
    if(found === undefined) throw new Error(`${logName}: found === undefined, searching for businessGroupId=${businessGroupId}`);
    return {
      id: found.businessGroupId,
      displayName: found.displayName
    };
  }

  private get_ApBusinessGroupEntityIdList_From_ApsBusinessGroupResponseList({ apsBusinessGroupResponseList, businessGroupIdList }:{
    apsBusinessGroupResponseList: APSBusinessGroupResponseList;
    businessGroupIdList: Array<string>;
  }): TAPEntityIdList {
    const result: TAPEntityIdList = [];
    businessGroupIdList.forEach( (x) => {
      result.push(this.get_ApBusinessGroupEntityId_From_ApsBusinessGroupResponseList({
        apsBusinessGroupResponseList: apsBusinessGroupResponseList,
        businessGroupId: x
      }));
    });
    return result;
  }

  // ********************************************************************************************************************************
  // API calls
  // ********************************************************************************************************************************

  // public async apsGet_ApBusinessGroupDisplay({ organizationId, businessGroupId }: {
  //   organizationId: string;
  //   businessGroupId: string;
  // }): Promise<TAPBusinessGroupDisplay> {

  //   const apsBusinessGroupResponse: APSBusinessGroupResponse = await ApsBusinessGroupsService.getApsBusinessGroup({
  //     organizationId: organizationId,
  //     businessgroupId: businessGroupId
  //   });

  //   // get external system for displayname
  //   // get all children groups for displayName
  //   // get parent group for displayName

  //   const apBusinessGroupDisplay: TAPBusinessGroupDisplay = this.create_ApBusinessGroupDisplay_From_ApiEntities({
  //     apsBusinessGroupResponse: apsBusinessGroupResponse,
  //     externalSystemDisplayName: this.getExternalSystemDisplayName(extSystemsListResponse.list, apsBusinessGroupResponse.externalReference),
  //     apParentBusinessGroupEntityId: parentBusinessGroupEntityId,
  //     apBusinessGroupChildrenEntityIdList: childrenEntityIdList
  //   });

  //   return apBusinessGroupDisplay;
  // }

  public async apsGetList_ApBusinessGroupSystemDisplayList({ organizationId, fetchAssetReferences = false }: {
    organizationId: string;
    fetchAssetReferences?: boolean;
  }): Promise<TAPBusinessGroupDisplayList> {

    const listResponse: ListAPSBusinessGroupsResponse = await ApsBusinessGroupsService.listApsBusinessGroups({
      organizationId: organizationId
    });
    const apsBusinessGroupResponseList: APSBusinessGroupResponseList = listResponse.list;
    // get all external systems
    const extSystemsListResponse: ListAPSExternalSystemsResponse = await ApsExternalSystemsService.listApsExternalSystems({
      organizationId: organizationId
    });

    const list: TAPBusinessGroupDisplayList = [];

    for(const apsBusinessGroupResponse of apsBusinessGroupResponseList) {

      const parentBusinessGroupEntityId: TAPEntityId | undefined = apsBusinessGroupResponse.businessGroupParentId !== undefined ? this.get_ApBusinessGroupEntityId_From_ApsBusinessGroupResponseList({
        apsBusinessGroupResponseList: apsBusinessGroupResponseList,
        businessGroupId: apsBusinessGroupResponse.businessGroupParentId
      }) : undefined;
      
      const childrenEntityIdList: TAPEntityIdList = this.get_ApBusinessGroupEntityIdList_From_ApsBusinessGroupResponseList({
        apsBusinessGroupResponseList: apsBusinessGroupResponseList,
        businessGroupIdList: apsBusinessGroupResponse.businessGroupChildIds
      });

      // get the references: api products
      let apApiProductReferenceEntityIdList: TAPEntityIdList = [];
      if(fetchAssetReferences) {
        apApiProductReferenceEntityIdList = await APAdminPortalApiProductsDisplayService.apiGetList_ApiProductEntityIdList_By_BusinessGroupId({
          organizationId: organizationId,
          businessGroupId: apsBusinessGroupResponse.businessGroupId
        });
      }

      list.push(this.create_ApBusinessGroupDisplay_From_ApiEntities({
        apsBusinessGroupResponse: apsBusinessGroupResponse,
        externalSystemDisplayName: this.getExternalSystemDisplayName(extSystemsListResponse.list, apsBusinessGroupResponse.externalReference),
        apParentBusinessGroupEntityId: parentBusinessGroupEntityId,
        apBusinessGroupChildrenEntityIdList: childrenEntityIdList,
        apApiProductReferenceEntityIdList: apApiProductReferenceEntityIdList,
      }));
    }
    return list;
  }

  public async apsGetList_ApBusinessGroupSystemDisplay_By_ExternalSystem({ organizationId, externalSystemId, fetchAssetReferences = false }: {
    organizationId: string;
    externalSystemId: string;
    fetchAssetReferences?: boolean;
  }): Promise<TAPBusinessGroupDisplayList> {

    // const funcName = 'apsGetList_ApBusinessGroupSystemDisplay_By_ExternalSystem';
    // const logName = `${this.BaseComponentName}.${funcName}()`;
    // alert(`${logName}: starting ...`);

    const listResponse: ListAPSBusinessGroupsResponse = await ApsBusinessGroupsService.listApsBusinessGroupsByExternalSystem({
      organizationId: organizationId,
      externalSystemId: externalSystemId
    });
    const apsBusinessGroupResponseList: APSBusinessGroupResponseList = listResponse.list;
    if(apsBusinessGroupResponseList.length === 0) return [];

    /* DEBUG */
    // for(const apsBusinessGroupResponse of apsBusinessGroupResponseList) {
    //   console.log(`${logName}: apsBusinessGroupResponse.businessGroupId=${apsBusinessGroupResponse.businessGroupId}, apsBusinessGroupResponse.displayName=${apsBusinessGroupResponse.displayName}`);
    // }
    // alert(`${logName}: see console log`);

    // add the organization/root business group to the list as well
    const root_apsBusinessGroupResponse: APSBusinessGroupResponse = await ApsBusinessGroupsService.getApsBusinessGroup({
      organizationId: organizationId,
      businessgroupId: organizationId
    });
    apsBusinessGroupResponseList.push(root_apsBusinessGroupResponse);

    const list: TAPBusinessGroupDisplayList = [];
    
    for(const apsBusinessGroupResponse of apsBusinessGroupResponseList) {

      const parentBusinessGroupEntityId: TAPEntityId | undefined = apsBusinessGroupResponse.businessGroupParentId !== undefined ? this.get_ApBusinessGroupEntityId_From_ApsBusinessGroupResponseList({
        apsBusinessGroupResponseList: apsBusinessGroupResponseList,
        businessGroupId: apsBusinessGroupResponse.businessGroupParentId
      }) : undefined;
      
      const childrenEntityIdList: TAPEntityIdList = this.get_ApBusinessGroupEntityIdList_From_ApsBusinessGroupResponseList({
        apsBusinessGroupResponseList: apsBusinessGroupResponseList,
        businessGroupIdList: apsBusinessGroupResponse.businessGroupChildIds
      });

      // get the references: api products
      let apApiProductReferenceEntityIdList: TAPEntityIdList = [];
      if(fetchAssetReferences) {
        apApiProductReferenceEntityIdList = await APAdminPortalApiProductsDisplayService.apiGetList_ApiProductEntityIdList_By_BusinessGroupId({
          organizationId: organizationId,
          businessGroupId: apsBusinessGroupResponse.businessGroupId
        });
      }
      
      list.push(this.create_ApBusinessGroupDisplay_From_ApiEntities({
        apsBusinessGroupResponse: apsBusinessGroupResponse,
        externalSystemDisplayName: undefined,
        apParentBusinessGroupEntityId: parentBusinessGroupEntityId,
        apBusinessGroupChildrenEntityIdList: childrenEntityIdList,
        apApiProductReferenceEntityIdList: apApiProductReferenceEntityIdList,
      }));
    }
    // get the top level business group === organization id
    const topLevelBusinessGroup: TAPBusinessGroupDisplay = await this.getRootApBusinessGroupDisplay({ 
      organizationId: organizationId,
    });
    // alert(`${logName}: \nBEFORE: topLevelBusinessGroup.apBusinessGroupChildrenEntityIdList = ${JSON.stringify(topLevelBusinessGroup.apBusinessGroupChildrenEntityIdList, null, 2)}`);
    topLevelBusinessGroup.apBusinessGroupChildrenEntityIdList = list.filter( (x) => {
      if(x.apBusinessGroupParentEntityId) return x.apBusinessGroupParentEntityId.id === organizationId;
      return false;
    }).map( (y) => {
      return y.apEntityId;
    })
    // alert(`${logName}: \nAFTER: topLevelBusinessGroup.apBusinessGroupChildrenEntityIdList = ${JSON.stringify(topLevelBusinessGroup.apBusinessGroupChildrenEntityIdList, null, 2)}`);
    // add it to the list
    list.push(topLevelBusinessGroup);

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
    return await this.apsGet_ApBusinessGroupDisplay({ 
      organizationId: organizationId,
      businessGroupId: organizationId
    });
  }

  public async apsGet_ApBusinessGroupDisplay({ organizationId, businessGroupId, fetchAssetReferences = false }: {
    organizationId: string;
    businessGroupId: string;
    fetchAssetReferences?: boolean;
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

    // get the references: api products
    let apApiProductReferenceEntityIdList: TAPEntityIdList = [];
    if(fetchAssetReferences) {
      apApiProductReferenceEntityIdList = await APAdminPortalApiProductsDisplayService.apiGetList_ApiProductEntityIdList_By_BusinessGroupId({
        organizationId: organizationId,
        businessGroupId: apsBusinessGroupResponse.businessGroupId
      });
    }

    return this.create_ApBusinessGroupDisplay_From_ApiEntities({
      apsBusinessGroupResponse: apsBusinessGroupResponse,
      externalSystemDisplayName: externalSystemDisplayName,
      apParentBusinessGroupEntityId: apsBusinessGroupResponse.businessGroupParentId !== undefined ? await this.getApBusinessGroupEntityId(organizationId, apsBusinessGroupResponse.businessGroupParentId) : undefined,
      apBusinessGroupChildrenEntityIdList: await this.getApBusinessGroupEntityIdList(organizationId, apsBusinessGroupResponse.businessGroupChildIds),
      apApiProductReferenceEntityIdList: apApiProductReferenceEntityIdList,
    });
  }

  public async apsGet_ApBusinessGroupDisplay_By_ExternalReference({ organizationId, externalReferenceId, fetchAssetReferences = false }: {
    organizationId: string;
    externalReferenceId: string;
    fetchAssetReferences?: boolean;
  }): Promise<TAPBusinessGroupDisplay> {
    const apsBusinessGroupResponse: APSBusinessGroupResponse = await ApsBusinessGroupsService.getApsBusinessGroupByExternalReference({
      organizationId: organizationId,
      externalReferenceId: externalReferenceId
    });
    // get the references: api products
    let apApiProductReferenceEntityIdList: TAPEntityIdList = [];
    if(fetchAssetReferences) {
      apApiProductReferenceEntityIdList = await APAdminPortalApiProductsDisplayService.apiGetList_ApiProductEntityIdList_By_BusinessGroupId({
        organizationId: organizationId,
        businessGroupId: apsBusinessGroupResponse.businessGroupId
      });
    }
    
    return this.create_ApBusinessGroupDisplay_From_ApiEntities({
      apsBusinessGroupResponse: apsBusinessGroupResponse,
      externalSystemDisplayName: undefined,
      apParentBusinessGroupEntityId: apsBusinessGroupResponse.businessGroupParentId !== undefined ? await this.getApBusinessGroupEntityId(organizationId, apsBusinessGroupResponse.businessGroupParentId) : undefined,
      apBusinessGroupChildrenEntityIdList: await this.getApBusinessGroupEntityIdList(organizationId, apsBusinessGroupResponse.businessGroupChildIds),
      apApiProductReferenceEntityIdList: apApiProductReferenceEntityIdList,
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
