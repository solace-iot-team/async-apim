import { Meta, MetaEntityReference } from "@solace-iot-team/apim-connector-openapi-browser";

const EmptyTimestamp = -1;
export type TAPMetaInfo = {
  apCreatedBy: string;
  apCreatedOn: number;
  apLastModifiedBy: string;
  apLastModifiedOn: number;
  apDerivedFrom?: MetaEntityReference;
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
    };
  }

  public create_ApMetaInfo_From_ApiEntities({ connectorMeta }:{
    connectorMeta?: Meta;
  }): TAPMetaInfo {
    if(connectorMeta === undefined) return this.create_Empty_ApMetaInfo();
    return {
      apCreatedBy: connectorMeta.createdBy ? connectorMeta.createdBy : '',
      apCreatedOn: connectorMeta.created ? connectorMeta.created : EmptyTimestamp,
      apLastModifiedBy: connectorMeta.lastModifiedBy ? connectorMeta.lastModifiedBy : '',
      apLastModifiedOn: connectorMeta.lastModified ? connectorMeta.lastModified : EmptyTimestamp,
      apDerivedFrom: connectorMeta.derivedFrom,
    };
  }
  
  public create_Timestamp_DisplayString(timestamp: number): string {
    if(timestamp === EmptyTimestamp) return 'N/A';
    const x = new Date(timestamp);
    return x.toUTCString();
  }
}

export default new APMetaInfoDisplayService();
