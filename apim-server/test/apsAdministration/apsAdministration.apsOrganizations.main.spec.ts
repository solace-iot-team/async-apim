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
  ListAPSOrganizationResponse,
  APSOrganizationList,
  APSOrganization,
  APSDisplayName,
  APSOrganizationUpdate,
  APSError,
  APSErrorIds,
  APSOrganizationCreate,
} from '../../src/@solace-iot-team/apim-server-openapi-node';


const scriptName: string = path.basename(__filename);
TestLogger.logMessage(scriptName, ">>> starting ...");

const OrganizationIdTemplate: APSId = 'test_organization';
const OrganizationDisplayNamePrefix: string = 'displayName for ';
const OrganizationUpdateDisplayNamePrefix: string = `updated ${OrganizationDisplayNamePrefix}`;
const NumberOfOrganizations: number = 10;

const createOrganizationId = (i: number): APSId => {
  const iStr: string = String(i).padStart(5, '0');
  const orgId: APSId = `${OrganizationIdTemplate}_${iStr}`;
  return orgId;
}
const createOrganizationDisplayName = (orgId: APSId): APSDisplayName => {
  return `${OrganizationDisplayNamePrefix}${orgId}`;
}
const createOrganizationUpdateDisplayName = (orgId: APSId): APSDisplayName => {
  return `${OrganizationUpdateDisplayNamePrefix}${orgId}`;
}

