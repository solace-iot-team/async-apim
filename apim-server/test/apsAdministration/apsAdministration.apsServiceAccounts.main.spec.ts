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
  APSError,
  APSErrorIds,
  ListAPSServiceAccountsResponse,
  APSSessionLoginResponse,
  ApsSessionService,
  APSServiceAccountCreate,
  APSServiceAccountCreateResponse,
  APSServiceAccountList,
  APSServiceAccount,
} from '../../src/@solace-iot-team/apim-server-openapi-node';
import ServerConfig, { EAuthConfigType } from '../../server/common/ServerConfig';
import { TestEnv } from '../setup.spec';
import { ApimServerAPIClient } from '../lib/api.helpers';


const scriptName: string = path.basename(__filename);
TestLogger.logMessage(scriptName, ">>> starting ...");

const ServiceAccountIdTemplate: string = 'test-service-account';
const ServiceAccountDisplayNamePrefix: string = 'displayName for ';
const NumberOfServiceAccounts: number = 3;

const createServiceAccountId = (i: number): APSId => {
  const iStr: string = String(i).padStart(5, '0');
  const id: string = `${ServiceAccountIdTemplate}_${iStr}`;
  return id;
}
const createServiceAccountDisplayName = (serviceAccountId: string): string => {
  return `${ServiceAccountDisplayNamePrefix}${serviceAccountId}`;
}

