import 'mocha';
import { expect } from 'chai';
import request from 'supertest';
import Server from '../../server/index';
import path from 'path';
import _ from 'lodash';
import { TestContext, TestLogger } from '../lib/test.helpers';
import { 
  ApiError, 
  ApsAdministrationService, 
  APSError, 
  APSErrorIds, 
  APSListResponseMeta, 
  APSOrganizationRoles, 
  APSOrganizationRolesList, 
  APSOrganizationRolesResponse, 
  APSOrganizationRolesResponseList, 
  APSUserCreate, 
  APSUserReplace, 
  APSUserResponse, 
  APSUserResponseList, 
  ApsUsersService, 
  APSUserUpdate, 
  EAPSOrganizationAuthRole, 
  EAPSSortDirection,
  EAPSSystemAuthRole,
  ListApsUsersResponse
} from '../../src/@solace-iot-team/apim-server-openapi-node';
import { ApsUsersHelper } from '../lib/apsUsers.helper';
import APSOrganizationsService from '../../server/api/services/apsAdministration/APSOrganizationsService';


const scriptName: string = path.basename(__filename);
TestLogger.logMessage(scriptName, ">>> starting ...");

const ReferenceOrg_1 = 'org_1';
const ReferenceOrg_2 = 'org_2';
const ReferenceOrg_Updated = 'updated_org';
const ReferenceOrg_Replaced = 'replaced_org';
const numberOfUsers: number = 50;
const apsUserCreateTemplate: APSUserCreate = {
  isActivated: true,
  userId: 'userId',
  password: 'password',
  profile: {
    email: 'email@aps.test',
    first: 'first',
    last: 'last'
  },
  systemRoles: [EAPSSystemAuthRole.LOGIN_AS, EAPSSystemAuthRole.SYSTEM_ADMIN],
  memberOfOrganizations: [
    { 
      organizationId: ReferenceOrg_1,
      roles: [EAPSOrganizationAuthRole.ORGANIZATION_ADMIN]
    }
  ],
  memberOfOrganizationGroups: [],
}
const apsUserCreateTemplate2: APSUserCreate = {
  isActivated: true,
  userId: 'userId2',
  password: 'password2',
  profile: {
    email: 'email2@aps.test',
    first: 'first2',
    last: 'last2'
  },
  memberOfOrganizations: [
    { 
      organizationId: ReferenceOrg_2,
      roles: [EAPSOrganizationAuthRole.ORGANIZATION_ADMIN]
    }
  ],
  memberOfOrganizationGroups: [],
}

