import { 
  ApiError,
  ImporterConfiguration,
  ImporterInfo,
  ManagementService,
  SuccessResponse,
} from '@solace-iot-team/apim-connector-openapi-browser';
import { APClientConnectorOpenApi } from '../utils/APClientConnectorOpenApi';
import APEntityIdsService, { 
  IAPEntityIdDisplay, TAPEntityId, TAPEntityIdList,
} from '../utils/APEntityIdsService';
import APSearchContentService, { IAPSearchContent } from '../utils/APSearchContentService';
import APApisDisplayService from './APApisDisplayService';
import APAttributesDisplayService, { TAPAttributeDisplayList, TAPRawAttributeList } from './APAttributesDisplayService/APAttributesDisplayService';
import APEpApplicationDomainsDisplayService, { IAPEpApplicationDomainDisplay } from './APEpApplicationDomainsDisplayService';
import APExternalSystemsDisplayService, { TAPExternalSystemDisplayList } from './APExternalSystemsDisplayService';
import { 
  EAPManagedAssetAttribute_BusinessGroup_Tag, 
  EAPManagedAssetAttribute_Publish_Tag, 
  EAPManagedAssetAttribute_Scope, 
  TAPManagedAssetDisplay_BusinessGroupSharingList, 
  TAPManagedAssetPublishDestinationInfo 
} from './APManagedAssetDisplayService';
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
  owningBusinessGroupEntityId: TAPEntityId;
  apBusinessGroupSharingList: TAPManagedAssetDisplay_BusinessGroupSharingList;
  apPublishDestinationInfo: TAPManagedAssetPublishDestinationInfo;
}
export type TApEpSettings_MappingList = Array<IApEpSettings_Mapping>;
export interface IAPEpSettingsDisplay extends IAPEntityIdDisplay, IAPSearchContent {
  connectorImporterConfiguration: ImporterConfiguration;
  apEpSettings_MappingList: TApEpSettings_MappingList;
}
export type TAPEpSettingsDisplayList = Array<IAPEpSettingsDisplay>;

class APEpSettingsDisplayService {
  private readonly ComponentName = "APEpSettingsDisplayService";

  public areAllMappingsValid({ apEpSettingsDisplay }:{
    apEpSettingsDisplay: IAPEpSettingsDisplay
  }): boolean {
    if(apEpSettingsDisplay.apEpSettings_MappingList.length === 0) return false;
    const areAllValid: boolean = apEpSettingsDisplay.apEpSettings_MappingList.map((x)=> {
      return x.isValid;
    }).reduce( (previous, current, index, array) => {
      return current;
    }, true);
    return areAllValid;
  }

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
      owningBusinessGroupEntityId: APEntityIdsService.create_EmptyObject_NoId(),
      apBusinessGroupSharingList: [],
      apPublishDestinationInfo: {
        apExternalSystemEntityIdList: [],
      },
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

