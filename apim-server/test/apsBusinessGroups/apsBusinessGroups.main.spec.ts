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


const scriptName: string = path.basename(__filename);
TestLogger.logMessage(scriptName, ">>> starting ...");

const OrganizationIdTemplate: APSId = 'test_businessgroups_organization';
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

const BusinessGroupMasterName = 'master';
const BusinessGroupIdTemplate: string = 'test_bizgroup';
const BusinessGroupDisplayNamePrefix: string = 'displayName for ';
const DefaultDescription = 'a default description';
const PatchedDisplayName = 'patched display name';
const createBusinessGroupId = (orgI: number, bizGroupName: string, bizGroupParentName?: string): APSId => {
  const orgIStr: string = String(orgI).padStart(5, '0');
  let bizGroupId = `${orgIStr}-${BusinessGroupIdTemplate}-${bizGroupName}`;
  if(bizGroupParentName) bizGroupId += `-${bizGroupParentName}`;
  return bizGroupId;
}
const createBusinessGroupDisplayName = (bizGroupId: string): APSDisplayName => {
  return `${BusinessGroupDisplayNamePrefix}${bizGroupId}`;
}

const NumberOfChildrenGroups = 3;
const BusinessGroupChildName = 'child';
const createChildBusinessGroupId = (orgI: number, masterI: number, childI: number, bizGroupName: string, bizGroupParentName?: string): APSId => {
  const orgIStr: string = String(orgI).padStart(5, 'O');
  const masterIStr: string = String(masterI).padStart(5, 'M');
  const childIStr: string = String(childI).padStart(5,'C');
  let bizGroupId = `${orgIStr}-${masterIStr}-${childIStr}-${BusinessGroupIdTemplate}-${bizGroupName}`;
  if(bizGroupParentName) bizGroupId += `-of-${bizGroupParentName}`;
  return bizGroupId;
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

  // ********  1 Organization: delete and check if all groups are gone *********
  it(`${scriptName}: should create first reference organizations with 3 master with 3 children each`, async () => {
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

      // create masters
      const NumMasterGroups = 3;
      const NumChildGroups = 3;
      for(let masterI=0; masterI < NumMasterGroups; masterI++) {
        const masterBusinessGroupId = createBusinessGroupId(masterI, BusinessGroupMasterName);
        const apsBusinessGroup: APSBusinessGroupCreate = {
          businessGroupId: masterBusinessGroupId,
          displayName: masterBusinessGroupId,
          description: DefaultDescription,
        }
        const createdApsBusinessGroup: APSBusinessGroupResponse = await ApsBusinessGroupsService.createApsBusinessGroup({
          organizationId: orgId,
          requestBody: apsBusinessGroup
        });
        expect(createdApsBusinessGroup.businessGroupChildIds, TestLogger.createTestFailMessage('businessGroupChildIds not an array')).to.be.an('array');
        expect(createdApsBusinessGroup.businessGroupChildIds.length, TestLogger.createTestFailMessage('businessGroupChildIds length not 0')).to.equal(0);
        const expectedResponse: APSBusinessGroupResponse = {
          ...apsBusinessGroup,
          businessGroupChildIds: []
        }
        expect(createdApsBusinessGroup, TestLogger.createTestFailMessage('created response does not equal request')).to.deep.equal(expectedResponse);
        // create children
        for(let childI=0; childI < NumChildGroups; childI++) {
          const childBusinessGroupId = createChildBusinessGroupId(orgI, masterI, childI, BusinessGroupChildName, masterBusinessGroupId);
          const childBusinessGroup: APSBusinessGroupCreate = {
            businessGroupId: childBusinessGroupId,
            displayName: childBusinessGroupId,
            description: DefaultDescription,
            }
          const createdChildGroup: APSBusinessGroupResponse = await ApsBusinessGroupsService.createApsBusinessGroup({
            organizationId: orgId,
            requestBody: childBusinessGroup
          });
          expect(createdChildGroup, TestLogger.createTestFailMessage('created child group response does not equal request')).to.deep.equal(createdChildGroup);  
        }
      }
      // now delete org 
      await ApsAdministrationService.deleteApsOrganization({
        organizationId: orgId
      });
      // check that it checks for missing organization
      try {
        const listResponse: ListAPSBusinessGroupsResponse = await ApsBusinessGroupsService.listApsBusinessGroups({
          organizationId: orgId        
        });
        expect(false, TestLogger.createTestFailMessage('must never get here')).to.be.true;
      } catch(e) {
        expect(e instanceof ApiError, TestLogger.createNotApiErrorMesssage(e.message)).to.be.true;
        const apiError: ApiError = e;
        expect(apiError.status, TestLogger.createTestFailMessage('status not 404')).equal(404);
        const apsError: APSError = apiError.body;
        expect(apsError.errorId, TestLogger.createTestFailMessage('incorrect errorId')).equal(APSErrorIds.ORGANIZATION_NOT_FOUND);
        const metaStr = JSON.stringify(apsError.meta);
        expect(metaStr, TestLogger.createTestFailMessage('error does not contain the organization id')).to.contain(orgId);
      }
    } catch (e) {
      expect(e instanceof ApiError, TestLogger.createNotApiErrorMesssage(e.message)).to.be.true;
      expect(false, TestLogger.createTestFailMessage('failed')).to.be.true;
    }
    // check in DB directly if no more groups exist
    const DBList: Array<any> = await APSBusinessGroupsService.getPersistenceService().allRawLessThanTargetSchemaVersion(APSBusinessGroupsService.getDBObjectSchemaVersion() + 1);
    expect(DBList.length, TestLogger.createTestFailMessage('DB List length does not equal 0')).to.equal(0);
  });


  // *********** N Organizations *******************
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
      expect(e instanceof ApiError, `${TestLogger.createNotApiErrorMesssage(e.message)}`).to.be.true;
      expect(false, `${TestLogger.createTestFailMessage('failed')}`).to.be.true;
    }
  });

  it(`${scriptName}: should list all business groups in all orgs and delete them`, async () => {
    try {
      for(let orgI=0; orgI < NumberOfOrganizations; orgI++) {
        const organizationId = createOrganizationId(orgI);
        const listResponse: ListAPSBusinessGroupsResponse = await ApsBusinessGroupsService.listApsBusinessGroups({
          organizationId: organizationId        
        });
        const groupList: APSBusinessGroupResponseList = listResponse.list;
        const meta = listResponse.meta;
        const totalCount: number = meta.totalCount;
        for(const group of groupList) {
          await ApsBusinessGroupsService.deleteApsBusinessGroup({
            organizationId: organizationId,
            businessgroupId: group.businessGroupId
          });
        }
      }
    } catch (e) {
      expect(e instanceof ApiError, `${TestLogger.createNotApiErrorMesssage(e.message)}`).to.be.true;
      expect(false, `${TestLogger.createTestFailMessage('failed')}`).to.be.true;
    }
  });

  it(`${scriptName}: should create master business group in all orgs`, async () => {
    try {
      for(let orgI=0; orgI < NumberOfOrganizations; orgI++) {
        const organizationId = createOrganizationId(orgI);
        const businessGroupId = createBusinessGroupId(orgI, BusinessGroupMasterName);
        const businessGroupDisplayName = createBusinessGroupDisplayName(businessGroupId);
        const apsBusinessGroup: APSBusinessGroupCreate = {
          businessGroupId: businessGroupId,
          displayName: businessGroupDisplayName,
          description: DefaultDescription,
        }
        const createdApsBusinessGroup: APSBusinessGroupResponse = await ApsBusinessGroupsService.createApsBusinessGroup({
          organizationId: organizationId,
          requestBody: apsBusinessGroup
        });
        const expectedResponse: APSBusinessGroupResponse = {
          ...apsBusinessGroup,
          businessGroupChildIds: []
        }
        expect(createdApsBusinessGroup, TestLogger.createTestFailMessage('created response does not equal request')).to.deep.equal(expectedResponse);
        // get it
        const getApsBusinessGroup: APSBusinessGroupResponse = await ApsBusinessGroupsService.getApsBusinessGroup({
          organizationId: organizationId,
          businessgroupId: apsBusinessGroup.businessGroupId
        });
        expect(getApsBusinessGroup, TestLogger.createTestFailMessage('created response does not equal request')).to.deep.equal(expectedResponse);
      }
    } catch (e) {
      expect(e instanceof ApiError, TestLogger.createNotApiErrorMesssage(e.message)).to.be.true;
      expect(false, TestLogger.createTestFailMessage('failed')).to.be.true;
    }
  });

  it(`${scriptName}: should create 3 children business groups of master business group in all orgs`, async () => {
    try {
      for(let orgI=0; orgI < NumberOfOrganizations; orgI++) {
        
        const organizationId = createOrganizationId(orgI);
        const businessGroupParentId = createBusinessGroupId(orgI, BusinessGroupMasterName);

        for(let childI=0; childI < NumberOfChildrenGroups; childI++) {
          const businessGroupId = createBusinessGroupId(orgI, createBusinessGroupId(childI, 'child'), businessGroupParentId);
          const businessGroupDisplayName = createBusinessGroupDisplayName(businessGroupId);
          const apsBusinessGroup: APSBusinessGroupCreate = {
            businessGroupId: businessGroupId,
            displayName: businessGroupDisplayName,
            businessGroupParentId: businessGroupParentId,
            description: DefaultDescription,
          }
          const createdApsBusinessGroupResponse: APSBusinessGroupResponse = await ApsBusinessGroupsService.createApsBusinessGroup({
            organizationId: organizationId,
            requestBody: apsBusinessGroup
          });
          const expectedResponse: APSBusinessGroupResponse = {
            ...apsBusinessGroup,
            businessGroupChildIds: []
          }
          expect(createdApsBusinessGroupResponse, TestLogger.createTestFailMessage('created response does not equal request')).to.deep.equal(expectedResponse);
        }
      }
      // now we should have 1 master & NumberOfChildrenGroups in each org
      const expectedNumberOfGroupsPerOrg = 1 + NumberOfChildrenGroups;
      for(let orgI=0; orgI < NumberOfOrganizations; orgI++) {
        const organizationId = createOrganizationId(orgI);
        const listResponse: ListAPSBusinessGroupsResponse = await ApsBusinessGroupsService.listApsBusinessGroups({
          organizationId: organizationId        
        });
        const groupList: APSBusinessGroupResponseList = listResponse.list;
        const meta = listResponse.meta;
        const totalCount: number = meta.totalCount;
        expect(totalCount, TestLogger.createTestFailMessage('totalCount does not equal expectedNumberOfGroupsPerOrg')).to.equal(expectedNumberOfGroupsPerOrg);
        for(const group of groupList) {
          if(!group.businessGroupParentId) {
            expect(group.businessGroupChildIds.length, TestLogger.createTestFailMessage('group.businessGroupChildIds.length does not equal 3')).to.equal(3);
          }
        }
      }

    } catch (e) {
      expect(e instanceof ApiError, TestLogger.createNotApiErrorMesssage(e.message)).to.be.true;
      expect(false, TestLogger.createTestFailMessage('failed')).to.be.true;
    }
  });

  it(`${scriptName}: should catch attempt to delete a parent group`, async () => {

    for(let orgI=0; orgI < NumberOfOrganizations; orgI++) {        
      const organizationId = createOrganizationId(orgI);
      const businessGroupParentId = createBusinessGroupId(orgI, BusinessGroupMasterName);
      try {
        await ApsBusinessGroupsService.deleteApsBusinessGroup({
          organizationId: organizationId,
          businessgroupId: businessGroupParentId
        });
        expect(false, TestLogger.createTestFailMessage('succeeded in deleting parent with children')).to.be.true;
      } catch(e) {
        expect(e instanceof ApiError, TestLogger.createNotApiErrorMesssage(e.message)).to.be.true;
        const apiError: ApiError = e;
        expect(apiError.status, TestLogger.createTestFailMessage('status not 422')).equal(422);
        const apsError: APSError = apiError.body;
        expect(apsError.errorId, TestLogger.createTestFailMessage('incorrect errorId')).equal(APSErrorIds.INVALID_OBJECT_REFERENCES);
        const metaStr = JSON.stringify(apsError.meta);
        expect(metaStr, TestLogger.createTestFailMessage('error does not contain the key')).to.contain(businessGroupParentId);
        expect(metaStr, TestLogger.createTestFailMessage('error does not contain referenceType=businessGroupChildren')).to.contain('businessGroupChildren');

        expect(apsError.meta, TestLogger.createTestFailMessage('property invalidReferenceList does not exist')).to.haveOwnProperty('invalidReferenceList');
        expect(apsError.meta.invalidReferenceList, TestLogger.createTestFailMessage('type of array')).to.be.an('array');
        const invalidReferenceList: Array<any> = (apsError.meta.invalidReferenceList as unknown) as Array<any>;
        expect(invalidReferenceList.length, TestLogger.createTestFailMessage('invalidReferenceList length not as expected')).equal(1);
        const referenceDetailsList: Array<any> = invalidReferenceList[0].referenceDetails;
        expect(referenceDetailsList.length, TestLogger.createTestFailMessage('referenceDetailsList length not as expected')).equal(NumberOfChildrenGroups);
      }
    }
  });

  it(`${scriptName}: should patch parent groups`, async () => {

    for(let orgI=0; orgI < NumberOfOrganizations; orgI++) {        
      const organizationId = createOrganizationId(orgI);
      const businessGroupId = createBusinessGroupId(orgI, BusinessGroupMasterName);
      try {
        const patch: APSBusinessGroupUpdate = {
          displayName: PatchedDisplayName,
          description: DefaultDescription,
        }
        const result: APSBusinessGroupResponse = await ApsBusinessGroupsService.updateApsBusinessGroup({
          organizationId: organizationId,
          businessgroupId: businessGroupId,
          requestBody: patch
        });
        expect(result.displayName, TestLogger.createTestFailMessage('failed to update display name')).equal(PatchedDisplayName);
      } catch(e) {
        expect(e instanceof ApiError, TestLogger.createNotApiErrorMesssage(e.message)).to.be.true;
        expect(false, TestLogger.createTestFailMessage('failed')).to.be.true;
      }
    }
  });

  it(`${scriptName}: should delete 1 child group`, async () => {

    for(let orgI=0; orgI < NumberOfOrganizations; orgI++) {        
      const organizationId = createOrganizationId(orgI);
      const businessGroupParentId = createBusinessGroupId(orgI, BusinessGroupMasterName);
      const childDeleteBusinessGroupId = createBusinessGroupId(orgI, createBusinessGroupId(0, 'child'), businessGroupParentId);

      try {
        // get the number of groups as reference first
        const beforeListResponse: ListAPSBusinessGroupsResponse = await ApsBusinessGroupsService.listApsBusinessGroups({
          organizationId: organizationId
        });
        await ApsBusinessGroupsService.deleteApsBusinessGroup({
          organizationId: organizationId,
          businessgroupId: childDeleteBusinessGroupId
        });
        const listResponse: ListAPSBusinessGroupsResponse = await ApsBusinessGroupsService.listApsBusinessGroups({
          organizationId: organizationId
        });
        const groupList: APSBusinessGroupResponseList = listResponse.list;
        const meta = listResponse.meta;
        const totalCount: number = meta.totalCount;
        expect(totalCount, TestLogger.createTestFailMessage('totalCount not as expected')).equal(beforeListResponse.meta.totalCount - 1);
      } catch(e) {
        expect(e instanceof ApiError, TestLogger.createNotApiErrorMesssage(e.message)).to.be.true;
        expect(false, TestLogger.createTestFailMessage('failed')).to.be.true;
      }
    }
  });

  it(`${scriptName}: should catch creating group for non-existing parent group`, async () => {
    const orgI = 0;
    const organizationId = createOrganizationId(orgI);
    const nonExistingParentBusinessGroupId = "non-existing-parent-group-id";
    const childBusinessGroupId = 'never-child-group-id';
    const apsBusinessGroup: APSBusinessGroupCreate = {
      businessGroupId: childBusinessGroupId,
      displayName: childBusinessGroupId,
      businessGroupParentId: nonExistingParentBusinessGroupId,
      description: DefaultDescription,      
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
      expect(metaStr, TestLogger.createTestFailMessage('error does not contain the parent group id')).to.contain(nonExistingParentBusinessGroupId);
      expect(metaStr, TestLogger.createTestFailMessage('error does not contain referenceType=businessGroupParentId')).to.contain('businessGroupParentId');
    }
  });


  // it(`${scriptName}: should catch creating/patching child group for non-existing parent group`, async () => {
  //   const orgI = 0;
  //   const organizationId = createOrganizationId(orgI);
  //   const nonExistingParentBusinessGroupId = "non-existing-parent-group-id";
  //   const childBusinessGroupId = 'never-child-group-id';
  //   const apsBusinessGroup: APSBusinessGroupCreate = {
  //     businessGroupId: childBusinessGroupId,
  //     displayName: childBusinessGroupId,
  //     businessGroupParentId: nonExistingParentBusinessGroupId,
  //     description: DefaultDescription,      
  //   }
  //   // create
  //   try {
  //     const created: APSBusinessGroupResponse = await ApsBusinessGroupsService.createApsBusinessGroup({
  //       organizationId: organizationId,
  //       requestBody: apsBusinessGroup
  //     });
  //     expect(false, TestLogger.createTestFailMessage('must never get here')).to.be.true;
  //   } catch(e) {
  //     expect(e instanceof ApiError, TestLogger.createNotApiErrorMesssage(e.message)).to.be.true;
  //     const apiError: ApiError = e;
  //     expect(apiError.status, TestLogger.createTestFailMessage('status not 422')).equal(422);
  //     const apsError: APSError = apiError.body;
  //     expect(apsError.errorId, TestLogger.createTestFailMessage('incorrect errorId')).equal(APSErrorIds.INVALID_OBJECT_REFERENCES);
  //     const metaStr = JSON.stringify(apsError.meta);
  //     expect(metaStr, TestLogger.createTestFailMessage('error does not contain the parent group id')).to.contain(nonExistingParentBusinessGroupId);
  //     expect(metaStr, TestLogger.createTestFailMessage('error does not contain referenceType=businessGroupParentId')).to.contain('businessGroupParentId');
  //   }
  //   // patch
  //   try {
  //     const existingBusinessGroupParentId = createBusinessGroupId(orgI, BusinessGroupMasterName);
  //     const childI = 0;
  //     const existingChildBusinessGroupId = createBusinessGroupId(orgI, createBusinessGroupId(childI, 'child'), existingBusinessGroupParentId);
  //     // ensure they both exists
  //     try {
  //       await ApsBusinessGroupsService.getApsBusinessGroup({ 
  //         organizationId: organizationId,
  //         businessgroupId: existingBusinessGroupParentId
  //       });
  //     } catch(e) {
  //       const parent: APSBusinessGroupCreate = {
  //         businessGroupId: existingBusinessGroupParentId,
  //         displayName: existingBusinessGroupParentId,
  //         description: DefaultDescription,
  //       }
  //       const createdParent: APSBusinessGroupResponse = await ApsBusinessGroupsService.createApsBusinessGroup({
  //         organizationId: organizationId,
  //         requestBody: parent
  //       });
  //     }
  //     const child: APSBusinessGroupCreate = {
  //       businessGroupId: existingChildBusinessGroupId,
  //       displayName: existingChildBusinessGroupId,
  //       businessGroupParentId: existingBusinessGroupParentId,
  //       description: DefaultDescription,
  //     }
  //     const createdChild: APSBusinessGroupResponse = await ApsBusinessGroupsService.createApsBusinessGroup({
  //       organizationId: organizationId,
  //       requestBody: child
  //     });
  //     const patch: APSBusinessGroupUpdate = {
  //       displayName: PatchedDisplayName,
  //       businessGroupParentId: nonExistingParentBusinessGroupId
  //     }
  //     const patched: APSBusinessGroupResponse = await ApsBusinessGroupsService.updateApsBusinessGroup({
  //       organizationId: organizationId,
  //       businessgroupId: existingChildBusinessGroupId,
  //       requestBody: patch
  //     });
  //     expect(false, TestLogger.createTestFailMessage('must never get here')).to.be.true;
  //   } catch(e) {
  //     expect(e instanceof ApiError, TestLogger.createNotApiErrorMesssage(e.message)).to.be.true;
  //     const apiError: ApiError = e;
  //     expect(apiError.status, TestLogger.createTestFailMessage('status not 422')).equal(422);
  //     const apsError: APSError = apiError.body;
  //     expect(apsError.errorId, TestLogger.createTestFailMessage('incorrect errorId')).equal(APSErrorIds.INVALID_OBJECT_REFERENCES);
  //     const metaStr = JSON.stringify(apsError.meta);
  //     expect(metaStr, TestLogger.createTestFailMessage('error does not contain the parent group id')).to.contain(nonExistingParentBusinessGroupId);
  //     expect(metaStr, TestLogger.createTestFailMessage('error does not contain referenceType=businessGroupParentId')).to.contain('businessGroupParentId');
  //   }
  // });

  it(`${scriptName}: should catch create attempt for non-existing organization`, async () => {
    const NonExistOrganizationId = createOrganizationId(11111);
    const create: APSBusinessGroupCreate = {
      businessGroupId: 'any-id',
      displayName: 'any',
      description: DefaultDescription,
    }
    try {
      const created: APSBusinessGroupResponse = await ApsBusinessGroupsService.createApsBusinessGroup({
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
      expect(metaStr, TestLogger.createTestFailMessage('error does not contain the parent group id')).to.contain(NonExistOrganizationId);
    }
  });

  it(`${scriptName}: should catch patch attempt for non-existing organization`, async () => {
    const NonExistOrganizationId = createOrganizationId(11111);
    const update: APSBusinessGroupUpdate = {
      displayName: 'any',
    }
    try {
      const updated: APSBusinessGroupResponse = await ApsBusinessGroupsService.updateApsBusinessGroup({
        organizationId: NonExistOrganizationId,
        businessgroupId: 'any-id',
        requestBody: update
      });
      expect(false, TestLogger.createTestFailMessage('must never get here')).to.be.true;
    } catch(e) {
      expect(e instanceof ApiError, TestLogger.createNotApiErrorMesssage(e.message)).to.be.true;
      const apiError: ApiError = e;
      expect(apiError.status, TestLogger.createTestFailMessage('status not 404')).equal(404);
      const apsError: APSError = apiError.body;
      expect(apsError.errorId, TestLogger.createTestFailMessage('incorrect errorId')).equal(APSErrorIds.ORGANIZATION_NOT_FOUND);
      const metaStr = JSON.stringify(apsError.meta);
      expect(metaStr, TestLogger.createTestFailMessage('error does not contain the parent group id')).to.contain(NonExistOrganizationId);
    }
  });

  it(`${scriptName}: should catch get list attempt for non-existing organization`, async () => {
    const NonExistOrganizationId = createOrganizationId(11111);
    try {
      await ApsBusinessGroupsService.listApsBusinessGroups({
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
      expect(metaStr, TestLogger.createTestFailMessage('error does not contain the parent group id')).to.contain(NonExistOrganizationId);
    }
  });

  it(`${scriptName}: should catch get attempt for non-existing organization`, async () => {
    const NonExistOrganizationId = createOrganizationId(11111);
    try {
      await ApsBusinessGroupsService.getApsBusinessGroup({
        organizationId: NonExistOrganizationId,
        businessgroupId: 'any-id'
      });
      expect(false, TestLogger.createTestFailMessage('must never get here')).to.be.true;
    } catch(e) {
      expect(e instanceof ApiError, TestLogger.createNotApiErrorMesssage(e.message)).to.be.true;
      const apiError: ApiError = e;
      expect(apiError.status, TestLogger.createTestFailMessage('status not 404')).equal(404);
      const apsError: APSError = apiError.body;
      expect(apsError.errorId, TestLogger.createTestFailMessage('incorrect errorId')).equal(APSErrorIds.ORGANIZATION_NOT_FOUND);
      const metaStr = JSON.stringify(apsError.meta);
      expect(metaStr, TestLogger.createTestFailMessage('error does not contain the parent group id')).to.contain(NonExistOrganizationId);
    }
  });


  xit(`${scriptName}: continue writing tests`, async () => {
    // unknown organization: list, get, create, patch, delete
    // not found error (delete non existing, patch non-existing)
    expect(false, TestLogger.createTestFailMessage('continue here')).to.be.true;
  });

    // xit(`${scriptName}: should return unauthorized request`, async() => {
    //   // TODO
    // });

    // xit(`${scriptName}: should return forbidden request`, async() => {
    //   // TODO
    // });

});

