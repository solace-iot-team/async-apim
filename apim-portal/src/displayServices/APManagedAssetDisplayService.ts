import APEntityIdsService, { 
  IAPEntityIdDisplay, 
  TAPEntityId
} from '../utils/APEntityIdsService';
import APAttributesDisplayService, { 
  TAPAttributeDisplayList, 
} from './APAttributesDisplayService/APAttributesDisplayService';
import APBusinessGroupsDisplayService, { 
  TAPBusinessGroupDisplayReference 
} from './APBusinessGroupsDisplayService';


const CAPManagedAssetAttribute_Prefix = "AP";
enum EAPManagedAssetAttribute_Scope {
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
| EAPManagedAssetAttribute_Classification_Tag
| EAPManagedAssetAttribute_Lifecycle_Tag;


export type TAPManagedAssetBusinessGroupInfo = {
  apBusinessGroupDisplayReference?: TAPBusinessGroupDisplayReference;
}
export interface IAPManagedAssetDisplay extends IAPEntityIdDisplay {
  original_ApAttributeDisplayList: TAPAttributeDisplayList;
  external_ApAttributeDisplayList: TAPAttributeDisplayList;
  apCustomAttributeDisplayList: TAPAttributeDisplayList;
  apBusinessGroupInfo: TAPManagedAssetBusinessGroupInfo;
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
  