  private extract_OwningBusinessGroupEntityId_From_ApRawAttributeList = ({ apRawAttributeList }:{
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

  private extract_BusinessGroupSharingList_From_ApRawAttributeList = ({ apRawAttributeList }:{
    apRawAttributeList: TAPRawAttributeList;
  }): TAPManagedAssetDisplay_BusinessGroupSharingList => {
    // const funcName = 'extract_BusinessGroupSharingList_From_ApRawAttributeList';
    // const logName = `${this.ComponentName}.${funcName}()`;

    const apAttributeDisplayList: TAPAttributeDisplayList = APAttributesDisplayService.create_ApAttributeDisplayList({ apRawAttributeList: apRawAttributeList });

    const businessGroupSharingList_apAttributeDisplayList: TAPAttributeDisplayList = APAttributesDisplayService.extract_Prefixed_With({
      prefixed_with: APApisDisplayService.create_ManagedAssetAttribute_Name({ scope: EAPManagedAssetAttribute_Scope.BUSINESS_GROUP, tag: EAPManagedAssetAttribute_BusinessGroup_Tag.SHARING_LIST }),
      apAttributeDisplayList: apAttributeDisplayList
    });
    // not using validation here
    // const apManagedAssetDisplay_BusinessGroupSharingList: TAPManagedAssetDisplay_BusinessGroupSharingList = APApisDisplayService.getValidatedBusinessGroupSharingList({
    //   businessGroupSharingList_apAttributeDisplayList: businessGroupSharingList_apAttributeDisplayList,
    //   complete_ApBusinessGroupDisplayList: complete_ApBusinessGroupDisplayList
    // });
    let apManagedAssetDisplay_BusinessGroupSharingList: TAPManagedAssetDisplay_BusinessGroupSharingList = [];
    if(businessGroupSharingList_apAttributeDisplayList.length > 0) apManagedAssetDisplay_BusinessGroupSharingList = APApisDisplayService.parse_BusinessGroupSharingListString(businessGroupSharingList_apAttributeDisplayList[0].value);

    return apManagedAssetDisplay_BusinessGroupSharingList;
  }

  private extract_PublishDestinationInfo_From_ApRawAttributeList = ({ apRawAttributeList, complete_ApExternalSystemDisplayList }:{
    apRawAttributeList: TAPRawAttributeList;
    complete_ApExternalSystemDisplayList: TAPExternalSystemDisplayList;
  }): TAPManagedAssetPublishDestinationInfo => {
    // const funcName = 'extract_PublishDestinationInfo_From_ApRawAttributeList';
    // const logName = `${this.ComponentName}.${funcName}()`;

    const apAttributeDisplayList: TAPAttributeDisplayList = APAttributesDisplayService.create_ApAttributeDisplayList({ apRawAttributeList: apRawAttributeList });
    const publishDestinationList: TAPAttributeDisplayList = APAttributesDisplayService.extract_Prefixed_With({
      prefixed_with: APApisDisplayService.create_ManagedAssetAttribute_Name({ scope: EAPManagedAssetAttribute_Scope.PUBLISH, tag: EAPManagedAssetAttribute_Publish_Tag.DESTINATION }),
      apAttributeDisplayList: apAttributeDisplayList
    });
    const publishDestinationEntityIdList: TAPEntityIdList = APApisDisplayService.getValidatedPublishDestinationList({
      publishDestinationList_apAttributeDisplayList: publishDestinationList,
      complete_ApExternalSystemDisplayList: complete_ApExternalSystemDisplayList
    });
    return {
      apExternalSystemEntityIdList: publishDestinationEntityIdList
    };
  }

  private create_ApRawAttributeList = ({ apEpSettings_Mapping }:{
    apEpSettings_Mapping: IApEpSettings_Mapping;
  }): TAPRawAttributeList => {
    // const funcName = 'create_ApRawAttributeList';
    // const logName = `${this.ComponentName}.${funcName}()`;

    const apAttributeDisplayList: TAPAttributeDisplayList = [];
    // business group id
    apAttributeDisplayList.push(APAttributesDisplayService.create_ApAttributeDisplay({ 
      name: APApisDisplayService.create_ManagedAssetAttribute_Name({ scope: EAPManagedAssetAttribute_Scope.BUSINESS_GROUP, tag: EAPManagedAssetAttribute_BusinessGroup_Tag.OWNING_ID }), 
      value: apEpSettings_Mapping.owningBusinessGroupEntityId.id
    }));
    // business group display name
    apAttributeDisplayList.push(APAttributesDisplayService.create_ApAttributeDisplay({ 
      name: APApisDisplayService.create_ManagedAssetAttribute_Name({ scope: EAPManagedAssetAttribute_Scope.BUSINESS_GROUP, tag: EAPManagedAssetAttribute_BusinessGroup_Tag.OWNING_DISPLAY_NAME }), 
      value: apEpSettings_Mapping.owningBusinessGroupEntityId.displayName
    }));
    // business group sharing 
    apAttributeDisplayList.push(APAttributesDisplayService.create_ApAttributeDisplay({ 
      name: APApisDisplayService.create_ManagedAssetAttribute_Name({ scope: EAPManagedAssetAttribute_Scope.BUSINESS_GROUP, tag: EAPManagedAssetAttribute_BusinessGroup_Tag.SHARING_LIST }), 
      value: APApisDisplayService.create_BusinessGroupSharingListString(apEpSettings_Mapping.apBusinessGroupSharingList)
    }));
    // publish destination
    const publishDestinationInfoStr: string | undefined = APApisDisplayService.create_PublishDestinationInfoString(apEpSettings_Mapping.apPublishDestinationInfo);
    if(publishDestinationInfoStr !== undefined) {
      apAttributeDisplayList.push(APAttributesDisplayService.create_ApAttributeDisplay({ 
        name: APApisDisplayService.create_ManagedAssetAttribute_Name({ scope: EAPManagedAssetAttribute_Scope.PUBLISH, tag: EAPManagedAssetAttribute_Publish_Tag.DESTINATION }), 
        value: publishDestinationInfoStr
      }));  
    }
    return APAttributesDisplayService.create_ApRawAttributeList({ apAttributeDisplayList: apAttributeDisplayList });
  }

  private create_ApEpSettings_MappingList_From_ApiEntities = async({ organizationId, apEpSettings_ConnectorAttributeMapElementList, complete_ApExternalSystemDisplayList }:{
    apEpSettings_ConnectorAttributeMapElementList?: TApEpSettings_ConnectorAttributeMapElementList;
    organizationId: string;
    complete_ApExternalSystemDisplayList: TAPExternalSystemDisplayList;
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
        owningBusinessGroupEntityId: this.extract_OwningBusinessGroupEntityId_From_ApRawAttributeList({ apRawAttributeList: apEpSettings_ConnectorAttributeMapElement.attributes }),
        apBusinessGroupSharingList: this.extract_BusinessGroupSharingList_From_ApRawAttributeList({ apRawAttributeList: apEpSettings_ConnectorAttributeMapElement.attributes }),
        apPublishDestinationInfo: this.extract_PublishDestinationInfo_From_ApRawAttributeList({ 
          apRawAttributeList: apEpSettings_ConnectorAttributeMapElement.attributes,
          complete_ApExternalSystemDisplayList: complete_ApExternalSystemDisplayList
        }),
        isValid: apEpApplicationDomainDisplay !== undefined,
        apSearchContent: ''
      };
        apEpSettings_MappingList.push(apEpSettings_Mapping);
    }
    return apEpSettings_MappingList;
  }

  private create_ApEpSettingsDisplay_From_ApiEntities = async({ organizationId, connectorImporterConfiguration, complete_ApExternalSystemDisplayList }:{
    connectorImporterConfiguration: ImporterConfiguration;
    organizationId: string;
    complete_ApExternalSystemDisplayList?: TAPExternalSystemDisplayList;
  }): Promise<IAPEpSettingsDisplay> => {
    // const funcName = 'create_ApEpSettingsDisplay_From_ApiEntities';
    // const logName = `${this.ComponentName}.${funcName}()`;

    // get the complete external system list for reference
    if(complete_ApExternalSystemDisplayList === undefined) {
      complete_ApExternalSystemDisplayList = await APExternalSystemsDisplayService.apiGetList_ApExternalSystemDisplay({ 
        organizationId: organizationId,
      });  
    }
    
    const apEpSettingsDisplay: IAPEpSettingsDisplay = {
      apEntityId: { id: connectorImporterConfiguration.name, displayName: connectorImporterConfiguration.displayName },
      connectorImporterConfiguration: connectorImporterConfiguration,
      apEpSettings_MappingList: await this.create_ApEpSettings_MappingList_From_ApiEntities({ 
        organizationId: organizationId, 
        apEpSettings_ConnectorAttributeMapElementList: connectorImporterConfiguration.attributeMap,
        complete_ApExternalSystemDisplayList: complete_ApExternalSystemDisplayList,
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

  public get_AllowedActions({ hasEventPortalConnectivity }:{
    // userId: string;
    // userBusinessGroupId?: string;
    // authorizedResourcePathAsString: string;
    hasEventPortalConnectivity: boolean;
    apEpSettingsDisplay: IAPEpSettingsDisplay;
  }): TAPEpSettingsDisplay_AllowedActions {
    if(!hasEventPortalConnectivity) return this.get_Empty_AllowedActions();
    const allowedActions: TAPEpSettingsDisplay_AllowedActions = {
      isEditAllowed: true,
      isDeleteAllowed: true,
      isViewAllowed: true,
    };
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

    // get the complete external system list for reference
    const complete_ApExternalSystemDisplayList: TAPExternalSystemDisplayList = await APExternalSystemsDisplayService.apiGetList_ApExternalSystemDisplay({ 
      organizationId: organizationId,
    });    
    
    const connectorImporterConfigurationList: Array<ImporterConfiguration> = await ManagementService.getAllImporters({ 
      organizationName: organizationId,
    });
    const list: TAPEpSettingsDisplayList = [];
    for(const connectorImporterConfiguration of connectorImporterConfigurationList) {
      list.push(await this.create_ApEpSettingsDisplay_From_ApiEntities({
        organizationId: organizationId, 
        connectorImporterConfiguration: connectorImporterConfiguration,
        complete_ApExternalSystemDisplayList: complete_ApExternalSystemDisplayList
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
      connectorImporterConfiguration: connectorImporterConfiguration,
    });
  }

  public async apiCreate_ApEpSettingsDisplay({ organizationId, apEpSettingsDisplay, doLogoutAllUsers }: {
    organizationId: string;
    apEpSettingsDisplay: IAPEpSettingsDisplay;
    doLogoutAllUsers: boolean;
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
    if(doLogoutAllUsers) await APLoginUsersDisplayService.apsSecLogoutOrganizationAll({ organizationId: organizationId });
    return await this.create_ApEpSettingsDisplay_From_ApiEntities({ 
      organizationId: organizationId,
      connectorImporterConfiguration: created
    });
  }

  public async apiUpdate_ApEpSettingsDisplay({ organizationId, apEpSettingsDisplay, doLogoutAllUsers }: {
    organizationId: string;
    apEpSettingsDisplay: IAPEpSettingsDisplay;
    doLogoutAllUsers: boolean;
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
    if(doLogoutAllUsers) await APLoginUsersDisplayService.apsSecLogoutOrganizationAll({ organizationId: organizationId });
    return await this.create_ApEpSettingsDisplay_From_ApiEntities({ 
      organizationId: organizationId,
      connectorImporterConfiguration: updated 
    });
  }

  public async apiDelete_ApEpSettingsDisplay({ organizationId, id, doLogoutAllUsers }:{
    organizationId: string;
    id: string;
    doLogoutAllUsers: boolean;
  }): Promise<void> {
    // const funcName = 'apiDelete_ApEpSettingsDisplay';
    // const logName = `${this.ComponentName}.${funcName}()`;
    // throw new Error(`${logName}: test error handling`);

    await ManagementService.deleteImporterJob({ 
      organizationName: organizationId,
      importerJobName: id
    });
    // logout all users from org
    if(doLogoutAllUsers) await APLoginUsersDisplayService.apsSecLogoutOrganizationAll({ organizationId: organizationId });
  }

  public async apiRun_ImportJob({ organizationId, id }: {
    organizationId: string;
    id: string;
  }): Promise<SuccessResponse> {
    // const funcName = 'apiRun_ImportJob';
    // const logName = `${this.ComponentName}.${funcName}()`;
    // throw new Error(`${logName}: test error handling`);

    const successResponse: SuccessResponse = await ManagementService.runImporterJob({ 
      organizationName: organizationId,
      importerJobName: id
    });

    return successResponse;
  }
}

export default new APEpSettingsDisplayService();
