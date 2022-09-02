import { 
  ApiError,
  ImporterConfiguration,
  ImporterInfo,
  ManagementService,
} from '@solace-iot-team/apim-connector-openapi-browser';
import { APClientConnectorOpenApi } from '../utils/APClientConnectorOpenApi';
import APEntityIdsService, { 
  IAPEntityIdDisplay, TAPEntityId,
} from '../utils/APEntityIdsService';
import APSearchContentService, { IAPSearchContent } from '../utils/APSearchContentService';
import APApisDisplayService from './APApisDisplayService';
import APAttributesDisplayService, { TAPAttributeDisplayList, TAPRawAttributeList } from './APAttributesDisplayService/APAttributesDisplayService';
import APEpApplicationDomainsDisplayService, { IAPEpApplicationDomainDisplay } from './APEpApplicationDomainsDisplayService';
import { EAPManagedAssetAttribute_BusinessGroup_Tag, EAPManagedAssetAttribute_Scope } from './APManagedAssetDisplayService';
import APLoginUsersDisplayService from './APUsersDisplayService/APLoginUsersDisplayService';

enum ConnectorImporterTypes {
  EventPortalImporter = "EventPortalImporter"
}
export type TAPEpSettingsDisplay_AllowedActions = {
  isDeleteAllowed: boolean;
  isEditAllowed: boolean;
  isViewAllowed: boolean;
}

export type TApEpSettings_ConnectorAttributeMapElement = {
    name?: string;
    attributes?: TAPRawAttributeList;
}
export type TApEpSettings_ConnectorAttributeMapElementList = Array<TApEpSettings_ConnectorAttributeMapElement>;

// entityId = application domain
export interface IApEpSettings_Mapping extends IAPEpApplicationDomainDisplay {
  isValid: boolean;
  businessGroupEntityId: TAPEntityId;
  // TODO: sharingList
}
export type TApEpSettings_MappingList = Array<IApEpSettings_Mapping>;
export interface IAPEpSettingsDisplay extends IAPEntityIdDisplay, IAPSearchContent {
  connectorImporterConfiguration: ImporterConfiguration;
  apEpSettings_MappingList: TApEpSettings_MappingList;
}
export type TAPEpSettingsDisplayList = Array<IAPEpSettingsDisplay>;

class APEpSettingsDisplayService {
  private readonly ComponentName = "APEpSettingsDisplayService";

  private create_Empty_ConnectorImporterConfiguration(): ImporterConfiguration {
    return {
      importerType: '',
      name: '',
      displayName: '',
      filter: [],
      attributeMap: []
    };
  }

  public create_Empty_ApEpSettingsDisplay_Mapping(): IApEpSettings_Mapping {
    return {
      apEntityId: APEntityIdsService.create_EmptyObject_NoId(),
      apSearchContent: '',
      businessGroupEntityId: APEntityIdsService.create_EmptyObject_NoId(),
      isValid: false
    };
  }

  public create_Empty_ApEpSettingsDisplay(): IAPEpSettingsDisplay {
    const apEpSettingsDisplay: IAPEpSettingsDisplay = {
      apEntityId: APEntityIdsService.create_EmptyObject_NoId(),
      connectorImporterConfiguration: this.create_Empty_ConnectorImporterConfiguration(),
      apEpSettings_MappingList: [],
      apSearchContent: '',
    };
    return APSearchContentService.add_SearchContent<IAPEpSettingsDisplay>(apEpSettingsDisplay);
  }