describe(`${scriptName}`, () => {

  beforeEach(() => {
    TestContext.newItId();
  });

  // ****************************************************************************************************************
  // * OpenApi API Tests *
  // ****************************************************************************************************************

  it(`${scriptName}: should login as root user`, async() => {
    const isInternalIdp: boolean = ServerConfig.getAuthConfig().type === EAuthConfigType.INTERNAL;
    if(isInternalIdp) {
      // login as root and use the bearer token in open api
      const apsSessionLoginResponse: APSSessionLoginResponse = await ApsSessionService.apsLogin({
        requestBody: {
          username: TestEnv.rootUsername,
          password: TestEnv.rootUserPassword
        }
      });
      ApimServerAPIClient.setCredentials({ bearerToken: apsSessionLoginResponse.token });
    }
  });

  it(`${scriptName}: should list all service accounts and delete them`, async () => {
    try {
      const listAPSServiceAccountsResponse: ListAPSServiceAccountsResponse = await ApsAdministrationService.listApsServiceAccounts();
      // const listOrgResponse: ListAPSOrganizationResponse = await ApsAdministrationService.listApsOrganizations();
      // const orgList: APSOrganizationList = listOrgResponse.list;
      const totalCount: number = listAPSServiceAccountsResponse.meta.totalCount;
      for(const apsServiceAccount of listAPSServiceAccountsResponse.list) {
        await ApsAdministrationService.deleteApsServiceAccount({
          serviceAccountId: apsServiceAccount.serviceAccountId
        });
      }
    } catch (e) {
      expect(e instanceof ApiError, TestLogger.createNotApiErrorMesssage(e.message)).to.be.true;
      expect(false, TestLogger.createTestFailMessage('failed')).to.be.true;
    }
  });

  it(`${scriptName}: should create service accounts`, async () => {
    try {
      for(let i=0; i < NumberOfServiceAccounts; i++) {
        const serviceAccountId: string = createServiceAccountId(i);
        const displayName: string = createServiceAccountDisplayName(serviceAccountId);

        const apsServiceAccountCreate: APSServiceAccountCreate = {
          serviceAccountId: serviceAccountId,
          displayName: displayName,
          description: displayName
        };
        const apsServiceAccountCreateResponse: APSServiceAccountCreateResponse = await ApsAdministrationService.createApsServiceAccount({ 
          requestBody: apsServiceAccountCreate
        });
        expect(apsServiceAccountCreateResponse, TestLogger.createTestFailMessage('response does not contain the token')).to.have.property('token');
      }
    } catch (e) {
      expect(e instanceof ApiError, TestLogger.createNotApiErrorMesssage(e.message)).to.be.true;
      expect(false, TestLogger.createTestFailMessage('failed')).to.be.true;
    }
  });

  it(`${scriptName}: should list and get all service accounts`, async () => {
    try {
      const listAPSServiceAccountsResponse: ListAPSServiceAccountsResponse = await ApsAdministrationService.listApsServiceAccounts();
      const totalCount: number = listAPSServiceAccountsResponse.meta.totalCount;
      const apsServiceAccountList: APSServiceAccountList = listAPSServiceAccountsResponse.list;
      expect(totalCount, TestLogger.createTestFailMessage('totalCount not as expected')).to.equal(NumberOfServiceAccounts);
      expect(apsServiceAccountList.length, TestLogger.createTestFailMessage('orgList.length not as expected')).to.equal(NumberOfServiceAccounts);
      for(const apsServiceAccount of apsServiceAccountList) {
        const get_APSServiceAccount: APSServiceAccount = await ApsAdministrationService.getApsServiceAccount({
          serviceAccountId: apsServiceAccount.serviceAccountId
        });
        expect(get_APSServiceAccount, TestLogger.createTestFailMessage('response does not equal request')).to.deep.equal(apsServiceAccount);
      }
    } catch (e) {
      expect(e instanceof ApiError, TestLogger.createNotApiErrorMesssage(e.message)).to.be.true;
      expect(false, TestLogger.createTestFailMessage('failed')).to.be.true;
    }
  });

  it(`${scriptName}: should delete 1 service account`, async () => {
    try {
      const deleteId: string = createServiceAccountId(0);
      await ApsAdministrationService.deleteApsServiceAccount({
        serviceAccountId: deleteId
      });
      const listAPSServiceAccountsResponse: ListAPSServiceAccountsResponse = await ApsAdministrationService.listApsServiceAccounts();
      const totalCount: number = listAPSServiceAccountsResponse.meta.totalCount;
      const apsServiceAccountList: APSServiceAccountList = listAPSServiceAccountsResponse.list;

      expect(totalCount, TestLogger.createTestFailMessage('totalCount not as expected')).to.equal(NumberOfServiceAccounts-1);
      expect(apsServiceAccountList.length, TestLogger.createTestFailMessage('orgList.length not as expected')).to.equal(NumberOfServiceAccounts-1);
      const found = apsServiceAccountList.find( (apsServiceAccount: APSServiceAccount) => {
        apsServiceAccount.serviceAccountId === deleteId;
      });
      expect(found, TestLogger.createTestFailMessage('found the serviceAccountId that was deleted in response list')).to.be.undefined;
    } catch (e) {
      expect(e instanceof ApiError, TestLogger.createNotApiErrorMesssage(e.message)).to.be.true;
      expect(false, TestLogger.createTestFailMessage('failed')).to.be.true;
    }
  });

  it(`${scriptName}: should return not found error`, async() => {
    const searchId = "_DOES_NOT_EXIST_";
    try {
      await ApsAdministrationService.getApsServiceAccount({
        serviceAccountId: searchId,
      });
      expect(false, TestLogger.createTestFailMessage('should not get here')).to.be.true;
    } catch (e) {
      expect(e instanceof ApiError, TestLogger.createNotApiErrorMesssage(e.message)).to.be.true;
      const apiError: ApiError = e;
      expect(apiError.status, TestLogger.createTestFailMessage('status not 404')).equal(404);
      const apsError: APSError = apiError.body;
      expect(apsError.errorId, TestLogger.createTestFailMessage('incorrect errorId')).equal(APSErrorIds.KEY_NOT_FOUND);
      expect(JSON.stringify(apsError.meta), TestLogger.createTestFailMessage('error does not contain the key')).to.contain(searchId);
    }
  });


  // it(`${scriptName}: continue here`, async () => {
  //   expect(false, 'continue here').to.be.true;
  // });

    // xit(`${scriptName}: should return unauthorized request`, async() => {
    //   // TODO
    // });

    // xit(`${scriptName}: should return forbidden request`, async() => {
    //   // TODO
    // });

});

