import { 
  APUsersDisplayService, 
} from './APUsersDisplayService';


// // export type TAPOrganizationUserDisplay = Omit<IAPUserDisplay, "" | ""> & {
// export type TAPOrganizationUserDisplay = IAPUserDisplay & {
//   apOrganizationEntityId: TAPEntityId;
//   apMemberOfOrganizationRolesDisplay: TAPMemberOfOrganizationRolesDisplay;
//   apMemberOfOrganizationBusinessGroupsDisplay: TAPMemberOfOrganizationBusinessGroupsDisplay;
//   readonly apCompleteBusinessGroupDisplayList?: TAPBusinessGroupDisplayList;
//   readonly apOrganizationAssetInfoDisplayList: TAPOrganizationAssetInfoDisplayList;
// }
// export type TAPOrganizationUserDisplayList = Array<TAPOrganizationUserDisplay>;
// export type TAPOrganizationUserDisplayListResponse = APSListResponseMeta & {
//   apOrganizationUserDisplayList: TAPOrganizationUserDisplayList;
// }
// export type TAPUserOrganizationRolesDisplay = IAPEntityIdDisplay & {
//   apOrganizationAuthRoleEntityIdList: TAPEntityIdList;
// }


class APSystemUsersDisplayService extends APUsersDisplayService {
  private readonly ComponentName = "APSystemUsersDisplayService";

  
}

export default new APSystemUsersDisplayService();
