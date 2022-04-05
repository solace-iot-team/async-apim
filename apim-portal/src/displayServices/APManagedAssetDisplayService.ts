import APEntityIdsService, { 
  IAPEntityIdDisplay, 
  TAPEntityId
} from '../utils/APEntityIdsService';
import APAttributesDisplayService, { 
  TAPAttributeDisplayList,
  TAPRawAttributeList, 
} from './APAttributesDisplayService/APAttributesDisplayService';
import APBusinessGroupsDisplayService, { 
  TAPBusinessGroupDisplay,
  TAPBusinessGroupDisplayReference 
} from './APBusinessGroupsDisplayService';
import APLifecycleDisplayService, { EAPLifecycleState } from './APLifecycleDisplayService';

const CAPManagedAssetAttribute_Prefix = "AP";
enum EAPManagedAssetAttribute_Scope {
  ASSET_OWNER = "ASSET_OWNER",
  BUSINESS_GROUP = "BUSINESS_GROUP",
  CLASSIFICATION = "CLASSIFICATION",
  LIFECYLE = "LIFECYLE",
  CUSTOM = "CUSTOM",
}
enum EAPManagedAssetAttribute_BusinessGroup_Tag {
  OWNING_ID = "OWNING_ID",
  OWNING_DISPLAY_NAME = "OWNING_DISPLAY_NAME",
  OWNING_EXTERNAL_ID = "OWNING_EXTERNAL_ID",
  OWNING_EXTERNAL_DISPLAY_NAME = "OWNING_EXTERNAL_DISPLAY_NAME",
  EXTERNAL_SYSTEM_ID = "EXTERNAL_SYSTEM_ID"
}
enum EAPManagedAssetAttribute_Owner_Tag {
  ID = "ID",
}
enum EAPManagedAssetAttribute_Classification_Tag {
  C1 = "C1",
  C2 = "C2",
  C3 = "C3",
  C4 = "C4"
}
enum EAPManagedAssetAttribute_Lifecycle_Tag {
  STATE = "STATE",
}
type TManagedAssetAttribute_Tag = 
EAPManagedAssetAttribute_BusinessGroup_Tag
| EAPManagedAssetAttribute_Owner_Tag
| EAPManagedAssetAttribute_Classification_Tag
| EAPManagedAssetAttribute_Lifecycle_Tag;

export type TAPManagedAssetDisplay_Attributes = IAPEntityIdDisplay & {
  apExternal_ApAttributeDisplayList: TAPAttributeDisplayList;
  apCustom_ApAttributeDisplayList: TAPAttributeDisplayList;
}

export type TAPManagedAssetBusinessGroupInfo = {
  apOwningBusinessGroupEntityId: TAPEntityId;
  // FUTURE: add sharing info here
}
export type TAPManagedAssetOwnerInfo = TAPEntityId;

