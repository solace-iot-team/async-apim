import "mocha";
import path from 'path';
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


const scriptName: string = path.basename(__filename);
TestLogger.setLogging(true);
TestLogger.logMessage(scriptName, ">>> initializing ...");
const testEnv: TTestEnv = {
  protocol: getMandatoryEnvVarValue(scriptName, 'APIM_TEST_SERVER_PROTOCOL'),
  host: getMandatoryEnvVarValue(scriptName, 'APIM_TEST_SERVER_HOST'),
  port: getMandatoryEnvVarValueAsNumber(scriptName, 'APIM_TEST_SERVER_PORT'),
  apiBase: getMandatoryEnvVarValue(scriptName, 'APIM_TEST_SERVER_API_BASE'),
  enableLogging: getOptionalEnvVarValueAsBoolean(scriptName, 'APIM_TEST_SERVER_ENABLE_LOGGING', true),
  rootUsername: getMandatoryEnvVarValue(scriptName, 'APIM_TEST_SERVER_ROOT_USER'),
  rootUserPassword: getMandatoryEnvVarValue(scriptName, 'APIM_TEST_SERVER_ROOT_USER_PWD'),
}
TestLogger.logTestEnv(scriptName, testEnv);
TestLogger.logMessage(scriptName, ">>> success.");
TestLogger.setLogging(testEnv.enableLogging);
TestContext.setTestEnv(testEnv);

before(async() => {
  const base: string = getBaseUrl(testEnv.protocol, testEnv.host, testEnv.port, testEnv.apiBase);
  ApimServerAPIClient.initialize(base);
});

describe(`${scriptName}`, () => {
  context(`${scriptName}`, () => {

    const apiStartupBase = `${TestContext.getApiBase()}/apsUsers`;

    beforeEach(() => {
      TestContext.newItId();
    });

    it(`${scriptName}: should start & bootstrap server`, async() => {
      const res = await request(Server).get(apiStartupBase);
      TestLogger.logMessageWithId(`res = ${JSON.stringify(res, null, 2)}\nbody-json = ${JSON.stringify(JSON.parse(res.text), null, 2)}`);
      expect(res.status, TestLogger.createTestFailMessage('status code')).equal(200);

      // TODO: need to wait until initialized & bootstrapping is finished ==> server ready
      await testHelperSleep(2000);

    });


  });
});