  private extract_BusinessGroupEntityId_From_ApRawAttributeList = ({ apRawAttributeList }:{
    apRawAttributeList: TAPRawAttributeList;
  }): TAPEntityId => {

    const businessGroupEntityId: TAPEntityId = APEntityIdsService.create_EmptyObject_NoId();

    const apAttributeDisplayList: TAPAttributeDisplayList = APAttributesDisplayService.create_ApAttributeDisplayList({ apRawAttributeList: apRawAttributeList });
    const businessGroupId_apAttributeDisplayList: TAPAttributeDisplayList = APAttributesDisplayService.extract_Prefixed_With({
      prefixed_with: APApisDisplayService.create_ManagedAssetAttribute_Name({ scope: EAPManagedAssetAttribute_Scope.BUSINESS_GROUP, tag: EAPManagedAssetAttribute_BusinessGroup_Tag.OWNING_ID }),
      apAttributeDisplayList: apAttributeDisplayList
    });
    if(businessGroupId_apAttributeDisplayList.length > 0) {
      businessGroupEntityId.id = businessGroupId_apAttributeDisplayList[0].value
    }
    const businessGroupDisplayName_apAttributeDisplayList: TAPAttributeDisplayList = APAttributesDisplayService.extract_Prefixed_With({
      prefixed_with: APApisDisplayService.create_ManagedAssetAttribute_Name({ scope: EAPManagedAssetAttribute_Scope.BUSINESS_GROUP, tag: EAPManagedAssetAttribute_BusinessGroup_Tag.OWNING_DISPLAY_NAME }),
      apAttributeDisplayList: apAttributeDisplayList
    });
    if(businessGroupDisplayName_apAttributeDisplayList.length > 0) {
      businessGroupEntityId.displayName = businessGroupDisplayName_apAttributeDisplayList[0].value
    }
    return businessGroupEntityId;
  }

  private create_ApRawAttributeList = ({ apEpSettings_Mapping }:{
    apEpSettings_Mapping: IApEpSettings_Mapping;
  }): TAPRawAttributeList => {
    const funcName = 'create_ApRawAttributeList';
    const logName = `${this.ComponentName}.${funcName}()`;

    const apAttributeDisplayList: TAPAttributeDisplayList = [];
    // business group id
    apAttributeDisplayList.push(APAttributesDisplayService.create_ApAttributeDisplay({ 
      name: APApisDisplayService.create_ManagedAssetAttribute_Name({ scope: EAPManagedAssetAttribute_Scope.BUSINESS_GROUP, tag: EAPManagedAssetAttribute_BusinessGroup_Tag.OWNING_ID }), 
      value: apEpSettings_Mapping.businessGroupEntityId.id
    }));
    // business group display name
    apAttributeDisplayList.push(APAttributesDisplayService.create_ApAttributeDisplay({ 
      name: APApisDisplayService.create_ManagedAssetAttribute_Name({ scope: EAPManagedAssetAttribute_Scope.BUSINESS_GROUP, tag: EAPManagedAssetAttribute_BusinessGroup_Tag.OWNING_DISPLAY_NAME }), 
      value: apEpSettings_Mapping.businessGroupEntityId.displayName
    }));

    return APAttributesDisplayService.create_ApRawAttributeList({ apAttributeDisplayList: apAttributeDisplayList });

  }

  private create_ApEpSettings_MappingList_From_ApiEntities = async({ organizationId, apEpSettings_ConnectorAttributeMapElementList }:{
    apEpSettings_ConnectorAttributeMapElementList?: TApEpSettings_ConnectorAttributeMapElementList;
    organizationId: string;
  }): Promise<TApEpSettings_MappingList> => {
    const funcName = 'create_ApEpSettings_MappingList_From_ApiEntities';
    const logName = `${this.ComponentName}.${funcName}()`;

    if(apEpSettings_ConnectorAttributeMapElementList === undefined) return [];
    const apEpSettings_MappingList: TApEpSettings_MappingList = [];
    for(const apEpSettings_ConnectorAttributeMapElement of apEpSettings_ConnectorAttributeMapElementList) {
      if(apEpSettings_ConnectorAttributeMapElement.name === undefined) throw new Error(`${logName}: apEpSettings_ConnectorAttributeMapElement.name === undefined`);
      if(apEpSettings_ConnectorAttributeMapElement.attributes === undefined) throw new Error(`${logName}: apEpSettings_ConnectorAttributeMapElement.attributes === undefined`);
      // get the applicationDomain display name
      const apEpApplicationDomainDisplay: IAPEpApplicationDomainDisplay | undefined = await APEpApplicationDomainsDisplayService.apiGet_IAPEpApplicationDomainDisplay({ 
        organizationId: organizationId,
        applicationDomainId: apEpSettings_ConnectorAttributeMapElement.name
      });
      const apEpSettings_Mapping: IApEpSettings_Mapping = {
        apEntityId: {
          id: apEpSettings_ConnectorAttributeMapElement.name,
          displayName: apEpApplicationDomainDisplay ? apEpApplicationDomainDisplay.apEntityId.displayName : `invalid id (${apEpSettings_ConnectorAttributeMapElement.name})`
        },
        businessGroupEntityId: this.extract_BusinessGroupEntityId_From_ApRawAttributeList({ apRawAttributeList: apEpSettings_ConnectorAttributeMapElement.attributes }),
        isValid: apEpApplicationDomainDisplay !== undefined,
        apSearchContent: ''
      };
        apEpSettings_MappingList.push(apEpSettings_Mapping);
    }
    return apEpSettings_MappingList;
  }