  protected create_Empty_ApManagedAssetDisplay(): IAPManagedAssetDisplay {
    const apManagedAssetDisplay: IAPManagedAssetDisplay = {
      apEntityId: APEntityIdsService.create_EmptyObject(),
      original_ApAttributeDisplayList: [],
      external_ApAttributeDisplayList: [],
      apCustomAttributeDisplayList: [],
      apBusinessGroupInfo: {
        apBusinessGroupDisplayReference: APBusinessGroupsDisplayService.create_EmptyObject(undefined),
      }
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
      const businessGroupId_apAttributeDisplayList = APAttributesDisplayService.extract_Prefixed_With({
        prefixed_with: this.create_ManagedAssetAttribute_Name({ scope: EAPManagedAssetAttribute_Scope.BUSINESS_GROUP, tag: EAPManagedAssetAttribute_BusinessGroup_Tag.ID }),
        apAttributeDisplayList: apBusinessGroupAttributeDisplayList
      });
      if(businessGroupId_apAttributeDisplayList.length > 1) throw new Error(`${logName}: businessGroupId_apAttributeDisplayList.length > 1`);
      // can be missing if not created by AP
      if(businessGroupId_apAttributeDisplayList.length === 1) {
        const businessGroupId: string = businessGroupId_apAttributeDisplayList[0].value;
        // displayName
        const businessGroupDisplayName_Name = this.create_ManagedAssetAttribute_Name({ scope: EAPManagedAssetAttribute_Scope.BUSINESS_GROUP, tag: EAPManagedAssetAttribute_BusinessGroup_Tag.DISPLAY_NAME });
        const businessGroupDisplayName_apAttributeDisplayList = APAttributesDisplayService.extract_Prefixed_With({
          prefixed_with: businessGroupDisplayName_Name,
          apAttributeDisplayList: apBusinessGroupAttributeDisplayList
        });
        if(businessGroupDisplayName_apAttributeDisplayList.length > 1) throw new Error(`${logName}: businessGroupDisplayName_apAttributeDisplayList.length > 1`);
        if(businessGroupDisplayName_apAttributeDisplayList.length !== 1) throw new Error(`${logName}: businessGroupDisplayName_apAttributeDisplayList.length !== 1, required=${businessGroupDisplayName_Name}`);
        const businessGroupDisplayName: string = businessGroupDisplayName_apAttributeDisplayList[0].value;
        
        const businessGroupEntityId: TAPEntityId = {
          id: businessGroupId,
          displayName: businessGroupDisplayName
        };
        apBusinessGroupDisplayReference.apEntityId = businessGroupEntityId;

        // external business group id & displayName, may be undefined
        const externalBusinessGroupId_apAttributeDisplayList = APAttributesDisplayService.extract_Prefixed_With({
          prefixed_with: this.create_ManagedAssetAttribute_Name({ scope: EAPManagedAssetAttribute_Scope.BUSINESS_GROUP, tag: EAPManagedAssetAttribute_BusinessGroup_Tag.EXTERNAL_ID }),
          apAttributeDisplayList: apBusinessGroupAttributeDisplayList
        });
        if(externalBusinessGroupId_apAttributeDisplayList.length > 1) throw new Error(`${logName}: externalBusinessGroupId_apAttributeDisplayList.length > 1`);
        if(externalBusinessGroupId_apAttributeDisplayList.length === 1) {
          const externalBusinessGroupId: string = externalBusinessGroupId_apAttributeDisplayList[0].value;
          const externalBusinessGroupDisplayName_Name = this.create_ManagedAssetAttribute_Name({ scope: EAPManagedAssetAttribute_Scope.BUSINESS_GROUP, tag: EAPManagedAssetAttribute_BusinessGroup_Tag.EXTERNAL_DISPLAY_NAME });
          const externalBusinessGroupDisplayName_apAttributeDisplayList = APAttributesDisplayService.extract_Prefixed_With({
            prefixed_with: externalBusinessGroupDisplayName_Name,
            apAttributeDisplayList: apBusinessGroupAttributeDisplayList
          });
          if(externalBusinessGroupDisplayName_apAttributeDisplayList.length > 1) throw new Error(`${logName}: externalBusinessGroupDisplayName_apAttributeDisplayList.length > 1`);
          if(externalBusinessGroupDisplayName_apAttributeDisplayList.length !== 1) throw new Error(`${logName}: externalBusinessGroupDisplayName_apAttributeDisplayList.length !== 1, required=${externalBusinessGroupDisplayName_Name}`);
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

  /**
   * Create a managed asset display object.
   */
  protected create_ApManagedAssetDisplay({ apEntityId, complete_ApAttributeDisplayList }: {
    apEntityId: TAPEntityId;
    complete_ApAttributeDisplayList: TAPAttributeDisplayList;
  }): IAPManagedAssetDisplay {
    // const funcName = 'create_ApManagedAssetDisplay';
    // const logName = `${this.BaseComponentName}.${funcName}()`;

    // make a copy of the orginal list, the working list may be modified with every extract call
    const working_ApAttributeDisplayList: TAPAttributeDisplayList = JSON.parse(JSON.stringify(complete_ApAttributeDisplayList));
    // extract externally controlled attributes
    const external_ApAttributeDisplayList: TAPAttributeDisplayList = APAttributesDisplayService.extract_Not_Prefixed_With({
      not_prefixed_with: this.create_ManagedAssetAttribute_Prefix(),
      apAttributeDisplayList: working_ApAttributeDisplayList
    });
    // working_ApAttributeDisplayList now contains only the AP controlled attributes
    // alert(`${logName}: after external attributes, working_ApAttributeDisplayList=${JSON.stringify(working_ApAttributeDisplayList, null, 2)}`);
    // extract custom attributes
    const apCustomAttributeDisplayList: TAPAttributeDisplayList = APAttributesDisplayService.extract_Prefixed_With({
      prefixed_with: this.create_ManagedAssetAttribute_Name({ scope: EAPManagedAssetAttribute_Scope.CUSTOM }),
      apAttributeDisplayList: working_ApAttributeDisplayList
    });
    // working_ApAttributeDisplayList now contains only the AP standard attributes
    // create the business group info
    const apBusinessGroupInfo: TAPManagedAssetBusinessGroupInfo = this.create_ApManagedAssetBusinessGroupInfo({
      apAttributeDisplayList: working_ApAttributeDisplayList
    });
    // create other like lifecycle, classification, etc.

    const result: IAPManagedAssetDisplay = {
      apEntityId: apEntityId,
      external_ApAttributeDisplayList: external_ApAttributeDisplayList,
      apCustomAttributeDisplayList: apCustomAttributeDisplayList,
      apBusinessGroupInfo: apBusinessGroupInfo,
      original_ApAttributeDisplayList: complete_ApAttributeDisplayList
    };
    return result;
  }

}