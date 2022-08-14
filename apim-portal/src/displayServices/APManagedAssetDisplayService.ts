import { Validator, ValidatorResult } from 'jsonschema';
import APEntityIdsService, { 
  IAPEntityIdDisplay, 
  TAPEntityId,
  TAPEntityIdList
} from '../utils/APEntityIdsService';
import APAttributesDisplayService, { 
  TAPAttributeDisplayList,
  TAPRawAttributeList, 
} from './APAttributesDisplayService/APAttributesDisplayService';
import APBusinessGroupsDisplayService, { 
  TAPBusinessGroupDisplay,
  TAPBusinessGroupDisplayList,
  TAPBusinessGroupDisplay_ExternalReference
} from './APBusinessGroupsDisplayService';
import { TAPExternalSystemDisplayList } from './APExternalSystemsDisplayService';
import APManagedAssetDisplay_BusinessGroupSharing_Schema from './schemas/APManagedAssetDisplay_BusinessGroupSharing_Schema.json';

const CAPManagedAssetAttribute_Prefix = "AP";
export enum EAPManagedAssetAttribute_Scope {
  ASSET_OWNER = "ASSET_OWNER",
  BUSINESS_GROUP = "BUSINESS_GROUP",
  CLASSIFICATION = "CLASSIFICATION",
  PUBLISH = "PUBLISH",
  CUSTOM = "CUSTOM",
}
export enum EAPManagedAssetAttribute_BusinessGroup_Tag {
  OWNING_ID = "OWNING_ID",
  OWNING_DISPLAY_NAME = "OWNING_DISPLAY_NAME",
  OWNING_EXTERNAL_ID = "OWNING_EXTERNAL_ID",
  OWNING_EXTERNAL_DISPLAY_NAME = "OWNING_EXTERNAL_DISPLAY_NAME",
  EXTERNAL_SYSTEM_ID = "EXTERNAL_SYSTEM_ID",
  SHARING_LIST = "SHARING_LIST",
}
export enum EAPManagedAssetAttribute_Owner_Tag {
  ID = "ID",
}
enum EAPManagedAssetAttribute_Classification_Tag {
  C1 = "C1",
  C2 = "C2",
  C3 = "C3",
  C4 = "C4"
}
export enum EAPManagedAssetAttribute_Publish_Tag {
  DESTINATION = "DESTINATION",
}
type TManagedAssetAttribute_Tag = 
EAPManagedAssetAttribute_BusinessGroup_Tag
| EAPManagedAssetAttribute_Owner_Tag
| EAPManagedAssetAttribute_Classification_Tag
| EAPManagedAssetAttribute_Publish_Tag;

export type TAPManagedAssetDisplay_Attributes = IAPEntityIdDisplay & {
  apExternal_ApAttributeDisplayList: TAPAttributeDisplayList;
  apCustom_ApAttributeDisplayList: TAPAttributeDisplayList;
}
export enum E_ManagedAssetDisplay_BusinessGroupSharing_AccessType {
  READONLY = "readonly",
  FULL_ACCESS = "full-access",
}

export type TAPManagedAssetDisplay_BusinessGroupSharing = IAPEntityIdDisplay & {
  apSharingAccessType: E_ManagedAssetDisplay_BusinessGroupSharing_AccessType;
  apExternalReference?: TAPBusinessGroupDisplay_ExternalReference;
}
export type TAPManagedAssetDisplay_BusinessGroupSharingList = Array<TAPManagedAssetDisplay_BusinessGroupSharing>;
export type TAPManagedAssetBusinessGroupInfo = {
  apOwningBusinessGroupEntityId: TAPEntityId;
  apBusinessGroupSharingList: TAPManagedAssetDisplay_BusinessGroupSharingList;
}
export type TAPManagedAssetOwnerInfo = TAPEntityId;

export type TAPManagedAssetPublishDestinationInfo = {
  apExternalSystemEntityIdList: TAPEntityIdList;
}
export interface IAPManagedAssetDisplay extends IAPEntityIdDisplay {
  devel_display_complete_ApAttributeList: TAPAttributeDisplayList; /** for devel display purposes only, only set during creation from api, not maintained on update */
  apExternal_ApAttributeDisplayList: TAPAttributeDisplayList;
  apCustom_ApAttributeDisplayList: TAPAttributeDisplayList;
  apBusinessGroupInfo: TAPManagedAssetBusinessGroupInfo;
  apOwnerInfo: TAPManagedAssetOwnerInfo;
  apPublishDestinationInfo: TAPManagedAssetPublishDestinationInfo;
  // classification
  // ...
}
export type TAPManagedAssetDisplayList = Array<IAPManagedAssetDisplay>;

export type TAPManagedAssetDisplay_AccessAndState = {
  apBusinessGroupInfo: TAPManagedAssetBusinessGroupInfo;
  apOwnerInfo: TAPManagedAssetOwnerInfo;
}