  private create_ApEpSettingsDisplay_From_ApiEntities = async({ organizationId, connectorImporterConfiguration }:{
    connectorImporterConfiguration: ImporterConfiguration;
    organizationId: string;
  }): Promise<IAPEpSettingsDisplay> => {
    const funcName = 'create_ApEpSettingsDisplay_From_ApiEntities';
    const logName = `${this.ComponentName}.${funcName}()`;

    const apEpSettingsDisplay: IAPEpSettingsDisplay = {
      apEntityId: { id: connectorImporterConfiguration.name, displayName: connectorImporterConfiguration.displayName },
      connectorImporterConfiguration: connectorImporterConfiguration,
      apEpSettings_MappingList: await this.create_ApEpSettings_MappingList_From_ApiEntities({ 
        organizationId: organizationId, 
        apEpSettings_ConnectorAttributeMapElementList: connectorImporterConfiguration.attributeMap 
      }),
      apSearchContent: ''
    };
    return APSearchContentService.add_SearchContent<IAPEpSettingsDisplay>(apEpSettingsDisplay);
  }

  private create_ConnectorAttributeMap_From_ApEpSettings = ({ apEpSettingsDisplay }:{
    apEpSettingsDisplay: IAPEpSettingsDisplay;
  }): TApEpSettings_ConnectorAttributeMapElementList => {

    const apEpSettings_ConnectorAttributeMapElementList: TApEpSettings_ConnectorAttributeMapElementList = [];
    for(const apEpSettings_Mapping of apEpSettingsDisplay.apEpSettings_MappingList) {
      const apEpSettings_ConnectorAttributeMapElement: TApEpSettings_ConnectorAttributeMapElement = {
        name: apEpSettings_Mapping.apEntityId.id,
        attributes: this.create_ApRawAttributeList({ apEpSettings_Mapping: apEpSettings_Mapping }),
      };
      apEpSettings_ConnectorAttributeMapElementList.push(apEpSettings_ConnectorAttributeMapElement);
    }
    return apEpSettings_ConnectorAttributeMapElementList;
  }
  public get_Empty_AllowedActions(): TAPEpSettingsDisplay_AllowedActions {
    return {
      isDeleteAllowed: false,
      isEditAllowed: false,
      isViewAllowed: false,
    };
  }

