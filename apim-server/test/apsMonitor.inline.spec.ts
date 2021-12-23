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
} from '../src/@solace-iot-team/apim-server-openapi-node';
import ServerMonitor from '../server/common/ServerMonitor';
import { initializeComponents } from '../server/index';


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

    // ****************************************************************************************************************
    // * DB down *
    // ****************************************************************************************************************

    it(`${scriptName}: should stop mongo db`, async () => {

      TestLogger.logMessageWithId(`stop mongo`);
      let code = s.exec(`${scriptDir}/mongodb/stop.mongo.sh `).code;
      expect(code, TestLogger.createTestFailMessage('stop mongo')).equal(0);

    });

    it(`${scriptName}: should return status db connection error`, async () => {

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
        expect(apiError.status, 'status code').equal(500);
      }
    });

    // ****************************************************************************************************************
    // * start the system again *
    // ****************************************************************************************************************
    it(`${scriptName}: should start mongo and re-initialize server`, async () => {
      TestLogger.logMessageWithId(`start mongo`);
      const code = s.exec(`${scriptDir}/mongodb/start.mongo.sh `).code;
      expect(code, TestLogger.createTestFailMessage('start mongo')).equal(0);
      await initializeComponents();
    });

    it(`${scriptName}: END: should test db connection and return status ready`, async () => {

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


  });
});


