import "mocha";
import path from 'path';
import s from 'shelljs';
import fs from 'fs';
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

const setTestEnv = (scriptDir: string): TTestEnv => { 
  let testRootDir = scriptDir;
  if(!scriptDir.includes('test')) testRootDir = path.join(scriptDir, 'test');
  const projectRootDir = path.join(testRootDir, '../..');
  const bootstrapDataDir = path.join(testRootDir, '../data/bootstrap');
  const testEnv: TTestEnv = {
    projectRootDir: projectRootDir,
    protocol: getMandatoryEnvVarValue(scriptName, 'APIM_TEST_SERVER_PROTOCOL'),
    host: getMandatoryEnvVarValue(scriptName, 'APIM_TEST_SERVER_HOST'),
    port: getMandatoryEnvVarValueAsNumber(scriptName, 'APIM_TEST_SERVER_PORT'),  
    apiBase: getMandatoryEnvVarValue(scriptName, 'APIM_TEST_SERVER_API_BASE'),
    enableLogging: getOptionalEnvVarValueAsBoolean(scriptName, 'APIM_TEST_SERVER_ENABLE_LOGGING', true),
    rootUsername: getMandatoryEnvVarValue(scriptName, 'APIM_TEST_SERVER_ROOT_USER'),
    rootUserPassword: getMandatoryEnvVarValue(scriptName, 'APIM_TEST_SERVER_ROOT_USER_PWD'),
    testRootDir: testRootDir,
    standupMongoScript: path.join(testRootDir, 'mongodb/standup.mongo.sh'), 
    teardownMongoScript: path.join(testRootDir, 'mongodb/teardown.mongo.sh'), 
    startMongoScript: path.join(testRootDir, 'mongodb/start.mongo.sh'),
    stopMongoScript: path.join(testRootDir, 'mongodb/stop.mongo.sh'),
    bootstrapFiles: {
      apsUserListFile: path.join(bootstrapDataDir, 'apsUsers/apsUserList.json'),
      apsConnectorListFile: path.join(bootstrapDataDir, 'apsConfig/apsConnectors/apsConnectorList.json'),
      quickstart: {
        apsUserListFile: path.join(projectRootDir, 'quickstart/docker-volumes/apim-server/bootstrap/apsUsers/apsUserList.json'),
        apsConnectorListFile: path.join(projectRootDir, 'quickstart/docker-volumes/apim-server/bootstrap/apsConfig/apsConnectors/apsConnectorList.json'),  
      }
    },
  }
  return testEnv;
}
// init testEnv
export const TestEnv = setTestEnv(scriptDir);
TestLogger.logTestEnv(scriptName, TestEnv);
TestLogger.setLogging(TestEnv.enableLogging);
TestContext.setTestEnv(TestEnv);

before(async() => {
  TestContext.newItId();
  // test environment
  expect(fs.existsSync(TestEnv.testRootDir), TestLogger.createTestFailMessage(`testRootDir does not exist = ${TestEnv.testRootDir}`)).to.be.true;
  expect(fs.existsSync(TestEnv.standupMongoScript), TestLogger.createTestFailMessage(`standupMongoScript does not exist = ${TestEnv.standupMongoScript}`)).to.be.true;
  expect(fs.existsSync(TestEnv.teardownMongoScript), TestLogger.createTestFailMessage(`teardownMongoScript does not exist = ${TestEnv.teardownMongoScript}`)).to.be.true;
  expect(fs.existsSync(TestEnv.startMongoScript), TestLogger.createTestFailMessage(`startMongoScript does not exist = ${TestEnv.startMongoScript}`)).to.be.true;
  expect(fs.existsSync(TestEnv.stopMongoScript), TestLogger.createTestFailMessage(`stopMongoScript does not exist = ${TestEnv.stopMongoScript}`)).to.be.true;
  expect(fs.existsSync(TestEnv.bootstrapFiles.apsUserListFile), TestLogger.createTestFailMessage(`bootstrap file does not exist = ${TestEnv.bootstrapFiles.apsUserListFile}`)).to.be.true;
  expect(fs.existsSync(TestEnv.bootstrapFiles.apsConnectorListFile), TestLogger.createTestFailMessage(`bootstrap file does not exist = ${TestEnv.bootstrapFiles.apsConnectorListFile
  }`)).to.be.true;
  expect(fs.existsSync(TestEnv.bootstrapFiles.quickstart.apsUserListFile), TestLogger.createTestFailMessage(`bootstrap file does not exist = ${TestEnv.bootstrapFiles.quickstart.apsUserListFile}`)).to.be.true;
  expect(fs.existsSync(TestEnv.bootstrapFiles.quickstart.apsConnectorListFile), TestLogger.createTestFailMessage(`bootstrap file does not exist = ${TestEnv.bootstrapFiles.quickstart.apsConnectorListFile
  }`)).to.be.true;
  
  // start mongo
  const code = s.exec(TestEnv.standupMongoScript).code;
  // const code = s.exec(`${scriptDir}/mongodb/standup.mongo.sh `).code;
  expect(code, TestLogger.createTestFailMessage(`standup mongo, script=${TestEnv.standupMongoScript}`)).equal(0);
    // init OpenAPI
  const base: string = getBaseUrl(TestEnv.protocol, TestEnv.host, TestEnv.port, TestEnv.apiBase);
  ApimServerAPIClient.initialize(base);
});

after(async() => {
  TestContext.newItId();
  // stop mongo
  const code = s.exec(TestEnv.teardownMongoScript).code;
  // const code = s.exec(`${scriptDir}/mongodb/teardown.mongo.sh `).code;
  expect(code, TestLogger.createTestFailMessage(`teardown mongo, script=${TestEnv.teardownMongoScript}`)).equal(0);
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