  public get_AllowedActions({ userId, userBusinessGroupId, authorizedResourcePathAsString, hasEventPortalConnectivity, apEpSettingsDisplay }:{
    userId: string;
    userBusinessGroupId?: string;
    authorizedResourcePathAsString: string;
    hasEventPortalConnectivity: boolean;
    apEpSettingsDisplay: IAPEpSettingsDisplay;
  }): TAPEpSettingsDisplay_AllowedActions {
    if(!hasEventPortalConnectivity) return this.get_Empty_AllowedActions();
    const allowedActions: TAPEpSettingsDisplay_AllowedActions = {
      isEditAllowed: true,
      isDeleteAllowed: true,
      isViewAllowed: true,
    };
    // additional checks: see AdminPortalApiProductDisplayService
    // if(!allowedActions.isEditAllowed || !allowedActions.isDeleteAllowed || !allowedActions.isViewAllowed) {
    //   // check if owned by user
    //   if(apAdminPortalApiProductDisplay.apOwnerInfo.id === userId) {
    //     allowedActions.isEditAllowed = true;
    //     allowedActions.isDeleteAllowed = true;
    //     allowedActions.isViewAllowed = true;
    //   }
    // }
    // if((!allowedActions.isEditAllowed || !allowedActions.isDeleteAllowed || !allowedActions.isViewAllowed) && userBusinessGroupId !== undefined) {
    //   // check if api product owned by same business group
    //   if(userBusinessGroupId === apAdminPortalApiProductDisplay.apBusinessGroupInfo.apOwningBusinessGroupEntityId.id) {
    //     allowedActions.isEditAllowed = true;
    //     allowedActions.isDeleteAllowed = true;
    //     allowedActions.isViewAllowed = true;
    //   }
    // }
    // if((!allowedActions.isViewAllowed) && userBusinessGroupId !== undefined) {
    //   // check if api product shared with user business group
    //   const foundSharingBusinessGroup: TAPManagedAssetDisplay_BusinessGroupSharing | undefined = apAdminPortalApiProductDisplay.apBusinessGroupInfo.apBusinessGroupSharingList.find( (x) => {
    //     return x.apEntityId.id === userBusinessGroupId;
    //   });
    //   if(foundSharingBusinessGroup !== undefined) {
    //     allowedActions.isViewAllowed = true;
    //   }
    // }
    return allowedActions;
  }

  // ********************************************************************************************************************************
  // API calls
  // ********************************************************************************************************************************

  public async apiGet_ImporterTypes({ organizationId }:{
    organizationId: string;
  }): Promise<Array<ImporterInfo>> {
    const importerInfoList: Array<ImporterInfo> = await ManagementService.getAllImporterTypes({
      organizationName: organizationId
    });
    return importerInfoList;
  }

  public async apiCheck_ApEpSettingId_Exists({ organizationId, id }: {
    organizationId: string;
    id: string;
  }): Promise<boolean> {
    // const funcName = 'apiCheck_ApEpSettingId_Exists';
    // const logName = `${this.ComponentName}.${funcName}()`;
    // throw new Error(`${logName}: test error handling`);

    try {
      await ManagementService.getImporterJob({ 
        organizationName: organizationId,
        importerJobName: id,
      });
      return true;
     } catch(e: any) {
      if(APClientConnectorOpenApi.isInstanceOfApiError(e)) {
        const apiError: ApiError = e;
        if(apiError.status === 404) return false;
      }
      throw e;
    }
  }

  public async apiGetList_ApEpSettingsDisplayList({ organizationId }:{
    organizationId: string;
  }): Promise<TAPEpSettingsDisplayList> {
    // const funcName = 'apiGetList_ApEpSettingsDisplayList';
    // const logName = `${this.ComponentName}.${funcName}()`;
    // throw new Error(`${logName}: test error handling`);

    const connectorImporterConfigurationList: Array<ImporterConfiguration> = await ManagementService.getAllImporters({ 
      organizationName: organizationId,
    });
    const list: TAPEpSettingsDisplayList = [];
    for(const connectorImporterConfiguration of connectorImporterConfigurationList) {
      list.push(await this.create_ApEpSettingsDisplay_From_ApiEntities({
        organizationId: organizationId, 
        connectorImporterConfiguration: connectorImporterConfiguration
      }));
    }
    return APEntityIdsService.sort_ApDisplayObjectList_By_DisplayName(list);
  }

  public async apiGet_ApEpSettingsDisplay({ organizationId, id }: {
    organizationId: string;
    id: string;
  }): Promise<IAPEpSettingsDisplay> {
    // const funcName = 'apiGet_ApEpSettingsDisplay';
    // const logName = `${this.ComponentName}.${funcName}()`;
    // throw new Error(`${logName}: test error handling`);

    const connectorImporterConfiguration: ImporterConfiguration = await ManagementService.getImporterJob({ 
      organizationName: organizationId,
      importerJobName: id
    });
    return await this.create_ApEpSettingsDisplay_From_ApiEntities({ 
      organizationId: organizationId,
      connectorImporterConfiguration: connectorImporterConfiguration
    });
  }