describe(`${scriptName}`, () => {

  const apiBase = `${TestContext.getApiBase()}/apsUsers`;

    beforeEach(() => {
      TestContext.newItId();
    });

    // after(`${scriptName}: AFTER: delete all users`, async() => {
    //   TestContext.newItId();
    //   try {
    //     const apsUserResponseList: APSUserResponseList = await ApsUsersHelper.deleteAllUsers()
    //   } catch (e) {
    //     expect(e instanceof ApiError, `${TestLogger.createNotApiErrorMesssage(e.message)}`).to.be.true;
    //     expect(false, `${TestLogger.createTestFailMessage('failed')}`).to.be.true;
    //   }
    // });
  
// ****************************************************************************************************************
// * OpenApi API Tests *
// ****************************************************************************************************************

    it(`${scriptName}: should list users with paging`, async () => {
      let apsUserList: APSUserResponseList = [];
      let receivedTotalCount: number = 0;
      let reportedTotalCount: number;
      try {
        const pageSize = 2;
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
          receivedTotalCount += resultListApsUsers.list.length;
          reportedTotalCount = resultListApsUsers.meta.totalCount;
        }
      } catch (e) {
        expect(e instanceof ApiError, `${TestLogger.createNotApiErrorMesssage(e.message)}`).to.be.true;
        let message = `ApsUsersService.deleteApsUser()`;
        expect(false, `${TestLogger.createTestFailMessage(message)}`).to.be.true;
      }
      expect(receivedTotalCount, 'number of objects received not the same as reported totalCount').equal(reportedTotalCount);
    });

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

    it(`${scriptName}: should create organizations for referencing`, async () => {
      try {
        await ApsAdministrationService.createApsOrganization({
          requestBody: {
            organizationId: ReferenceOrg_1,
            displayName: ReferenceOrg_1,
            appCredentialsExpiryDuration: APSOrganizationsService.get_DefaultAppCredentialsExpiryDuration(),
            maxNumApisPerApiProduct: APSOrganizationsService.get_DefaultMaxNumApis_Per_ApiProduct(),  
          }
        });
        await ApsAdministrationService.createApsOrganization({
          requestBody: {
            organizationId: ReferenceOrg_2,
            displayName: ReferenceOrg_2,
            appCredentialsExpiryDuration: APSOrganizationsService.get_DefaultAppCredentialsExpiryDuration(),
            maxNumApisPerApiProduct: APSOrganizationsService.get_DefaultMaxNumApis_Per_ApiProduct(),  
          }
        });
        await ApsAdministrationService.createApsOrganization({
          requestBody: {
            organizationId: ReferenceOrg_Updated,
            displayName: ReferenceOrg_Updated,
            appCredentialsExpiryDuration: APSOrganizationsService.get_DefaultAppCredentialsExpiryDuration(),
            maxNumApisPerApiProduct: APSOrganizationsService.get_DefaultMaxNumApis_Per_ApiProduct(),  
          }
        });
        await ApsAdministrationService.createApsOrganization({
          requestBody: {
            organizationId: ReferenceOrg_Replaced,
            displayName: ReferenceOrg_Replaced,
            appCredentialsExpiryDuration: APSOrganizationsService.get_DefaultAppCredentialsExpiryDuration(),
            maxNumApisPerApiProduct: APSOrganizationsService.get_DefaultMaxNumApis_Per_ApiProduct(),  
          }
        });
      } catch (e) {
        expect(e instanceof ApiError, `${TestLogger.createNotApiErrorMesssage(e.message)}`).to.be.true;
        expect(false, `${TestLogger.createTestFailMessage('failed')}`).to.be.true;
      }
    });

    it(`${scriptName}: should create a number of users from templates`, async () => {
      try {
        for (let i=0; i < numberOfUsers; i++) {
          const iStr: string = String(i).padStart(5, '0');
          const userId = `x-${iStr}_${apsUserCreateTemplate.userId}@aps.com`;
          const apsUserCreate: APSUserCreate = {
            ...apsUserCreateTemplate,
            isActivated: (i % 2 === 0),
            userId: userId,
            profile: {
              email: userId,
              first: apsUserCreateTemplate.profile.first,
              last: apsUserCreateTemplate.profile.last
            }
          }
          const apsUserResponse: APSUserResponse = await ApsUsersService.createApsUser({
            requestBody: apsUserCreate
          });
          const userId2 = `x-${iStr}_${apsUserCreateTemplate2.userId}@aps.com`;
          const apsUserCreate2: APSUserCreate = {
            ...apsUserCreateTemplate2,
            userId: userId2,
            isActivated: (i % 2 === 0),
            profile: {
              email: userId2,
              first: apsUserCreateTemplate.profile.first,
              last: apsUserCreateTemplate.profile.last
            }
          }
          const apsUserResponse2: APSUserResponse = await ApsUsersService.createApsUser({
            requestBody: apsUserCreate2
          });
        }  
      } catch (e) {
        expect(e instanceof ApiError, `${TestLogger.createNotApiErrorMesssage(e.message)}`).to.be.true;
        let message = `ApsUsersService.createApsUser() & ApsUsersService.listApsUsers()`;
        expect(false, TestLogger.createTestFailMessage(message)).to.be.true;
      }
    });

    it(`${scriptName}: should list users with paging`, async () => {
      let apsUserList: APSUserResponseList = [];
      let receivedTotalCount: number = 0;
      try {
        const pageSize = 2;
        let pageNumber = 1;
        let hasNextPage = true;
        while (hasNextPage) {
          const resultListApsUsers: APSListResponseMeta & { list: APSUserResponseList }  = await ApsUsersService.listApsUsers({
            pageSize: pageSize, 
            pageNumber: pageNumber
          });
          if(resultListApsUsers.list.length === 0 || resultListApsUsers.list.length < pageSize) hasNextPage = false;
          pageNumber++;
          apsUserList.push(...resultListApsUsers.list);
          receivedTotalCount += resultListApsUsers.list.length;
        }
      } catch (e) {
        expect(e instanceof ApiError, `${TestLogger.createNotApiErrorMesssage(e.message)}`).to.be.true;
        let message = `ApsUsersService.deleteApsUser()`;
        expect(false, TestLogger.createTestFailMessage(message)).to.be.true;
      }
      const message = `receivedTotalCount not  + ${2 * numberOfUsers}`;
      expect(receivedTotalCount, TestLogger.createTestFailMessage(message)).equal(2 * numberOfUsers);
    });

    it(`${scriptName}: should list users with sortInfo: profile.email`, async () => {
      const sortFieldName: string = 'profile.email';
      const sortDirection: EAPSSortDirection = EAPSSortDirection.ASC;
      try {
          const resultListApsUsers: APSListResponseMeta & { list: APSUserResponseList }  = await ApsUsersService.listApsUsers({
            sortFieldName: sortFieldName, 
            sortDirection: sortDirection
          });
      } catch (e) {
        expect(e instanceof ApiError, `${TestLogger.createNotApiErrorMesssage(e.message)}`).to.be.true;
        expect(false, TestLogger.createTestFailMessage('failed')).to.be.true;
      }
    });

    it(`${scriptName}: should list users with sortInfo: isActivated`, async () => {
      const sortFieldName: string = 'isActivated';
      const sortDirection: EAPSSortDirection = EAPSSortDirection.ASC;
      try {
          const resultListApsUsers: APSListResponseMeta & { list: APSUserResponseList }  = await ApsUsersService.listApsUsers({
            sortFieldName: sortFieldName, 
            sortDirection: sortDirection
          });
      } catch (e) {
        expect(e instanceof ApiError, `${TestLogger.createNotApiErrorMesssage(e.message)}`).to.be.true;
        expect(false, TestLogger.createTestFailMessage('failed')).to.be.true;
      }
    });

    it(`${scriptName}: should handle list users with invalid sortInfo`, async () => {
      const sortFieldName: string = 'rubbish';
      const sortDirection: EAPSSortDirection = EAPSSortDirection.ASC;
      try {
          const resultListApsUsers: APSListResponseMeta & { list: APSUserResponseList }  = await ApsUsersService.listApsUsers({
            sortFieldName: sortFieldName, 
            sortDirection: sortDirection
          });
      } catch (e) {
        expect(e instanceof ApiError, `${TestLogger.createNotApiErrorMesssage(e.message)}`).to.be.true;
        const apiError: ApiError = e;
        expect(apiError.status, TestLogger.createTestFailMessage('status not 400')).equal(400);
        const apsError: APSError = apiError.body;
        expect(apsError.errorId, TestLogger.createTestFailMessage('incorrect errorId')).equal(APSErrorIds.INVALID_SORT_FIELD_NAME);
        expect(apsError.meta.sortFieldName, TestLogger.createTestFailMessage('incorrect sortFieldName')).equal(sortFieldName);
        expect(apsError.meta.apsObjectName, TestLogger.createTestFailMessage('incorrect apsObjectName')).equal('APSUser');
        return;
      }
      expect(false, `${TestLogger.createTestFailMessage('should not get here')}`).to.be.true;
    });

    it(`${scriptName}: should return duplicate key error`, async() => {
      let response: APSUserResponse;
      try {
        response = await ApsUsersService.createApsUser({
          requestBody: apsUserCreateTemplate
        });
        response = await ApsUsersService.createApsUser({
          requestBody: apsUserCreateTemplate
        });
      } catch (e) {
        expect(e instanceof ApiError, TestLogger.createNotApiErrorMesssage(e.message)).to.be.true;
        const apiError: ApiError = e;
        expect(apiError.status, TestLogger.createTestFailMessage('status not 422')).equal(422);
        const apsError: APSError = apiError.body;
        expect(apsError.errorId, TestLogger.createTestFailMessage('incorrect errorId')).equal(APSErrorIds.DUPLICATE_KEY);
      }
    });

    it(`${scriptName}: should get 1 user`, async() => {
      let apsUserResponse: APSUserResponse;
      try {
        apsUserResponse = await ApsUsersService.getApsUser({
          userId: apsUserCreateTemplate.userId
        });
      } catch (e) {
        expect(e instanceof ApiError, TestLogger.createNotApiErrorMesssage(e.message)).to.be.true;
        let message = `ApsUsersService.getApsUser()`;
        expect(false, TestLogger.createTestFailMessage(message)).to.be.true;
      }
      // expect organizationDisplayName in all memberOfOrganizations to be equal to organizationId
      let recreatedApsUser: APSUserResponse = apsUserResponse;
      const recreatedMemberOfOrganizations: APSOrganizationRolesResponseList = [];
      for(const memberOfOrganization of apsUserResponse.memberOfOrganizations) {
        expect(memberOfOrganization.organizationId, TestLogger.createTestFailMessage('org displayname not equal org id')).to.deep.equal(memberOfOrganization.organizationDisplayName);
        // also re-create the original data structure 
        const apsOrganizationRolesResponse: APSOrganizationRolesResponse = {
          organizationId: memberOfOrganization.organizationId,
          organizationDisplayName: memberOfOrganization.organizationDisplayName,
          roles: memberOfOrganization.roles
        }
        recreatedMemberOfOrganizations.push(apsOrganizationRolesResponse);
      }
      recreatedApsUser.memberOfOrganizations = recreatedMemberOfOrganizations;
      const target: Partial<APSUserCreate> = JSON.parse(JSON.stringify(apsUserCreateTemplate));
      delete target.password;
      expect(recreatedApsUser, TestLogger.createTestFailMessage('response equals request')).to.deep.equal({
        ...target, 
        organizationSessionInfoList: [],
        memberOfOrganizations: recreatedMemberOfOrganizations
      });
    });

    it(`${scriptName}: should not find user`, async() => {
      let apsUser: APSUserResponse;
      try {
        apsUser = await ApsUsersService.getApsUser({
          userId: "unknown_user_id"
        });
      } catch (e) {
        expect(e instanceof ApiError, `${TestLogger.createNotApiErrorMesssage(e.message)}`).to.be.true;
        const apiError: ApiError = e;
        expect(apiError.status, TestLogger.createTestFailMessage('status code')).equal(404);
        const apsError: APSError = apiError.body;
        expect(apsError.errorId, TestLogger.createTestFailMessage('incorrect errorId')).equal(APSErrorIds.KEY_NOT_FOUND);
      }
    });

    it(`${scriptName}: should update user`, async() => {
      let updatedApsUser: APSUserResponse;
      const userId = apsUserCreateTemplate.userId;
      const updateRequest: APSUserUpdate = {
        isActivated: false,
        password: 'updated',        
        memberOfOrganizations: [ 
          {
            organizationId: ReferenceOrg_Updated,
            roles: [ EAPSOrganizationAuthRole.API_CONSUMER]
          }
        ],
        profile: {
          email: 'updated@aps.test'
        }
      }
      const updateCustomizer = (originalValue: any, updateValue: any): any => {
        // replace arrays
        if(_.isArray(originalValue)) return updateValue;
        else return undefined;
        // if(_.isArray(originalValue)) return originalValue.concat(updateValue);
        // else return undefined;
      }
      const targetApsUser = _.mergeWith(JSON.parse(JSON.stringify(apsUserCreateTemplate)), updateRequest, updateCustomizer);
      try {
        updatedApsUser = await ApsUsersService.updateApsUser({
          userId: userId, 
          requestBody: updateRequest
        });
      } catch (e) {
        expect(e instanceof ApiError, `${TestLogger.createNotApiErrorMesssage(e.message)}`).to.be.true;
        let message = `ApsUsersService.updateApsUser()`;
        expect(false, `${TestLogger.createTestFailMessage(message)}`).to.be.true;
      }
      // memberOfOrganizations has display name in response
      // password is not in response
      //  organizationSessionInfoList is in response
      delete targetApsUser.password;
      targetApsUser.organizationSessionInfoList = [];
      // organizationDisplayName is same as the id
      const newMemberOfOrganizations = targetApsUser.memberOfOrganizations.map( (x) => {
        return {
          organizationDisplayName: x.organizationId,
          organizationId: x.organizationId,
          roles: x.roles
        }
      });
      targetApsUser.memberOfOrganizations = newMemberOfOrganizations;
      // console.log(`targetApsUser = ${JSON.stringify(targetApsUser, null, 2)}`);
      expect(updatedApsUser, 'user not updated correctly').to.deep.equal(targetApsUser);
    });

    it(`${scriptName}: should handle update user without any data`, async() => {
      let updatedApsUser: APSUserResponse;
      let existingApsUser: APSUserResponse;
      const userId = apsUserCreateTemplate.userId;
      try {
        existingApsUser = await ApsUsersService.getApsUser({
          userId: userId
        });
        updatedApsUser = await ApsUsersService.updateApsUser({
          userId: userId, 
          requestBody: {}
        });
      } catch (e) {
        expect(e instanceof ApiError, `${TestLogger.createNotApiErrorMesssage(e.message)}`).to.be.true;
        let message = `ApsUsersService.updateApsUser()`;
        expect(false, `${TestLogger.createTestFailMessage(message)}`).to.be.true;
      }
      // delete all the organizationDisplayNames
      let recreatedExistingApsUser: APSUserResponse = existingApsUser;
      if(existingApsUser.memberOfOrganizations !== undefined) {
        const newMemberOfOrganizations: APSOrganizationRolesResponseList = [];
        for(const memberOfOrganization of recreatedExistingApsUser.memberOfOrganizations) {
          const newMemberOfOrganization: APSOrganizationRolesResponse = {
            organizationId: memberOfOrganization.organizationId,
            organizationDisplayName: memberOfOrganization.organizationDisplayName,
            roles: memberOfOrganization.roles
          }
          newMemberOfOrganizations.push(newMemberOfOrganization);
        }
        recreatedExistingApsUser.memberOfOrganizations = newMemberOfOrganizations;
      }
      expect(updatedApsUser, 'updated user different from existing user').to.deep.equal(recreatedExistingApsUser);
    });

    it(`${scriptName}: should handle update user not found`, async() => {
      const userId = 'unknown-user-id';
      try {
        await ApsUsersService.updateApsUser({
          userId: userId, 
          requestBody: {}
        });
      } catch (e) {
        expect(e instanceof ApiError, `${TestLogger.createNotApiErrorMesssage(e.message)}`).to.be.true;
        const apiError: ApiError = e;
        expect(apiError.status, TestLogger.createTestFailMessage('status code')).equal(404);
        const apsError: APSError = apiError.body;
        expect(apsError.errorId, TestLogger.createTestFailMessage('incorrect errorId')).equal(APSErrorIds.KEY_NOT_FOUND);
      }
    });

    // it(`${scriptName}: should replace user`, async() => {
    //   let replacedApsUser: APSUserResponse;
    //   const userId = apsUserCreateTemplate.userId;
    //   const replaceRequest: APSUserReplace = {
    //     isActivated: true,
    //     password: 'replaced',
    //     memberOfOrganizations: [ 
    //       {
    //         organizationId: ReferenceOrg_Replaced,
    //         roles: [EAPSOrganizationAuthRole.API_TEAM]
    //       }
    //     ],
    //     profile: {
    //       email: 'replaced@aps.test',
    //       first: 'replaced',
    //       last: 'replaced'
    //     }
    //   }
    //   const targetApsUser: APSUserResponse = {
    //     ...replaceRequest,
    //     userId: userId
    //   }
    //   try {
    //     replacedApsUser = await ApsUsersService.replaceApsUser({
    //       userId: userId, 
    //       requestBody: replaceRequest
    //     });
    //   } catch (e) {
    //     expect(e instanceof ApiError, TestLogger.createNotApiErrorMesssage(e.message)).to.be.true;
    //     let message = `ApsUsersService.updateApsUser()`;
    //     expect(false, TestLogger.createTestFailMessage(message)).to.be.true;
    //   }
    //   expect(replacedApsUser, TestLogger.createTestFailMessage('user not replaced correctly')).to.deep.equal(targetApsUser);
    // });

    it(`${scriptName}: should not allow empty userId`, async() => {
      const toCreate: APSUserCreate = {
        ...apsUserCreateTemplate,
        userId: ''
      }
      try {
        await ApsUsersService.createApsUser({
          requestBody: toCreate
        });
      } catch (e) {
        expect(e instanceof ApiError, `${TestLogger.createNotApiErrorMesssage(e.message)}`).to.be.true;
        const apiError: ApiError = e;
        expect(apiError.status, `${TestLogger.createTestFailMessage('fail')}`).equal(400);
        const apsError: APSError = apiError.body;
        expect(apsError.errorId, `${TestLogger.createTestFailMessage('fail')}`).equal(APSErrorIds.OPEN_API_REQUEST_VALIDATION);
        expect(JSON.stringify(apsError), `${TestLogger.createTestFailMessage('fail')}`).contains('body.userId');
        return;
      }
      expect(false, TestLogger.createTestFailMessage('should not get here')).to.be.true;
    });

    it(`${scriptName}: should not allow whitespace in userId`, async() => {
      const toCreate: APSUserCreate = {
        ...apsUserCreateTemplate,
        userId: ' sdssdsd '
      }
      try {
        await ApsUsersService.createApsUser({
          requestBody: toCreate
        });
      } catch (e) {
        expect(e instanceof ApiError, `${TestLogger.createNotApiErrorMesssage(e.message)}`).to.be.true;
        const apiError: ApiError = e;
        expect(apiError.status, TestLogger.createTestFailMessage('fail')).equal(400);
        const apsError: APSError = apiError.body;
        expect(apsError.errorId, TestLogger.createTestFailMessage('fail')).equal(APSErrorIds.OPEN_API_REQUEST_VALIDATION);
        expect(JSON.stringify(apsError), TestLogger.createTestFailMessage('fail')).contains('body.userId');
        return;
      }
      expect(false, `${TestLogger.createTestFailMessage('should not get here')}`).to.be.true;
    });

    it(`${scriptName}: should validate email pattern`, async() => {
      let replacedApsUser: APSUserResponse;
      const userId = apsUserCreateTemplate.userId;
      const replaceRequest: APSUserReplace = {
        isActivated: true,
        password: 'replaced',
        memberOfOrganizations: [ 
          {
            organizationId: 'replaced',
            roles: [EAPSOrganizationAuthRole.API_TEAM]
          }
        ],
        profile: {
          email: 'not-an-email',
          first: 'replaced',
          last: 'replaced'
        }
      }
      try {
        replacedApsUser = await ApsUsersService.replaceApsUser({
          userId: userId, 
          requestBody: replaceRequest
        });
      } catch (e) {
        expect(e instanceof ApiError, `${TestLogger.createNotApiErrorMesssage(e.message)}`).to.be.true;
        const apiError: ApiError = e;
        expect(apiError.status, TestLogger.createTestFailMessage('status code')).equal(400);
        const apsError: APSError = apiError.body;
        expect(apsError.errorId, TestLogger.createTestFailMessage('incorrect errorId')).equal(APSErrorIds.OPEN_API_REQUEST_VALIDATION);
        expect(JSON.stringify(apsError), TestLogger.createTestFailMessage('does not contain')).contains('body.profile.email');
        return;
      }
      expect(false, TestLogger.createTestFailMessage('should not get here')).to.be.true;
    });

    // ****************************************************************************************************************
    // * Open API Tests: searchPhrase *
    // ****************************************************************************************************************

    const apsUserSearchTemplate: APSUserCreate = {
      isActivated: true,
      userId: '@aps.test',
      password: 'password',
      profile: {
        email: '@aps.test',
        first: 'first',
        last: 'last'
      },
      systemRoles: [ EAPSSystemAuthRole.LOGIN_AS, EAPSSystemAuthRole.SYSTEM_ADMIN ],
      memberOfOrganizations: [ 
        {
          organizationId: ReferenceOrg_2,
          roles: [ EAPSOrganizationAuthRole.LOGIN_AS]
         }
      ]
    }
    
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
      expect(finalMeta.meta.totalCount, `${TestLogger.createTestFailMessage('totalCount not zero')}`).equal(0);
    });

    it(`${scriptName}: should create a number of users from search template`, async () => {
      try {
        for (let i=0; i < numberOfUsers; i++) {
          const iStr: string = String(i).padStart(5, '0');
          const first = `${iStr}-first`;
          const email = `${first}.${apsUserSearchTemplate.profile.last}@aps.com`;
          const userId = email;
          const apsUserCreate: APSUserCreate = {
            ...apsUserSearchTemplate,
            isActivated: (i % 2 === 0),
            userId: userId,
            profile: {
              email: email,
              first: first,
              last: 'last1'
            }
          }
          const apsUserResponse: APSUserResponse = await ApsUsersService.createApsUser({
            requestBody: apsUserCreate
          });
          const apsUserCreate2: APSUserCreate = {
            ...apsUserCreate,
            userId: `${apsUserCreate.userId}-2`,
            profile: {
              ...apsUserCreate.profile,
              last: 'last2'
            }
          }
          const apsUserResponse2: APSUserResponse = await ApsUsersService.createApsUser({
            requestBody: apsUserCreate2
          });
        }  
      } catch (e) {
        expect(e instanceof ApiError, `${TestLogger.createNotApiErrorMesssage(e.message)}`).to.be.true;
        expect(false, `${TestLogger.createTestFailMessage('failed')}`).to.be.true;
      }
    });

    it(`${scriptName}: should list users with paging & searchWordList=last1, last2`, async () => {
      let apsUserList: APSUserResponseList = [];
      let receivedTotalCount: number = 0;
      try {
        receivedTotalCount = 0;
        const pageSize = 2;
        let pageNumber = 1;
        let hasNextPage = true;
        while (hasNextPage) {
          const resultListApsUsers: APSListResponseMeta & { list: APSUserResponseList }  = await ApsUsersService.listApsUsers({
            pageSize: pageSize, 
            pageNumber: pageNumber, 
            searchWordList: 'last1'
          });
          if(resultListApsUsers.list.length === 0 || resultListApsUsers.list.length < pageSize) hasNextPage = false;
          pageNumber++;
          apsUserList.push(...resultListApsUsers.list);
          receivedTotalCount += resultListApsUsers.list.length;
        }
      } catch (e) {
        expect(e instanceof ApiError, `${TestLogger.createNotApiErrorMesssage(e.message)}`).to.be.true;
        expect(false, `${TestLogger.createTestFailMessage('failed')}`).to.be.true;
      }
      // 50 last-1 & 50 last-2
      expect(receivedTotalCount, `${TestLogger.createTestFailMessage(`receivedTotalCount not ${numberOfUsers}`)}`).equal(numberOfUsers);
      try {
        receivedTotalCount = 0;
        const pageSize = 2;
        let pageNumber = 1;
        let hasNextPage = true;
        while (hasNextPage) {
          const resultListApsUsers: APSListResponseMeta & { list: APSUserResponseList }  = await ApsUsersService.listApsUsers({
            pageSize: pageSize, 
            pageNumber: pageNumber, 
            searchWordList: 'last2'
          });
          if(resultListApsUsers.list.length === 0 || resultListApsUsers.list.length < pageSize) hasNextPage = false;
          pageNumber++;
          apsUserList.push(...resultListApsUsers.list);
          receivedTotalCount += resultListApsUsers.list.length;
        }
      } catch (e) {
        expect(e instanceof ApiError, `${TestLogger.createNotApiErrorMesssage(e.message)}`).to.be.true;
        expect(false, `${TestLogger.createTestFailMessage('failed')}`).to.be.true;
      }
      // 50 last-1 & 50 last-2
      expect(receivedTotalCount, `${TestLogger.createTestFailMessage(`receivedTotalCount not ${numberOfUsers}`)}`).equal(numberOfUsers);
    });


    it(`${scriptName}: should return invalid reference error for unknown org when creating user`, async () => {
      const NonExistentOrgName = 'org-does-not-exist';
      try {
        const apsUserCreate: APSUserCreate = {
          ...apsUserCreateTemplate,
          // password: 'password',
          memberOfOrganizations: [
            {
              organizationId: NonExistentOrgName,
              roles: [EAPSOrganizationAuthRole.API_CONSUMER]
            }
          ]
        }
        await ApsUsersService.createApsUser({
          requestBody: apsUserCreate
        });
      } catch (e) {
        expect(e instanceof ApiError, TestLogger.createNotApiErrorMesssage(e.message)).to.be.true;
        const apiError: ApiError = e;
        expect(apiError.status, TestLogger.createTestFailMessage('status code')).equal(422);
        const apsError: APSError = apiError.body;
        expect(apsError.errorId, TestLogger.createTestFailMessage('incorrect errorId')).equal(APSErrorIds.INVALID_OBJECT_REFERENCES);
        expect(apsError.meta, TestLogger.createTestFailMessage('property does not exist')).to.have.property('invalidReferenceList');
        expect(apsError.meta.invalidReferenceList, TestLogger.createTestFailMessage('not an array of correct length')).to.be.an('array').of.length(1);
        expect(JSON.stringify(apsError.meta.invalidReferenceList), TestLogger.createTestFailMessage('does not contain')).contains('referenceId');
        expect(JSON.stringify(apsError.meta.invalidReferenceList), TestLogger.createTestFailMessage('does not contain')).contains('referenceType');
        expect(JSON.stringify(apsError.meta.invalidReferenceList), TestLogger.createTestFailMessage('does not contain')).contains(NonExistentOrgName);
        expect(JSON.stringify(apsError.meta.invalidReferenceList), TestLogger.createTestFailMessage('does not contain')).contains('APSOrganization');
        return;
      }
      expect(false, TestLogger.createTestFailMessage('should never get here')).to.be.true;
    });



