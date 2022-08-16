import { attributes, Meta, MetaEntityReference } from "@solace-iot-team/apim-connector-openapi-browser";
import APAttributesDisplayService, { TAPAttributeDisplayList, TAPRawAttributeList } from "./APAttributesDisplayService/APAttributesDisplayService";

const EmptyTimestamp = -1;
export type TAPMetaInfo = {
  apCreatedBy: string;
  apCreatedOn: number;
  apLastModifiedBy: string;
  apLastModifiedOn: number;
  apDerivedFrom?: MetaEntityReference;
  apAttributeDisplayList: TAPAttributeDisplayList;

}

class APMetaInfoDisplayService {
  private readonly ComponentName = "APMetaInfoDisplayService";

  public nameOf(name: keyof TAPMetaInfo) {
    return `${name}`;
  }

  public create_Empty_ApMetaInfo = (): TAPMetaInfo => {
    return {
      apCreatedBy: '',
      apCreatedOn: EmptyTimestamp,
      apLastModifiedBy: '',
      apLastModifiedOn: EmptyTimestamp,
      apAttributeDisplayList: [],
    };
  }

  public create_ApMetaInfo_From_ApiEntities({ connectorMeta, apRawAttributeList, apManagedAssetAttributePrefix }:{
    connectorMeta?: Meta;
    apRawAttributeList: TAPRawAttributeList;
    apManagedAssetAttributePrefix: string;
  }): TAPMetaInfo {
    // const funcName = 'create_ApMetaInfo_From_ApiEntities';
    // const logName = `${this.ComponentName}.${funcName}()`;
    // console.log(`${logName}: apRawAttributeList=${JSON.stringify(apRawAttributeList, null, 2)}`);
    
    // extract all AP owned attributes

    const apManaged_AttributeDisplayList: TAPAttributeDisplayList = APAttributesDisplayService.extract_Prefixed_With({
      prefixed_with: apManagedAssetAttributePrefix,
      apAttributeDisplayList: APAttributesDisplayService.create_ApAttributeDisplayList({
        apRawAttributeList: apRawAttributeList
      })
    });
    // console.log(`${logName}: apManaged_AttributeDisplayList=${JSON.stringify(apManaged_AttributeDisplayList, null, 2)}`);

    let apMetaInfo: TAPMetaInfo = this.create_Empty_ApMetaInfo();
    if(connectorMeta !== undefined) {
      apMetaInfo = {
        apCreatedBy: connectorMeta.createdBy ? connectorMeta.createdBy : '',
        apCreatedOn: connectorMeta.created ? connectorMeta.created : EmptyTimestamp,
        apLastModifiedBy: connectorMeta.lastModifiedBy ? connectorMeta.lastModifiedBy : '',
        apLastModifiedOn: connectorMeta.lastModified ? connectorMeta.lastModified : EmptyTimestamp,
        apDerivedFrom: connectorMeta.derivedFrom,
        apAttributeDisplayList: apManaged_AttributeDisplayList
      };
    } else {
      apMetaInfo.apAttributeDisplayList = apManaged_AttributeDisplayList;
    }
    // console.log(`${logName}: apMetaInfo=${JSON.stringify(apMetaInfo, null, 2)}`);
    return apMetaInfo;
  }
  
  public create_Timestamp_DisplayString(timestamp: number): string {
    if(timestamp === EmptyTimestamp) return 'N/A';
    const x = new Date(timestamp);
    return x.toUTCString();
  }
}

export default new APMetaInfoDisplayService();
