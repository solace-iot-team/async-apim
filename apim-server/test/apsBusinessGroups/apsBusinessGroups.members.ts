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
  APSUserCreate,
  APSMemberOfOrganizationGroupsList,
  APSMemberOfOrganizationGroups,
  APSBusinessGroupAuthRoleList,
  EAPSBusinessGroupAuthRole,
  APSUserResponse,
  ApsUsersService,
  APSOrganizationRolesList,
  APSOrganizationRoles,
  APSOrganizationAuthRoleList,
  EAPSOrganizationAuthRole,
  APSUserIdList,
} from '../../src/@solace-iot-team/apim-server-openapi-node';
import APSBusinessGroupsService from '../../server/api/services/apsOrganization/apsBusinessGroups/APSBusinessGroupsService';
import { TestApsOrganizationUtils } from '../lib/TestApsOrganizationsUtils';
import APSOrganizationsService from '../../server/api/services/apsAdministration/APSOrganizationsService';


const scriptName: string = path.basename(__filename);
TestLogger.logMessage(scriptName, ">>> starting ...");

const OrganizationId = 'test_businessgroups_organization_members';
const BusinessGroupId = "business_group";
const UserId = 'user.member@apim-test.dev';


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

  it(`${scriptName}: should create organization`, async () => {
    try {
      const apsOrg: APSOrganizationCreate = {
        organizationId: OrganizationId,
        displayName: OrganizationId,
        appCredentialsExpiryDuration: APSOrganizationsService.get_DefaultAppCredentialsExpiryDuration(),
        maxNumApisPerApiProduct: APSOrganizationsService.get_DefaultMaxNumApis_Per_ApiProduct(),
        assetIncVersionStrategy: APSOrganizationsService.get_DefaultAssetIncVersionStrategy(),
        maxNumEnvsPerApiProduct: APSOrganizationsService.get_DefaultMaxNumEnvs_Per_ApiProduct(),
      }
      const apsOrgCreated: APSOrganization = await ApsAdministrationService.createApsOrganization({
        requestBody: apsOrg
      });
      expect(apsOrgCreated, TestLogger.createTestFailMessage('response does not equal request')).to.deep.equal(apsOrg);
    } catch (e) {
      expect(e instanceof ApiError, TestLogger.createNotApiErrorMesssage(e.message)).to.be.true;
      expect(false, TestLogger.createTestFailMessage('failed')).to.be.true;
    }
  });

  it(`${scriptName}: should create a business group`, async () => {
    try {
      const create: APSBusinessGroupCreate = {
        businessGroupId: BusinessGroupId,
        businessGroupParentId: OrganizationId,
        displayName: BusinessGroupId,
        description: BusinessGroupId,
      }
      const created: APSBusinessGroupResponse = await ApsBusinessGroupsService.createApsBusinessGroup({
        organizationId: OrganizationId,
        requestBody: create
      });
    } catch (e) {
      expect(e instanceof ApiError, TestLogger.createNotApiErrorMesssage(e.message)).to.be.true;
      expect(false, TestLogger.createTestFailMessage('failed')).to.be.true;
    }
  });

  it(`${scriptName}: should create user with member of business group`, async () => {
    try {

      const roles: APSBusinessGroupAuthRoleList = [EAPSBusinessGroupAuthRole.API_TEAM];
      const apsMemberOfOrganizationGroups: APSMemberOfOrganizationGroups = {
        organizationId: OrganizationId,
        memberOfBusinessGroupList: [
          {
            businessGroupId: BusinessGroupId,
            roles: roles
          }
        ]
      };
      const apsMemberOfOrganizationGroupsList: APSMemberOfOrganizationGroupsList = [apsMemberOfOrganizationGroups];
      // must also populate memberOfOrganizations
      const apsOrganizationAuthRoleList: APSOrganizationAuthRoleList = [EAPSOrganizationAuthRole.API_TEAM];
      const apsOrganizationRoles: APSOrganizationRoles = {
        organizationId: OrganizationId,
        roles: apsOrganizationAuthRoleList
      }
      const apsOrganizationRolesList: APSOrganizationRolesList = [apsOrganizationRoles];

      const apsUserCreate: APSUserCreate = {
        isActivated: true,
        userId: UserId,
        profile: {
          email: UserId,
          first: 'first',
          last: 'last'
        },
        password: 'password',
        memberOfOrganizationGroups: apsMemberOfOrganizationGroupsList,
        memberOfOrganizations: apsOrganizationRolesList
      }
      const apsUserResponse: APSUserResponse = await ApsUsersService.createApsUser({
        requestBody: apsUserCreate
      });
    } catch (e) {
      expect(e instanceof ApiError, TestLogger.createNotApiErrorMesssage(e.message)).to.be.true;
      expect(false, TestLogger.createTestFailMessage('failed')).to.be.true;
    }
  });

  it(`${scriptName}: should catch attempt deleting business group`, async () => {
    try {
      await ApsBusinessGroupsService.deleteApsBusinessGroup({
        organizationId: OrganizationId,
        businessgroupId: BusinessGroupId
      });
      expect(false, TestLogger.createTestFailMessage('should never get here')).to.be.true;
    } catch (e) {
      expect(e instanceof ApiError, TestLogger.createNotApiErrorMesssage(e.message)).to.be.true;
      const apiError: ApiError = e;
      expect(apiError.status, TestLogger.createTestFailMessage('status not 422')).equal(422);
      const apsError: APSError = apiError.body;
      expect(apsError.errorId, TestLogger.createTestFailMessage('incorrect errorId')).equal(APSErrorIds.INVALID_OBJECT_REFERENCES);
      const metaStr = JSON.stringify(apsError.meta);
      expect(metaStr, TestLogger.createTestFailMessage('error does not contain the userId')).to.contain(UserId);
      expect(metaStr, TestLogger.createTestFailMessage('error does not contain referenceType=userId')).to.contain('userId');
    }
  });

  it(`${scriptName}: should return users that are member of the business group`, async () => {
    try {
      const apsUserIdList: APSUserIdList = await ApsBusinessGroupsService.listApsBusinessGroupMembers({
        organizationId: OrganizationId,
        businessgroupId: BusinessGroupId
      });
      expect(apsUserIdList, TestLogger.createTestFailMessage('response not an array')).to.be.an('array');
      expect(apsUserIdList, TestLogger.createTestFailMessage('array of incorrect length')).to.have.lengthOf(1);
      expect(apsUserIdList, TestLogger.createTestFailMessage('does not include userId')).to.include(UserId);
    } catch (e) {
      expect(e instanceof ApiError, TestLogger.createNotApiErrorMesssage(e.message)).to.be.true;
      expect(false, TestLogger.createTestFailMessage('failed')).to.be.true;
    }
  });


});