/**
 * Manage aspects common to all assets.
 * - business group info
 * - lifecycle
 * - classification
 * - custom
 * - external (unknown)
 */
export abstract class APManagedAssetDisplayService {
  private readonly BaseComponentName = "APManagedAssetDisplayService";

  public nameOf<T extends IAPManagedAssetDisplay>(name: keyof T) {
    return name;
  }
  public nameOf_ApEntityId(name: keyof TAPEntityId) {
    return `${this.nameOf('apEntityId')}.${name}`;
  }
  private _nameOf_ApBusinessGroupInfo(name: keyof TAPManagedAssetBusinessGroupInfo) {
    return `${this.nameOf('apBusinessGroupInfo')}.${name}`;
  }
  public nameOf_ApBusinessGroupInfo_ApOwningBusinessGroupEntityId(name: keyof TAPEntityId) {
    return `${this._nameOf_ApBusinessGroupInfo('apOwningBusinessGroupEntityId')}.${name}`;
  }
  
  // public nameOf_ApBusinessGroupInfo_ApBusinessGroupDisplayReference(name: keyof TAPBusinessGroupDisplayReference) {
  //   return `${this._nameOf_ApBusinessGroupInfo('apOwningBusinessGroupEntityId')}.${name}`;
  // }
  // public nameOf_ApBusinessGroupInfo_ApBusinessGroupDisplayReference_ApEntityId(name: keyof TAPEntityId) {
  //   return `${this._nameOf_ApBusinessGroupInfo('apEntityId')}.${name}`;
  // }
  public nameOf_BusinessGroupSharing(name: keyof TAPManagedAssetDisplay_BusinessGroupSharing) {
    return name;
  }
  public nameOf_BusinessGroupSharing_ApEntityId(name: keyof TAPEntityId) {
    return `${this.nameOf_BusinessGroupSharing('apEntityId')}.${name}`;
  }

  protected create_ManagedAssetAttribute_Prefix = (): string => {
    return `_${CAPManagedAssetAttribute_Prefix}_`;
  }
  protected create_ManagedAssetAttribute_Name = ({ scope, tag }: {
    scope: EAPManagedAssetAttribute_Scope;
    tag?: TManagedAssetAttribute_Tag;
  }): string => {
    if(tag !== undefined) return `_${CAPManagedAssetAttribute_Prefix}_${scope}_${tag}_`;
    return `_${CAPManagedAssetAttribute_Prefix}_${scope}_`;
  }

  protected create_ConnectorFilter_For_Attribute({ attributeName, attributeValue }:{
    attributeName: string;
    attributeValue: string;
  }): string {
    return `"${attributeName}" "${attributeValue}"`;
  }

  protected get_AttributeName_OwningBusinessGroupId(): string {
    return this.create_ManagedAssetAttribute_Name({ scope: EAPManagedAssetAttribute_Scope.BUSINESS_GROUP, tag: EAPManagedAssetAttribute_BusinessGroup_Tag.OWNING_ID });
  }
  
  protected get_AttributeName_SharingBusinessGroupId(): string {
    return this.create_ManagedAssetAttribute_Name({ scope: EAPManagedAssetAttribute_Scope.BUSINESS_GROUP, tag: EAPManagedAssetAttribute_BusinessGroup_Tag.SHARING_LIST });
  }

  public create_Empty_ApManagedAssetDisplay_BusinessGroupSharing(): TAPManagedAssetDisplay_BusinessGroupSharing {
    return {
      apEntityId: APEntityIdsService.create_EmptyObject_NoId(),
      apSharingAccessType: E_ManagedAssetDisplay_BusinessGroupSharing_AccessType.READONLY,
    };
  }

  public get_ApManagedAssetDisplay_BusinessGroupSharing_AccessType_SelectList = (): Array<E_ManagedAssetDisplay_BusinessGroupSharing_AccessType> => {
    return Object.values(E_ManagedAssetDisplay_BusinessGroupSharing_AccessType);
  }

  protected create_Empty_ApManagedAssetDisplay(): IAPManagedAssetDisplay {
    const apManagedAssetDisplay: IAPManagedAssetDisplay = {
      apEntityId: APEntityIdsService.create_EmptyObject(),
      devel_display_complete_ApAttributeList: [],
      apExternal_ApAttributeDisplayList: [],
      apCustom_ApAttributeDisplayList: [],
      apBusinessGroupInfo: {
        apOwningBusinessGroupEntityId: APEntityIdsService.create_EmptyObject_NoId(),
        apBusinessGroupSharingList: [],
      },
      apOwnerInfo: APEntityIdsService.create_EmptyObject_NoId(),
      apPublishDestinationInfo: {
        apExternalSystemEntityIdList: []
      }
    };
    return apManagedAssetDisplay;
  }

