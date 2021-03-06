import 'mocha';
import { expect } from 'chai';
import path from 'path';
import { TestContext, TestLogger } from '../lib/test.helpers';
import { 
  ApiError, 
  ApsAdministrationService, 
  APSError, 
  APSErrorIds, 
  APSListResponseMeta, 
  ApsLoginService, 
  APSUserCreate, 
  APSUserLoginCredentials, 
  APSUserResponse, 
  APSUserResponseList,
  ApsUsersService, 
  APSUserUpdate, 
  EAPSOrganizationAuthRole, 
  EAPSSystemAuthRole, 
  ListApsUsersResponse
} from '../../src/@solace-iot-team/apim-server-openapi-node';
import APSOrganizationsService from '../../server/api/services/apsAdministration/APSOrganizationsService';


const scriptName: string = path.basename(__filename);
TestLogger.logMessage(scriptName, ">>> starting ...");

const OrganizationId = 'login-reference-org';
const apsUserLoginTemplate: APSUserCreate = {
  isActivated: true,
  userId: `${scriptName}-userId`,
  password: `${scriptName}-password`,
  profile: {
    email: `${scriptName}@aps.com`,
    first: `${scriptName}-first`,
    last: `${scriptName}-last`
  },
  systemRoles: [ EAPSSystemAuthRole.SYSTEM_ADMIN ],
  memberOfOrganizations: [ 
    {
      organizationId: OrganizationId,
      roles: [EAPSOrganizationAuthRole.ORGANIZATION_ADMIN]
    }
  ]
}

describe(`${scriptName}`, () => {

  beforeEach(() => {
      TestContext.newItId();
    });

  after(async() => {
    TestContext.newItId();
    let apsUserList: APSUserResponseList = [];
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
  
  it(`${scriptName}: should create organization for referencing`, async () => {
    try {
      await ApsAdministrationService.createApsOrganization({
        requestBody: {
          organizationId: OrganizationId,
          displayName: OrganizationId,
          appCredentialsExpiryDuration: APSOrganizationsService.get_DefaultAppCredentialsExpiryDuration(),
          maxNumApisPerApiProduct: APSOrganizationsService.get_DefaultMaxNumApis_Per_ApiProduct(),
        }
      });
    } catch (e) {
      expect(e instanceof ApiError, TestLogger.createNotApiErrorMesssage(e.message)).to.be.true;
      expect(false, TestLogger.createTestFailMessage('failed')).to.be.true;
    }
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
        const resultListApsUsers: APSListResponseMeta & { list: APSUserResponseList }  = await ApsUsersService.listApsUsers({
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
      // const target: Partial<APSUserCreate> = apsUserLoginTemplate;
      // delete target.password;
      // expect(created, 'user not created correctly').to.deep.equal(target);
    } catch (e) {
      expect(e instanceof ApiError, `${TestLogger.createNotApiErrorMesssage(e.message)}`).to.be.true;
      expect(false, `${TestLogger.createTestFailMessage('failed')}`).to.be.true;
    }
  });

  it(`${scriptName}: should login as user`, async() => {
    const loginUserId: string = apsUserLoginTemplate.userId;
    const loginPwd: string = apsUserLoginTemplate.password;
    let loggedIn: APSUserResponse;
    try {
      loggedIn = await ApsLoginService.login({
        requestBody: { username: loginUserId, password: loginPwd }
      });
    } catch (e) {
      expect(e instanceof ApiError, `${TestLogger.createNotApiErrorMesssage(e.message)}`).to.be.true;
      expect(false, `${TestLogger.createTestFailMessage('failed')}`).to.be.true;
    }
    expect(loggedIn.systemRoles).to.be.an('array');
    expect(loggedIn.systemRoles).to.eql(apsUserLoginTemplate.systemRoles);
    expect(loggedIn.memberOfOrganizations).to.be.an('array');
    for(const apsOrganizationRolesResponse of loggedIn.memberOfOrganizations) {
      // check organizationId and roles are the same as template
      const found = apsUserLoginTemplate.memberOfOrganizations.find( (x) => {
        return x.organizationId === apsOrganizationRolesResponse.organizationId;
      });
      expect(found !== undefined, TestLogger.createTestFailMessage('organization not found')).to.be.true;
      expect(found.roles, TestLogger.createTestFailMessage('roles not equal')).to.deep.equal(apsOrganizationRolesResponse.roles);
    }
  });

  it(`${scriptName}: should fail to login as user`, async() => {
    const loginUserId: string = apsUserLoginTemplate.userId;
    const loginPwd: string = 'wrong';
    let loggedIn: APSUserResponse;
    try {
      loggedIn = await ApsLoginService.login({
        requestBody: { username: loginUserId, password: loginPwd }
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
    let loggedIn: APSUserResponse;
    try {
      loggedIn = await ApsLoginService.login({
        requestBody: { username: loginUserId, password: loginPwd }
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
      username: loginUserId,
      password: loginPwd
    }
    try {
      const loggedIn: APSUserResponse = await ApsLoginService.login({
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
      username: loginUserId,
      password: loginPwd
    }
    try {
      const loggedIn: APSUserResponse = await ApsLoginService.login({
        requestBody: { username: 'unknown', password: loginCredentials.password }
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
      username: loginUserId,
      password: loginPwd
    }
    try {
      const loggedIn: APSUserResponse = await ApsLoginService.login({
        requestBody: { username: loginCredentials.username, password: 'wrong' }
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
    let updated: APSUserResponse;
    const updateRequest: APSUserUpdate = {
      isActivated: false
    }
    const anyUpdateRequest: any = updateRequest;
    anyUpdateRequest.userId = undefined;
    try {
      updated = await ApsUsersService.updateApsUser({
        userId: apsUserLoginTemplate.userId, 
        requestBody: updateRequest
      });
    } catch (e) {
      expect(e instanceof ApiError, `${TestLogger.createNotApiErrorMesssage(e.message)}`).to.be.true;
      expect(false, TestLogger.createTestFailMessage('error')).to.be.true;
    }
    expect(updated.isActivated, TestLogger.createTestFailMessage('isActivated not false')).to.be.false;
    // expect(replaced, TestLogger.createTestFailMessage('replaced object is not equal to expected object')).to.deep.equal({ ...replaceRequest, userId: apsUserLoginTemplate.userId });
  });

  it(`${scriptName}: should fail to login as inactive user`, async() => {
    const loginUserId: string = apsUserLoginTemplate.userId;
    const loginPwd: string = apsUserLoginTemplate.password;
    let loggedIn: APSUserResponse;
    try {
      loggedIn = await ApsLoginService.login({
        requestBody: { username: loginUserId, password: loginPwd }
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

