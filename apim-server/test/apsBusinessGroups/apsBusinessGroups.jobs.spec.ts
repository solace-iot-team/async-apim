import 'mocha';
import { expect } from 'chai';
import request from 'supertest';
import Server from '../../server/index';
import path from 'path';
import _ from 'lodash';
import { TestContext, TestLogger } from '../lib/test.helpers';
import { 
  ApiError, 
  APSId,
  ApsAdministrationService,
  APSOrganization,
  APSError,
  APSErrorIds,
  APSOrganizationCreate,
  ApsBusinessGroupsService,
  APSBusinessGroupCreate,
  APSBusinessGroupResponse,
  APSExternalReference,
  ListAPSBusinessGroupsResponse,
  APSBusinessGroupResponseList,
  ApsExternalSystemsService,
  APSBusinessGroupUpdate,
} from '../../src/@solace-iot-team/apim-server-openapi-node';
import { TestApsOrganizationUtils } from '../lib/TestApsOrganizationsUtils';
import APSBusinessGroupsService from '../../server/api/services/apsOrganization/apsBusinessGroups/APSBusinessGroupsService';
import APSOrganizationsService from '../../server/api/services/apsAdministration/APSOrganizationsService';


const scriptName: string = path.basename(__filename);
TestLogger.logMessage(scriptName, ">>> starting ...");

const OrganizationId = "test_business-groups-jobs";

// const ExternalReference_SystemId = "EXTERNAL_SYSTEM_ID";
// const ExternalReference_MasterGroupId = "external-system-master-id";
// const ExternalReference_Master: APSExternalReference = {
//   externalId: ExternalReference_MasterGroupId,
//   displayName: ExternalReference_MasterGroupId,
//   externalSystemId: ExternalReference_SystemId,
// }
// const NumberOfChildrenGroups = 3;
// const createInternalChildBusinessGroupId = (masterId: string, childI: number): APSId => {
//   const childIStr: string = String(childI).padStart(5,'C');
//   return `${masterId}-internal-${childIStr}`;
// }
// const createExternalChildBusinessGroupId = (masterId: string, childI: number): APSId => {
//   const childIStr: string = String(childI).padStart(5,'C');
//   return `${masterId}-external-${childIStr}`;
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

  it(`${scriptName}: SETUP: should delete organization`, async () => {
    try {
      await ApsAdministrationService.deleteApsOrganization({
        organizationId: OrganizationId
      });
    } catch (e) {
      expect(e instanceof ApiError, TestLogger.createNotApiErrorMesssage(e.message)).to.be.true;
      const apiError: ApiError = e;
      if(apiError.status !== 404) expect(false, TestLogger.createTestFailMessage('failed')).to.be.true;
    }
  });

  it(`${scriptName}: should create organization`, async () => {
    try {
      const create: APSOrganizationCreate = {
        organizationId: OrganizationId,
        displayName: OrganizationId,
        appCredentialsExpiryDuration: APSOrganizationsService.get_DefaultAppCredentialsExpiryDuration(),
        maxNumApisPerApiProduct: APSOrganizationsService.get_DefaultMaxNumApis_Per_ApiProduct(),
      }
      const created: APSOrganization = await ApsAdministrationService.createApsOrganization({
        requestBody: create
      });
    } catch (e) {
      expect(e instanceof ApiError, TestLogger.createNotApiErrorMesssage(e.message)).to.be.true;
      expect(false, TestLogger.createTestFailMessage('failed')).to.be.true;
    }
  });

  it(`${scriptName}: should find business group of same name`, async () => {
    try {
      const listResponse: ListAPSBusinessGroupsResponse = await ApsBusinessGroupsService.listApsBusinessGroups({
        organizationId: OrganizationId
      });
      const list: APSBusinessGroupResponseList = listResponse.list;
      expect(list.length, TestLogger.createTestFailMessage('list.length not equal 1')).to.equal(1);
      const group: APSBusinessGroupResponse = list[0];
      expect(group.businessGroupId, TestLogger.createTestFailMessage('group.businessGroupId not equal to organizationId')).to.equal(OrganizationId);
    } catch (e) {
      expect(e instanceof ApiError, TestLogger.createNotApiErrorMesssage(e.message)).to.be.true;
      expect(false, TestLogger.createTestFailMessage('failed')).to.be.true;
    }
  });

  it(`${scriptName}: should catch attempt to delete root group`, async () => {
    try {
      await ApsBusinessGroupsService.deleteApsBusinessGroup({
        organizationId: OrganizationId,
        businessgroupId: OrganizationId
      });
      expect(false, TestLogger.createTestFailMessage('should never get here')).to.be.true;
    } catch (e) {
      expect(e instanceof ApiError, TestLogger.createNotApiErrorMesssage(e.message)).to.be.true;
      const apiError: ApiError = e;
      expect(apiError.status, TestLogger.createTestFailMessage('status not 422')).equal(422);
      const apsError: APSError = apiError.body;
      expect(apsError.errorId, TestLogger.createTestFailMessage('incorrect errorId')).equal(APSErrorIds.DELETE_NOT_ALLOWED_FOR_KEY);
      const metaStr = JSON.stringify(apsError.meta);
      expect(metaStr, TestLogger.createTestFailMessage('error does not contain the key')).to.contain(OrganizationId);
    }
  });

  it(`${scriptName}: should delete organization`, async () => {
    try {
      await ApsAdministrationService.deleteApsOrganization({
        organizationId: OrganizationId
      });
    } catch (e) {
      expect(e instanceof ApiError, TestLogger.createNotApiErrorMesssage(e.message)).to.be.true;
      expect(false, TestLogger.createTestFailMessage('failed')).to.be.true;
    }
  });

  it(`${scriptName}: should not find business group of same name in DB`, async () => {
    try {
      await APSBusinessGroupsService.wait4CollectionUnlock();
      // check DB directly
      const businessGroupsDBList: Array<any> = await APSBusinessGroupsService.getPersistenceService().allByOrganizationIdRaw(OrganizationId);
      expect(businessGroupsDBList.length, TestLogger.createTestFailMessage('businessGroupsDBList length does not equal 0')).to.equal(0);
    } catch (e) {
      expect(e instanceof ApiError, TestLogger.createNotApiErrorMesssage(e.message)).to.be.true;
      expect(false, TestLogger.createTestFailMessage('failed')).to.be.true;
    }
  });

});

