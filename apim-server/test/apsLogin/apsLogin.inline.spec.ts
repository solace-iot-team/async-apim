import 'mocha';
import { expect } from 'chai';
import path from 'path';
import { TestContext, TestLogger } from '../lib/test.helpers';
import { 
  ApiError, 
  APSError, 
  APSErrorIds, 
  APSListResponseMeta, 
  ApsLoginService, 
  APSUser, 
  APSUserLoginCredentials, 
  APSUserReplace, 
  ApsUsersService, 
  EAPSOrganizationAuthRole, 
  EAPSSystemAuthRole, 
  ListApsUsersResponse
} from '../../src/@solace-iot-team/apim-server-openapi-node';


const scriptName: string = path.basename(__filename);
TestLogger.logMessage(scriptName, ">>> starting ...");

const apsUserLoginTemplate: APSUser = {
  isActivated: true,
  userId: `${scriptName}-userId`,
  password: `${scriptName}-password`,
  profile: {
    email: `${scriptName}@aps.com`,
    first: `${scriptName}-first`,
    last: `${scriptName}-last`
  },
  systemRoles: [ EAPSSystemAuthRole.LOGIN_AS, EAPSSystemAuthRole.SYSTEM_ADMIN ],
  memberOfOrganizations: [ 
    {
      organizationId: `${scriptName}-org`,
      roles: [EAPSOrganizationAuthRole.ORGANIZATION_ADMIN]
    }
  ]
}