  private parse_BusinessGroupSharingListString(attributeValue: string): TAPManagedAssetDisplay_BusinessGroupSharingList {
    const funcName = 'parse_BusinessGroupSharingListString';
    const logName = `${this.BaseComponentName}.${funcName}()`;

    const apManagedAssetDisplay_BusinessGroupSharingList: TAPManagedAssetDisplay_BusinessGroupSharingList = [];
    try {
      // try parse as JSON and validate against schema
      const jsonBusinessGroupSharingList: TAPManagedAssetDisplay_BusinessGroupSharingList = JSON.parse(attributeValue);
      for(const jsonBusinessGroupSharing of jsonBusinessGroupSharingList) {
        // validate content
        const v: Validator = new Validator();
        const validateResult: ValidatorResult = v.validate(jsonBusinessGroupSharing, APManagedAssetDisplay_BusinessGroupSharing_Schema);
        if(!validateResult.valid) throw new Error(`${logName}: validateResult=${JSON.stringify(validateResult.errors, null, 2)}`);
        apManagedAssetDisplay_BusinessGroupSharingList.push(jsonBusinessGroupSharing);
      }
    } catch(e: any) {
      console.error(`${logName}: error parsing attributeValue = ${attributeValue}, e=${e}`);
    } finally {
      return apManagedAssetDisplay_BusinessGroupSharingList;
    }
  }

  protected create_BusinessGroupSharingListString(apManagedAssetDisplay_BusinessGroupSharingList: TAPManagedAssetDisplay_BusinessGroupSharingList): string {
    return JSON.stringify(apManagedAssetDisplay_BusinessGroupSharingList);
  }

  private create_recovered_ApManagedAssetBusinessGroupInfo(): TAPManagedAssetBusinessGroupInfo {
    return {
      apOwningBusinessGroupEntityId: APBusinessGroupsDisplayService.create_recovered_BusinessGroupEntityId(),
      apBusinessGroupSharingList: []
    };
  }

  protected is_recovered_ApManagedAssetDisplay({ apManagedAssetDisplay }:{
    apManagedAssetDisplay: IAPManagedAssetDisplay
  }): boolean {
    return apManagedAssetDisplay.apBusinessGroupInfo.apOwningBusinessGroupEntityId.id === APBusinessGroupsDisplayService.get_recovered_BusinessGroupId();
  }

  private parse_PublishDestinationListString(attributeValue: string): Array<string> {
    const funcName = 'parse_PublishDestinationListString';
    const logName = `${this.BaseComponentName}.${funcName}()`;
    const idList: Array<string> = [];
    try {
      idList.push(...attributeValue.split(','));
    } catch(e: any) {
      console.error(`${logName}: error parsing attributeValue = ${attributeValue}, e=${e}`);
    } finally {
      return idList;
    }
  }

  protected create_PublishDestinationInfoString(apPublishDestinationInfo: TAPManagedAssetPublishDestinationInfo): string | undefined {
    if(apPublishDestinationInfo.apExternalSystemEntityIdList.length === 0) return undefined;
    return APEntityIdsService.create_IdList(apPublishDestinationInfo.apExternalSystemEntityIdList).join(',');
  }

  private getValidatedPublishDestinationList({ publishDestinationList_apAttributeDisplayList, complete_ApExternalSystemDisplayList }:{
    publishDestinationList_apAttributeDisplayList: TAPAttributeDisplayList;
    complete_ApExternalSystemDisplayList: TAPExternalSystemDisplayList;
  }): TAPEntityIdList {
    const resultList: TAPEntityIdList = [];
    if(publishDestinationList_apAttributeDisplayList.length > 0) {
      const externalSystemIdList: Array<string> = this.parse_PublishDestinationListString(publishDestinationList_apAttributeDisplayList[0].value);
      for(const externalSystemId of externalSystemIdList) {
        // find the external system
        const found = complete_ApExternalSystemDisplayList.find( (x) => {
          return x.apEntityId.id === externalSystemId;
        });
        if(found !== undefined) {
          if(found.isMarketplaceDestination) resultList.push(found.apEntityId);
        }
      }
    }
    return resultList;
  }

  private getValidatedBusinessGroupEntityId({ businessGroupId_ApAttributeDisplayList, complete_ApBusinessGroupDisplayList }:{
    businessGroupId_ApAttributeDisplayList: TAPAttributeDisplayList;
    complete_ApBusinessGroupDisplayList: TAPBusinessGroupDisplayList;
  }): TAPEntityId | undefined {
    if(businessGroupId_ApAttributeDisplayList.length === 0) return undefined;
    const businessGroupId: string = businessGroupId_ApAttributeDisplayList[0].value;
    const found = complete_ApBusinessGroupDisplayList.find( (x) => {
      return x.apEntityId.id === businessGroupId;
    });
    if(found === undefined) return found;
    return found.apEntityId;
  }

