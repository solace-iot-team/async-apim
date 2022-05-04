import { 
  ApsAdministrationService, 
  APSOrganizationList, 
  APSUserResponseList, 
  ApsUsersService, 
  ListAPSOrganizationResponse, 
  ListApsUsersResponse 
} from "../../src/@solace-iot-team/apim-server-openapi-node";


export class ApsOrganizationsHelper {

  public static deleteAllOrganizations = async(): Promise<APSOrganizationList> => {
    const listOrgResponse: ListAPSOrganizationResponse = await ApsAdministrationService.listApsOrganizations();
    const orgList: APSOrganizationList = listOrgResponse.list;
    const totalCount: number = listOrgResponse.meta.totalCount;
    for(const org of orgList) {
      await ApsAdministrationService.deleteApsOrganization({
        organizationId: org.organizationId
      });
    }
    return orgList;
  }

}