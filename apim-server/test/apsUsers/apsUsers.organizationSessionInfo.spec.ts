import 'mocha';
import { expect } from 'chai';
import request from 'supertest';
import Server from '../../server/index';
import path from 'path';
import _ from 'lodash';
import { TestContext, testHelperSleep, TestLogger } from '../lib/test.helpers';
import { 
  ApiError, 
  ApsAdministrationService, 
  APSDisplayName, 
  APSId, 
  APSListResponseMeta, 
  APSOrganization, 
  APSOrganizationCreate, 
  APSOrganizationList, 
  APSUserCreate, 
  APSUserId, 
  APSUserResponse, 
  APSUserResponseList, 
  ApsUsersService, 
  APSUserUpdate, 
  ListAPSOrganizationResponse,
  ListApsUsersResponse
} from '../../src/@solace-iot-team/apim-server-openapi-node';
import { APSOrganizationSessionInfo } from '../../src/@solace-iot-team/apim-server-openapi-node/models/APSOrganizationSessionInfo';
import APSOrganizationsService from '../../server/api/services/apsAdministration/APSOrganizationsService';


const scriptName: string = path.basename(__filename);
TestLogger.logMessage(scriptName, ">>> starting ...");

const NumberOfOrganizations: number = 5;
const OrganizationIdTemplate: APSId = 'test_user_organization';
const OrganizationDisplayNamePrefix: string = 'displayName for ';
const NumberOfUsersPerOrganization: number = 2;
const apsUserCreateTemplate: APSUserCreate = {
  isActivated: true,
  userId: 'userId',
  password: 'password',
  profile: {
    email: 'email@aps.com',
    first: 'first',
    last: 'last'
  },
}

const createOrganizationId = (i: number): APSId => {
  const iStr: string = String(i).padStart(5, '0');
  const orgId: APSId = `${OrganizationIdTemplate}_${iStr}`;
  return orgId;
}
const createOrganizationDisplayName = (orgId: APSId): APSDisplayName => {
  return `${OrganizationDisplayNamePrefix}${orgId}`;
}
const createUserId = (orgId: string, i: number): APSUserId => {
  const iStr: string = String(i).padStart(5, '0');
  return `user.${iStr}@${orgId}.test`;
}