  /**
   * Returns configured business group sharing list. 
   * If any of the businessGroupIds is not found, returns empty list.
   */
  private getValidatedBusinessGroupSharingList({ businessGroupSharingList_apAttributeDisplayList, complete_ApBusinessGroupDisplayList }:{
    businessGroupSharingList_apAttributeDisplayList: TAPAttributeDisplayList;
    complete_ApBusinessGroupDisplayList: TAPBusinessGroupDisplayList;
  }): TAPManagedAssetDisplay_BusinessGroupSharingList {
    const resultList: TAPManagedAssetDisplay_BusinessGroupSharingList = [];
    if(businessGroupSharingList_apAttributeDisplayList.length > 0) {
      const list: TAPManagedAssetDisplay_BusinessGroupSharingList = this.parse_BusinessGroupSharingListString(businessGroupSharingList_apAttributeDisplayList[0].value);
      for(const apManagedAssetDisplay_BusinessGroupSharing of list) {
        // find the business group id
        const found = complete_ApBusinessGroupDisplayList.find( (x) => {
          return x.apEntityId.id === apManagedAssetDisplay_BusinessGroupSharing.apEntityId.id;
        });
        if(found === undefined) return [];
        resultList.push(apManagedAssetDisplay_BusinessGroupSharing);
      }
    }
    return resultList;
  }
  /**
   * Extracts all attributes for business group management. Cross checks configured ids with the actual known ids.
   * Looks for business group Id + display name.
   * - Requires business group Id + displayName to be present
   * - Discards all others
   * - sets the business group info to 'recovered assets' if none found or cross-check failed. 
   */
  private create_ApManagedAssetBusinessGroupInfo({ apAttributeDisplayList, complete_ApBusinessGroupDisplayList }: {
    apAttributeDisplayList: TAPAttributeDisplayList;
    complete_ApBusinessGroupDisplayList: TAPBusinessGroupDisplayList;
  }): TAPManagedAssetBusinessGroupInfo {
    // const funcName = 'create_ApManagedAssetBusinessGroupInfo';
    // const logName = `${this.BaseComponentName}.${funcName}()`;

    // set to default in case none is found
    const apManagedAssetBusinessGroupInfo: TAPManagedAssetBusinessGroupInfo = {
      apOwningBusinessGroupEntityId: APEntityIdsService.create_EmptyObject_NoId(),
      apBusinessGroupSharingList: [],
    };

    // extract business group attributes
    const apBusinessGroupAttributeDisplayList: TAPAttributeDisplayList = APAttributesDisplayService.extract_Prefixed_With({
      prefixed_with: this.create_ManagedAssetAttribute_Name({ scope: EAPManagedAssetAttribute_Scope.BUSINESS_GROUP }),
      apAttributeDisplayList: apAttributeDisplayList
    });
    // alert(`${logName}: apBusinessGroupAttributeDisplayList=${JSON.stringify(apBusinessGroupAttributeDisplayList)}`);
    if(apBusinessGroupAttributeDisplayList.length === 0) {
      // console.warn(`${logName}: apBusinessGroupAttributeDisplayList.length === 0, returning recovered info`);
      return this.create_recovered_ApManagedAssetBusinessGroupInfo();
    }

    // id & displayName
    const businessGroupId_apAttributeDisplayList: TAPAttributeDisplayList = APAttributesDisplayService.extract_Prefixed_With({
      prefixed_with: this.create_ManagedAssetAttribute_Name({ scope: EAPManagedAssetAttribute_Scope.BUSINESS_GROUP, tag: EAPManagedAssetAttribute_BusinessGroup_Tag.OWNING_ID }),
      apAttributeDisplayList: apBusinessGroupAttributeDisplayList
    });
    const businessGroupEntityId: TAPEntityId | undefined = this.getValidatedBusinessGroupEntityId({ 
      businessGroupId_ApAttributeDisplayList: businessGroupId_apAttributeDisplayList, 
      complete_ApBusinessGroupDisplayList: complete_ApBusinessGroupDisplayList 
    });
    if(businessGroupEntityId === undefined) return this.create_recovered_ApManagedAssetBusinessGroupInfo();
    apManagedAssetBusinessGroupInfo.apOwningBusinessGroupEntityId = businessGroupEntityId;
    // sharing list
    const businessGroupSharingList_apAttributeDisplayList: TAPAttributeDisplayList = APAttributesDisplayService.extract_Prefixed_With({
      prefixed_with: this.create_ManagedAssetAttribute_Name({ scope: EAPManagedAssetAttribute_Scope.BUSINESS_GROUP, tag: EAPManagedAssetAttribute_BusinessGroup_Tag.SHARING_LIST }),
      apAttributeDisplayList: apBusinessGroupAttributeDisplayList
    });
    apManagedAssetBusinessGroupInfo.apBusinessGroupSharingList = this.getValidatedBusinessGroupSharingList({
      businessGroupSharingList_apAttributeDisplayList: businessGroupSharingList_apAttributeDisplayList,
      complete_ApBusinessGroupDisplayList: complete_ApBusinessGroupDisplayList
    });

    return apManagedAssetBusinessGroupInfo;

  }

