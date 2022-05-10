import 'mocha';
import { expect } from 'chai';
import path from 'path';
import { TestContext, TestLogger } from '../../lib/test.helpers';
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
  ListApsUsersResponse,
  ApsSessionService,
  APSSessionLoginResponse
} from '../../../src/@solace-iot-team/apim-server-openapi-node';
import APSOrganizationsService from '../../../server/api/services/apsAdministration/APSOrganizationsService';
import { ApimServerAPIClient } from '../../lib/api.helpers';
import ServerConfig, { EAuthConfigType } from '../../../server/common/ServerConfig';


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

  // it(`${scriptName}: sec setup`, async() => {
  //   const isInternalIdp: boolean = ServerConfig.getAuthConfig().type === EAuthConfigType.INTERNAL;
  //   expect(isInternalIdp, TestLogger.createTestFailMessage(`isInternalIdp=${isInternalIdp}`)).to.be.true;
  //   ApimServerAPIClient.initializeAuthConfigInternal();
  // });

  it(`${scriptName}: should create login user`, async() => {
    try {
      await ApsUsersService.createApsUser({
        requestBody: apsUserLoginTemplate
      });
    } catch (e) {
      expect(e instanceof ApiError, `${TestLogger.createNotApiErrorMesssage(e.message)}`).to.be.true;
      expect(false, `${TestLogger.createTestFailMessage('failed')}`).to.be.true;
    }
  });

  it(`${scriptName}: should login as user`, async() => {
    const loginUserId: string = apsUserLoginTemplate.userId;
    const loginPwd: string = apsUserLoginTemplate.password;
    let loggedIn: APSSessionLoginResponse;
    try {

      const apsSessionLoginResponse: APSSessionLoginResponse = await ApsSessionService.apsLogin({
        requestBody: {
          username: loginUserId,
          password: loginPwd
        }
      });

    } catch (e) {
      expect(e instanceof ApiError, `${TestLogger.createNotApiErrorMesssage(e.message)}`).to.be.true;
      expect(false, `${TestLogger.createTestFailMessage('failed')}`).to.be.true;
    }

    expect(false, TestLogger.createTestFailMessage(`loggedIn = ${JSON.stringify(loggedIn, null, 2)}`)).to.be.true;


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

  // test
  // logout

});

