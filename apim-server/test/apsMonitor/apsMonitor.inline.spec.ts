import 'mocha';
import { expect } from 'chai';
import path from 'path';
import s from 'shelljs';
import _ from 'lodash';
import { TestContext, testHelperSleep, TestLogger } from './lib/test.helpers';
import { 
  ApiError, 
  APSStatus,
  ApsMonitorService,
  APSUser,
  EAPSAuthRole,
  ApsUsersService,
  APSError,
  APSErrorIds,
} from '../src/@solace-iot-team/apim-server-openapi-node';
import ServerMonitor from '../server/common/ServerMonitor';
import { MongoDatabaseAccess } from '../server/common/MongoDatabaseAccess';
import ServerConfig from '../server/common/ServerConfig';
import { ServerErrorFactory } from '../server/common/ServerError';
import { MongoClientOptions } from 'mongodb';


const scriptName: string = path.basename(__filename);
const scriptDir: string = path.dirname(__filename);
TestLogger.logMessage(scriptName, ">>> starting ...");

const apsUserTemplate: APSUser = {
  isActivated: true,
  userId: 'userId',
  password: 'password',
  profile: {
    email: 'email@aps.com',
    first: 'first',
    last: 'last'
  },
  roles: [ EAPSAuthRole.LOGIN_AS, EAPSAuthRole.SYSTEM_ADMIN ],
  memberOfOrganizations: [ 'org' ]
}