  public async apiCreate_ApEpSettingsDisplay({ organizationId, apEpSettingsDisplay }: {
    organizationId: string;
    apEpSettingsDisplay: IAPEpSettingsDisplay;
  }): Promise<IAPEpSettingsDisplay> {
    // const funcName = 'apiCreate_ApEpSettingsDisplay';
    // const logName = `${this.ComponentName}.${funcName}()`;
    // throw new Error(`${logName}: test error handling`);

    const apEpSettings_ConnectorAttributeMapElementList: TApEpSettings_ConnectorAttributeMapElementList = this.create_ConnectorAttributeMap_From_ApEpSettings({ apEpSettingsDisplay: apEpSettingsDisplay });
    const create: ImporterConfiguration = {
      name: apEpSettingsDisplay.apEntityId.id,
      displayName: apEpSettingsDisplay.apEntityId.displayName,
      importerType: ConnectorImporterTypes.EventPortalImporter,
      filter: apEpSettings_ConnectorAttributeMapElementList.map( (x) => {
        return x.name ? x.name : '';
      }),
      attributeMap: apEpSettings_ConnectorAttributeMapElementList
    };
    const created: ImporterConfiguration = await ManagementService.createImporterJob({ 
      organizationName: organizationId,
      requestBody: create
    });
    // logout all users from org
    await APLoginUsersDisplayService.apsSecLogoutOrganizationAll({ organizationId: organizationId });
    return await this.create_ApEpSettingsDisplay_From_ApiEntities({ 
      organizationId: organizationId,
      connectorImporterConfiguration: created
    });
  }

  public async apiUpdate_ApEpSettingsDisplay({ organizationId, apEpSettingsDisplay }: {
    organizationId: string;
    apEpSettingsDisplay: IAPEpSettingsDisplay;
  }): Promise<IAPEpSettingsDisplay> {
    // const funcName = 'apiUpdate_ApEpSettingsDisplay';
    // const logName = `${this.ComponentName}.${funcName}()`;
    // throw new Error(`${logName}: test error handling`);

    const apEpSettings_ConnectorAttributeMapElementList: TApEpSettings_ConnectorAttributeMapElementList = this.create_ConnectorAttributeMap_From_ApEpSettings({ apEpSettingsDisplay: apEpSettingsDisplay });
    const update: ImporterConfiguration = {
      name: apEpSettingsDisplay.apEntityId.id,
      displayName: apEpSettingsDisplay.apEntityId.displayName,
      importerType: ConnectorImporterTypes.EventPortalImporter,
      filter: apEpSettings_ConnectorAttributeMapElementList.map( (x) => {
        return x.name ? x.name : '';
      }),
      attributeMap: apEpSettings_ConnectorAttributeMapElementList
    };
    const updated: ImporterConfiguration = await ManagementService.updateImporterJob({ 
      organizationName: organizationId,
      importerJobName: apEpSettingsDisplay.apEntityId.id,
      requestBody: update
    });
    // logout all users from org
    await APLoginUsersDisplayService.apsSecLogoutOrganizationAll({ organizationId: organizationId });
    return await this.create_ApEpSettingsDisplay_From_ApiEntities({ 
      organizationId: organizationId,
      connectorImporterConfiguration: updated 
    });
  }

  public async apiDelete_ApEpSettingsDisplay({ organizationId, id }:{
    organizationId: string;
    id: string;
  }): Promise<void> {
    // const funcName = 'apiDelete_ApEpSettingsDisplay';
    // const logName = `${this.ComponentName}.${funcName}()`;
    // throw new Error(`${logName}: test error handling`);

    await ManagementService.deleteImporterJob({ 
      organizationName: organizationId,
      importerJobName: id
    });
    // logout all users from org
    await APLoginUsersDisplayService.apsSecLogoutOrganizationAll({ organizationId: organizationId });

  }

}

export default new APEpSettingsDisplayService();