describe(`${scriptName}`, () => {
  context(`${scriptName}`, () => {

    beforeEach(() => {
      TestContext.newItId();
    });

    after(async() => {
      TestContext.newItId();
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

    // ****************************************************************************************************************
    // * OpenApi API Tests *
    // ****************************************************************************************************************
    
    it(`${scriptName}: should delete all users`, async () => {
      let finalApsUserList: Array<APSUser>;
      let finalMeta: APSListResponseMeta;
      try {
        let apsUserList: Array<APSUser> = [];
        const pageSize = 100;
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
        expect(false, `${TestLogger.createTestFailMessage('log:')}`).to.be.true;
      }
      expect(finalApsUserList, `${TestLogger.createTestFailMessage('type of array')}`).to.be.an('array');
      expect(finalApsUserList, `${TestLogger.createTestFailMessage('empty array')}`).to.be.empty;
      expect(finalMeta.meta.totalCount, `${TestLogger.createTestFailMessage('totalCount not zero')}`).equal(0);
    });

    it(`${scriptName}: should create login user`, async() => {
      try {
        const created = await ApsUsersService.createApsUser({
          requestBody: apsUserLoginTemplate
        });
        expect(created, 'user not created correctly').to.deep.equal(apsUserLoginTemplate);
      } catch (e) {
        expect(e instanceof ApiError, `${TestLogger.createNotApiErrorMesssage(e.message)}`).to.be.true;
        expect(false, `${TestLogger.createTestFailMessage('failed')}`).to.be.true;
      }
    });

    it(`${scriptName}: should login as user`, async() => {
      const loginUserId: string = apsUserLoginTemplate.userId;
      const loginPwd: string = apsUserLoginTemplate.password;
      let loggedIn: APSUser;
      try {
        loggedIn = await ApsLoginService.login({
          requestBody: { userId: loginUserId, userPwd: loginPwd }
        });
      } catch (e) {
        expect(e instanceof ApiError, `${TestLogger.createNotApiErrorMesssage(e.message)}`).to.be.true;
        expect(false, `${TestLogger.createTestFailMessage('failed')}`).to.be.true;
      }
      expect(loggedIn.systemRoles).to.be.an('array');
      expect(loggedIn.systemRoles).to.eql(apsUserLoginTemplate.systemRoles);
      expect(loggedIn.memberOfOrganizations).to.be.an('array');
      expect(loggedIn.memberOfOrganizations).to.deep.equal(apsUserLoginTemplate.memberOfOrganizations);
    });

    it(`${scriptName}: should fail to login as user`, async() => {
      const loginUserId: string = apsUserLoginTemplate.userId;
      const loginPwd: string = 'wrong';
      let loggedIn: APSUser;
      try {
        loggedIn = await ApsLoginService.login({
          requestBody: { userId: loginUserId, userPwd: loginPwd }
        });
      } catch (e) {
        expect(e instanceof ApiError, `${TestLogger.createNotApiErrorMesssage(e.message)}`).to.be.true;
        const apiError: ApiError = e;
        expect(apiError.status, 'status code').equal(401);
        const apsError: APSError = apiError.body;
        expect(apsError.errorId).equal(APSErrorIds.NOT_AUTHORIZED);
      }
    });

    it(`${scriptName}: should fail to login as user`, async() => {
      const loginUserId: string = apsUserLoginTemplate.userId;
      const loginPwd: string = 'wrong';
      let loggedIn: APSUser;
      try {
        loggedIn = await ApsLoginService.login({
          requestBody: { userId: loginUserId, userPwd: loginPwd }
        });
      } catch (e) {
        expect(e instanceof ApiError, `${TestLogger.createNotApiErrorMesssage(e.message)}`).to.be.true;
        const apiError: ApiError = e;
        expect(apiError.status, 'status code').equal(401);
        const apsError: APSError = apiError.body;
        expect(apsError.errorId).equal(APSErrorIds.NOT_AUTHORIZED);
      }
    });

    it(`${scriptName}: should log in as root user`, async() => {
      const loginUserId: string = TestContext.getTestEnv().rootUsername;
      const loginPwd: string = TestContext.getTestEnv().rootUserPassword;
      const loginCredentials: APSUserLoginCredentials = {
        userId: loginUserId,
        userPwd: loginPwd
      }
      try {
        const loggedIn: APSUser = await ApsLoginService.login({
          requestBody: loginCredentials
        });
        expect(loggedIn.systemRoles, TestLogger.createTestFailMessage('roles not an array')).to.be.an('array');
        expect(loggedIn.systemRoles, TestLogger.createTestFailMessage('more than 1 role')).length(1);
        expect(loggedIn.systemRoles[0], TestLogger.createTestFailMessage('role is not root')).equal(EAPSSystemAuthRole.ROOT);
      } catch (e) {
        expect(e instanceof ApiError, `${TestLogger.createNotApiErrorMesssage(e.message)}`).to.be.true;
        expect(false, TestLogger.createTestFailMessage('failed')).to.be.true;
      }
    });

    it(`${scriptName}: should fail to log in as root user: wrong user`, async() => {
      const loginUserId: string = TestContext.getTestEnv().rootUsername;
      const loginPwd: string = TestContext.getTestEnv().rootUserPassword;
      const loginCredentials: APSUserLoginCredentials = {
        userId: loginUserId,
        userPwd: loginPwd
      }
      try {
        const loggedIn: APSUser = await ApsLoginService.login({
          requestBody: { userId: 'unknown', userPwd: loginCredentials.userPwd }
        });
      } catch (e) {
        expect(e instanceof ApiError, `${TestLogger.createNotApiErrorMesssage(e.message)}`).to.be.true;
        const apiError: ApiError = e;
        expect(apiError.status, TestLogger.createTestFailMessage('status code')).equal(401);
        const apsError: APSError = apiError.body;
        expect(apsError.errorId, TestLogger.createTestFailMessage('incorrect errorId')).equal(APSErrorIds.NOT_AUTHORIZED);
      }
    });

    it(`${scriptName}: should fail to log in as root user: wrong password`, async() => {
      const loginUserId: string = TestContext.getTestEnv().rootUsername;
      const loginPwd: string = TestContext.getTestEnv().rootUserPassword;
      const loginCredentials: APSUserLoginCredentials = {
        userId: loginUserId,
        userPwd: loginPwd
      }
      try {
        const loggedIn: APSUser = await ApsLoginService.login({
          requestBody: { userId: loginCredentials.userId, userPwd: 'wrong' }
        });
      } catch (e) {
        expect(e instanceof ApiError, `${TestLogger.createNotApiErrorMesssage(e.message)}`).to.be.true;
        const apiError: ApiError = e;
        expect(apiError.status, TestLogger.createTestFailMessage('status code')).equal(401);
        const apsError: APSError = apiError.body;
        expect(apsError.errorId, TestLogger.createTestFailMessage('incorrect errorId')).equal(APSErrorIds.NOT_AUTHORIZED);
      }
    });

    it(`${scriptName}: should set login user to not active`, async() => {
      let replaced: APSUser;
      const replaceRequest: APSUserReplace = {
        ...apsUserLoginTemplate,
        isActivated: false,
      }
      const anyReplaceRequest: any = replaceRequest;
      anyReplaceRequest.userId = undefined;
      try {
        replaced = await ApsUsersService.replaceApsUser({
          userId: apsUserLoginTemplate.userId, 
          requestBody: replaceRequest
        });
      } catch (e) {
        expect(e instanceof ApiError, `${TestLogger.createNotApiErrorMesssage(e.message)}`).to.be.true;
        expect(false, TestLogger.createTestFailMessage('error')).to.be.true;
      }
      expect(replaced, TestLogger.createTestFailMessage('replaced object is not equal to expected object')).to.deep.equal({ ...replaceRequest, userId: apsUserLoginTemplate.userId });
    });

    it(`${scriptName}: should fail to login as inactive user`, async() => {
      const loginUserId: string = apsUserLoginTemplate.userId;
      const loginPwd: string = apsUserLoginTemplate.password;
      let loggedIn: APSUser;
      try {
        loggedIn = await ApsLoginService.login({
          requestBody: { userId: loginUserId, userPwd: loginPwd }
        });
        expect(false, TestLogger.createTestFailMessage('should not have logged in successfully, user is not active')).to.be.true;
      } catch (e) {
        expect(e instanceof ApiError, `${TestLogger.createNotApiErrorMesssage(e.message)}`).to.be.true;
        const apiError: ApiError = e;
        expect(apiError.status, TestLogger.createTestFailMessage('status code')).equal(401);
        const apsError: APSError = apiError.body;
        expect(apsError.errorId, TestLogger.createTestFailMessage('errorId mismatch')).equal(APSErrorIds.NOT_AUTHORIZED);
      }
    });

    // ****************************************************************************************************************
    // * Raw API Tests *
    // ****************************************************************************************************************

  });
});

