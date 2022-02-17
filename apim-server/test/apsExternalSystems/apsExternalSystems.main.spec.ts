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
  ApsExternalSystemsService,
  ListAPSOrganizationResponse,
  APSOrganizationList,
  APSOrganization,
  APSDisplayName,
  APSError,
  APSErrorIds,
  APSOrganizationCreate,
  APSExternalSystemCreate,
  ListAPSExternalSystemsResponse,
  APSExternalSystem,
  APSExternalSystemList,
  APSExternalSystemUpdate,
} from '../../src/@solace-iot-team/apim-server-openapi-node';
import APSExternalSystemsService from '../../server/api/services/apsOrganization/apsExternalSystems/APSExternalSystemsService';


const scriptName: string = path.basename(__filename);
TestLogger.logMessage(scriptName, ">>> starting ...");

const OrganizationIdTemplate: APSId = 'test_external-systems_organization';
const NumberOfOrganizations: number = 3;

const createOrganizationId = (i: number): APSId => {
  const iStr: string = String(i).padStart(5, '0');
  const orgId: APSId = `${OrganizationIdTemplate}_${iStr}`;
  return orgId;
}
const createOrganizationDisplayName = (orgId: APSId): APSDisplayName => {
  return `display name for: ${orgId}`;
}

const NumberOfExternalSystems = 3;
const createExternalSystemId = (orgI: number, extSystemI: number): APSId => {
  const orgIStr = createOrganizationId(orgI);
  const extSystemIStr = String(extSystemI).padStart(5, '0');
  const extSystemId = `${orgIStr}-${extSystemIStr}`;
  return extSystemId;
}
const createExternalSystemDisplayName = (extSytemId: string): APSDisplayName => {
  return `display name for: ${extSytemId}`;
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
      expect(e instanceof ApiError, TestLogger.createNotApiErrorMesssage(e.message)).to.be.true;
      expect(false, TestLogger.createTestFailMessage('failed')).to.be.true;
    }
  });

  // ****************************************************************************************************************
  // * OpenApi API Tests *
  // ****************************************************************************************************************

  it(`${scriptName}: SETUP: should list all organizations and delete them and check no more external systems exist`, async () => {
    try {
      const listOrgResponse: ListAPSOrganizationResponse = await ApsAdministrationService.listApsOrganizations();
      const orgList: APSOrganizationList = listOrgResponse.list;
      const totalCount: number = listOrgResponse.meta.totalCount;
      for(const org of orgList) {
        await ApsAdministrationService.deleteApsOrganization({
          organizationId: org.organizationId
        });
        // wait until done
        try {
          await ApsExternalSystemsService.listApsExternalSystems({
            organizationId: org.organizationId
          });
        } catch(e) {}
      }
      // check DB directly
      // above call ensures background delete job is done.
      const DBList: Array<any> = await APSExternalSystemsService.getPersistenceService().allRawLessThanTargetSchemaVersion(APSExternalSystemsService.getDBObjectSchemaVersion() + 1);
      expect(DBList.length, TestLogger.createTestFailMessage('DB List length does not equal 0')).to.equal(0);
    } catch (e) {
      expect(e instanceof ApiError, TestLogger.createNotApiErrorMesssage(e.message)).to.be.true;
      expect(false, TestLogger.createTestFailMessage('failed')).to.be.true;
    }
  });

  it(`${scriptName}: should create first reference organization with 3 external systems`, async () => {
    try {
      // create org
      const orgI = 0;
      const orgId: APSId = createOrganizationId(orgI);
      const orgDisplayName: APSDisplayName = createOrganizationDisplayName(orgId);
      const apsOrg: APSOrganizationCreate = {
        organizationId: orgId,
        displayName: orgDisplayName
      }
      const apsOrgCreated: APSOrganization = await ApsAdministrationService.createApsOrganization({
        requestBody: apsOrg
      });
      expect(apsOrgCreated, TestLogger.createTestFailMessage('response does not equal request')).to.deep.equal(apsOrg);

      // create external systems
      for(let extI=0; extI < NumberOfExternalSystems; extI++) {
        const extSystemId = createExternalSystemId(orgI, extI);
        const extDisplayName = createExternalSystemDisplayName(extSystemId);
        const create: APSExternalSystemCreate = {
          externalSystemId: extSystemId,
          displayName: extDisplayName
        }
        const created: APSExternalSystem = await ApsExternalSystemsService.createApsExternalSystem({
          organizationId: orgId,
          requestBody: create
        });
      }
      // ensure external systems exist
      const listResponse: ListAPSExternalSystemsResponse = await ApsExternalSystemsService.listApsExternalSystems({
        organizationId: orgId
      });
      expect(listResponse.list.length, TestLogger.createTestFailMessage('list response length not as expected')).to.equal(NumberOfExternalSystems);

      // now delete org 
      await ApsAdministrationService.deleteApsOrganization({
        organizationId: orgId
      });

      // wait for background delete to finish
      try {
        const listResponse2: ListAPSExternalSystemsResponse = await ApsExternalSystemsService.listApsExternalSystems({
          organizationId: orgId
        });
        expect(false, TestLogger.createTestFailMessage('must never get here')).to.be.true;
      } catch(e) {
        // ignore here
      }
      // check in DB directly if no more external systems exist
      const DBList: Array<any> = await APSExternalSystemsService.getPersistenceService().allRawLessThanTargetSchemaVersion(APSExternalSystemsService.getDBObjectSchemaVersion() + 1);
      expect(DBList.length, TestLogger.createTestFailMessage('DB List length does not equal 0')).to.equal(0);
    } catch (e) {
      expect(e instanceof ApiError, TestLogger.createNotApiErrorMesssage(e.message)).to.be.true;
      expect(false, TestLogger.createTestFailMessage('failed')).to.be.true;
    }
  });

  it(`${scriptName}: should create reference organizations`, async () => {
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
      expect(e instanceof ApiError, TestLogger.createNotApiErrorMesssage(e.message)).to.be.true;
      expect(false, TestLogger.createTestFailMessage('failed')).to.be.true;
    }
  });

  it(`${scriptName}: should create external systems in all reference organizations`, async () => {
    try {
      for(let orgI=0; orgI < NumberOfOrganizations; orgI++) {
        const orgId: APSId = createOrganizationId(orgI);
        for(let extI=0; extI < NumberOfExternalSystems; extI++) {
          const extSystemId = createExternalSystemId(orgI, extI);
          const extDisplayName = createExternalSystemDisplayName(extSystemId);
          const create: APSExternalSystemCreate = {
            externalSystemId: extSystemId,
            displayName: extDisplayName
          }
          const created: APSExternalSystem = await ApsExternalSystemsService.createApsExternalSystem({
            organizationId: orgId,
            requestBody: create
          });  
        }
      }
    } catch (e) {
      expect(e instanceof ApiError, TestLogger.createNotApiErrorMesssage(e.message)).to.be.true;
      expect(false, TestLogger.createTestFailMessage('failed')).to.be.true;
    }
  });

  it(`${scriptName}: should patch all external systems in all organizations`, async () => {
    try {
      for(let orgI=0; orgI < NumberOfOrganizations; orgI++) {
        const orgId: APSId = createOrganizationId(orgI);
        // get all
        const listResponse: ListAPSExternalSystemsResponse = await ApsExternalSystemsService.listApsExternalSystems({
          organizationId: orgId
        });
        // patch one by one
        const updateDisplayName = "new display name";
        const responseList: APSExternalSystemList = listResponse.list;
        for(const apsExternalSystem of responseList) {
          const patch: APSExternalSystemUpdate = {
            displayName: updateDisplayName
          }
          const patched: APSExternalSystem = await ApsExternalSystemsService.updateApsExternalSystem({
            organizationId: orgId,
            externalSystemId: apsExternalSystem.externalSystemId,
            requestBody: patch
          });
          const expectedPatched: APSExternalSystem = {
            displayName: updateDisplayName,
            externalSystemId: apsExternalSystem.externalSystemId,
          }
          expect(patched, TestLogger.createTestFailMessage('patched does not equal expectedPatched')).to.deep.equal(expectedPatched);
        }
      }  
    } catch (e) {
      expect(e instanceof ApiError, TestLogger.createNotApiErrorMesssage(e.message)).to.be.true;
      expect(false, TestLogger.createTestFailMessage('failed')).to.be.true;
    }
  });

  it(`${scriptName}: should list all external systems in all organizations and delete one by one`, async () => {
    try {
      for(let orgI=0; orgI < NumberOfOrganizations; orgI++) {
        const orgId: APSId = createOrganizationId(orgI);
        // get all
        const listResponse: ListAPSExternalSystemsResponse = await ApsExternalSystemsService.listApsExternalSystems({
          organizationId: orgId
        });
        // delete one by one
        const responseList: APSExternalSystemList = listResponse.list;
        for(const apsExternalSystem of responseList) {
          await ApsExternalSystemsService.deleteApsExternalSystem({
            organizationId: orgId,
            externalSystemId: apsExternalSystem.externalSystemId
          });
        }
        // get all
        const listResponseAfter: ListAPSExternalSystemsResponse = await ApsExternalSystemsService.listApsExternalSystems({
          organizationId: orgId
        });
        expect(listResponseAfter.list.length, TestLogger.createTestFailMessage('externalSystem list length not 0')).to.equal(0);
        expect(listResponseAfter.meta.totalCount, TestLogger.createTestFailMessage('totalCount not 0')).to.equal(0);
      }  
    } catch (e) {
      expect(e instanceof ApiError, `${TestLogger.createNotApiErrorMesssage(e.message)}`).to.be.true;
      expect(false, `${TestLogger.createTestFailMessage('failed')}`).to.be.true;
    }
  });

  it(`${scriptName}: should catch create attempt for non-existing organization`, async () => {
    const NonExistOrganizationId = createOrganizationId(11111);
    try {
      const create: APSExternalSystemCreate = {
        externalSystemId: 'any-id',
        displayName: 'any'
      }
      const created: APSExternalSystem = await ApsExternalSystemsService.createApsExternalSystem({
        organizationId: NonExistOrganizationId,
        requestBody: create
      });
      expect(false, TestLogger.createTestFailMessage('must never get here')).to.be.true;
    } catch(e) {
      expect(e instanceof ApiError, TestLogger.createNotApiErrorMesssage(e.message)).to.be.true;
      const apiError: ApiError = e;
      expect(apiError.status, TestLogger.createTestFailMessage('status not 404')).equal(404);
      const apsError: APSError = apiError.body;
      expect(apsError.errorId, TestLogger.createTestFailMessage('incorrect errorId')).equal(APSErrorIds.ORGANIZATION_NOT_FOUND);
      const metaStr = JSON.stringify(apsError.meta);
      expect(metaStr, TestLogger.createTestFailMessage('error does not contain the organization id')).to.contain(NonExistOrganizationId);
    }
  });

  it(`${scriptName}: should catch patch attempt for non-existing organization`, async () => {
    const NonExistOrganizationId = createOrganizationId(11111);
    try {
      const patch: APSExternalSystemUpdate = {
        displayName: 'any'
      }
      const patched: APSExternalSystem = await ApsExternalSystemsService.updateApsExternalSystem({
        organizationId: NonExistOrganizationId,
        externalSystemId: 'any-id',
        requestBody: patch
      });
      expect(false, TestLogger.createTestFailMessage('must never get here')).to.be.true;
    } catch(e) {
      expect(e instanceof ApiError, TestLogger.createNotApiErrorMesssage(e.message)).to.be.true;
      const apiError: ApiError = e;
      expect(apiError.status, TestLogger.createTestFailMessage('status not 404')).equal(404);
      const apsError: APSError = apiError.body;
      expect(apsError.errorId, TestLogger.createTestFailMessage('incorrect errorId')).equal(APSErrorIds.ORGANIZATION_NOT_FOUND);
      const metaStr = JSON.stringify(apsError.meta);
      expect(metaStr, TestLogger.createTestFailMessage('error does not contain the organization id')).to.contain(NonExistOrganizationId);
    }
  });  

  it(`${scriptName}: should catch get list attempt for non-existing organization`, async () => {
    const NonExistOrganizationId = createOrganizationId(11111);
    try {
      await ApsExternalSystemsService.listApsExternalSystems({
        organizationId: NonExistOrganizationId
      });
      expect(false, TestLogger.createTestFailMessage('must never get here')).to.be.true;
    } catch(e) {
      expect(e instanceof ApiError, TestLogger.createNotApiErrorMesssage(e.message)).to.be.true;
      const apiError: ApiError = e;
      expect(apiError.status, TestLogger.createTestFailMessage('status not 404')).equal(404);
      const apsError: APSError = apiError.body;
      expect(apsError.errorId, TestLogger.createTestFailMessage('incorrect errorId')).equal(APSErrorIds.ORGANIZATION_NOT_FOUND);
      const metaStr = JSON.stringify(apsError.meta);
      expect(metaStr, TestLogger.createTestFailMessage('error does not contain the organization id')).to.contain(NonExistOrganizationId);
    }
  });  

  it(`${scriptName}: should catch get attempt for non-existing organization`, async () => {
    const NonExistOrganizationId = createOrganizationId(11111);
    try {
      await ApsExternalSystemsService.getApsExternalSystem({
        organizationId: NonExistOrganizationId,
        externalSystemId: 'any-id'
      });
      expect(false, TestLogger.createTestFailMessage('must never get here')).to.be.true;
    } catch(e) {
      expect(e instanceof ApiError, TestLogger.createNotApiErrorMesssage(e.message)).to.be.true;
      const apiError: ApiError = e;
      expect(apiError.status, TestLogger.createTestFailMessage('status not 404')).equal(404);
      const apsError: APSError = apiError.body;
      expect(apsError.errorId, TestLogger.createTestFailMessage('incorrect errorId')).equal(APSErrorIds.ORGANIZATION_NOT_FOUND);
      const metaStr = JSON.stringify(apsError.meta);
      expect(metaStr, TestLogger.createTestFailMessage('error does not contain the organization id')).to.contain(NonExistOrganizationId);
    }
  });  

  it(`${scriptName}: should catch delete attempt for non-existing organization`, async () => {
    const NonExistOrganizationId = createOrganizationId(11111);
    try {
      await ApsExternalSystemsService.deleteApsExternalSystem({
        organizationId: NonExistOrganizationId,
        externalSystemId: 'any-id'
      });
      expect(false, TestLogger.createTestFailMessage('must never get here')).to.be.true;
    } catch(e) {
      expect(e instanceof ApiError, TestLogger.createNotApiErrorMesssage(e.message)).to.be.true;
      const apiError: ApiError = e;
      expect(apiError.status, TestLogger.createTestFailMessage('status not 404')).equal(404);
      const apsError: APSError = apiError.body;
      expect(apsError.errorId, TestLogger.createTestFailMessage('incorrect errorId')).equal(APSErrorIds.ORGANIZATION_NOT_FOUND);
      const metaStr = JSON.stringify(apsError.meta);
      expect(metaStr, TestLogger.createTestFailMessage('error does not contain the organization id')).to.contain(NonExistOrganizationId);
    }
  });  


    // xit(`${scriptName}: should return unauthorized request`, async() => {
    //   // TODO
    // });

    // xit(`${scriptName}: should return forbidden request`, async() => {
    //   // TODO
    // });

});

