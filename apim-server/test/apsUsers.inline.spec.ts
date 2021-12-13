import 'mocha';
import { expect } from 'chai';
import request from 'supertest';
import Server from '../server/index';
import path from 'path';
import _ from 'lodash';
import { TestContext, TestLogger } from './lib/test.helpers';
import { 
  ApiError, 
  APSError, 
  APSErrorIds, 
  APSListResponseMeta, 
  APSUser, 
  APSUserReplace, 
  ApsUsersService, 
  APSUserUpdate, 
  EAPSAuthRole, 
  EAPSSortDirection,
  ListApsUsersResponse
} from '../src/@solace-iot-team/apim-server-openapi-node';


const scriptName: string = path.basename(__filename);
TestLogger.logMessage(scriptName, ">>> starting ...");

const numberOfUsers: number = 50;
const apsUserTemplate: APSUser = {
  isActivated: true,
  userId: 'userId',
  password: 'password',
  profile: {
    email: 'email@aps.com',
    first: 'first',
    last: 'last'
  },
  roles: [ EAPSAuthRole.LOGIN_AS, EAPSAuthRole.SYSTEM_ADMIN ],
  memberOfOrganizations: [ 'org' ]
}
const apsUserTemplate2: APSUser = {
  isActivated: true,
  userId: 'userId2',
  password: 'password2',
  profile: {
    email: 'email2@aps.com',
    first: 'first2',
    last: 'last2'
  },
  roles: [ EAPSAuthRole.LOGIN_AS, EAPSAuthRole.SYSTEM_ADMIN ],
  memberOfOrganizations: [ 'org2' ]
}

