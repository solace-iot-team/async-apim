import 'mocha';
import { expect } from 'chai';
import request from 'supertest';
import Server from '../../server/index';
import path from 'path';
import _ from 'lodash';
import { 
  TestContext, 
  TestLogger 
} from '../lib/test.helpers';
import { 
  ApiError, 
  APSId,
  ApsAdministrationService,
  APSOrganization,
  APSDisplayName,
  APSError,
  APSErrorIds,
  APSOrganizationCreate,
  ApsBusinessGroupsService,
  ListAPSBusinessGroupsResponse,
  APSBusinessGroupResponseList,
  APSBusinessGroupCreate,
  APSBusinessGroupResponse,
  APSBusinessGroupUpdate,
} from '../../src/@solace-iot-team/apim-server-openapi-node';
import APSBusinessGroupsService from '../../server/api/services/apsOrganization/apsBusinessGroups/APSBusinessGroupsService';
import { TestApsOrganizationUtils } from '../lib/TestApsOrganizationsUtils';
import APSOrganizationsService from '../../server/api/services/apsAdministration/APSOrganizationsService';
import { AdministrationService, Organization } from '@solace-iot-team/apim-connector-openapi-node';


const scriptName: string = path.basename(__filename);
TestLogger.logMessage(scriptName, ">>> starting ...");

const OrganizationIdTemplate: APSId = 'test_apiProducts_organization';
const OrganizationDisplayNamePrefix: string = 'displayName for ';
const NumberOfOrganizations: number = 3;

const createOrganizationId = (i: number): APSId => {
  const iStr: string = String(i).padStart(5, '0');
  const orgId: APSId = `${OrganizationIdTemplate}_${iStr}`;
  return orgId;
}
const createOrganizationDisplayName = (orgId: APSId): APSDisplayName => {
  return `${OrganizationDisplayNamePrefix}${orgId}`;
}

// const BusinessGroupMasterName = 'master';
// const BusinessGroupIdTemplate: string = 'test_bizgroup';
// const BusinessGroupDisplayNamePrefix: string = 'displayName for ';
// const DefaultDescription = 'a default description';
// const PatchedDisplayName = 'patched display name';
// const createBusinessGroupId = (orgI: number, bizGroupName: string, bizGroupParentName?: string): APSId => {
//   const orgIStr: string = String(orgI).padStart(5, '0');
//   let bizGroupId = `${orgIStr}-${BusinessGroupIdTemplate}-${bizGroupName}`;
//   if(bizGroupParentName) bizGroupId += `-${bizGroupParentName}`;
//   return bizGroupId;
// }
// const createBusinessGroupDisplayName = (bizGroupId: string): APSDisplayName => {
//   return `${BusinessGroupDisplayNamePrefix}${bizGroupId}`;
// }

// const NumberOfChildrenGroups = 3;
// const BusinessGroupChildName = 'child';
// const createChildBusinessGroupId = (orgI: number, masterI: number, childI: number, bizGroupName: string, bizGroupParentName?: string): APSId => {
//   const orgIStr: string = String(orgI).padStart(5, 'O');
//   const masterIStr: string = String(masterI).padStart(5, 'M');
//   const childIStr: string = String(childI).padStart(5,'C');
//   let bizGroupId = `${orgIStr}-${masterIStr}-${childIStr}-${BusinessGroupIdTemplate}-${bizGroupName}`;
//   if(bizGroupParentName) bizGroupId += `-of-${bizGroupParentName}`;
//   return bizGroupId;
// }


describe(`${scriptName}`, () => {

  beforeEach(() => {
    TestContext.newItId();
  });

  after(async() => {
    TestContext.newItId();      
  });

  // ****************************************************************************************************************
  // * OpenApi API Tests *
  // ****************************************************************************************************************

  it(`${scriptName}: SETUP: should delete all orgs and all it's dependants`, async () => {
    try {
      await TestApsOrganizationUtils.deleteAllOrgs();
    } catch (e) {
      expect(e instanceof ApiError, TestLogger.createNotApiErrorMesssage(e.message)).to.be.true;
      expect(false, TestLogger.createTestFailMessage('failed')).to.be.true;
    }
  });

  // *********** N Organizations *******************
  it(`${scriptName}: should create reference organizations`, async () => {
    try {
      for(let i=0; i < NumberOfOrganizations; i++) {
        const orgId: APSId = createOrganizationId(i);
        const orgDisplayName: APSDisplayName = createOrganizationDisplayName(orgId);

        const connectorOrganization: Organization = {
          name: orgId,
        }
        await AdministrationService.createOrganization({
          requestBody: connectorOrganization
        });

        const apsOrg: APSOrganizationCreate = {
          organizationId: orgId,
          displayName: orgDisplayName,
          appCredentialsExpiryDuration: APSOrganizationsService.get_DefaultAppCredentialsExpiryDuration(),
          maxNumApisPerApiProduct: APSOrganizationsService.get_DefaultMaxNumApis_Per_ApiProduct(),
          assetIncVersionStrategy: APSOrganizationsService.get_DefaultAssetIncVersionStrategy(),
          maxNumEnvsPerApiProduct: APSOrganizationsService.get_DefaultMaxNumEnvs_Per_ApiProduct(),
        }
        const apsOrgCreated: APSOrganization = await ApsAdministrationService.createApsOrganization({
          requestBody: apsOrg
        });
        expect(apsOrgCreated, TestLogger.createTestFailMessage('response does not equal request')).to.deep.equal(apsOrg);
      }
    } catch (e) {
      expect(e instanceof ApiError, TestLogger.createNotApiErrorMesssage(e.message)).to.be.true;
      expect(false, TestLogger.createTestFailMessage('failed')).to.be.true;
    }
  });

});

