import { Meta, MetaEntityReference } from "@solace-iot-team/apim-connector-openapi-browser";
import APAttributesDisplayService, { TAPAttributeDisplayList } from "./APAttributesDisplayService/APAttributesDisplayService";

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

  public create_ApMetaInfo_From_ApiEntities({ connectorMeta, removeApManagedAssetAttributePrefixList }:{
    connectorMeta?: Meta;
    // apRawAttributeList: TAPRawAttributeList;
    // apManagedAssetAttributePrefix: string;
    removeApManagedAssetAttributePrefixList: Array<string>;
  }): TAPMetaInfo {
    // const funcName = 'create_ApMetaInfo_From_ApiEntities';
    // const logName = `${this.ComponentName}.${funcName}()`;
    let apMetaInfo: TAPMetaInfo = this.create_Empty_ApMetaInfo();
    if(connectorMeta !== undefined) {
      let apAttributeDisplayList = APAttributesDisplayService.create_ApAttributeDisplayList({
        apRawAttributeList: connectorMeta.attributes ? connectorMeta.attributes : []
      });
      // console.log(`${logName}: original apAttributeDisplayList=${JSON.stringify(apAttributeDisplayList, null, 2)}`);
      if(connectorMeta.attributes !== undefined) {
        // get rid of all manged attributes
        for(const prefix of removeApManagedAssetAttributePrefixList) {
          // console.log(`${logName}: removing prefix=${prefix}`);
          APAttributesDisplayService.extract_Prefixed_With({
            prefixed_with: prefix,
            apAttributeDisplayList: apAttributeDisplayList,
          });
        }
        // console.log(`${logName}: final apAttributeDisplayList=${JSON.stringify(apAttributeDisplayList, null, 2)}`);
      }
      apMetaInfo = {
        apCreatedBy: connectorMeta.createdBy ? connectorMeta.createdBy : '',
        apCreatedOn: connectorMeta.created ? connectorMeta.created : EmptyTimestamp,
        apLastModifiedBy: connectorMeta.lastModifiedBy ? connectorMeta.lastModifiedBy : '',
        apLastModifiedOn: connectorMeta.lastModified ? connectorMeta.lastModified : EmptyTimestamp,
        apDerivedFrom: connectorMeta.derivedFrom,
        // apAttributeDisplayList: APAttributesDisplayService.create_ApAttributeDisplayList({ apRawAttributeList: apRawAttributeList })
        apAttributeDisplayList: apAttributeDisplayList
      };
    } 
    return apMetaInfo;
  }
  
  public create_Timestamp_DisplayString(timestamp: number): string {
    if(timestamp === EmptyTimestamp) return 'N/A';
    const x = new Date(timestamp);
    return x.toUTCString();
  }
}

export default new APMetaInfoDisplayService();