describe(`${scriptName}`, () => {
  context(`${scriptName}`, () => {

    beforeEach(() => {
      TestContext.newItId();
    });

    it(`${scriptName}: START: should test db connection and return status ready`, async () => {

      await ServerMonitor.testDBConnection();

      let apsStatus: APSStatus;
      try {
        apsStatus = await ApsMonitorService.getApsStatus();
        TestLogger.logMessageWithId(`apsStatus = ${JSON.stringify(apsStatus, null, 2)}`);
      } catch (e) {
        expect(e instanceof ApiError, `${TestLogger.createNotApiErrorMesssage(e.message)}`).to.be.true;
        expect(false, `${TestLogger.createTestFailMessage('failed')}`).to.be.true;
      }
      expect(apsStatus.isReady, TestLogger.createTestFailMessage(`server not ready`)).to.be.true;

    });

    it(`${scriptName}: should test for wrong connection strings`, async () => {
      const logName = `${scriptName}.TestForWrongConnectionString`;
      // const MongoConnectionString_WrongPort = "mongodb://localhost:28020/?retryWrites=true&w=majority";
      const orgConnectionString = ServerConfig.getMongoDBConfig().mongoConnectionString;
      const mongoClientOptions: MongoClientOptions = {
        connectTimeoutMS: 500,
        serverSelectionTimeoutMS: 500
      };  

      const connectionKVList: Array<{ key: string; value: string; expectedErrorName: string;}> = [
         {
           key: 'MongoConnectionString_WrongPort',
           value: 'mongodb://localhost:28020/?retryWrites=true&w=majority',
           expectedErrorName: 'MongoServerSelectionError'
         },
         {
          key: 'MongoConnectionString_Malformed_URL',
          value: 'mongodb:/localhost:27020/?retryWrites=true&w=majority',
          expectedErrorName: 'MongoParseError'
        },
        {
          key: 'MongoConnectionString_Authentication_Failure',
          value: 'mongodb://uname:pwd@localhost:27020/?retryWrites=true&w=majority',
          expectedErrorName: 'MongoServerError'
        },
     ];
      for(const connectionKV of connectionKVList) {
        try {
          ServerConfig.getMongoDBConfig().mongoConnectionString = connectionKV.value;
          await MongoDatabaseAccess.initialize(mongoClientOptions);
          expect(false, TestLogger.createTestFailMessage(`DB initialize should have failed`)).to.be.true;
        } catch(e) {
          const serverError = ServerErrorFactory.createServerError(e, logName);
          const serverErrorObject = serverError.toObject();  
          TestLogger.logMessageWithId(`key = ${connectionKV.key}, serverErrorObject = ${JSON.stringify(serverErrorObject, null, 2)}`);
          expect(serverErrorObject, `${TestLogger.createTestFailMessage('wrong serverError')}`).to.haveOwnProperty('originalError');
          expect(serverErrorObject.originalError, `${TestLogger.createTestFailMessage('wrong serverError')}`).to.haveOwnProperty('name');
          expect(serverErrorObject.originalError.name, `${TestLogger.createTestFailMessage('wrong serverError')}`).to.equal(connectionKV.expectedErrorName);
        }  
      }
      // restore server
      try {
        ServerConfig.getMongoDBConfig().mongoConnectionString = orgConnectionString;
        await MongoDatabaseAccess.initialize(mongoClientOptions);
      } catch(e) {
        const serverError = ServerErrorFactory.createServerError(e, logName);
        expect(false, TestLogger.createTestFailMessage(`DB should have initialized again, serverError = ${JSON.stringify(serverError.toObject(), null, 2)}`)).to.be.true;
      }
    });


    // ****************************************************************************************************************
    // * DB down *
    // ****************************************************************************************************************

    it(`${scriptName}: suspend connection monitors`, async () => {
      TestLogger.logMessageWithId(`suspending connection monitors`);
      ServerMonitor.suspendConnectionMonitors();
    });

    it(`${scriptName}: should stop mongo db`, async () => {
      TestLogger.logMessageWithId(`stop mongo`);
      let code = s.exec(`${scriptDir}/mongodb/stop.mongo.sh `).code;
      expect(code, TestLogger.createTestFailMessage('stop mongo')).equal(0);
    });

    it(`${scriptName}: should handle api call with db down, undetected yet`, async () => {
      try {
        await ApsUsersService.listApsUsers({});
        expect(false, TestLogger.createTestFailMessage('should never get here')).to.be.true;
      } catch (e) {
        expect(e instanceof ApiError, `${TestLogger.createNotApiErrorMesssage(e.message)}`).to.be.true;
        const apiError: ApiError = e;
        expect(apiError.status, TestLogger.createTestFailMessage('status code')).equal(500);
        const apsError: APSError = apiError.body;
        expect(apsError.errorId, TestLogger.createTestFailMessage('incorrect errorId')).equal(APSErrorIds.INTERNAL_SERVER_ERROR);
      }
    });

    it(`${scriptName}: should handle api call with db down, detected`, async () => {

      await ServerMonitor.testDBConnection();

      try {
        await ApsUsersService.listApsUsers({});
        expect(false, TestLogger.createTestFailMessage('should never get here')).to.be.true;
      } catch (e) {
        expect(e instanceof ApiError, `${TestLogger.createNotApiErrorMesssage(e.message)}`).to.be.true;
        const apiError: ApiError = e;
        expect(apiError.status, TestLogger.createTestFailMessage('status code')).equal(500);
        const apsError: APSError = apiError.body;
        expect(apsError.errorId, TestLogger.createTestFailMessage('incorrect errorId')).equal(APSErrorIds.SERVER_NOT_OPERATIONAL);
        expect(apsError.meta, TestLogger.createTestFailMessage('check meta')).to.haveOwnProperty('status');
        const apsStatus: APSStatus = (apsError.meta.status as unknown) as APSStatus;
        expect(apsStatus.isReady, TestLogger.createTestFailMessage('isReady')).to.be.false;
      }
    });

    it(`${scriptName}: test db connection: should return status db connection error`, async () => {

      await ServerMonitor.testDBConnection();

      let apsStatus: APSStatus;
      let i = 0;
      do {
        i = i + 1;
        apsStatus = await ApsMonitorService.getApsStatus();
        TestLogger.logMessageWithId(`i=${i}, apsStatus = ${JSON.stringify(apsStatus, null, 2)}`);
        await testHelperSleep(2000);
      } while (apsStatus.isReady && i <= 10);
      expect(apsStatus.isReady, TestLogger.createTestFailMessage(`server should not be ready`)).to.be.false;
    });

    it(`${scriptName}: should fail creating a user`, async () => {
      let created: APSUser;
      try {
        created = await ApsUsersService.createApsUser({
          requestBody: apsUserTemplate
        });
        expect(false, `${TestLogger.createTestFailMessage('test failed')}`).to.be.true;
      } catch (e) {
        expect(e instanceof ApiError, `${TestLogger.createNotApiErrorMesssage(e.message)}`).to.be.true;
        const apiError: ApiError = e;
        expect(apiError.status, TestLogger.createTestFailMessage('status code')).equal(500);
        const apsError: APSError = apiError.body;
        expect(apsError.errorId, TestLogger.createTestFailMessage('incorrect errorId')).equal(APSErrorIds.SERVER_NOT_OPERATIONAL);
        expect(apsError.meta, TestLogger.createTestFailMessage('check meta')).to.haveOwnProperty('status');
        const apsStatus: APSStatus = (apsError.meta.status as unknown) as APSStatus;
        expect(apsStatus.isReady, TestLogger.createTestFailMessage('isReady')).to.be.false;
      }
    });

    // ****************************************************************************************************************
    // * start the system again *
    // ****************************************************************************************************************
    it(`${scriptName}: should start mongo and re-initialize server`, async () => {
      TestLogger.logMessageWithId(`start mongo`);
      const code = s.exec(`${scriptDir}/mongodb/start.mongo.sh `).code;
      expect(code, TestLogger.createTestFailMessage('start mongo')).equal(0);

      // test and initializes server if failed
      await ServerMonitor.doConnectionTests();
    });

    it(`${scriptName}: END: should return status ready`, async () => {
      let apsStatus: APSStatus;
      try {
        apsStatus = await ApsMonitorService.getApsStatus();
        TestLogger.logMessageWithId(`apsStatus = ${JSON.stringify(apsStatus, null, 2)}`);
      } catch (e) {
        expect(e instanceof ApiError, `${TestLogger.createNotApiErrorMesssage(e.message)}`).to.be.true;
        expect(false, `${TestLogger.createTestFailMessage('failed')}`).to.be.true;
      }
      expect(apsStatus.isReady, TestLogger.createTestFailMessage(`server not ready`)).to.be.true;
    });


  });
});


