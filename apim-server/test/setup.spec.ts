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
  ApsConfigService,
  APSConnector,
  APSConnectorStatus,
  ApsMonitorService, 
  APSStatus,
} from '../src/@solace-iot-team/apim-server-openapi-node';
import ServerConfig, { EAuthConfigType } from "../server/common/ServerConfig";
import { TestApsOrganizationUtils } from "./lib/TestApsOrganizationsUtils";
import {
  OpenAPI as ConnectorOpenAPI,
  ApiError
} from '@solace-iot-team/apim-connector-openapi-node';

// ensure any unhandled exception cause exit = 1
function onUncaught(err: any){
  console.log(err);
  process.exit(1);
}
process.on('unhandledRejection', onUncaught);

const scriptName: string = path.basename(__filename);
const scriptDir: string = path.dirname(__filename);

TestLogger.setLogging(true);
TestLogger.logMessage(scriptName, ">>> initializing ...");

const setTestEnv = (scriptDir: string): TTestEnv => { 
  let testRootDir = scriptDir;
  if(!scriptDir.includes('test')) testRootDir = path.join(scriptDir, 'test');
  const projectRootDir = path.join(testRootDir, '../..');
  const bootstrapDataDir = path.join(testRootDir, './data/bootstrap');
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
    startServicesScript: path.join(testRootDir, 'services/start.sh'),  
    stopServicesScript: path.join(testRootDir, 'services/stop.sh'),  
    startMongoScript: path.join(testRootDir, 'services/start.mongo.sh'),
    stopMongoScript: path.join(testRootDir, 'services/stop.mongo.sh'),
    bootstrapFiles: {
      // apsUserListFile: path.join(bootstrapDataDir, 'apsUsers/apsUserList.json'),
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
  expect(fs.existsSync(TestEnv.startServicesScript), TestLogger.createTestFailMessage(`startServicesScript does not exist = ${TestEnv.startServicesScript}`)).to.be.true;
  expect(fs.existsSync(TestEnv.stopServicesScript), TestLogger.createTestFailMessage(`stopServicesScript does not exist = ${TestEnv.stopServicesScript}`)).to.be.true;
  expect(fs.existsSync(TestEnv.startMongoScript), TestLogger.createTestFailMessage(`startMongoScript does not exist = ${TestEnv.startMongoScript}`)).to.be.true;
  expect(fs.existsSync(TestEnv.stopMongoScript), TestLogger.createTestFailMessage(`stopMongoScript does not exist = ${TestEnv.stopMongoScript}`)).to.be.true;
  // expect(fs.existsSync(TestEnv.bootstrapFiles.apsUserListFile), TestLogger.createTestFailMessage(`bootstrap file does not exist = ${TestEnv.bootstrapFiles.apsUserListFile}`)).to.be.true;
  expect(fs.existsSync(TestEnv.bootstrapFiles.apsConnectorListFile), TestLogger.createTestFailMessage(`bootstrap file does not exist = ${TestEnv.bootstrapFiles.apsConnectorListFile}`)).to.be.true;
  expect(fs.existsSync(TestEnv.bootstrapFiles.quickstart.apsConnectorListFile), TestLogger.createTestFailMessage(`bootstrap file does not exist = ${TestEnv.bootstrapFiles.quickstart.apsConnectorListFile}`)).to.be.true;
  
  // start services
  const code = s.exec(TestEnv.startServicesScript).code;
  expect(code, TestLogger.createTestFailMessage(`start services, script=${TestEnv.startServicesScript}`)).equal(0);
  // // start mongo
  // const code = s.exec(TestEnv.standupMongoScript).code;
  // // const code = s.exec(`${scriptDir}/mongodb/standup.mongo.sh `).code;
  // expect(code, TestLogger.createTestFailMessage(`standup mongo, script=${TestEnv.standupMongoScript}`)).equal(0);

  // init OpenAPI
  const base: string = getBaseUrl(TestEnv.protocol, TestEnv.host, TestEnv.port, TestEnv.apiBase);
  ApimServerAPIClient.initialize(base);
});

