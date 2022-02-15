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
  APSError,
  APSErrorIds,
  APSOrganizationCreate,
  ApsBusinessGroupsService,
  ListAPSBusinessGroupsResponse,
  APSBusinessGroupResponseList,
  APSBusinessGroupCreate,
  APSBusinessGroupResponse,
  APSBusinessGroupUpdate,
  APSExternalReference,
  ListAPSBusinessGroupsExternalSystemResponse,
  APSBusinessGroupExternalResponseList,
} from '../../src/@solace-iot-team/apim-server-openapi-node';
import APSBusinessGroupsService from '../../server/api/services/apsOrganization/APSBusinessGroupsService';


const scriptName: string = path.basename(__filename);
TestLogger.logMessage(scriptName, ">>> starting ...");

const OrganizationId = "test_mixed_bu"
const DefaultBusinessGroupOwnerId = 'biz.group.owner@async-apim.test';
const InternalMasterGroupId = "internal-master";
const ExternalMasterGroupId = "external-master";

const ExternalReference_SystemId = "EXTERNAL_SYSTEM_ID";
const ExternalReference_MasterGroupId = "external-system-master-id";
const ExternalReference_Master: APSExternalReference = {
  externalId: ExternalReference_MasterGroupId,
  externalDisplayName: ExternalReference_MasterGroupId,
  externalSystemId: ExternalReference_SystemId,
  externalSystemDisplayName: ExternalReference_SystemId
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
// const OrganizationIdTemplate: APSId = 'test_businessgroups_organization';
// const OrganizationDisplayNamePrefix: string = 'displayName for ';
// const NumberOfOrganizations: number = 3;

// const createOrganizationId = (i: number): APSId => {
//   const iStr: string = String(i).padStart(5, '0');
//   const orgId: APSId = `${OrganizationIdTemplate}_${iStr}`;
//   return orgId;
// }
// const createOrganizationDisplayName = (orgId: APSId): APSDisplayName => {
//   return `${OrganizationDisplayNamePrefix}${orgId}`;
// }

// const DefaultBusinessGroupOwnerId = 'biz.group.owner@async-apim.test';
// const PatchedBusinessGroupOwnerId = 'patch.biz.group.owner@async-apim.test';

// const BusinessGroupMasterName = 'master';
// const BusinessGroupIdTemplate: string = 'test_bizgroup';
// const BusinessGroupDisplayNamePrefix: string = 'displayName for ';
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
    // TestContext.newItId();      
    // try {
    //   const listOrgResponse: ListAPSOrganizationResponse = await ApsAdministrationService.listApsOrganizations();
    //   const orgList: APSOrganizationList = listOrgResponse.list;
    //   for(const org of orgList) {
    //     await ApsAdministrationService.deleteApsOrganization({
    //       organizationId: org.organizationId
    //     });
    //   }
    // } catch (e) {
    //   expect(e instanceof ApiError, `${TestLogger.createNotApiErrorMesssage(e.message)}`).to.be.true;
    //   expect(false, `${TestLogger.createTestFailMessage('failed')}`).to.be.true;
    // }
  });

  // ****************************************************************************************************************
  // * OpenApi API Tests *
  // ****************************************************************************************************************

  it(`${scriptName}: SETUP: should list all organizations and delete them and check no more business groups exist`, async () => {
    try {
      const listOrgResponse: ListAPSOrganizationResponse = await ApsAdministrationService.listApsOrganizations();
      const orgList: APSOrganizationList = listOrgResponse.list;
      const totalCount: number = listOrgResponse.meta.totalCount;
      for(const org of orgList) {
        await ApsAdministrationService.deleteApsOrganization({
          organizationId: org.organizationId
        });
      }
      // check DB directly
      const DBList: Array<any> = await APSBusinessGroupsService.getPersistenceService().allRawLessThanTargetSchemaVersion(APSBusinessGroupsService.getDBObjectSchemaVersion() + 1);
      expect(DBList.length, TestLogger.createTestFailMessage('DB List length does not equal 0')).to.equal(0);
    } catch (e) {
      expect(e instanceof ApiError, TestLogger.createNotApiErrorMesssage(e.message)).to.be.true;
      expect(false, TestLogger.createTestFailMessage('failed')).to.be.true;
    }
  });

  it(`${scriptName}: should create reference org with 1 internal master and 1 external master`, async () => {
    try {
      // create org
      const apsOrg: APSOrganizationCreate = {
        organizationId: OrganizationId,
        displayName: OrganizationId
      }
      const apsOrgCreated: APSOrganization = await ApsAdministrationService.createApsOrganization({
        requestBody: apsOrg
      });

      // create internal master group
      const createInternal: APSBusinessGroupCreate = {
          businessGroupId: InternalMasterGroupId,
          businessGroupDisplayName: InternalMasterGroupId,
          ownerId: DefaultBusinessGroupOwnerId
        }
      const createdInternalGroup: APSBusinessGroupResponse = await ApsBusinessGroupsService.createApsBusinessGroup({
        organizationId: OrganizationId,
        requestBody: createInternal
      });

      // create external master group
      const externalReference: APSExternalReference = ExternalReference_Master;
      const createExternal: APSBusinessGroupCreate = {
        businessGroupId: ExternalMasterGroupId,
        businessGroupDisplayName: ExternalMasterGroupId,
        ownerId: DefaultBusinessGroupOwnerId,
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
          businessGroupDisplayName: childId,
          businessGroupParentId: InternalMasterGroupId,
          ownerId: DefaultBusinessGroupOwnerId
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
          externalDisplayName: childId,
          externalSystemId: ExternalReference_Master.externalSystemId,
          externalSystemDisplayName: ExternalReference_Master.externalSystemDisplayName
        }
        const createExternal: APSBusinessGroupCreate = {
          businessGroupId: childId,
          businessGroupDisplayName: childId,
          businessGroupParentId: ExternalMasterGroupId,
          ownerId: DefaultBusinessGroupOwnerId,
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
      const listResponse: ListAPSBusinessGroupsExternalSystemResponse = await ApsBusinessGroupsService.listApsBusinessGroupsByExternalSystem({
        organizationId: OrganizationId,
        externalSystemId: ExternalReference_SystemId
      });
      const expectedNumberOfGroups = 1 + NumberOfChildrenGroups;
      const groupList: APSBusinessGroupExternalResponseList = listResponse.list;
      // verify they all have an external reference
      for(const group of groupList) {
        expect(group.externalReference, TestLogger.createTestFailMessage('totalCount does not equal expectedNumberOfGroupsPerOrg')).to.be.true;
      }
      const meta = listResponse.meta;
      const totalCount: number = meta.totalCount;
      expect(totalCount, TestLogger.createTestFailMessage('totalCount does not equal expectedNumberOfGroupsPerOrg')).to.equal(expectedNumberOfGroups);
    } catch (e) {
      expect(e instanceof ApiError, TestLogger.createNotApiErrorMesssage(e.message)).to.be.true;
      expect(false, TestLogger.createTestFailMessage('failed')).to.be.true;
    }
    expect(false, TestLogger.createTestFailMessage('continue here')).to.be.true;
  });


  xit(`${scriptName}: continue writing tests`, async () => {
    // create children with external for external masters
    // get master groups by externalSystem
    // get all the children groups from list of children
    // get master by externalReference
    // get child by externalReference
    expect(false, TestLogger.createTestFailMessage('continue here')).to.be.true;
  });

    // xit(`${scriptName}: should return unauthorized request`, async() => {
    //   // TODO
    // });

    // xit(`${scriptName}: should return forbidden request`, async() => {
    //   // TODO
    // });

});