// ****************************************************************************************************************
// * Raw API Tests *
// ****************************************************************************************************************

    it(`${scriptName}: should return method not allowed with headers`, async() => {
      const res: request.Response = await request(Server)
        .delete(apiBase);
      TestContext.setFromSuperTestRequestResponse(res);
      expect(res.status, TestLogger.createTestFailMessage('status code')).equal(405);
      expect(res.header, TestLogger.createTestFailMessage('header "allow"')).to.be.an('object').that.has.property('allow').contains('GET, POST'); 
      expect(res.body, TestLogger.createTestFailMessage('errorId')).to.be.an('object').that.has.property('errorId').equal(APSErrorIds.OPEN_API_REQUEST_VALIDATION);
      expect(res.body, TestLogger.createTestFailMessage('meta')).to.have.property('meta');
      expect(res.body.meta, TestLogger.createTestFailMessage('errors')).to.be.an('object').that.has.property('errors').to.be.an('array').of.length(1);
      expect(res.body.meta, TestLogger.createTestFailMessage('headers')).to.be.an('object').that.has.property('headers').to.be.an('object');
    });

    xit(`${scriptName}: create user should return openapi validation error`, async() => {
      const toCreate = {
        isActivated: false,
        userId: 'requestValidationError',
        password: 'p',
        profile: {
          email: 'email'
        },
        roles: []
      }
      const res = await request(Server)
        .post(apiBase)
        .send(toCreate);
      
      TestContext.setFromSuperTestRequestResponse(res);
      // TestLogger.logMessageWithId(`res = ${JSON.stringify(res, null, 2)}\nbody-json = ${JSON.stringify(JSON.parse(res.text), null, 2)}`);

      expect(res.status, TestLogger.createTestFailMessage('status code')).equal(400);
      expect(res.body).to.be.an('object').that.has.property('errorId').equal('openApiValidation');
      expect(res.body).to.have.property('meta').to.be.an('array').of.length(2);
      expect(JSON.stringify(res.body.meta)).contains('first');
      expect(JSON.stringify(res.body.meta)).contains('last');
    });

    xit(`${scriptName}: should return forbidden`, async() => {
      // TODO: here or in openapi?
    });

});

