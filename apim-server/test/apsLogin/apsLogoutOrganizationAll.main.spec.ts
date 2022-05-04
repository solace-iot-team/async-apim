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
  APSOrganization, 
  APSOrganizationCreate, 
  APSUserCreate, 
  APSUserResponse, 
  APSUserResponseList, 
  ApsUsersService, 
} from '../../src/@solace-iot-team/apim-server-openapi-node';
import APSOrganizationsService from '../../server/api/services/apsAdministration/APSOrganizationsService';


const scriptName: string = path.basename(__filename);
TestLogger.logMessage(scriptName, ">>> starting ...");

const apsUserCreateLoginTemplate: APSUserCreate = {
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

const apsOrganizationCreate: APSOrganizationCreate = {
  organizationId: 'logoutAllOrganization',
  displayName: 'logoutAllOrganization',
  appCredentialsExpiryDuration: APSOrganizationsService.get_DefaultAppCredentialsExpiryDuration(),
  maxNumApisPerApiProduct: APSOrganizationsService.get_DefaultMaxNumApis_Per_ApiProduct(),
}


describe(`${scriptName}`, () => {

  beforeEach(() => {
      TestContext.newItId();
    });

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
    expect(finalApsUserList, TestLogger.createTestFailMessage('type of array')).to.be.an('array');
    expect(finalApsUserList, TestLogger.createTestFailMessage('empty array')).to.be.empty;
    expect(finalMeta.meta.totalCount, TestLogger.createTestFailMessage('totalCount not zero')).equal(0);
  });

  it(`${scriptName}: should create organization`, async() => {
    try {
      const apsOrgCreated: APSOrganization = await ApsAdministrationService.createApsOrganization({
        requestBody: apsOrganizationCreate
      });
    } catch (e) {
      expect(e instanceof ApiError, TestLogger.createNotApiErrorMesssage(e.message)).to.be.true;
      expect(false, TestLogger.createTestFailMessage('failed')).to.be.true;
    }
  });

  it(`${scriptName}: should create login user`, async() => {
    try {
      const created = await ApsUsersService.createApsUser({
        requestBody: apsUserCreateLoginTemplate
      });
      // expect(created, 'user not created correctly').to.deep.equal(apsUserCreateLoginTemplate);
    } catch (e) {
      expect(e instanceof ApiError, TestLogger.createNotApiErrorMesssage(e.message)).to.be.true;
      expect(false, TestLogger.createTestFailMessage('failed')).to.be.true;
    }
  });

  it(`${scriptName}: should login as user`, async() => {
    const loginUserId: string = apsUserCreateLoginTemplate.userId;
    const loginPwd: string = apsUserCreateLoginTemplate.password;
    let loggedIn: APSUserResponse;
    try {
      loggedIn = await ApsLoginService.login({
        requestBody: { userId: loginUserId, userPwd: loginPwd }
      });
    } catch (e) {
      expect(e instanceof ApiError, TestLogger.createNotApiErrorMesssage(e.message)).to.be.true;
      expect(false, TestLogger.createTestFailMessage('failed')).to.be.true;
    }
  });

  it(`${scriptName}: should logout all users from organization`, async() => {
    try {
      await ApsLoginService.logoutOrganizationAll({
        organizationId: apsOrganizationCreate.organizationId
      });
    } catch (e) {
      expect(e instanceof ApiError, TestLogger.createNotApiErrorMesssage(e.message)).to.be.true;
      expect(false, TestLogger.createTestFailMessage('log:')).to.be.true;
    }
  });

  xit(`${scriptName}: should return not authorized error for users after logout all`, async() => {
    // TODO: access a resource ==> not authorized
  });

  it(`${scriptName}: should delete org`, async() => {
    try {
      await ApsAdministrationService.deleteApsOrganization({
        organizationId: apsOrganizationCreate.organizationId
      });
    } catch (e) {
      expect(e instanceof ApiError, TestLogger.createNotApiErrorMesssage(e.message)).to.be.true;
      expect(false, TestLogger.createTestFailMessage('failed')).to.be.true;
    }
  });

  xit(`${scriptName}: should return not authorized error after org deleted`, async() => {
    // TODO: access a resource ==> not authorized
  });

  it(`${scriptName}: should fail logging out from non-existing organization`, async() => {
    const NonExistentOrgName = 'non-existent-org';
    try {
      await ApsLoginService.logoutOrganizationAll({
        organizationId: NonExistentOrgName
      });
    } catch (e) {
      expect(e instanceof ApiError, TestLogger.createNotApiErrorMesssage(e.message)).to.be.true;
      const apiError: ApiError = e;
      expect(apiError.status, TestLogger.createTestFailMessage('fail')).equal(404);
      const apsError: APSError = apiError.body;
      expect(apsError.errorId, TestLogger.createTestFailMessage('fail')).equal(APSErrorIds.ORGANIZATION_NOT_FOUND);
      expect(JSON.stringify(apsError), TestLogger.createTestFailMessage('fail')).contains(NonExistentOrgName);
      return;
    }
    expect(false, `${TestLogger.createTestFailMessage('should not get here')}`).to.be.true;
  });

});
