import { expect } from "chai";
import APSBusinessGroupsService from "../../server/api/services/apsOrganization/apsBusinessGroups/APSBusinessGroupsService";
import APSExternalSystemsService from "../../server/api/services/apsOrganization/apsExternalSystems/APSExternalSystemsService";
import { 
  ApsAdministrationService,
  APSOrganizationList,
  ListAPSOrganizationResponse
} from "../../src/@solace-iot-team/apim-server-openapi-node";
import { testHelperSleep, TestLogger } from "./test.helpers";


export class TestApsOrganizationUtils {

  public static deleteAllOrgs = async(): Promise<void> => {
    const listOrgResponse: ListAPSOrganizationResponse = await ApsAdministrationService.listApsOrganizations();
    const orgList: APSOrganizationList = listOrgResponse.list;
    const totalCount: number = listOrgResponse.meta.totalCount;
    for(const org of orgList) {
      await ApsAdministrationService.deleteApsOrganization({
        organizationId: org.organizationId
      });
    }
    // wait until done, break event loop to allow background jobs to kick in
    await testHelperSleep(10);
    await APSBusinessGroupsService.wait4CollectionUnlock();
    await APSExternalSystemsService.wait4CollectionUnlock();
    // check DB directly
    const businessGroupsDBList: Array<any> = await APSBusinessGroupsService.getPersistenceService().allRawLessThanTargetSchemaVersion(APSBusinessGroupsService.getDBObjectSchemaVersion() + 1);
    expect(businessGroupsDBList.length, TestLogger.createTestFailMessage('businessGroupsDBList length does not equal 0')).to.equal(0);
    const externalSystemsDBList: Array<any> = await APSExternalSystemsService.getPersistenceService().allRawLessThanTargetSchemaVersion(APSExternalSystemsService.getDBObjectSchemaVersion() + 1);
    expect(externalSystemsDBList.length, TestLogger.createTestFailMessage('externalSystemsDBList length does not equal 0')).to.equal(0);
  }


}