  private create_ApManagedAsset_OwnerInfo({ apAttributeDisplayList, default_ownerId }:{
    apAttributeDisplayList: TAPAttributeDisplayList;
    default_ownerId: string;
  }): TAPManagedAssetOwnerInfo {

    const apManagedAssetOwnerInfo: TAPManagedAssetOwnerInfo = APEntityIdsService.create_EmptyObject();
    const ownerList: TAPAttributeDisplayList = APAttributesDisplayService.extract_Prefixed_With({
      prefixed_with: this.create_ManagedAssetAttribute_Name({ scope: EAPManagedAssetAttribute_Scope.ASSET_OWNER, tag: EAPManagedAssetAttribute_Owner_Tag.ID }),
      apAttributeDisplayList: apAttributeDisplayList
    });
    if(ownerList.length > 0) {
      const ownerId: string = ownerList[0].value;
      apManagedAssetOwnerInfo.id = ownerId;
      apManagedAssetOwnerInfo.displayName = ownerId;
    } else {
      apManagedAssetOwnerInfo.id = default_ownerId;
      apManagedAssetOwnerInfo.displayName = default_ownerId;
    }
    return apManagedAssetOwnerInfo;
  }

  private create_ApManagedAsset_PublishDestinationInfo({ apAttributeDisplayList, complete_ApExternalSystemDisplayList }:{
    apAttributeDisplayList: TAPAttributeDisplayList;
    complete_ApExternalSystemDisplayList: TAPExternalSystemDisplayList;
  }): TAPManagedAssetPublishDestinationInfo {
    const apManagedAssetPublishDestinationInfo: TAPManagedAssetPublishDestinationInfo = {
      apExternalSystemEntityIdList: []
    };
    const publishDestinationList: TAPAttributeDisplayList = APAttributesDisplayService.extract_Prefixed_With({
      prefixed_with: this.create_ManagedAssetAttribute_Name({ scope: EAPManagedAssetAttribute_Scope.PUBLISH, tag: EAPManagedAssetAttribute_Publish_Tag.DESTINATION }),
      apAttributeDisplayList: apAttributeDisplayList
    });
    apManagedAssetPublishDestinationInfo.apExternalSystemEntityIdList = this.getValidatedPublishDestinationList({
      publishDestinationList_apAttributeDisplayList: publishDestinationList,
      complete_ApExternalSystemDisplayList: complete_ApExternalSystemDisplayList
    });
    return apManagedAssetPublishDestinationInfo;
  }

  /**
   * Create a managed asset display object.
   */
  protected create_ApManagedAssetDisplay_From_ApiEntities({ id, displayName, apRawAttributeList, default_ownerId, complete_ApBusinessGroupDisplayList, complete_ApExternalSystemDisplayList }: {
    id: string;
    displayName: string;
    apRawAttributeList: TAPRawAttributeList;
    default_ownerId: string;
    complete_ApBusinessGroupDisplayList: TAPBusinessGroupDisplayList;
    complete_ApExternalSystemDisplayList: TAPExternalSystemDisplayList;
  }): IAPManagedAssetDisplay {
    // const funcName = 'create_ApManagedAssetDisplay';
    // const logName = `${this.BaseComponentName}.${funcName}()`;

    // create the working list
    const working_ApAttributeDisplayList: TAPAttributeDisplayList = APAttributesDisplayService.create_ApAttributeDisplayList({
      apRawAttributeList: apRawAttributeList
    });
    // save complete list for devel purposes
    const devel_complete_ApAttributeDisplayList: TAPAttributeDisplayList = JSON.parse(JSON.stringify(working_ApAttributeDisplayList));
    // extract externally controlled attributes
    const _apExternal_ApAttributeDisplayList: TAPAttributeDisplayList = APAttributesDisplayService.extract_Not_Prefixed_With({
      not_prefixed_with: this.create_ManagedAssetAttribute_Prefix(),
      apAttributeDisplayList: working_ApAttributeDisplayList
    });
    // working_ApAttributeDisplayList now contains only the AP controlled attributes
    // alert(`${logName}: after external attributes, working_ApAttributeDisplayList=${JSON.stringify(working_ApAttributeDisplayList, null, 2)}`);
    // extract custom attributes
    const _apCustom_AttributeDisplayList: TAPAttributeDisplayList = APAttributesDisplayService.extract_Prefixed_With({
      prefixed_with: this.create_ManagedAssetAttribute_Name({ scope: EAPManagedAssetAttribute_Scope.CUSTOM }),
      apAttributeDisplayList: working_ApAttributeDisplayList
    });
    // working_ApAttributeDisplayList now contains only the AP standard attributes
    // create the business group info
    const apBusinessGroupInfo: TAPManagedAssetBusinessGroupInfo = this.create_ApManagedAssetBusinessGroupInfo({
      apAttributeDisplayList: working_ApAttributeDisplayList,
      complete_ApBusinessGroupDisplayList: complete_ApBusinessGroupDisplayList,
    });
    // create the owner info
    const apManagedAssetOwnerInfo: TAPManagedAssetOwnerInfo = this.create_ApManagedAsset_OwnerInfo({ 
      apAttributeDisplayList: working_ApAttributeDisplayList,
      default_ownerId: default_ownerId
    });
    // create publishDestinationInfo
    const apManagedAssetPublishDestinationInfo: TAPManagedAssetPublishDestinationInfo = this.create_ApManagedAsset_PublishDestinationInfo({ 
      apAttributeDisplayList: working_ApAttributeDisplayList,
      complete_ApExternalSystemDisplayList: complete_ApExternalSystemDisplayList,
    });

    // create other like classification, etc.

    const result: IAPManagedAssetDisplay = {
      apEntityId: { id: id, displayName: displayName },
      devel_display_complete_ApAttributeList: devel_complete_ApAttributeDisplayList,
      apExternal_ApAttributeDisplayList: _apExternal_ApAttributeDisplayList,
      apCustom_ApAttributeDisplayList: _apCustom_AttributeDisplayList,
      apBusinessGroupInfo: apBusinessGroupInfo,
      apOwnerInfo: apManagedAssetOwnerInfo,
      apPublishDestinationInfo: apManagedAssetPublishDestinationInfo,
    };
    return result;
  }

