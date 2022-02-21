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


const scriptName: string = path.basename(__filename);
TestLogger.logMessage(scriptName, ">>> starting ...");

const OrganizationId = "test_mixed_internal_external_business_groups";
const InternalMasterGroupId = "internal-master";
const ExternalMasterGroupId = "external-master";
const DefaultDescription = 'a default description';

const ExternalReference_SystemId = "EXTERNAL_SYSTEM_ID";
const ExternalReference_MasterGroupId = "external-system-master-id";
const ExternalReference_Master: APSExternalReference = {
  externalId: ExternalReference_MasterGroupId,
  displayName: ExternalReference_MasterGroupId,
  externalSystemId: ExternalReference_SystemId,
}
const NumberOfChildrenGroups = 3;
const createInternalChildBusinessGroupId = (masterId: string, childI: number): APSId => {
  const childIStr: string = String(childI).padStart(5,'C');
  return `${masterId}-internal-${childIStr}`;
}
const createExternalChildBusinessGroupId = (masterId: string, childI: number): APSId => {
  const childIStr: string = String(childI).padStart(5,'C');
  return `${masterId}-external-${childIStr}`;
}

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

  it(`${scriptName}: should create reference org with 1 externalSystem, 1 internal master and 1 external master`, async () => {
    try {
      // create org
      const apsOrg: APSOrganizationCreate = {
        organizationId: OrganizationId,
        displayName: OrganizationId
      }
      const apsOrgCreated: APSOrganization = await ApsAdministrationService.createApsOrganization({
        requestBody: apsOrg
      });

      // create externalSystem
      const aspExternalSystemCreated = await ApsExternalSystemsService.createApsExternalSystem({
        organizationId: OrganizationId,
        requestBody: {
          externalSystemId: ExternalReference_SystemId,
          displayName: `display name for ${ExternalReference_SystemId}`,
          description: DefaultDescription
        }
      })

      // create internal master group
      const createInternal: APSBusinessGroupCreate = {
          businessGroupId: InternalMasterGroupId,
          displayName: InternalMasterGroupId,
          description: DefaultDescription
        }
      const createdInternalGroup: APSBusinessGroupResponse = await ApsBusinessGroupsService.createApsBusinessGroup({
        organizationId: OrganizationId,
        requestBody: createInternal
      });

      // create external master group
      const externalReference: APSExternalReference = ExternalReference_Master;
      const createExternal: APSBusinessGroupCreate = {
        businessGroupId: ExternalMasterGroupId,
        displayName: ExternalMasterGroupId,
        description: DefaultDescription,
        externalReference: externalReference
      }
      const createdExternalGroup: APSBusinessGroupResponse = await ApsBusinessGroupsService.createApsBusinessGroup({
        organizationId: OrganizationId,
        requestBody: createExternal
      });

    } catch (e) {
      expect(e instanceof ApiError, TestLogger.createNotApiErrorMesssage(e.message)).to.be.true;
      expect(false, TestLogger.createTestFailMessage('failed')).to.be.true;
    }
    // // check in DB directly if no more groups exist
    // const DBList: Array<any> = await APSBusinessGroupsService.getPersistenceService().allRawLessThanTargetSchemaVersion(APSBusinessGroupsService.getDBObjectSchemaVersion() + 1);
    // expect(DBList.length, TestLogger.createTestFailMessage('DB List length does not equal 0')).to.equal(0);
  });

  it(`${scriptName}: should create 3 children for each master`, async () => {
    try {
      // create internal children
      for(let childI=0; childI < NumberOfChildrenGroups; childI++) {
        const childId = createInternalChildBusinessGroupId(InternalMasterGroupId, childI);
        const createInternal: APSBusinessGroupCreate = {
          businessGroupId: childId,
          displayName: childId,
          businessGroupParentId: InternalMasterGroupId,
          description: DefaultDescription,
        }
        const createdInternalGroup: APSBusinessGroupResponse = await ApsBusinessGroupsService.createApsBusinessGroup({
          organizationId: OrganizationId,
          requestBody: createInternal
        });  
      }
      // create external children
      for(let childI=0; childI < NumberOfChildrenGroups; childI++) {
        const childId = createExternalChildBusinessGroupId(ExternalMasterGroupId, childI);
        const externalReference: APSExternalReference = {
          externalId: childId,
          displayName: childId,
          externalSystemId: ExternalReference_Master.externalSystemId,
        }
        const createExternal: APSBusinessGroupCreate = {
          businessGroupId: childId,
          displayName: childId,
          description: DefaultDescription,
          businessGroupParentId: ExternalMasterGroupId,
          externalReference: externalReference
        }
        const createdExternalGroup: APSBusinessGroupResponse = await ApsBusinessGroupsService.createApsBusinessGroup({
          organizationId: OrganizationId,
          requestBody: createExternal,
        });  
      }
    } catch (e) {
      expect(e instanceof ApiError, TestLogger.createNotApiErrorMesssage(e.message)).to.be.true;
      expect(false, TestLogger.createTestFailMessage('failed')).to.be.true;
    }
  });

  it(`${scriptName}: should validate children list of master orgs`, async () => {
    try {
      const internalMasterGroup: APSBusinessGroupResponse = await ApsBusinessGroupsService.getApsBusinessGroup({
        organizationId: OrganizationId,
        businessgroupId: InternalMasterGroupId
      });
      expect(internalMasterGroup.businessGroupChildIds.length, TestLogger.createTestFailMessage('internalMasterGroup.businessGroupChildIds.length does not equal expected count')).to.equal(NumberOfChildrenGroups);
      const externalMasterGroup: APSBusinessGroupResponse = await ApsBusinessGroupsService.getApsBusinessGroup({
        organizationId: OrganizationId,
        businessgroupId: ExternalMasterGroupId
      });
      expect(externalMasterGroup.businessGroupChildIds.length, TestLogger.createTestFailMessage('externalMasterGroup.businessGroupChildIds.length does not equal expected count')).to.equal(NumberOfChildrenGroups);
    } catch (e) {
      expect(e instanceof ApiError, TestLogger.createNotApiErrorMesssage(e.message)).to.be.true;
      expect(false, TestLogger.createTestFailMessage('failed')).to.be.true;
    }
  });

  it(`${scriptName}: should list all groups`, async () => {
    try {
      const listResponse: ListAPSBusinessGroupsResponse = await ApsBusinessGroupsService.listApsBusinessGroups({
        organizationId: OrganizationId        
      });
      const expectedNumberOfGroups = 2 + (2 * NumberOfChildrenGroups);
      const groupList: APSBusinessGroupResponseList = listResponse.list;
      const meta = listResponse.meta;
      const totalCount: number = meta.totalCount;
      expect(totalCount, TestLogger.createTestFailMessage('totalCount does not equal expectedNumberOfGroupsPerOrg')).to.equal(expectedNumberOfGroups);
    } catch (e) {
      expect(e instanceof ApiError, TestLogger.createNotApiErrorMesssage(e.message)).to.be.true;
      expect(false, TestLogger.createTestFailMessage('failed')).to.be.true;
    }
  });

  it(`${scriptName}: should list all groups by external System`, async () => {
    try {
      const listResponse: ListAPSBusinessGroupsResponse = await ApsBusinessGroupsService.listApsBusinessGroupsByExternalSystem({
        organizationId: OrganizationId,
        externalSystemId: ExternalReference_SystemId
      });
      const expectedNumberOfGroups = 1 + NumberOfChildrenGroups;
      const groupList: APSBusinessGroupResponseList = listResponse.list;
      // verify they all have an external reference
      for(const group of groupList) {
        expect(group.externalReference !== undefined, TestLogger.createTestFailMessage('group.externalReference is undefined')).to.be.true;
      }
      const meta = listResponse.meta;
      const totalCount: number = meta.totalCount;
      expect(totalCount, TestLogger.createTestFailMessage('totalCount does not equal expectedNumberOfGroupsPerOrg')).to.equal(expectedNumberOfGroups);
    } catch (e) {
      expect(e instanceof ApiError, TestLogger.createNotApiErrorMesssage(e.message)).to.be.true;
      expect(false, TestLogger.createTestFailMessage('failed')).to.be.true;
    }
  });

  it(`${scriptName}: should list all groups by external System and get the groups by externalReferenceId`, async () => {
    try {
      const listResponse: ListAPSBusinessGroupsResponse = await ApsBusinessGroupsService.listApsBusinessGroupsByExternalSystem({
        organizationId: OrganizationId,
        externalSystemId: ExternalReference_SystemId
      });
      const groupList: APSBusinessGroupResponseList = listResponse.list;
      // verify they all have an external reference
      for(const group of groupList) {
        const groupResponse: APSBusinessGroupResponse = await ApsBusinessGroupsService.getApsBusinessGroupByExternalReference({
          organizationId: OrganizationId,
          externalReferenceId: group.externalReference.externalId
        });        
        expect(groupResponse.externalReference !== undefined, TestLogger.createTestFailMessage('group.externalReference is undefined')).to.be.true;
        expect(groupResponse.externalReference.externalId, TestLogger.createTestFailMessage('')).to.equal(group.externalReference.externalId);
      }
    } catch (e) {
      expect(e instanceof ApiError, TestLogger.createNotApiErrorMesssage(e.message)).to.be.true;
      expect(false, TestLogger.createTestFailMessage('failed')).to.be.true;
    }
  });

  it(`${scriptName}: should catch duplicate external reference id`, async () => {
    try {
      // Expects these to exist already
      // create external children again
      for(let childI=0; childI < NumberOfChildrenGroups; childI++) {
        const externalId = `${createExternalChildBusinessGroupId(ExternalMasterGroupId, childI)}`;
        const childId = `${externalId}-duplicate`;
        const externalReference: APSExternalReference = {
          externalId: externalId,
          displayName: externalId,
          externalSystemId: ExternalReference_Master.externalSystemId,
        }
        const createExternal: APSBusinessGroupCreate = {
          businessGroupId: childId,
          displayName: childId,
          description: DefaultDescription,
          businessGroupParentId: ExternalMasterGroupId,
          externalReference: externalReference
        }
        try {
          const createdExternalGroup: APSBusinessGroupResponse = await ApsBusinessGroupsService.createApsBusinessGroup({
            organizationId: OrganizationId,
            requestBody: createExternal,
          });  
          expect(false, TestLogger.createTestFailMessage('shoud never get here')).to.be.true;
        } catch(e) {
          expect(e instanceof ApiError, TestLogger.createNotApiErrorMesssage(e.message)).to.be.true;
          const apiError: ApiError = e;
          expect(apiError.status, TestLogger.createTestFailMessage('status not 422')).equal(422);
          const apsError: APSError = apiError.body;
          expect(apsError.errorId, TestLogger.createTestFailMessage('incorrect errorId')).equal(APSErrorIds.DUPLICATE_KEY);
          const metaStr = JSON.stringify(apsError.meta);
          expect(metaStr, TestLogger.createTestFailMessage('error does not contain the externalId')).to.contain(externalId);  
        }
      }
    } catch (e) {
      expect(e instanceof ApiError, TestLogger.createNotApiErrorMesssage(e.message)).to.be.true;
      expect(false, TestLogger.createTestFailMessage('failed')).to.be.true;
    }
  });

  it(`${scriptName}: should catch deleting external system with groups referencing it`, async () => {
    try {
      const listResponse: ListAPSBusinessGroupsResponse = await ApsBusinessGroupsService.listApsBusinessGroupsByExternalSystem({
        organizationId: OrganizationId,
        externalSystemId: ExternalReference_SystemId
      });
      // ensure we have groups, otherwise test setup is wrong
      expect(listResponse.list.length, TestLogger.createTestFailMessage('group.externalReference is undefined')).to.be.greaterThan(0);

      // delete external system
      await ApsExternalSystemsService.deleteApsExternalSystem({
        organizationId: OrganizationId,
        externalSystemId: ExternalReference_SystemId
      });
      expect(false, TestLogger.createTestFailMessage('should never get here')).to.be.true;

    } catch (e) {
      expect(e instanceof ApiError, TestLogger.createNotApiErrorMesssage(e.message)).to.be.true;
      const apiError: ApiError = e;
      expect(apiError.status, TestLogger.createTestFailMessage('status not 422')).equal(422);
      const apsError: APSError = apiError.body;
      expect(apsError.errorId, TestLogger.createTestFailMessage('incorrect errorId')).equal(APSErrorIds.DEPENDANT_OBJECTS);
      expect(apsError, TestLogger.createTestFailMessage('meta is undefined')).to.haveOwnProperty('meta');
      const meta = apsError.meta;
      expect(meta, TestLogger.createTestFailMessage('meta.dependantList is undefined')).to.haveOwnProperty('dependantList');
      const dependantList: Array<any> = (meta.dependantList as unknown) as Array<any>;
      expect(dependantList, TestLogger.createTestFailMessage('meta.dependantList is not an array')).to.be.an('array');
      expect(dependantList.length, TestLogger.createTestFailMessage('meta.dependantList is not an array')).to.be.greaterThan(0);
      const metaStr = JSON.stringify(apsError.meta);
      expect(metaStr, TestLogger.createTestFailMessage('error does not contain the parentId')).to.contain(ExternalReference_SystemId);  
    }
  });

  it(`${scriptName}: should catch creating group for non-existing external system`, async () => {
    const organizationId = OrganizationId;
    const businessGroupId = 'never-business-group-id';
    const externalId = 'never-external-id';
    const nonExistingExternalSystemId = "non-existing-external-system-id";
    const apsBusinessGroup: APSBusinessGroupCreate = {
      businessGroupId: businessGroupId,
      displayName: businessGroupId,
      description: DefaultDescription,      
      externalReference: {
        externalId: externalId,
        displayName: externalId,
        externalSystemId: nonExistingExternalSystemId
      }
    }
    // create
    try {
      const created: APSBusinessGroupResponse = await ApsBusinessGroupsService.createApsBusinessGroup({
        organizationId: organizationId,
        requestBody: apsBusinessGroup
      });
      expect(false, TestLogger.createTestFailMessage('must never get here')).to.be.true;
    } catch(e) {
      expect(e instanceof ApiError, TestLogger.createNotApiErrorMesssage(e.message)).to.be.true;
      const apiError: ApiError = e;
      expect(apiError.status, TestLogger.createTestFailMessage('status not 422')).equal(422);
      const apsError: APSError = apiError.body;
      expect(apsError.errorId, TestLogger.createTestFailMessage('incorrect errorId')).equal(APSErrorIds.INVALID_OBJECT_REFERENCES);
      const metaStr = JSON.stringify(apsError.meta);
      expect(metaStr, TestLogger.createTestFailMessage('error does not contain the external system id')).to.contain(nonExistingExternalSystemId);
      expect(metaStr, TestLogger.createTestFailMessage('error does not contain referenceType=externalReference.externalSystemId')).to.contain('externalReference.externalSystemId');
    }
  });

  it(`${scriptName}: should catch updating group with non-existing external system`, async () => {
    const organizationId = OrganizationId;
    const businessGroupId = 'patch-me-business-group-id';
    const externalId = 'never-external-id';
    const nonExistingExternalSystemId = "non-existing-external-system-id";

    const createRequest: APSBusinessGroupCreate = {
      businessGroupId: businessGroupId,
      displayName: businessGroupId,
      description: DefaultDescription,      
    }

    const updateRequest: APSBusinessGroupUpdate = {
      externalReference: {
        externalId: externalId,
        displayName: externalId,
        externalSystemId: nonExistingExternalSystemId
      }
    }
    // create & patch
    try {
      const created: APSBusinessGroupResponse = await ApsBusinessGroupsService.createApsBusinessGroup({
        organizationId: organizationId,
        requestBody: createRequest
      });
      const updated: APSBusinessGroupResponse = await ApsBusinessGroupsService.updateApsBusinessGroup({
        organizationId: organizationId,
        businessgroupId: businessGroupId,
        requestBody: updateRequest
      })
      expect(false, TestLogger.createTestFailMessage('must never get here')).to.be.true;
    } catch(e) {
      expect(e instanceof ApiError, TestLogger.createNotApiErrorMesssage(e.message)).to.be.true;
      const apiError: ApiError = e;
      expect(apiError.status, TestLogger.createTestFailMessage('status not 422')).equal(422);
      const apsError: APSError = apiError.body;
      expect(apsError.errorId, TestLogger.createTestFailMessage('incorrect errorId')).equal(APSErrorIds.INVALID_OBJECT_REFERENCES);
      const metaStr = JSON.stringify(apsError.meta);
      expect(metaStr, TestLogger.createTestFailMessage('error does not contain the external system id')).to.contain(nonExistingExternalSystemId);
      expect(metaStr, TestLogger.createTestFailMessage('error does not contain referenceType=externalReference.externalSystemId')).to.contain('externalReference.externalSystemId');
    }
  });

    // xit(`${scriptName}: should return unauthorized request`, async() => {
    //   // TODO
    // });

    // xit(`${scriptName}: should return forbidden request`, async() => {
    //   // TODO
    // });

});

