import "mocha";
import path from 'path';
import { 
  getBaseUrl, 
  getMandatoryEnvVarValue, 
  getMandatoryEnvVarValueAsNumber, 
  getOptionalEnvVarValueAsBoolean, 
  TestContext, 
  TestLogger, 
  TTestEnv 
} from './lib/test.helpers';
import { ApimServerAPIClient } from './lib/api.helpers'


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


