
export enum EAPAssetType {
  DEVELOPER_APP = "DEVELOPER_APP"
}
export type TAPEntityId = {
  id: string;
  displayName: string;
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