  public get_ApExternalAttributeList({ apManagedAssetDisplay }:{
    apManagedAssetDisplay: IAPManagedAssetDisplay;
  }): TAPAttributeDisplayList {
    return apManagedAssetDisplay.apExternal_ApAttributeDisplayList;
  }

  /**
   * Makes a copy of apExternal_ApAttributeDisplayList and sets it in apManagedAssetDisplay.
   */
  public set_ApExternalAttributeList({ apManagedAssetDisplay, apExternal_ApAttributeDisplayList }: {
    apManagedAssetDisplay: IAPManagedAssetDisplay;
    apExternal_ApAttributeDisplayList: TAPAttributeDisplayList;
  }): IAPManagedAssetDisplay {
    apManagedAssetDisplay.apExternal_ApAttributeDisplayList = JSON.parse(JSON.stringify(apExternal_ApAttributeDisplayList));
    return apManagedAssetDisplay;
  }

  public get_ApCustomAttributeList({ apManagedAssetDisplay }:{
    apManagedAssetDisplay: IAPManagedAssetDisplay;
  }): TAPAttributeDisplayList {
    return apManagedAssetDisplay.apCustom_ApAttributeDisplayList;
  }

  /**
   * Makes a copy of apCustom_ApAttributeDisplayList and sets it in apManagedAssetDisplay.
   */
  public set_ApCustomAttributeList({ apManagedAssetDisplay, apCustom_ApAttributeDisplayList }: {
    apManagedAssetDisplay: IAPManagedAssetDisplay;
    apCustom_ApAttributeDisplayList: TAPAttributeDisplayList;
  }): IAPManagedAssetDisplay {
    apManagedAssetDisplay.apCustom_ApAttributeDisplayList = JSON.parse(JSON.stringify(apCustom_ApAttributeDisplayList));
    return apManagedAssetDisplay;
  }

  public get_ApOwnerInfo({ apManagedAssetDisplay }:{
    apManagedAssetDisplay: IAPManagedAssetDisplay;
  }): TAPManagedAssetOwnerInfo {
    return apManagedAssetDisplay.apOwnerInfo;
  }

  /**
   * Makes a copy of apOwnerInfo and sets it in apManagedAssetDisplay.
   */
  public set_ApOwnerInfo({ apManagedAssetDisplay, apOwnerInfo }: {
    apManagedAssetDisplay: IAPManagedAssetDisplay;
    apOwnerInfo: TAPManagedAssetOwnerInfo;
  }): IAPManagedAssetDisplay {
    apManagedAssetDisplay.apOwnerInfo = JSON.parse(JSON.stringify(apOwnerInfo));
    return apManagedAssetDisplay;
  }

  public get_ApBusinessGroupInfo({ apManagedAssetDisplay }: {
    apManagedAssetDisplay: IAPManagedAssetDisplay;
  }): TAPManagedAssetBusinessGroupInfo {
    return apManagedAssetDisplay.apBusinessGroupInfo;
  }