describe(`${scriptName}`, () => {

    beforeEach(() => {
      TestContext.newItId();
    });

    // after(async() => {
    //   TestContext.newItId();
    //   // delete all users
    //   let apsUserList: Array<APSUser> = [];
    //   try {
    //     const pageSize = 100;
    //     let pageNumber = 1;
    //     let hasNextPage = true;
    //     while (hasNextPage) {
    //       const resultListApsUsers: ListApsUsersResponse  = await ApsUsersService.listApsUsers({
    //         pageSize: pageSize, 
    //         pageNumber: pageNumber
    //       });
    //       if(resultListApsUsers.list.length === 0 || resultListApsUsers.list.length < pageSize) hasNextPage = false;
    //       pageNumber++;
    //       apsUserList.push(...resultListApsUsers.list);
    //     }
    //     for (const apsUser of apsUserList) {
    //       await ApsUsersService.deleteApsUser({
    //         userId: apsUser.userId
    //       });
    //     }
    //   } catch (e) {
    //     expect(e instanceof ApiError, `${TestLogger.createNotApiErrorMesssage(e.message)}`).to.be.true;
    //     expect(false, `${TestLogger.createTestFailMessage('failed')}`).to.be.true;
    //   }
    //   // delete all orgs
    //   try {
    //     const listOrgResponse: ListAPSOrganizationResponse = await ApsAdministrationService.listApsOrganizations();
    //     const orgList: APSOrganizationList = listOrgResponse.list;
    //     const totalCount: number = listOrgResponse.meta.totalCount;
    //     for(const org of orgList) {
    //       await ApsAdministrationService.deleteApsOrganization({
    //         organizationId: org.organizationId
    //       });
    //     }
    //   } catch (e) {
    //     expect(e instanceof ApiError, `${TestLogger.createNotApiErrorMesssage(e.message)}`).to.be.true;
    //     expect(false, `${TestLogger.createTestFailMessage('failed')}`).to.be.true;
    //   }
    // });

// ****************************************************************************************************************
// * OpenApi API Tests *
// ****************************************************************************************************************

    it(`${scriptName}: should delete all users`, async () => {
      let finalApsUserList: APSUserResponseList;
      let finalMeta: APSListResponseMeta;
      try {
        let apsUserList: APSUserResponseList = [];
        const pageSize = 100;
        let pageNumber = 1;
        let hasNextPage = true;
        while (hasNextPage) {
          const resultListApsUsers: ListApsUsersResponse  = await ApsUsersService.listApsUsers({
            pageSize: pageSize, 
            pageNumber: pageNumber
          });
          if(resultListApsUsers.list.length === 0 || resultListApsUsers.list.length < pageSize) hasNextPage = false;
          pageNumber++;
          apsUserList.push(...resultListApsUsers.list);
        }
        for (const apsUser of apsUserList) {
          await ApsUsersService.deleteApsUser({
            userId: apsUser.userId
          });
        }
        const { list, meta } = await ApsUsersService.listApsUsers({});
        finalApsUserList = list;
        finalMeta = { meta: meta };
      } catch (e) {
        expect(e instanceof ApiError, `${TestLogger.createNotApiErrorMesssage(e.message)}`).to.be.true;
        expect(false, `${TestLogger.createTestFailMessage('error')}`).to.be.true;
      }
      expect(finalApsUserList, `${TestLogger.createTestFailMessage('type of array')}`).to.be.an('array');
      expect(finalApsUserList, `${TestLogger.createTestFailMessage('empty array')}`).to.be.empty;
      expect(finalMeta.meta.totalCount, TestLogger.createTestFailMessage('totalCount not zero')).equal(0);
    });

    it(`${scriptName}: should delete all orgs`, async () => {
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
        // create the one reference org
        const apsOrg: APSOrganizationCreate = {
          organizationId: OrganizationIdTemplate,
          displayName: createOrganizationDisplayName(OrganizationIdTemplate),
          appCredentialsExpiryDuration: APSOrganizationsService.get_DefaultAppCredentialsExpiryDuration(),
          maxNumApisPerApiProduct: APSOrganizationsService.get_DefaultMaxNumApis_Per_ApiProduct(),
        }
        await ApsAdministrationService.createApsOrganization({
          requestBody: apsOrg
        });
        //  create the list of orgs
        for(let i=0; i < NumberOfOrganizations; i++) {
          const orgId: APSId = createOrganizationId(i);
          const orgDisplayName: APSDisplayName = createOrganizationDisplayName(orgId);
          const apsOrg: APSOrganizationCreate = {
            organizationId: orgId,
            displayName: orgDisplayName,
            appCredentialsExpiryDuration: APSOrganizationsService.get_DefaultAppCredentialsExpiryDuration(),
            maxNumApisPerApiProduct: APSOrganizationsService.get_DefaultMaxNumApis_Per_ApiProduct(),  
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
  
    it(`${scriptName}: should create users per org`, async () => {
      try {
        for(let orgI=0; orgI<NumberOfOrganizations; orgI++) {
          const orgId: APSId = createOrganizationId(orgI);
          for(let userI=0; userI < NumberOfUsersPerOrganization; userI++) {
            const userId = createUserId(orgId, userI);
            const apsUserCreate: APSUserCreate = {
              ...apsUserCreateTemplate,
              isActivated: true,
              userId: userId,
              profile: {
                email: userId,
                first: apsUserCreateTemplate.profile.first,
                last: apsUserCreateTemplate.profile.last
              },
            }
            const apsUserResponse: APSUserResponse = await ApsUsersService.createApsUser({
              requestBody: apsUserCreate
            });
          }
        }
      } catch (e) {
        expect(e instanceof ApiError, TestLogger.createNotApiErrorMesssage(e.message)).to.be.true;
        expect(false, TestLogger.createTestFailMessage('failed')).to.be.true;
      }
    });

    it(`${scriptName}: should update last session info for all users per org`, async () => {
      try {
        for(let orgI=0; orgI<NumberOfOrganizations; orgI++) {
          const orgId: APSId = createOrganizationId(orgI);
          for(let userI=0; userI < NumberOfUsersPerOrganization; userI++) {
            const userId = createUserId(orgId, userI);
            const organizationSessionInfo: APSOrganizationSessionInfo = {
                organizationId: orgId,
                lastSessionInfo: {
                  businessGroupId: orgId
                }
            };
            const apsUserUpdate: APSUserUpdate = {
              organizationSessionInfoList: [ organizationSessionInfo]
            }
            const apsUser: APSUserResponse = await ApsUsersService.updateApsUser({
              userId: userId,
              requestBody: apsUserUpdate
            });
            // verify the update last session info is correct
            expect(apsUser.organizationSessionInfoList, TestLogger.createTestFailMessage('failed')).to.deep.include(organizationSessionInfo);
          }
        }
      } catch (e) {
        expect(e instanceof ApiError, TestLogger.createNotApiErrorMesssage(e.message)).to.be.true;
        expect(false, TestLogger.createTestFailMessage('failed')).to.be.true;
      }
    });

    it(`${scriptName}: should delete all orgs`, async () => {
      try {
        for(let orgI=0; orgI<NumberOfOrganizations; orgI++) {
          const orgId: APSId = createOrganizationId(orgI);
          await ApsAdministrationService.deleteApsOrganization({
            organizationId: orgId
          });
        }
      } catch (e) {
        expect(e instanceof ApiError, TestLogger.createNotApiErrorMesssage(e.message)).to.be.true;
        expect(false, TestLogger.createTestFailMessage('failed')).to.be.true;
      }
    });

    it(`${scriptName}: do something else for background jobs to run`, async () => {
      await testHelperSleep(1000);
    });


    it(`${scriptName}: should list all users and check no user has last session info for this org`, async () => {
      try {
        const { list, meta } = await ApsUsersService.listApsUsers({
          pageSize: 100,
        });
        for (const apsUser of list) {
          expect(apsUser.organizationSessionInfoList.length, TestLogger.createTestFailMessage('user still has organization session info')).equal(0);
        }
      } catch (e) {
        expect(e instanceof ApiError, TestLogger.createNotApiErrorMesssage(e.message)).to.be.true;
        expect(false, TestLogger.createTestFailMessage('error')).to.be.true;
      }
    });

});

