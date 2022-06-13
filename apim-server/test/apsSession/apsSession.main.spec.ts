import 'mocha';
import { expect } from 'chai';
import path from 'path';
import { TestContext, TestLogger } from '../lib/test.helpers';
import { 
  ApiError, 
  APSError, 
  APSErrorIds, 
  APSUserCreate, 
  ApsUsersService, 
  EAPSSystemAuthRole, 
  ApsSessionService,
  APSSessionLoginResponse,
  ApsSecureTestsService,
  APSSecureTestResponse,
  APSSessionLogoutResponse,
  APSSessionRefreshTokenResponse
} from '../../src/@solace-iot-team/apim-server-openapi-node';
import { ApimServerAPIClient } from '../lib/api.helpers';


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
  // memberOfOrganizations: [ 
  //   {
  //     organizationId: OrganizationId,
  //     roles: [EAPSOrganizationAuthRole.ORGANIZATION_ADMIN]
  //   }
  // ]
}

describe(`${scriptName}`, () => {

  beforeEach(() => {
      TestContext.newItId();
    });

  // after(async() => {
  //   TestContext.newItId();
  //   let apsUserList: APSUserResponseList = [];
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
  // });

  // ****************************************************************************************************************
  // * OpenApi API Tests *
  // ****************************************************************************************************************

  it(`${scriptName}: should create login user`, async() => {
    try {
      await ApsUsersService.createApsUser({
        requestBody: apsUserLoginTemplate
      });
    } catch (e) {
      expect(e instanceof ApiError, TestLogger.createNotApiErrorMesssage(e.message)).to.be.true;
      expect(false, TestLogger.createTestFailMessage('failed')).to.be.true;
    }
  });

  it(`${scriptName}: should login as user`, async() => {
    const loginUserId: string = apsUserLoginTemplate.userId;
    const loginPwd: string = apsUserLoginTemplate.password;
    let loggedIn: APSSessionLoginResponse;
    try {
      loggedIn = await ApsSessionService.apsLogin({
        requestBody: {
          username: loginUserId,
          password: loginPwd
        }
      });
    } catch (e) {
      expect(e instanceof ApiError, TestLogger.createNotApiErrorMesssage(e.message)).to.be.true;
      expect(false, TestLogger.createTestFailMessage('failed')).to.be.true;
    }
    expect(loggedIn.token, TestLogger.createTestFailMessage('loggedIn.token is undefined')).not.to.be.undefined;
    ApimServerAPIClient.setCredentials({ bearerToken: loggedIn.token });  
  });

  // it(`${scriptName}: continue here`, async() => {
  //   expect(false, TestLogger.createTestFailMessage('continue here')).to.be.true;
  // });

  it(`${scriptName}: should get new token`, async() => {
    let response: APSSessionRefreshTokenResponse;
    try {
      response = await ApsSessionService.apsRefreshToken();
    } catch (e) {
      expect(e instanceof ApiError, TestLogger.createNotApiErrorMesssage(e.message)).to.be.true;
      expect(false, TestLogger.createTestFailMessage('failed')).to.be.true;
    }
    expect(response.success, TestLogger.createTestFailMessage('failed')).to.be.true;
    expect(response.token, TestLogger.createTestFailMessage('response.token is undefined')).not.to.be.undefined;
    ApimServerAPIClient.setCredentials({ bearerToken: response.token });  
  });

  // it(`${scriptName}: continue here`, async() => {
  //   expect(false, TestLogger.createTestFailMessage('continue here')).to.be.true;
  // });

  it(`${scriptName}: should get /test`, async() => {
    let response: APSSecureTestResponse;
    try {
      response = await ApsSecureTestsService.apsTest();
    } catch (e) {
      expect(e instanceof ApiError, TestLogger.createNotApiErrorMesssage(e.message)).to.be.true;
      expect(false, TestLogger.createTestFailMessage('failed')).to.be.true;
    }
    expect(response.success, TestLogger.createTestFailMessage('failed')).to.be.true;
  });

  it(`${scriptName}: should logout`, async() => {
    let response: APSSessionLogoutResponse;
    try {
      response = await ApsSessionService.apsLogout();
    } catch (e) {
      expect(e instanceof ApiError, TestLogger.createNotApiErrorMesssage(e.message)).to.be.true;
      expect(false, TestLogger.createTestFailMessage('failed')).to.be.true;
    }
    expect(response.success, TestLogger.createTestFailMessage('failed')).to.be.true;
  });

  it(`${scriptName}: should fail to get /test`, async() => {
    let response: APSSecureTestResponse;
    try {
      response = await ApsSecureTestsService.apsTest();
      expect(false, TestLogger.createTestFailMessage('should never get here')).to.be.true;
    } catch (e) {
      expect(e instanceof ApiError,TestLogger.createNotApiErrorMesssage(e.message)).to.be.true;
      const apiError: ApiError = e;
      expect(apiError.status, TestLogger.createTestFailMessage('status code')).equal(401);
      const apsError: APSError = apiError.body;
      expect(apsError.errorId, TestLogger.createTestFailMessage('errorId mismatch')).equal(APSErrorIds.NOT_AUTHORIZED);
    }
  });

  it(`${scriptName}: should login as user`, async() => {
    const loginUserId: string = apsUserLoginTemplate.userId;
    const loginPwd: string = apsUserLoginTemplate.password;
    let loggedIn: APSSessionLoginResponse;
    try {
      loggedIn = await ApsSessionService.apsLogin({
        requestBody: {
          username: loginUserId,
          password: loginPwd
        }
      });
    } catch (e) {
      expect(e instanceof ApiError, TestLogger.createNotApiErrorMesssage(e.message)).to.be.true;
      expect(false, TestLogger.createTestFailMessage('failed')).to.be.true;
    }
    expect(loggedIn.token, TestLogger.createTestFailMessage('loggedIn.token is undefined')).not.to.be.undefined;
    ApimServerAPIClient.setCredentials({ bearerToken: loggedIn.token });  
  });

  it(`${scriptName}: should get /test`, async() => {
    let response: APSSecureTestResponse;
    try {
      response = await ApsSecureTestsService.apsTest();
    } catch (e) {
      expect(e instanceof ApiError, TestLogger.createNotApiErrorMesssage(e.message)).to.be.true;
      expect(false, TestLogger.createTestFailMessage('failed')).to.be.true;
    }
    expect(response.success, TestLogger.createTestFailMessage('failed')).to.be.true;
  });

  it(`${scriptName}: should get new token`, async() => {
    let response: APSSessionRefreshTokenResponse;
    try {
      response = await ApsSessionService.apsRefreshToken();
    } catch (e) {
      expect(e instanceof ApiError, TestLogger.createNotApiErrorMesssage(e.message)).to.be.true;
      expect(false, TestLogger.createTestFailMessage('failed')).to.be.true;
    }
    expect(response.success, TestLogger.createTestFailMessage('failed')).to.be.true;
    expect(response.token, TestLogger.createTestFailMessage('response.token is undefined')).not.to.be.undefined;
    ApimServerAPIClient.setCredentials({ bearerToken: response.token });  
  });

  // it(`${scriptName}: continue here`, async() => {
  //   expect(false, TestLogger.createTestFailMessage('continue here')).to.be.true;
  // });


  it(`${scriptName}: should get /test`, async() => {
    let response: APSSecureTestResponse;
    try {
      response = await ApsSecureTestsService.apsTest();
    } catch (e) {
      expect(e instanceof ApiError, TestLogger.createNotApiErrorMesssage(e.message)).to.be.true;
      expect(false, TestLogger.createTestFailMessage('failed')).to.be.true;
    }
    expect(response.success, TestLogger.createTestFailMessage('failed')).to.be.true;
  });

  it(`${scriptName}: should logout`, async() => {
    let response: APSSessionLogoutResponse;
    try {
      response = await ApsSessionService.apsLogout();
    } catch (e) {
      expect(e instanceof ApiError, TestLogger.createNotApiErrorMesssage(e.message)).to.be.true;
      expect(false, TestLogger.createTestFailMessage('failed')).to.be.true;
    }
    expect(response.success, TestLogger.createTestFailMessage('failed')).to.be.true;
  });

  it(`${scriptName}: should fail to get /test`, async() => {
    let response: APSSecureTestResponse;
    try {
      response = await ApsSecureTestsService.apsTest();
      expect(false, TestLogger.createTestFailMessage('should never get here')).to.be.true;
    } catch (e) {
      expect(e instanceof ApiError,TestLogger.createNotApiErrorMesssage(e.message)).to.be.true;
      const apiError: ApiError = e;
      expect(apiError.status, TestLogger.createTestFailMessage('status code')).equal(401);
      const apsError: APSError = apiError.body;
      expect(apsError.errorId, TestLogger.createTestFailMessage('errorId mismatch')).equal(APSErrorIds.NOT_AUTHORIZED);
    }
  });


});

