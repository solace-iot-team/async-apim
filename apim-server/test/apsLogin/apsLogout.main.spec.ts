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
  ApsUsersService, 
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
  // systemRoles: [ EAPSSystemAuthRole.LOGIN_AS, EAPSSystemAuthRole.SYSTEM_ADMIN ],
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
    expect(finalApsUserList, TestLogger.createTestFailMessage('type of array')).to.be.an('array');
    expect(finalApsUserList, TestLogger.createTestFailMessage('empty array')).to.be.empty;
    expect(finalMeta.meta.totalCount, TestLogger.createTestFailMessage('totalCount not zero')).equal(0);
  });

  it(`${scriptName}: should create login user`, async() => {
    try {
      const created = await ApsUsersService.createApsUser({
        requestBody: apsUserLoginTemplate
      });
      expect(created, 'user not created correctly').to.deep.equal(apsUserLoginTemplate);
    } catch (e) {
      expect(e instanceof ApiError, TestLogger.createNotApiErrorMesssage(e.message)).to.be.true;
      expect(false, TestLogger.createTestFailMessage('failed')).to.be.true;
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
      expect(e instanceof ApiError, TestLogger.createNotApiErrorMesssage(e.message)).to.be.true;
      expect(false, TestLogger.createTestFailMessage('failed')).to.be.true;
    }
  });

  it(`${scriptName}: should logout user`, async() => {
    const loginUserId: string = apsUserLoginTemplate.userId;
    try {
      await ApsLoginService.logout({
        userId: loginUserId
      });
    } catch (e) {
      expect(e instanceof ApiError, TestLogger.createNotApiErrorMesssage(e.message)).to.be.true;
      expect(false, TestLogger.createTestFailMessage('log:')).to.be.true;
    }
  });

  it(`${scriptName}: should handle unknown user`, async() => {
    const loginUserId: string = 'unknown_user';
    try {
      await ApsLoginService.logout({
        userId: loginUserId
      });
    } catch (e) {
      expect(e instanceof ApiError, TestLogger.createNotApiErrorMesssage(e.message)).to.be.true;
      // expect(false, TestLogger.createTestFailMessage('log:')).to.be.true;
      const apiError: ApiError = e;
      expect(apiError.status, TestLogger.createTestFailMessage('status code')).equal(404);
      const apsError: APSError = apiError.body;
      expect(apsError.errorId, TestLogger.createTestFailMessage('errorId mismatch')).equal(APSErrorIds.KEY_NOT_FOUND);
    }
  });

});