  /**
   * Makes a copy of apManagedAssetBusinessGroupInfo and sets it in apManagedAssetDisplay.
   */
   public set_ApBusinessGroupInfo({ apManagedAssetDisplay, apManagedAssetBusinessGroupInfo }: {
    apManagedAssetDisplay: IAPManagedAssetDisplay;
    apManagedAssetBusinessGroupInfo: TAPManagedAssetBusinessGroupInfo;
  }): IAPManagedAssetDisplay {
    apManagedAssetDisplay.apBusinessGroupInfo = JSON.parse(JSON.stringify(apManagedAssetBusinessGroupInfo));
    return apManagedAssetDisplay;
  }

  public get_ApManagedAssetDisplay_AccessAndState({ apManagedAssetDisplay }:{
    apManagedAssetDisplay: IAPManagedAssetDisplay;
  }): TAPManagedAssetDisplay_AccessAndState {
    const apManagedAssetDisplay_AccessAndState: TAPManagedAssetDisplay_AccessAndState = {
      apBusinessGroupInfo: this.get_ApBusinessGroupInfo({ apManagedAssetDisplay: apManagedAssetDisplay }),
      apOwnerInfo: this.get_ApOwnerInfo({ apManagedAssetDisplay: apManagedAssetDisplay })
    };
    return apManagedAssetDisplay_AccessAndState;
  }

  /** 
   * Set the access & state properties. 
   * @returns the modified apApiProductDisplay (not a copy)
  */
   public set_ApManagedAssetDisplay_AccessAndState({ apManagedAssetDisplay, apManagedAssetDisplay_AccessAndState }:{
    apManagedAssetDisplay: IAPManagedAssetDisplay;
    apManagedAssetDisplay_AccessAndState: TAPManagedAssetDisplay_AccessAndState;
  }): IAPManagedAssetDisplay {
    this.set_ApBusinessGroupInfo({ apManagedAssetDisplay: apManagedAssetDisplay, apManagedAssetBusinessGroupInfo: apManagedAssetDisplay_AccessAndState.apBusinessGroupInfo });
    this.set_ApOwnerInfo({ apManagedAssetDisplay: apManagedAssetDisplay, apOwnerInfo: apManagedAssetDisplay_AccessAndState.apOwnerInfo });
    return apManagedAssetDisplay;
  }

  /**
   * Convenience method to get all attributes in one object.
   */
  public get_ApManagedAssetDisplay_Attributes({ apManagedAssetDisplay }:{
    apManagedAssetDisplay: IAPManagedAssetDisplay;
  }): TAPManagedAssetDisplay_Attributes {
    const apManagedAssetDisplay_Attributes: TAPManagedAssetDisplay_Attributes = {
      apEntityId: apManagedAssetDisplay.apEntityId,
      apExternal_ApAttributeDisplayList: this.get_ApExternalAttributeList({ apManagedAssetDisplay: apManagedAssetDisplay }),
      apCustom_ApAttributeDisplayList: this.get_ApCustomAttributeList({ apManagedAssetDisplay: apManagedAssetDisplay }),
    };
    return apManagedAssetDisplay_Attributes;
  }

  /** 
   * Convenience method to set all attributes in one object.
   * 
   * @param apManagedAssetDisplay - updated with input 
   * @returns the modified apManagedAssetDisplay (not a copy)
  */
  public set_ApManagedAssetDisplay_Attributes({ apManagedAssetDisplay, apManagedAssetDisplay_Attributes }:{
    apManagedAssetDisplay: IAPManagedAssetDisplay;
    apManagedAssetDisplay_Attributes: TAPManagedAssetDisplay_Attributes;
  }): IAPManagedAssetDisplay {

    this.set_ApExternalAttributeList({
      apManagedAssetDisplay: apManagedAssetDisplay,
      apExternal_ApAttributeDisplayList: apManagedAssetDisplay_Attributes.apExternal_ApAttributeDisplayList,
    });
    this.set_ApCustomAttributeList({
      apManagedAssetDisplay: apManagedAssetDisplay,
      apCustom_ApAttributeDisplayList: apManagedAssetDisplay_Attributes.apCustom_ApAttributeDisplayList,
    });
    return apManagedAssetDisplay;
  }