describe(`${scriptName}`, () => {

  beforeEach(() => {
    TestContext.newItId();
  });

  after(async() => {
    TestContext.newItId();      
    try {
      const listOrgResponse: ListAPSOrganizationResponse = await ApsAdministrationService.listApsOrganizations();
      const orgList: APSOrganizationList = listOrgResponse.list;
      for(const org of orgList) {
        await ApsAdministrationService.deleteApsOrganization({
          organizationId: org.organizationId
        });
      }
    } catch (e) {
      expect(e instanceof ApiError, `${TestLogger.createNotApiErrorMesssage(e.message)}`).to.be.true;
      expect(false, `${TestLogger.createTestFailMessage('failed')}`).to.be.true;
    }
  });

  // ****************************************************************************************************************
  // * OpenApi API Tests *
  // ****************************************************************************************************************

  it(`${scriptName}: should list all organizations and delete them`, async () => {
    try {
      const listOrgResponse: ListAPSOrganizationResponse = await ApsAdministrationService.listApsOrganizations();
      const orgList: APSOrganizationList = listOrgResponse.list;
      const totalCount: number = listOrgResponse.meta.totalCount;
      for(const org of orgList) {
        await ApsAdministrationService.deleteApsOrganization({
          organizationId: org.organizationId
        });
      }
    } catch (e) {
      expect(e instanceof ApiError, `${TestLogger.createNotApiErrorMesssage(e.message)}`).to.be.true;
      expect(false, `${TestLogger.createTestFailMessage('failed')}`).to.be.true;
    }
  });

  it(`${scriptName}: should create organizations`, async () => {
    try {
      for(let i=0; i < NumberOfOrganizations; i++) {
        const orgId: APSId = createOrganizationId(i);
        const orgDisplayName: APSDisplayName = createOrganizationDisplayName(orgId);
        const apsOrg: APSOrganizationCreate = {
          organizationId: orgId,
          displayName: orgDisplayName
        }
        const apsOrgCreated: APSOrganization = await ApsAdministrationService.createApsOrganization({
          requestBody: apsOrg
        });
        expect(apsOrgCreated, TestLogger.createTestFailMessage('response does not equal request')).to.deep.equal(apsOrg);
      }
    } catch (e) {
      expect(e instanceof ApiError, `${TestLogger.createNotApiErrorMesssage(e.message)}`).to.be.true;
      expect(false, `${TestLogger.createTestFailMessage('failed')}`).to.be.true;
    }
  });

  it(`${scriptName}: should list and get all organizations`, async () => {
    try {
      const listOrgResponse: ListAPSOrganizationResponse = await ApsAdministrationService.listApsOrganizations();
      const orgList: APSOrganizationList = listOrgResponse.list;
      const totalCount: number = listOrgResponse.meta.totalCount;
      expect(totalCount, `${TestLogger.createTestFailMessage('totalCount not as expected')}`).to.equal(NumberOfOrganizations);
      expect(orgList.length, `${TestLogger.createTestFailMessage('orgList.length not as expected')}`).to.equal(NumberOfOrganizations);
      for(const org of orgList) {
        const getOrg: APSOrganization = await ApsAdministrationService.getApsOrganization({
          organizationId: org.organizationId
        });
        expect(getOrg, TestLogger.createTestFailMessage('response does not equal request')).to.deep.equal(org);
      }
    } catch (e) {
      expect(e instanceof ApiError, `${TestLogger.createNotApiErrorMesssage(e.message)}`).to.be.true;
      expect(false, `${TestLogger.createTestFailMessage('failed')}`).to.be.true;
    }
  });

  it(`${scriptName}: should update all organizations`, async () => {
    try {
      const listOrgResponse: ListAPSOrganizationResponse = await ApsAdministrationService.listApsOrganizations();
      const orgList: APSOrganizationList = listOrgResponse.list;
      for(const org of orgList) {
        const orgUpdate: APSOrganizationUpdate = {
          displayName: createOrganizationUpdateDisplayName(org.organizationId)
        };
        const updatedOrg: APSOrganization = await ApsAdministrationService.updateApsOrganization({
          organizationId: org.organizationId,
          requestBody: orgUpdate
        });
        const expectedUpdatedOrg: APSOrganization = {
          organizationId: org.organizationId,
          displayName: orgUpdate.displayName
        }
        expect(updatedOrg, TestLogger.createTestFailMessage('response does not equal request')).to.deep.equal(expectedUpdatedOrg);
      }
    } catch (e) {
      expect(e instanceof ApiError, `${TestLogger.createNotApiErrorMesssage(e.message)}`).to.be.true;
      expect(false, `${TestLogger.createTestFailMessage('failed')}`).to.be.true;
    }
  });

  it(`${scriptName}: should delete 1 organization`, async () => {
    try {
      const deleteOrgId: APSId = createOrganizationId(0);
      await ApsAdministrationService.deleteApsOrganization({
        organizationId: deleteOrgId
      });
      const listOrgResponse: ListAPSOrganizationResponse = await ApsAdministrationService.listApsOrganizations();
      const orgList: APSOrganizationList = listOrgResponse.list;
      const totalCount: number = listOrgResponse.meta.totalCount;
      expect(totalCount, `${TestLogger.createTestFailMessage('totalCount not as expected')}`).to.equal(NumberOfOrganizations-1);
      expect(orgList.length, `${TestLogger.createTestFailMessage('orgList.length not as expected')}`).to.equal(NumberOfOrganizations-1);
      const found = orgList.find( (org: APSOrganization) => {
        org.organizationId === deleteOrgId;
      });
      expect(found, `${TestLogger.createTestFailMessage('found the orgId that was deleted in response list')}`).to.be.undefined;
    } catch (e) {
      expect(e instanceof ApiError, `${TestLogger.createNotApiErrorMesssage(e.message)}`).to.be.true;
      expect(false, `${TestLogger.createTestFailMessage('failed')}`).to.be.true;
    }
  });

  it(`${scriptName}: should return duplicate key error`, async() => {
    const orgId = "DUPLICATE_KEY";
    try {
      await ApsAdministrationService.createApsOrganization({
        requestBody: {
          organizationId: orgId,
          displayName:'d'
        }
      });
      await ApsAdministrationService.createApsOrganization({
        requestBody: {
          organizationId: orgId,
          displayName:'d'
        }
      });
      expect(false, TestLogger.createTestFailMessage('should not get here')).to.be.true;
    } catch (e) {
      expect(e instanceof ApiError, TestLogger.createNotApiErrorMesssage(e.message)).to.be.true;
      const apiError: ApiError = e;
      expect(apiError.status, TestLogger.createTestFailMessage('status not 422')).equal(422);
      const apsError: APSError = apiError.body;
      expect(apsError.errorId, TestLogger.createTestFailMessage('incorrect errorId')).equal(APSErrorIds.DUPLICATE_KEY);
      expect(JSON.stringify(apsError.meta), TestLogger.createTestFailMessage('error does not contain the key')).to.contain(orgId);
    }
  });

  it(`${scriptName}: should return not found error`, async() => {
    const orgId = "_DOES_NOT_EXIST_";
    try {
      await ApsAdministrationService.getApsOrganization({
        organizationId: orgId,
      });
      expect(false, TestLogger.createTestFailMessage('should not get here')).to.be.true;
    } catch (e) {
      expect(e instanceof ApiError, TestLogger.createNotApiErrorMesssage(e.message)).to.be.true;
      const apiError: ApiError = e;
      expect(apiError.status, TestLogger.createTestFailMessage('status not 404')).equal(404);
      const apsError: APSError = apiError.body;
      expect(apsError.errorId, TestLogger.createTestFailMessage('incorrect errorId')).equal(APSErrorIds.KEY_NOT_FOUND);
      expect(JSON.stringify(apsError.meta), TestLogger.createTestFailMessage('error does not contain the key')).to.contain(orgId);
    }
  });


    // xit(`${scriptName}: should return unauthorized request`, async() => {
    //   // TODO
    // });

    // xit(`${scriptName}: should return forbidden request`, async() => {
    //   // TODO
    // });

});