describe(`${scriptName}`, () => {
  context(`${scriptName}`, () => {

    // const apiStartupBase = `${TestContext.getApiBase()}/apsUsers`; 
    const apiBase = `${TestContext.getApiBase()}/apsUsers`;

    beforeEach(() => {
      TestContext.newItId();
    });

    after(async() => {
      let apsUserList: Array<APSUser> = [];
      try {
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
      } catch (e) {
        expect(e instanceof ApiError, `${TestLogger.createNotApiErrorMesssage(e.message)}`).to.be.true;
        expect(false, `${TestLogger.createTestFailMessage('failed')}`).to.be.true;
      }
    });

    // it(`${scriptName}: should start server`, async() => {
    //   const res = await request(Server).get(apiStartupBase);
    //   TestLogger.logMessageWithId(`res = ${JSON.stringify(res, null, 2)}\nbody-json = ${JSON.stringify(JSON.parse(res.text), null, 2)}`);
    //   expect(res.status, TestLogger.createTestFailMessage('status code')).equal(200);
    // });

// ****************************************************************************************************************
// * OpenApi API Tests *
// ****************************************************************************************************************

    it(`${scriptName}: should list users with paging`, async () => {
      let apsUserList: Array<APSUser> = [];
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
      let finalApsUserList: Array<APSUser>;
      let finalMeta: APSListResponseMeta;
      try {
        let apsUserList: Array<APSUser> = [];
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

    it(`${scriptName}: should create a number of users from templates`, async () => {
      try {
        for (let i=0; i < numberOfUsers; i++) {
          const iStr: string = String(i).padStart(5, '0');
          const userId = `x-${iStr}_${apsUserTemplate.userId}@aps.com`;
          const apsUser: APSUser = {
            ...apsUserTemplate,
            isActivated: (i % 2 === 0),
            userId: userId,
            profile: {
              email: userId,
              first: apsUserTemplate.profile.first,
              last: apsUserTemplate.profile.last
            }
          }
          const apsUserResponse: APSUser = await ApsUsersService.createApsUser({
            requestBody: apsUser
          });
          const userId2 = `x-${iStr}_${apsUserTemplate2.userId}@aps.com`;
          const apsUser2: APSUser = {
            ...apsUserTemplate2,
            userId: userId2,
            isActivated: (i % 2 === 0),
            profile: {
              email: userId2,
              first: apsUserTemplate.profile.first,
              last: apsUserTemplate.profile.last
            }
          }
          const apsUserResponse2: APSUser = await ApsUsersService.createApsUser({
            requestBody: apsUser2
          });
        }  
      } catch (e) {
        expect(e instanceof ApiError, `${TestLogger.createNotApiErrorMesssage(e.message)}`).to.be.true;
        let message = `ApsUsersService.createApsUser() & ApsUsersService.listApsUsers()`;
        expect(false, `${TestLogger.createTestFailMessage(message)}`).to.be.true;
      }
    });

    it(`${scriptName}: should list users with paging`, async () => {
      let apsUserList: Array<APSUser> = [];
      let receivedTotalCount: number = 0;
      try {
        const pageSize = 2;
        let pageNumber = 1;
        let hasNextPage = true;
        while (hasNextPage) {
          const resultListApsUsers: APSListResponseMeta & { list: Array<APSUser> }  = await ApsUsersService.listApsUsers({
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
        expect(false, `${TestLogger.createTestFailMessage(message)}`).to.be.true;
      }
      const message = `receivedTotalCount not  + ${2 * numberOfUsers}`;
      expect(receivedTotalCount, `${TestLogger.createTestFailMessage(message)}`).equal(2 * numberOfUsers);
    });

    it(`${scriptName}: should list users with sortInfo: profile.email`, async () => {
      const sortFieldName: string = 'profile.email';
      const sortDirection: EAPSSortDirection = EAPSSortDirection.ASC;
      try {
          const resultListApsUsers: APSListResponseMeta & { list: Array<APSUser> }  = await ApsUsersService.listApsUsers({
            sortFieldName: sortFieldName, 
            sortDirection: sortDirection
          });
      } catch (e) {
        expect(e instanceof ApiError, `${TestLogger.createNotApiErrorMesssage(e.message)}`).to.be.true;
        expect(false, `${TestLogger.createTestFailMessage('failed')}`).to.be.true;
      }
    });

    it(`${scriptName}: should list users with sortInfo: isActivated`, async () => {
      const sortFieldName: string = 'isActivated';
      const sortDirection: EAPSSortDirection = EAPSSortDirection.ASC;
      try {
          const resultListApsUsers: APSListResponseMeta & { list: Array<APSUser> }  = await ApsUsersService.listApsUsers({
            sortFieldName: sortFieldName, 
            sortDirection: sortDirection
          });
      } catch (e) {
        expect(e instanceof ApiError, `${TestLogger.createNotApiErrorMesssage(e.message)}`).to.be.true;
        expect(false, `${TestLogger.createTestFailMessage('failed')}`).to.be.true;
      }
    });

    it(`${scriptName}: should handle list users with invalid sortInfo`, async () => {
      const sortFieldName: string = 'rubbish';
      const sortDirection: EAPSSortDirection = EAPSSortDirection.ASC;
      try {
          const resultListApsUsers: APSListResponseMeta & { list: Array<APSUser> }  = await ApsUsersService.listApsUsers({
            sortFieldName: sortFieldName, 
            sortDirection: sortDirection
          });
      } catch (e) {
        expect(e instanceof ApiError, `${TestLogger.createNotApiErrorMesssage(e.message)}`).to.be.true;
        const apiError: ApiError = e;
        expect(apiError.status, 'expecting 400').equal(400);
        const apsError: APSError = apiError.body;
        expect(apsError.errorId, 'incorrect errorId').equal(APSErrorIds.INVALID_SORT_FIELD_NAME);
        expect(apsError.meta.sortFieldName, 'incorrect sortFieldName').equal(sortFieldName);
        expect(apsError.meta.apsObjectName, 'incorrect apsObjectName').equal('APSUser');
        return;
      }
      expect(false, `${TestLogger.createTestFailMessage('should not get here')}`).to.be.true;
    });

    it(`${scriptName}: should return duplicate key error`, async() => {
      let response: APSUser;
      try {
        response = await ApsUsersService.createApsUser({
          requestBody: apsUserTemplate
        });
        response = await ApsUsersService.createApsUser({
          requestBody: apsUserTemplate
        });
      } catch (e) {
        expect(e instanceof ApiError, `${TestLogger.createNotApiErrorMesssage(e.message)}`).to.be.true;
        const apiError: ApiError = e;
        expect(apiError.status, 'expecting 422').equal(422);
        const apsError: APSError = apiError.body;
        expect(apsError.errorId, 'incorrect errorId').equal(APSErrorIds.DUPLICATE_KEY);
      }
    });

    it(`${scriptName}: should get 1 user`, async() => {
      let apsUser: APSUser;
      try {
        apsUser = await ApsUsersService.getApsUser({
          userId: apsUserTemplate.userId
        });
      } catch (e) {
        expect(e instanceof ApiError, `${TestLogger.createNotApiErrorMesssage(e.message)}`).to.be.true;
        let message = `ApsUsersService.getApsUser()`;
        expect(false, `${TestLogger.createTestFailMessage(message)}`).to.be.true;
      }
      expect(apsUser, `${TestLogger.createTestFailMessage('response equals request')}`).to.deep.equal(apsUserTemplate);
    });

    it(`${scriptName}: should not find user`, async() => {
      let apsUser: APSUser;
      try {
        apsUser = await ApsUsersService.getApsUser({
          userId: "unknown_user_id"
        });
      } catch (e) {
        expect(e instanceof ApiError, `${TestLogger.createNotApiErrorMesssage(e.message)}`).to.be.true;
        const apiError: ApiError = e;
        expect(apiError.status, 'status code').equal(404);
        const apsError: APSError = apiError.body;
        expect(apsError.errorId, 'incorrect errorId').equal(APSErrorIds.KEY_NOT_FOUND);
      }
    });

    it(`${scriptName}: should update user`, async() => {
      let updatedApsUser: APSUser;
      const userId = apsUserTemplate.userId;
      const updateRequest: APSUserUpdate = {
        isActivated: false,
        password: 'updated',
        memberOfOrganizations: [ 'updated' ],
        roles: [ EAPSAuthRole.API_CONSUMER ],
        profile: {
          email: 'updated@aps.com'
        }
      }
      const updateCustomizer = (originalValue: any, updateValue: any): any => {
        if(_.isArray(originalValue)) return originalValue.concat(updateValue);
        else return undefined;
      }
      const targetApsUser = _.mergeWith(apsUserTemplate, updateRequest, updateCustomizer);
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
      expect(updatedApsUser, 'user not updated correctly').to.deep.equal(targetApsUser);
    });

    it(`${scriptName}: should handle update user without any data`, async() => {
      let updatedApsUser: APSUser;
      let existingApsUser: APSUser;
      const userId = apsUserTemplate.userId;
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
      expect(updatedApsUser, 'updated user different from existing user').to.deep.equal(existingApsUser);
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
        expect(apiError.status, 'status code').equal(404);
        const apsError: APSError = apiError.body;
        expect(apsError.errorId, 'incorrect errorId').equal(APSErrorIds.KEY_NOT_FOUND);
      }
    });

    it(`${scriptName}: should replace user`, async() => {
      let replacedApsUser: APSUser;
      const userId = apsUserTemplate.userId;
      const replaceRequest: APSUserReplace = {
        isActivated: true,
        password: 'replaced',
        memberOfOrganizations: [ 'replaced' ],
        roles: [ EAPSAuthRole.API_TEAM ],
        profile: {
          email: 'replaced@aps.com',
          first: 'replaced',
          last: 'replaced'
        }
      }
      const targetApsUser: APSUser = {
        ...replaceRequest,
        userId: userId
      }
      try {
        replacedApsUser = await ApsUsersService.replaceApsUser({
          userId: userId, 
          requestBody: replaceRequest
        });
      } catch (e) {
        expect(e instanceof ApiError, `${TestLogger.createNotApiErrorMesssage(e.message)}`).to.be.true;
        let message = `ApsUsersService.updateApsUser()`;
        expect(false, `${TestLogger.createTestFailMessage(message)}`).to.be.true;
      }
      expect(replacedApsUser, 'user not replaced correctly').to.deep.equal(targetApsUser);
    });

    it(`${scriptName}: should not allow empty userId`, async() => {
      const toCreate: APSUser = {
        ...apsUserTemplate,
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
      expect(false, `${TestLogger.createTestFailMessage('should not get here')}`).to.be.true;
    });

    it(`${scriptName}: should not allow whitespace in userId`, async() => {
      const toCreate: APSUser = {
        ...apsUserTemplate,
        userId: ' sdssdsd '
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
      expect(false, `${TestLogger.createTestFailMessage('should not get here')}`).to.be.true;
    });

    it(`${scriptName}: should validate email pattern`, async() => {
      let replacedApsUser: APSUser;
      const userId = apsUserTemplate.userId;
      const replaceRequest: APSUserReplace = {
        isActivated: true,
        password: 'replaced',
        memberOfOrganizations: [ 'replaced' ],
        roles: [ EAPSAuthRole.API_TEAM ],
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
        expect(apiError.status, 'status code').equal(400);
        const apsError: APSError = apiError.body;
        expect(apsError.errorId, 'incorrect errorId').equal(APSErrorIds.OPEN_API_REQUEST_VALIDATION);
        expect(JSON.stringify(apsError), '').contains('body.profile.email');
        return;
      }
      expect(false, `${TestLogger.createTestFailMessage('should not get here')}`).to.be.true;
    });

    // ****************************************************************************************************************
    // * Open API Tests: searchPhrase *
    // ****************************************************************************************************************

    const apsUserSearchTemplate: APSUser = {
      isActivated: true,
      userId: '@aps.com',
      password: 'password',
      profile: {
        email: '@aps.com',
        first: 'first',
        last: 'last'
      },
      roles: [ EAPSAuthRole.LOGIN_AS, EAPSAuthRole.SYSTEM_ADMIN ],
      memberOfOrganizations: [ 'org2' ]
    }
    
    it(`${scriptName}: should delete all users`, async () => {
      let finalApsUserList: Array<APSUser>;
      let finalMeta: APSListResponseMeta;
      try {
        let apsUserList: Array<APSUser> = [];
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
          const apsUser: APSUser = {
            ...apsUserSearchTemplate,
            isActivated: (i % 2 === 0),
            userId: userId,
            profile: {
              email: email,
              first: first,
              last: 'last1'
            }
          }
          const apsUserResponse: APSUser = await ApsUsersService.createApsUser({
            requestBody: apsUser
          });
          const apsUser2: APSUser = {
            ...apsUser,
            userId: `${apsUser.userId}-2`,
            profile: {
              ...apsUser.profile,
              last: 'last2'
            }
          }
          const apsUserResponse2: APSUser = await ApsUsersService.createApsUser({
            requestBody: apsUser2
          });
        }  
      } catch (e) {
        expect(e instanceof ApiError, `${TestLogger.createNotApiErrorMesssage(e.message)}`).to.be.true;
        expect(false, `${TestLogger.createTestFailMessage('failed')}`).to.be.true;
      }
    });

    it(`${scriptName}: should list users with paging & searchWordList=last1, last2`, async () => {
      let apsUserList: Array<APSUser> = [];
      let receivedTotalCount: number = 0;
      try {
        receivedTotalCount = 0;
        const pageSize = 2;
        let pageNumber = 1;
        let hasNextPage = true;
        while (hasNextPage) {
          const resultListApsUsers: APSListResponseMeta & { list: Array<APSUser> }  = await ApsUsersService.listApsUsers({
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
          const resultListApsUsers: APSListResponseMeta & { list: Array<APSUser> }  = await ApsUsersService.listApsUsers({
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
});