  public async create_Complete_ApAttributeList({ organizationId, apManagedAssetDisplay }:{
    organizationId: string;
    apManagedAssetDisplay: IAPManagedAssetDisplay;
  }): Promise<TAPAttributeDisplayList> {

    // work on a copy
    const _complete_ApAttributeList: TAPAttributeDisplayList = JSON.parse(JSON.stringify(this.get_ApExternalAttributeList({ apManagedAssetDisplay: apManagedAssetDisplay })));

    _complete_ApAttributeList.push(...this.get_ApCustomAttributeList({ apManagedAssetDisplay: apManagedAssetDisplay }));
    
    // get the business group
    const apBusinessGroupDisplay: TAPBusinessGroupDisplay = await APBusinessGroupsDisplayService.apsGet_ApBusinessGroupDisplay({
      organizationId: organizationId,
      businessGroupId: apManagedAssetDisplay.apBusinessGroupInfo.apOwningBusinessGroupEntityId.id,
    });
    // add the business group info attributes
    // business group id
    _complete_ApAttributeList.push(APAttributesDisplayService.create_ApAttributeDisplay({ 
      name: this.create_ManagedAssetAttribute_Name({ scope: EAPManagedAssetAttribute_Scope.BUSINESS_GROUP, tag: EAPManagedAssetAttribute_BusinessGroup_Tag.OWNING_ID }), 
      value: apBusinessGroupDisplay.apEntityId.id
    }));
    // business group displayName
    _complete_ApAttributeList.push(APAttributesDisplayService.create_ApAttributeDisplay({ 
      name: this.create_ManagedAssetAttribute_Name({ scope: EAPManagedAssetAttribute_Scope.BUSINESS_GROUP, tag: EAPManagedAssetAttribute_BusinessGroup_Tag.OWNING_DISPLAY_NAME }), 
      value: apBusinessGroupDisplay.apEntityId.displayName
    }));
    if(apBusinessGroupDisplay.apExternalReference !== undefined) {
      // external business group id
      _complete_ApAttributeList.push(APAttributesDisplayService.create_ApAttributeDisplay({ 
        name: this.create_ManagedAssetAttribute_Name({ scope: EAPManagedAssetAttribute_Scope.BUSINESS_GROUP, tag: EAPManagedAssetAttribute_BusinessGroup_Tag.OWNING_EXTERNAL_ID }), 
        value: apBusinessGroupDisplay.apExternalReference.externalId,
      }));
      // external business group displayName
      _complete_ApAttributeList.push(APAttributesDisplayService.create_ApAttributeDisplay({ 
        name: this.create_ManagedAssetAttribute_Name({ scope: EAPManagedAssetAttribute_Scope.BUSINESS_GROUP, tag: EAPManagedAssetAttribute_BusinessGroup_Tag.OWNING_EXTERNAL_DISPLAY_NAME }), 
        value: apBusinessGroupDisplay.apExternalReference.displayName
      }));
      // external system id
      _complete_ApAttributeList.push(APAttributesDisplayService.create_ApAttributeDisplay({ 
        name: this.create_ManagedAssetAttribute_Name({ scope: EAPManagedAssetAttribute_Scope.BUSINESS_GROUP, tag: EAPManagedAssetAttribute_BusinessGroup_Tag.EXTERNAL_SYSTEM_ID }), 
        value: apBusinessGroupDisplay.apExternalReference.externalSystemId
      }));    
    }
    // business group sharing
    _complete_ApAttributeList.push(APAttributesDisplayService.create_ApAttributeDisplay({ 
      name: this.create_ManagedAssetAttribute_Name({ scope: EAPManagedAssetAttribute_Scope.BUSINESS_GROUP, tag: EAPManagedAssetAttribute_BusinessGroup_Tag.SHARING_LIST }), 
      value: this.create_BusinessGroupSharingListString(apManagedAssetDisplay.apBusinessGroupInfo.apBusinessGroupSharingList)
    }));

    // owner info
    _complete_ApAttributeList.push(APAttributesDisplayService.create_ApAttributeDisplay({ 
        name: this.create_ManagedAssetAttribute_Name({ scope: EAPManagedAssetAttribute_Scope.ASSET_OWNER, tag: EAPManagedAssetAttribute_Owner_Tag.ID }), 
        value: apManagedAssetDisplay.apOwnerInfo.id
    }));

    // publishDestination info
    const publishDestinationInfoStr: string | undefined = this.create_PublishDestinationInfoString(apManagedAssetDisplay.apPublishDestinationInfo);
    if(publishDestinationInfoStr !== undefined) {
      _complete_ApAttributeList.push(APAttributesDisplayService.create_ApAttributeDisplay({ 
        name: this.create_ManagedAssetAttribute_Name({ scope: EAPManagedAssetAttribute_Scope.PUBLISH, tag: EAPManagedAssetAttribute_Publish_Tag.DESTINATION }), 
        value: publishDestinationInfoStr
      }));  
    }
  
    return _complete_ApAttributeList;
  }

  public async create_Complete_ApRawAttributeList({ organizationId, apManagedAssetDisplay }:{
    organizationId: string;
    apManagedAssetDisplay: IAPManagedAssetDisplay;
  }): Promise<TAPRawAttributeList> {
    const rawAttributeList: TAPRawAttributeList = APAttributesDisplayService.create_ApRawAttributeList({
      apAttributeDisplayList: await this.create_Complete_ApAttributeList({ 
        organizationId: organizationId,
        apManagedAssetDisplay: apManagedAssetDisplay 
      })
    });
    return rawAttributeList;
  }

  // ********************************************************************************************************************************
  // API calls
  // ********************************************************************************************************************************


}