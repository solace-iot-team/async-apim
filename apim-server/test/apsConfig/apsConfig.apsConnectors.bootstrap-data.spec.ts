import 'mocha';
import { expect } from 'chai';
import request from 'supertest';
import Server from '../../server/index';
import path from 'path';
import _ from 'lodash';
import { TestContext, TestLogger } from '../lib/test.helpers';
import { 
  ApiError, 
  ApsConfigService, 
  ListApsConnectorsResponse, 
} from '../../src/@solace-iot-team/apim-server-openapi-node';
import { TestEnv } from '../setup.spec';
import { ServerUtils } from '../../server/common/ServerUtils';


const scriptName: string = path.basename(__filename);
TestLogger.logMessage(scriptName, ">>> starting ...");

describe(`${scriptName}`, () => {

  let bootstrapConnectorList = [];

  beforeEach(() => {
    TestContext.newItId();
  });

  after(async() => {
    TestContext.newItId();
    try {
      const result: ListApsConnectorsResponse  = await ApsConfigService.listApsConnectors();
      for (const connector of result.list) {
        await ApsConfigService.deleteApsConnector({
          connectorId: connector.connectorId
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

  it(`${scriptName}: should read bootstrap connector list`, async () => {
    try {
      bootstrapConnectorList = ServerUtils.readFileContentsAsJson(TestEnv.bootstrapFiles.apsConnectorListFile);
      // TestLogger.logMessageWithId(`bootstrapUserList = \n${JSON.stringify(bootstrapUserList, null, 2)}`);
    } catch (e) {
      expect(e instanceof ApiError, TestLogger.createNotApiErrorMesssage(e.message)).to.be.true;
      expect(false, TestLogger.createTestFailMessage('error')).to.be.true;
    }
  });

  it(`${scriptName}: should delete bootstrap connector list`, async () => {
    try {
      for(const connector of bootstrapConnectorList) {
        try {
          // TestLogger.logMessageWithId(`userId = ${user.userId}`);
          await ApsConfigService.deleteApsConnector({
            connectorId: connector.connectorId
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

  it(`${scriptName}: should create connector`, async () => {
    try {
      for(const connector of bootstrapConnectorList) {
        await ApsConfigService.createApsConnector({
          requestBody: { ...connector }
        });
      }
    } catch (e) {
      expect(e instanceof ApiError, TestLogger.createNotApiErrorMesssage(e.message)).to.be.true;
      expect(false, TestLogger.createTestFailMessage('error')).to.be.true;
    }
  });

});

