import APEntityIdsService, { 
  IAPEntityIdDisplay, 
  TAPEntityId
} from '../utils/APEntityIdsService';
import APAttributesDisplayService, { 
  TAPAttributeDisplayList,
  TAPRawAttributeList, 
} from './APAttributesDisplayService/APAttributesDisplayService';
import APBusinessGroupsDisplayService, { 
  TAPBusinessGroupDisplayReference 
} from './APBusinessGroupsDisplayService';


const CAPManagedAssetAttribute_Prefix = "AP";
enum EAPManagedAssetAttribute_Scope {
  ASSET_OWNER = "ASSET_OWNER",
  BUSINESS_GROUP = "BUSINESS_GROUP",
  CLASSIFICATION = "CLASSIFICATION",
  LIFECYLE = "LIFECYLE",
  CUSTOM = "CUSTOM",
}
enum EAPManagedAssetAttribute_BusinessGroup_Tag {
  ID = "ID",
  DISPLAY_NAME = "DISPLAY_NAME",
  EXTERNAL_ID = "EXTERNAL_ID",
  EXTERNAL_DISPLAY_NAME = "EXTERNAL_DISPLAY_NAME",
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
// enum EAPManagedAssetAttribute_Lifecycle_StateValues {
//   IN_DEVELOPMENT = "IN_DEVELOPMENT",
//   PUBLISHED = "PUBLISHED",
//   DEPRECATED = "DEPRECATED"
// }
type TManagedAssetAttribute_Tag = 
EAPManagedAssetAttribute_BusinessGroup_Tag
| EAPManagedAssetAttribute_Owner_Tag
| EAPManagedAssetAttribute_Classification_Tag
| EAPManagedAssetAttribute_Lifecycle_Tag;

export type TAPManagedAssetDisplay_Attributes = IAPEntityIdDisplay & {
  // internalReference: {
  //   apComplete_ApAttributeDisplayList: TAPAttributeDisplayList;
  // }
  apExternal_ApAttributeDisplayList: TAPAttributeDisplayList;
  apCustom_ApAttributeDisplayList: TAPAttributeDisplayList;
}

export type TAPManagedAssetBusinessGroupInfo = {
  apBusinessGroupDisplayReference?: TAPBusinessGroupDisplayReference;
}
export type TAPManagedAssetOwnerInfo = TAPEntityId;

export interface IAPManagedAssetDisplay extends IAPEntityIdDisplay {
  devel_display_complete_ApAttributeList: TAPAttributeDisplayList; /** for devel display purposes only */
  apExternal_ApAttributeDisplayList: TAPAttributeDisplayList;
  apCustom_ApAttributeDisplayList: TAPAttributeDisplayList;
  apBusinessGroupInfo: TAPManagedAssetBusinessGroupInfo;
  apOwnerInfo: TAPManagedAssetOwnerInfo;
  // lifecyle
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
  private _nameOf_ApBusinessGroupInfo(name: keyof TAPManagedAssetBusinessGroupInfo) {
    return `${this.nameOf('apBusinessGroupInfo')}.${name}`;
  }
  private _nameOf_ApBusinessGroupInfo_ApBusinessGroupDisplayReference(name: keyof TAPBusinessGroupDisplayReference) {
    return `${this._nameOf_ApBusinessGroupInfo('apBusinessGroupDisplayReference')}.${name}`;
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
  
  protected get_AttributeName_BusinessGroupId(): string {
    return this.create_ManagedAssetAttribute_Name({ scope: EAPManagedAssetAttribute_Scope.BUSINESS_GROUP, tag: EAPManagedAssetAttribute_BusinessGroup_Tag.ID });
  }
  
  protected create_Empty_ApManagedAssetDisplay(): IAPManagedAssetDisplay {
    const apManagedAssetDisplay: IAPManagedAssetDisplay = {
      apEntityId: APEntityIdsService.create_EmptyObject(),
      devel_display_complete_ApAttributeList: [],
      apExternal_ApAttributeDisplayList: [],
      apCustom_ApAttributeDisplayList: [],
      apBusinessGroupInfo: {
        apBusinessGroupDisplayReference: APBusinessGroupsDisplayService.create_EmptyObject(undefined),
      },
      apOwnerInfo: APEntityIdsService.create_EmptyObject(),
    };
    return apManagedAssetDisplay;
  }

  private create_ApManagedAssetBusinessGroupInfo({ apAttributeDisplayList }:{
    apAttributeDisplayList: TAPAttributeDisplayList;
  }): TAPManagedAssetBusinessGroupInfo {
    const funcName = 'create_ApManagedAssetBusinessGroupInfo';
    const logName = `${this.BaseComponentName}.${funcName}()`;

    // alert(`${logName}: businessGroupId=${this.create_ManagedAssetAttribute_Name({
    //   type: EAPManagedAssetAttribute_Type.INTERNAL,
    //   realm: EAPManagedAssetAttribute_Realm.BUSINESS_GROUP,
    //   tag: EAPManagedAssetAttribute_BusinessGroup_Tag.ID
    // })}`);
    // alert(`${logName}: start: apAttributeDisplayList=${JSON.stringify(apAttributeDisplayList)}`);

    // extract business group attributes
    const apBusinessGroupAttributeDisplayList: TAPAttributeDisplayList = APAttributesDisplayService.extract_Prefixed_With({
      prefixed_with: this.create_ManagedAssetAttribute_Name({ scope: EAPManagedAssetAttribute_Scope.BUSINESS_GROUP }),
      apAttributeDisplayList: apAttributeDisplayList
    });
    // alert(`${logName}: apBusinessGroupAttributeDisplayList=${JSON.stringify(apBusinessGroupAttributeDisplayList)}`);
    const apBusinessGroupInfo: TAPManagedAssetBusinessGroupInfo = {
      apBusinessGroupDisplayReference: undefined
    };
    if(apBusinessGroupAttributeDisplayList.length > 0) {
      // create empty to populate
      const apBusinessGroupDisplayReference: TAPBusinessGroupDisplayReference = {
        apEntityId: APEntityIdsService.create_EmptyObject(),
        apExternalBusinessGroupReference: undefined
      };
      // id
      const businessGroupId_apAttributeDisplayList: TAPAttributeDisplayList = APAttributesDisplayService.extract_Prefixed_With({
        prefixed_with: this.create_ManagedAssetAttribute_Name({ scope: EAPManagedAssetAttribute_Scope.BUSINESS_GROUP, tag: EAPManagedAssetAttribute_BusinessGroup_Tag.ID }),
        apAttributeDisplayList: apBusinessGroupAttributeDisplayList
      });
      // be tolerant to multiple entries, take the first one only
      // if(businessGroupId_apAttributeDisplayList.length > 1) throw new Error(`${logName}: businessGroupId_apAttributeDisplayList.length > 1`);
      // can be missing if not created by AP
      if(businessGroupId_apAttributeDisplayList.length > 0) {
        const businessGroupId: string = businessGroupId_apAttributeDisplayList[0].value;
        // displayName
        const businessGroupDisplayName_Name = this.create_ManagedAssetAttribute_Name({ scope: EAPManagedAssetAttribute_Scope.BUSINESS_GROUP, tag: EAPManagedAssetAttribute_BusinessGroup_Tag.DISPLAY_NAME });
        const businessGroupDisplayName_apAttributeDisplayList: TAPAttributeDisplayList = APAttributesDisplayService.extract_Prefixed_With({
          prefixed_with: businessGroupDisplayName_Name,
          apAttributeDisplayList: apBusinessGroupAttributeDisplayList
        });
        // be tolerant to multiple entries, take the first one only
        // if(businessGroupDisplayName_apAttributeDisplayList.length > 1) throw new Error(`${logName}: businessGroupDisplayName_apAttributeDisplayList.length > 1`);
        if(businessGroupDisplayName_apAttributeDisplayList.length < 1) throw new Error(`${logName}: businessGroupDisplayName_apAttributeDisplayList.length < 1, required=${businessGroupDisplayName_Name}`);
        const businessGroupDisplayName: string = businessGroupDisplayName_apAttributeDisplayList[0].value;

        const businessGroupEntityId: TAPEntityId = {
          id: businessGroupId,
          displayName: businessGroupDisplayName
        };
        apBusinessGroupDisplayReference.apEntityId = businessGroupEntityId;

        // external business group id & displayName, may be undefined
        const externalBusinessGroupId_apAttributeDisplayList: TAPAttributeDisplayList = APAttributesDisplayService.extract_Prefixed_With({
          prefixed_with: this.create_ManagedAssetAttribute_Name({ scope: EAPManagedAssetAttribute_Scope.BUSINESS_GROUP, tag: EAPManagedAssetAttribute_BusinessGroup_Tag.EXTERNAL_ID }),
          apAttributeDisplayList: apBusinessGroupAttributeDisplayList
        });
        // if(externalBusinessGroupId_apAttributeDisplayList.length > 1) throw new Error(`${logName}: externalBusinessGroupId_apAttributeDisplayList.length > 1`);
        if(externalBusinessGroupId_apAttributeDisplayList.length > 0) {
          const externalBusinessGroupId: string = externalBusinessGroupId_apAttributeDisplayList[0].value;
          const externalBusinessGroupDisplayName_Name = this.create_ManagedAssetAttribute_Name({ scope: EAPManagedAssetAttribute_Scope.BUSINESS_GROUP, tag: EAPManagedAssetAttribute_BusinessGroup_Tag.EXTERNAL_DISPLAY_NAME });
          const externalBusinessGroupDisplayName_apAttributeDisplayList: TAPAttributeDisplayList = APAttributesDisplayService.extract_Prefixed_With({
            prefixed_with: externalBusinessGroupDisplayName_Name,
            apAttributeDisplayList: apBusinessGroupAttributeDisplayList
          });
          // if(externalBusinessGroupDisplayName_apAttributeDisplayList.length > 1) throw new Error(`${logName}: externalBusinessGroupDisplayName_apAttributeDisplayList.length > 1`);
          if(externalBusinessGroupDisplayName_apAttributeDisplayList.length < 1) throw new Error(`${logName}: externalBusinessGroupDisplayName_apAttributeDisplayList.length < 1, required=${externalBusinessGroupDisplayName_Name}`);
          const externalBusinessGroupDisplayName: string = externalBusinessGroupDisplayName_apAttributeDisplayList[0].value;
          const externalBusinessGroupEntityId: TAPEntityId = {
            id: externalBusinessGroupId,
            displayName: externalBusinessGroupDisplayName
          };
          apBusinessGroupDisplayReference.apExternalBusinessGroupReference = externalBusinessGroupEntityId;
        }
      }
      apBusinessGroupInfo.apBusinessGroupDisplayReference = apBusinessGroupDisplayReference;
    }
    // alert(`${logName}: apBusinessGroupInfo=${JSON.stringify(apBusinessGroupInfo)}`);
    return apBusinessGroupInfo;
  }

  private create_ApManagedAsset_OwnerInfo({ apAttributeDisplayList }:{
    apAttributeDisplayList: TAPAttributeDisplayList;
  }): TAPManagedAssetOwnerInfo {

    const apManagedAssetOwnerInfo: TAPManagedAssetOwnerInfo = APEntityIdsService.create_EmptyObject();
    const ownerList: TAPAttributeDisplayList = APAttributesDisplayService.extract_Prefixed_With({
      prefixed_with: this.create_ManagedAssetAttribute_Name({ scope: EAPManagedAssetAttribute_Scope.ASSET_OWNER, tag: EAPManagedAssetAttribute_Owner_Tag.ID }),
      apAttributeDisplayList: apAttributeDisplayList
    });
    // if(ownerList.length > 1) throw new Error(`${logName}: ownerList.length > 1`);
    if(ownerList.length > 0) {
      const ownerId: string = ownerList[0].value;
      apManagedAssetOwnerInfo.id = ownerId;
      apManagedAssetOwnerInfo.displayName = ownerId;
    }
    return apManagedAssetOwnerInfo;
  }

  /**
   * Create a managed asset display object.
   */
  protected create_ApManagedAssetDisplay_From_ApiEntities({ id, displayName, apRawAttributeList }: {
    id: string;
    displayName: string;
    apRawAttributeList: TAPRawAttributeList;
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
      apAttributeDisplayList: working_ApAttributeDisplayList
    });
    // create the owner info
    const apManagedAssetOwnerInfo: TAPManagedAssetOwnerInfo = this.create_ApManagedAsset_OwnerInfo({ apAttributeDisplayList: working_ApAttributeDisplayList });
    // create other like lifecycle, classification, etc.

    const result: IAPManagedAssetDisplay = {
      apEntityId: { id: id, displayName: displayName },
      devel_display_complete_ApAttributeList: devel_complete_ApAttributeDisplayList,
      apExternal_ApAttributeDisplayList: _apExternal_ApAttributeDisplayList,
      apCustom_ApAttributeDisplayList: _apCustom_AttributeDisplayList,
      apBusinessGroupInfo: apBusinessGroupInfo,
      apOwnerInfo: apManagedAssetOwnerInfo,
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
   * Makes a copy of apCustom_ApAttributeDisplayList and sets it in apManagedAssetDisplay.
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


  public create_Complete_ApAttributeList({ apManagedAssetDisplay }:{
    apManagedAssetDisplay: IAPManagedAssetDisplay;
  }): TAPAttributeDisplayList {
    const _complete_ApAttributeList: TAPAttributeDisplayList = this.get_ApExternalAttributeList({ apManagedAssetDisplay: apManagedAssetDisplay });
    _complete_ApAttributeList.push(...this.get_ApCustomAttributeList({ apManagedAssetDisplay: apManagedAssetDisplay }));
    // add the business group info attributes
    const apManagedAssetBusinessGroupInfo: TAPManagedAssetBusinessGroupInfo = apManagedAssetDisplay.apBusinessGroupInfo;
    // if it is not defined, then asset not managed by AP
    if(apManagedAssetBusinessGroupInfo.apBusinessGroupDisplayReference !== undefined) {
      // business group id
      _complete_ApAttributeList.push(APAttributesDisplayService.create_ApAttributeDisplay({ 
        name: this.create_ManagedAssetAttribute_Name({ scope: EAPManagedAssetAttribute_Scope.BUSINESS_GROUP, tag: EAPManagedAssetAttribute_BusinessGroup_Tag.ID }), 
        value: apManagedAssetBusinessGroupInfo.apBusinessGroupDisplayReference.apEntityId.id
      }));
      // business group displayName
      _complete_ApAttributeList.push(APAttributesDisplayService.create_ApAttributeDisplay({ 
        name: this.create_ManagedAssetAttribute_Name({ scope: EAPManagedAssetAttribute_Scope.BUSINESS_GROUP, tag: EAPManagedAssetAttribute_BusinessGroup_Tag.DISPLAY_NAME }), 
        value: apManagedAssetBusinessGroupInfo.apBusinessGroupDisplayReference.apEntityId.displayName
      }));
      if(apManagedAssetBusinessGroupInfo.apBusinessGroupDisplayReference.apExternalBusinessGroupReference !== undefined) {
        // external business group id
        _complete_ApAttributeList.push(APAttributesDisplayService.create_ApAttributeDisplay({ 
          name: this.create_ManagedAssetAttribute_Name({ scope: EAPManagedAssetAttribute_Scope.BUSINESS_GROUP, tag: EAPManagedAssetAttribute_BusinessGroup_Tag.EXTERNAL_ID }), 
          value: apManagedAssetBusinessGroupInfo.apBusinessGroupDisplayReference.apExternalBusinessGroupReference.id
        }));
        // external business group displayName
        _complete_ApAttributeList.push(APAttributesDisplayService.create_ApAttributeDisplay({ 
          name: this.create_ManagedAssetAttribute_Name({ scope: EAPManagedAssetAttribute_Scope.BUSINESS_GROUP, tag: EAPManagedAssetAttribute_BusinessGroup_Tag.EXTERNAL_DISPLAY_NAME }), 
          value: apManagedAssetBusinessGroupInfo.apBusinessGroupDisplayReference.apExternalBusinessGroupReference.displayName
        }));
      }      
    }
    // owner info
    _complete_ApAttributeList.push(APAttributesDisplayService.create_ApAttributeDisplay({ 
        name: this.create_ManagedAssetAttribute_Name({ scope: EAPManagedAssetAttribute_Scope.ASSET_OWNER, tag: EAPManagedAssetAttribute_Owner_Tag.ID }), 
        value: apManagedAssetDisplay.apOwnerInfo.id
    }));
    return _complete_ApAttributeList;
  }

  public create_Complete_ApRawAttributeList({ apManagedAssetDisplay }:{
    apManagedAssetDisplay: IAPManagedAssetDisplay;
  }): TAPRawAttributeList {
    const rawAttributeList: TAPRawAttributeList = APAttributesDisplayService.create_ApRawAttributeList({
      apAttributeDisplayList: this.create_Complete_ApAttributeList({ apManagedAssetDisplay: apManagedAssetDisplay })
    });
    return rawAttributeList;
  }

  // ********************************************************************************************************************************
  // API calls
  // ********************************************************************************************************************************


}