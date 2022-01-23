import "mocha";
import path from 'path';
import s from 'shelljs';
import { 
  getBaseUrl, 
  getMandatoryEnvVarValue, 
  getMandatoryEnvVarValueAsNumber, 
  getOptionalEnvVarValueAsBoolean, 
  TestContext, 
  TestLogger, 
  TTestEnv,
  testHelperSleep
} from './lib/test.helpers';
import { ApimServerAPIClient } from './lib/api.helpers'
import request from 'supertest';
import Server from '../server/index';
import { expect } from 'chai';
import { 
  ApsMonitorService, 
  APSStatus,
} from '../src/@solace-iot-team/apim-server-openapi-node';

const scriptName: string = path.basename(__filename);
const scriptDir: string = path.dirname(__filename);
TestLogger.setLogging(true);
TestLogger.logMessage(scriptName, ">>> initializing ...");

const setTestEnv = (): TTestEnv => {
  const testEnv: TTestEnv = {
    protocol: getMandatoryEnvVarValue(scriptName, 'APIM_TEST_SERVER_PROTOCOL'),
    host: getMandatoryEnvVarValue(scriptName, 'APIM_TEST_SERVER_HOST'),
    port: getMandatoryEnvVarValueAsNumber(scriptName, 'APIM_TEST_SERVER_PORT'),  
    apiBase: getMandatoryEnvVarValue(scriptName, 'APIM_TEST_SERVER_API_BASE'),
    enableLogging: getOptionalEnvVarValueAsBoolean(scriptName, 'APIM_TEST_SERVER_ENABLE_LOGGING', true),
    rootUsername: getMandatoryEnvVarValue(scriptName, 'APIM_TEST_SERVER_ROOT_USER'),
    rootUserPassword: getMandatoryEnvVarValue(scriptName, 'APIM_TEST_SERVER_ROOT_USER_PWD'),
  }
  return testEnv;
}
// init testEnv
const testEnv = setTestEnv();
TestLogger.logTestEnv(scriptName, testEnv);
TestLogger.setLogging(testEnv.enableLogging);
TestContext.setTestEnv(testEnv);

before(async() => {
  TestContext.newItId();
  // start mongo
  const code = s.exec(`${scriptDir}/mongodb/standup.mongo.sh `).code;
  expect(code, TestLogger.createTestFailMessage('standup mongo')).equal(0);
    // init OpenAPI
  const base: string = getBaseUrl(testEnv.protocol, testEnv.host, testEnv.port, testEnv.apiBase);
  ApimServerAPIClient.initialize(base);
});

after(async() => {
  TestContext.newItId();
  // stop mongo
  const code = s.exec(`${scriptDir}/mongodb/teardown.mongo.sh `).code;
  expect(code, TestLogger.createTestFailMessage('teardown mongo')).equal(0);
});

describe(`${scriptName}`, () => {
  context(`${scriptName}`, () => {

    const apiStartupBase = `/index.html`;

    beforeEach(() => {
      TestContext.newItId();
    });

    it(`${scriptName}: should start, initialize & bootstrap server`, async() => {
      const res = await request(Server).get(apiStartupBase);
      TestLogger.logMessageWithId(`res = ${JSON.stringify(res, null, 2)}`);
      expect(res.status, TestLogger.createTestFailMessage('status code')).equal(200);
    });

    it(`${scriptName}: should wait until server ready`, async() => {
      let apsStatus: APSStatus;
      let i = 0;
      do {
        i = i + 1;
        apsStatus = await ApsMonitorService.getApsStatus();
        TestLogger.logMessageWithId(`i=${i}, apsStatus = ${JSON.stringify(apsStatus, null, 2)}`);
        await testHelperSleep(500);
      } while (!apsStatus.isReady && i <= 5);
      expect(apsStatus.isReady, TestLogger.createTestFailMessage(`server not ready after i=${i} tries`)).to.be.true;
    });


  });
});

