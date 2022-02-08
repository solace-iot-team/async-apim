import { TAPEntityId } from "./APEntityId";

export enum EAPAssetType {
  DEVELOPER_APP = "DEVELOPER_APP"
}
export type TAPAssetInfo = {
  assetType: EAPAssetType;
  assetEntityId: TAPEntityId;
}
export type TAPAssetInfoList = Array<TAPAssetInfo>;

export type TAPAssetInfoWithOrg = TAPAssetInfo & {
  organizationEntityId: TAPEntityId;
}
export type TAPAssetInfoWithOrgList = Array<TAPAssetInfoWithOrg>;

export type TAPOrgAsset = {
  organizationEntityId: TAPEntityId;
  assetInfoList: TAPAssetInfoList;
}
export type TAPOrgAssetList = Array<TAPOrgAsset>;

export enum EAPAsyncApiSpecFormat {
  JSON = 'application/json',
  YAML = 'application/x-yaml',
  UNKNOWN = 'application/x-unknown'
}

export type TAPAsyncApiSpec = {
  format: EAPAsyncApiSpecFormat,
  spec: any
}