export type TAPManagedAssetLifecycleInfo = {
  apLifecycleState: EAPLifecycleState;
}
export interface IAPManagedAssetDisplay extends IAPEntityIdDisplay {
  devel_display_complete_ApAttributeList: TAPAttributeDisplayList; /** for devel display purposes only */
  apExternal_ApAttributeDisplayList: TAPAttributeDisplayList;
  apCustom_ApAttributeDisplayList: TAPAttributeDisplayList;
  apBusinessGroupInfo: TAPManagedAssetBusinessGroupInfo;
  apOwnerInfo: TAPManagedAssetOwnerInfo;
  apLifecycleInfo: TAPManagedAssetLifecycleInfo;
  // classification
  // ...
}
export type TAPManagedAssetDisplayList = Array<IAPManagedAssetDisplay>;


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
  public nameOf_ApLifecycleInfo(name: keyof TAPManagedAssetLifecycleInfo) {
    return `${this.nameOf('apLifecycleInfo')}.${name}}`;
  }
  private _nameOf_ApBusinessGroupInfo(name: keyof TAPManagedAssetBusinessGroupInfo) {
    return `${this.nameOf('apBusinessGroupInfo')}.${name}`;
  }
  private _nameOf_ApBusinessGroupInfo_ApBusinessGroupDisplayReference(name: keyof TAPBusinessGroupDisplayReference) {
    return `${this._nameOf_ApBusinessGroupInfo('apOwningBusinessGroupEntityId')}.${name}`;
  }
  public nameOf_ApBusinessGroupInfo_ApBusinessGroupDisplayReference_ApEntityId(name: keyof TAPEntityId) {
    return `${this._nameOf_ApBusinessGroupInfo_ApBusinessGroupDisplayReference('apEntityId')}.${name}`;
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
  
  protected create_Empty_ApManagedAssetDisplay(): IAPManagedAssetDisplay {
    const apManagedAssetDisplay: IAPManagedAssetDisplay = {
      apEntityId: APEntityIdsService.create_EmptyObject(),
      devel_display_complete_ApAttributeList: [],
      apExternal_ApAttributeDisplayList: [],
      apCustom_ApAttributeDisplayList: [],
      apBusinessGroupInfo: {
        apOwningBusinessGroupEntityId: APEntityIdsService.create_EmptyObject_NoId(),
      },
      apOwnerInfo: APEntityIdsService.create_EmptyObject_NoId(),
      apLifecycleInfo: {
        apLifecycleState: APLifecycleDisplayService.get_Default_LifecycleState()
      }
    };
    return apManagedAssetDisplay;
  }

  /**
   * Extracts all attributes for business group management.
   * Looks for business group Id + display name.
   * - Requires business group Id + displayName to be present
   * - Discards all others
   * @throws - if either business group id or display name not found 
   */
  private create_ApManagedAssetBusinessGroupInfo({ apAttributeDisplayList }: {
    apAttributeDisplayList: TAPAttributeDisplayList;
  }): TAPManagedAssetBusinessGroupInfo {
    const funcName = 'create_ApManagedAssetBusinessGroupInfo';
    const logName = `${this.BaseComponentName}.${funcName}()`;

    // set to default in case none is found
    const apManagedAssetBusinessGroupInfo: TAPManagedAssetBusinessGroupInfo = {
      apOwningBusinessGroupEntityId: APEntityIdsService.create_EmptyObject_NoId()
    };

    // extract business group attributes
    const apBusinessGroupAttributeDisplayList: TAPAttributeDisplayList = APAttributesDisplayService.extract_Prefixed_With({
      prefixed_with: this.create_ManagedAssetAttribute_Name({ scope: EAPManagedAssetAttribute_Scope.BUSINESS_GROUP }),
      apAttributeDisplayList: apAttributeDisplayList
    });
    // alert(`${logName}: apBusinessGroupAttributeDisplayList=${JSON.stringify(apBusinessGroupAttributeDisplayList)}`);
    if(apBusinessGroupAttributeDisplayList.length === 0) throw new Error(`${logName}: apBusinessGroupAttributeDisplayList.length === 0`);

    // id
    const businessGroupId_apAttributeDisplayList: TAPAttributeDisplayList = APAttributesDisplayService.extract_Prefixed_With({
      prefixed_with: this.create_ManagedAssetAttribute_Name({ scope: EAPManagedAssetAttribute_Scope.BUSINESS_GROUP, tag: EAPManagedAssetAttribute_BusinessGroup_Tag.OWNING_ID }),
      apAttributeDisplayList: apBusinessGroupAttributeDisplayList
    });
    if(businessGroupId_apAttributeDisplayList.length === 0) throw new Error(`${logName}: businessGroupId_apAttributeDisplayList.length === 0`);
    apManagedAssetBusinessGroupInfo.apOwningBusinessGroupEntityId.id = businessGroupId_apAttributeDisplayList[0].value;
    // displayName
    const businessGroupDisplayName_apAttributeDisplayList: TAPAttributeDisplayList = APAttributesDisplayService.extract_Prefixed_With({
      prefixed_with: this.create_ManagedAssetAttribute_Name({ scope: EAPManagedAssetAttribute_Scope.BUSINESS_GROUP, tag: EAPManagedAssetAttribute_BusinessGroup_Tag.OWNING_DISPLAY_NAME }),
      apAttributeDisplayList: apBusinessGroupAttributeDisplayList
    });
    if(businessGroupDisplayName_apAttributeDisplayList.length === 0) throw new Error(`${logName}: businessGroupDisplayName_apAttributeDisplayList.length === 0`);
    apManagedAssetBusinessGroupInfo.apOwningBusinessGroupEntityId.displayName = businessGroupDisplayName_apAttributeDisplayList[0].value;

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

  private create_ApManagedAsset_LifecycleInfo({ apAttributeDisplayList }:{
    apAttributeDisplayList: TAPAttributeDisplayList;
  }): TAPManagedAssetLifecycleInfo {
    const apManagedAssetLifecycleInfo: TAPManagedAssetLifecycleInfo = {
      apLifecycleState: APLifecycleDisplayService.get_Default_LifecycleState()
    };
    const lifecycleList: TAPAttributeDisplayList = APAttributesDisplayService.extract_Prefixed_With({
      prefixed_with: this.create_ManagedAssetAttribute_Name({ scope: EAPManagedAssetAttribute_Scope.LIFECYLE, tag: EAPManagedAssetAttribute_Lifecycle_Tag.STATE }),
      apAttributeDisplayList: apAttributeDisplayList
    });
    if(lifecycleList.length > 0) {
      const state: string = lifecycleList[0].value;
      if(APLifecycleDisplayService.isValid(state)) apManagedAssetLifecycleInfo.apLifecycleState = state as EAPLifecycleState;
      // otherwise keep the default state
    }
    return apManagedAssetLifecycleInfo;
  }

  /**
   * Create a managed asset display object.
   */
  protected create_ApManagedAssetDisplay_From_ApiEntities({ id, displayName, apRawAttributeList, default_ownerId, version }: {
    id: string;
    displayName: string;
    apRawAttributeList: TAPRawAttributeList;
    default_ownerId: string;
    version?: string;
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
    });
    // create the owner info
    const apManagedAssetOwnerInfo: TAPManagedAssetOwnerInfo = this.create_ApManagedAsset_OwnerInfo({ 
      apAttributeDisplayList: working_ApAttributeDisplayList,
      default_ownerId: default_ownerId
    });
    // create the lifecycle info
    const apManagedAssetLifecycleInfo: TAPManagedAssetLifecycleInfo = this.create_ApManagedAsset_LifecycleInfo({ 
      apAttributeDisplayList: working_ApAttributeDisplayList,
    });
    // create other like classification, etc.

    const result: IAPManagedAssetDisplay = {
      apEntityId: { id: id, displayName: displayName },
      devel_display_complete_ApAttributeList: devel_complete_ApAttributeDisplayList,
      apExternal_ApAttributeDisplayList: _apExternal_ApAttributeDisplayList,
      apCustom_ApAttributeDisplayList: _apCustom_AttributeDisplayList,
      apBusinessGroupInfo: apBusinessGroupInfo,
      apOwnerInfo: apManagedAssetOwnerInfo,
      apLifecycleInfo: apManagedAssetLifecycleInfo,
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

  public get_ApLifecycleInfo({ apManagedAssetDisplay }:{
    apManagedAssetDisplay: IAPManagedAssetDisplay;
  }): TAPManagedAssetLifecycleInfo {
    return apManagedAssetDisplay.apLifecycleInfo;
  }
  /**
   * Makes a copy of apManagedAssetLifecycleInfo and sets it in apManagedAssetDisplay.
   */
  public set_ApLifecycleInfo({ apManagedAssetDisplay, apManagedAssetLifecycleInfo }: {
    apManagedAssetDisplay: IAPManagedAssetDisplay;
    apManagedAssetLifecycleInfo: TAPManagedAssetLifecycleInfo;
  }): IAPManagedAssetDisplay {
    apManagedAssetDisplay.apLifecycleInfo = JSON.parse(JSON.stringify(apManagedAssetLifecycleInfo));
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

    // owner info
    _complete_ApAttributeList.push(APAttributesDisplayService.create_ApAttributeDisplay({ 
        name: this.create_ManagedAssetAttribute_Name({ scope: EAPManagedAssetAttribute_Scope.ASSET_OWNER, tag: EAPManagedAssetAttribute_Owner_Tag.ID }), 
        value: apManagedAssetDisplay.apOwnerInfo.id
    }));

    // lifecycle info
    _complete_ApAttributeList.push(APAttributesDisplayService.create_ApAttributeDisplay({ 
      name: this.create_ManagedAssetAttribute_Name({ scope: EAPManagedAssetAttribute_Scope.LIFECYLE, tag: EAPManagedAssetAttribute_Lifecycle_Tag.STATE }), 
      value: apManagedAssetDisplay.apLifecycleInfo.apLifecycleState
    }));
  
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