after(async() => {
  TestContext.newItId();
  // stop services

  const code = s.exec(TestEnv.stopServicesScript).code;
  expect(code, TestLogger.createTestFailMessage(`stop services, script=${TestEnv.stopServicesScript}`)).equal(0);

  // previous
  // const code = s.exec(`${scriptDir}/mongodb/teardown.mongo.sh `).code;
  // expect(code, TestLogger.createTestFailMessage(`stop services, script=${TestEnv.stopServicesScript}`)).equal(0);
  // // stop mongo
  // const code = s.exec(TestEnv.teardownMongoScript).code;
  // // const code = s.exec(`${scriptDir}/mongodb/teardown.mongo.sh `).code;
  // expect(code, TestLogger.createTestFailMessage(`teardown mongo, script=${TestEnv.teardownMongoScript}`)).equal(0);
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
        await testHelperSleep(1000);
      } while (!apsStatus.isReady && i <= 5);
      expect(apsStatus.isReady, TestLogger.createTestFailMessage(`server not ready after i=${i} tries`)).to.be.true;
    });

    // /**
    //  * TODO: add creating a service account (with all roles) as root ==> use the service account as the main TEST token for all tests
    //  */
    // it(`${scriptName}: should login as root user`, async() => {
    //   const isInternalIdp: boolean = ServerConfig.getAuthConfig().type === EAuthConfigType.INTERNAL;
    //   if(isInternalIdp) {
    //     // login as root and use the bearer token in open api
    //     const apsSessionLoginResponse: APSSessionLoginResponse = await ApsSessionService.apsLogin({
    //       requestBody: {
    //         username: TestEnv.rootUsername,
    //         password: TestEnv.rootUserPassword
    //       }
    //     });
    //     ApimServerAPIClient.setCredentials({ bearerToken: apsSessionLoginResponse.token });
    //   }
    // });
    
    // it(`${scriptName}: should create service account and set credentials`, async() => {
    //   await ApimServerAPIClient.setServiceAccountCredentials();
    // });

    it(`${scriptName}: should test active connector exists in cache`, async() => {
      const active_in_DB_APSConnector: APSConnector = await ApsConfigService.getActiveApsConnector();
      TestLogger.logMessageWithId(`active_in_DB_APSConnector = ${JSON.stringify(active_in_DB_APSConnector, null, 2)}`);
      const cached_active_APSConnector = ServerConfig.getConnectorConfig();
      TestLogger.logMessageWithId(`cached_active_APSConnector = ${JSON.stringify(cached_active_APSConnector, null, 2)}`);
      expect(cached_active_APSConnector, TestLogger.createTestFailMessage('cached connector not equal to DB connector')).to.deep.equal(active_in_DB_APSConnector);
    });

    it(`${scriptName}: should test connector is ready`, async() => {
      TestLogger.logMessageWithId(`ConnectorOpenAPI = ${JSON.stringify(ConnectorOpenAPI, null, 2)}`);
      const apsConnectorStatus: APSConnectorStatus = await ApsMonitorService.getApsConnectorStatus({});
      TestLogger.logMessageWithId(`apsConnectorStatus = ${JSON.stringify(apsConnectorStatus, null, 2)}`);
      expect(apsConnectorStatus.connectorHealthCheckStatus, 'failed').to.eq('ok');
    });

    it(`${scriptName}: should initialize aps server open api`, async() => {
      const isInternalIdp: boolean = ServerConfig.getAuthConfig().type === EAuthConfigType.INTERNAL;
      if(isInternalIdp) {
        ApimServerAPIClient.initializeAuthConfigInternal({ 
          host: TestEnv.host, 
          port: TestEnv.port,
          protocol: TestEnv.protocol
        });
      } else {
        expect(false, `unsupported ServerConfig.getAuthConfig().type=${ServerConfig.getAuthConfig().type}`);
      }
    });

  });
});

