import 'mocha';
import { expect } from 'chai';
import request from 'supertest';
import Server from '../../server/index';
import path from 'path';
import _ from 'lodash';
import { TestContext, TestLogger } from '../lib/test.helpers';
import { 
  ApiError, 
  APSUser, 
  ApsUsersService, 
  ListApsUsersResponse
} from '../../src/@solace-iot-team/apim-server-openapi-node';
import { TestEnv } from '../setup.spec';
import { ServerUtils } from '../../server/common/ServerUtils';


const scriptName: string = path.basename(__filename);
TestLogger.logMessage(scriptName, ">>> starting ...");

describe(`${scriptName}`, () => {

  let bootstrapUserList = [];

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

  it(`${scriptName}: should read bootstrap user list`, async () => {
    try {
      bootstrapUserList = ServerUtils.readFileContentsAsJson(TestEnv.bootstrapFiles.apsUserListFile);
      // TestLogger.logMessageWithId(`bootstrapUserList = \n${JSON.stringify(bootstrapUserList, null, 2)}`);
    } catch (e) {
      expect(e instanceof ApiError, TestLogger.createNotApiErrorMesssage(e.message)).to.be.true;
      expect(false, TestLogger.createTestFailMessage('error')).to.be.true;
    }
  });

  it(`${scriptName}: should delete bootstrap user list`, async () => {
    try {
      for(const user of bootstrapUserList) {
        try {
          // TestLogger.logMessageWithId(`userId = ${user.userId}`);
          await ApsUsersService.deleteApsUser({
            userId: user.userId
          });
        } catch (e) {
          expect(e instanceof ApiError, TestLogger.createNotApiErrorMesssage(e.message)).to.be.true;
          const apiError: ApiError = e;
          expect(apiError.status, TestLogger.createTestFailMessage('status not 404')).equal(404);
        }
      }
    } catch (e) {
      expect(false, TestLogger.createTestFailMessage(`error = ${e}`)).to.be.true;
    }
  });

  it(`${scriptName}: should create users`, async () => {
    try {
      for(const user of bootstrapUserList) {
        await ApsUsersService.createApsUser({
          requestBody: { ...user }
        });
      }
    } catch (e) {
      expect(e instanceof ApiError, TestLogger.createNotApiErrorMesssage(e.message)).to.be.true;
      expect(false, TestLogger.createTestFailMessage('error')).to.be.true;
    }
  });

});

