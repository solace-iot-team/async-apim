import 'mocha';
import { expect } from 'chai';
import request from 'supertest';
import Server from '../server/index';
import path from 'path';
import _ from 'lodash';
import { TestContext, testHelperSleep, TestLogger } from './lib/test.helpers';
import { 
  ApiError, 
  APSError, 
  APSErrorIds, 
  APSListResponseMeta, 
  APSConnector, 
  APSConnectorCreate, 
  APSConnectorReplace, 
  ApsConfigService, 
  EAPSClientProtocol, 
  APSId,
  ListApsConnectorsResponse,
  APSLocationConfigExternal,
  APSLocationConfigInternalProxy
} from '../src/@solace-iot-team/apim-server-openapi-node';


const scriptName: string = path.basename(__filename);
TestLogger.logMessage(scriptName, ">>> starting ...");

const numberOfConnectors: number = 10;
APSLocationConfigExternal
const apsConnectorTemplate: APSConnector = {
  connectorId: 'connectorId',
  displayName: 'displayName',
  description: 'description',
  isActive: true,
  connectorClientConfig: {
    locationConfig: {
      configType: APSLocationConfigExternal.configType.EXTERNAL,
      protocol: EAPSClientProtocol.HTTP,
      host: 'host.com',
      port: 3000  
    },
    apiVersion: 'apiVersion',
    serviceUser: 'serviceUser',
    serviceUserPwd: 'serviceUserPwd'
  }
}

describe(`${scriptName}`, () => {
  context(`${scriptName}`, () => {

    const apiStartupBase = `${TestContext.getApiBase()}/apsUsers`; 
    const apiBase = `${TestContext.getApiBase()}/apsConfig/apsConnectors`;

    beforeEach(() => {
      TestContext.newItId();
    });

    after(async() => {
      try {
        const result: ListApsConnectorsResponse = await ApsConfigService.listApsConnectors();
        const apsConnectorList: Array<APSConnector> = result.list;
        for (const apsConnector of apsConnectorList) {
          await ApsConfigService.deleteApsConnector({
            connectorId: apsConnector.connectorId
          });
        }
      } catch (e) {
        expect(e instanceof ApiError, `${TestLogger.createNotApiErrorMesssage(e.message)}`).to.be.true;
        expect(false, `${TestLogger.createTestFailMessage('failed')}`).to.be.true;
      }
    });

    it(`${scriptName}: should start server`, async() => {
      const res = await request(Server).get(apiStartupBase);
      TestLogger.logMessageWithId(`res = ${JSON.stringify(res, null, 2)}\nbody-json = ${JSON.stringify(JSON.parse(res.text), null, 2)}`);
      expect(res.status, TestLogger.createTestFailMessage('status code')).equal(200);

      // TODO: need to wait until initialized & bootstrapping is finished ==> server ready
      testHelperSleep(2000);

    });

    // ****************************************************************************************************************
    // * OpenApi API Tests *
    // ****************************************************************************************************************

    it(`${scriptName}: should list connectors`, async () => {
      let receivedTotalCount: number = 0;
      let reportedTotalCount: number;
      try {
        const resultList: ListApsConnectorsResponse  = await ApsConfigService.listApsConnectors();
        receivedTotalCount += resultList.list.length;
        reportedTotalCount = resultList.meta.totalCount;
      } catch (e) {
        expect(e instanceof ApiError, `${TestLogger.createNotApiErrorMesssage(e.message)}`).to.be.true;
        expect(false, `${TestLogger.createTestFailMessage('failed')}`).to.be.true;
      }
      expect(receivedTotalCount, 'number of objects received not the same as reported totalCount').equal(reportedTotalCount);
    });

    it(`${scriptName}: should delete all connectors`, async () => {
      let finalList: Array<APSConnector>;
      let finalMeta: APSListResponseMeta;
      try {
        const result: ListApsConnectorsResponse  = await ApsConfigService.listApsConnectors();
        const apsConnectorList: Array<APSConnector> = result.list;
        for (const apsConnector of apsConnectorList) {

          await ApsConfigService.deleteApsConnector({
            connectorId: apsConnector.connectorId
          });
        }
        const { list, meta } = await ApsConfigService.listApsConnectors();
        finalList = list;
        finalMeta = { meta: meta };
      } catch (e) {
        expect(e instanceof ApiError, `${TestLogger.createNotApiErrorMesssage(e.message)}`).to.be.true;
        expect(false, `${TestLogger.createTestFailMessage('failed')}`).to.be.true;
      }
      expect(finalList, `${TestLogger.createTestFailMessage('type of array')}`).to.be.an('array');
      expect(finalList, `${TestLogger.createTestFailMessage('empty array')}`).to.be.empty;
      expect(finalMeta.meta.totalCount, `${TestLogger.createTestFailMessage('totalCount not zero')}`).equal(0);
    });

    it(`${scriptName}: should create a number of connectors from template`, async () => {
      const { isActive, ...apsConnectorCreateTemplate } = apsConnectorTemplate;
      try {
        for (let i=0; i < numberOfConnectors; i++) {
          const apsConnectorCreate: APSConnectorCreate = {
            ...apsConnectorCreateTemplate,
            connectorId: apsConnectorTemplate.connectorId + '_' + i,
          }
          const created: APSConnector = await ApsConfigService.createApsConnector({
            requestBody: apsConnectorCreate
          });
          expect(created.isActive, 'isActive not false').equal(false);
        }
      } catch (e) {
        expect(e instanceof ApiError, `${TestLogger.createNotApiErrorMesssage(e.message)}`).to.be.true;
        expect(false, `${TestLogger.createTestFailMessage('failed')}`).to.be.true;
      }
    });

    it(`${scriptName}: should list created connectors`, async () => {
      let receivedTotalCount: number = 0;
      let reportedTotalCount: number;
      try {
        const resultList: ListApsConnectorsResponse  = await ApsConfigService.listApsConnectors();
        receivedTotalCount += resultList.list.length;
        reportedTotalCount = resultList.meta.totalCount;
      } catch (e) {
        expect(e instanceof ApiError, `${TestLogger.createNotApiErrorMesssage(e.message)}`).to.be.true;
        expect(false, `${TestLogger.createTestFailMessage('failed')}`).to.be.true;
      }
      expect(receivedTotalCount, 'number of objects received not the same as reported totalCount').equal(reportedTotalCount);
      expect(receivedTotalCount, 'number of objects received not the same as numberOfConnectors created').equal(numberOfConnectors);
    });

    it(`${scriptName}: should return duplicate key error`, async() => {
      let response: APSConnector;
      try {
        response = await ApsConfigService.createApsConnector({
          requestBody: apsConnectorTemplate
        });
        response = await ApsConfigService.createApsConnector({
          requestBody: apsConnectorTemplate
        });
      } catch (e) {
        expect(e instanceof ApiError, `${TestLogger.createNotApiErrorMesssage(e.message)}`).to.be.true;
        const apiError: ApiError = e;
        expect(apiError.status, 'expecting 422').equal(422);
        const apsError: APSError = apiError.body;
        expect(apsError.errorId, 'incorrect errorId').equal(APSErrorIds.DUPLICATE_KEY);
      }
    });

    it(`${scriptName}: should get 1 connector`, async() => {
      let apsConnector: APSConnector;
      try {
        apsConnector = await ApsConfigService.getApsConnector({
          connectorId: apsConnectorTemplate.connectorId
        });
      } catch (e) {
        expect(e instanceof ApiError, `${TestLogger.createNotApiErrorMesssage(e.message)}`).to.be.true;
        expect(false, `${TestLogger.createTestFailMessage('failed')}`).to.be.true;
      }
      const compare: APSConnector = {
        ...apsConnectorTemplate,
        isActive: false
      }
      expect(apsConnector, `${TestLogger.createTestFailMessage('response equals request')}`).to.deep.equal(compare);
    });

    it(`${scriptName}: should not find connector`, async() => {
      let apsConnector: APSConnector;
      try {
        apsConnector = await ApsConfigService.getApsConnector({
          connectorId: "unknown_connector_id"
        });
      } catch (e) {
        expect(e instanceof ApiError, `${TestLogger.createNotApiErrorMesssage(e.message)}`).to.be.true;
        const apiError: ApiError = e;
        expect(apiError.status, 'status code').equal(404);
        const apsError: APSError = apiError.body;
        expect(apsError.errorId, 'incorrect errorId').equal(APSErrorIds.KEY_NOT_FOUND);
      }
    });

    it(`${scriptName}: should replace connector`, async() => {
      let replaced: APSConnector;
      const connectorId = apsConnectorTemplate.connectorId;
      const replaceRequest: APSConnectorReplace = {
        displayName: 'replaced',
        description: 'replaced',
        connectorClientConfig: {
          serviceUser: 'replaced',
          serviceUserPwd: 'replaced',
          apiVersion: 'replaced',
          locationConfig: {
            configType: APSLocationConfigExternal.configType.EXTERNAL,
            host: 'replaced.host.com',
            port: 0,
            protocol: EAPSClientProtocol.HTTPS
          }
        }
      }
      const target: APSConnector = {
        ...replaceRequest,
        connectorId: connectorId,
        isActive: false
      }
      try {
        replaced = await ApsConfigService.replaceApsConnector({
          connectorId: connectorId, 
          requestBody: replaceRequest
        });
      } catch (e) {
        expect(e instanceof ApiError, `${TestLogger.createNotApiErrorMesssage(e.message)}`).to.be.true;
        expect(false, `${TestLogger.createTestFailMessage('failed')}`).to.be.true;
      }
      expect(replaced, TestLogger.createLogMessage('connector not replaced correctly')).to.deep.equal(target);
    });

    it(`${scriptName}: should not find active connector`, async() => {
      let apsConnector: APSConnector;
      try {
        apsConnector = await ApsConfigService.getActiveApsConnector();
      } catch (e) {
        expect(e instanceof ApiError, `${TestLogger.createNotApiErrorMesssage(e.message)}`).to.be.true;
        const apiError: ApiError = e;
        expect(apiError.status, 'status code').equal(404);
        const apsError: APSError = apiError.body;
        expect(apsError.errorId, 'incorrect errorId').equal(APSErrorIds.OBJECT_NOT_FOUND);
      }
    });

    it(`${scriptName}: should set active connector`, async() => {
      let apsConnector: APSConnector;
      const connectorId: APSId = apsConnectorTemplate.connectorId;
      try {
        apsConnector = await ApsConfigService.replaceApsConnector({
          connectorId: connectorId, 
          requestBody: apsConnectorTemplate
        });
        apsConnector = await ApsConfigService.setApsConnectorActive({
          connectorId: connectorId
        });
        apsConnector = await ApsConfigService.getActiveApsConnector();
      } catch (e) {
        expect(e instanceof ApiError, `${TestLogger.createNotApiErrorMesssage(e.message)}`).to.be.true;
        expect(false, `${TestLogger.createTestFailMessage('failed')}`).to.be.true;
      }
      expect(apsConnector.connectorId, TestLogger.createLogMessage('unexpected connector is active')).equal(connectorId);
    });

    it(`${scriptName}: should set new active connector`, async() => {
      let apsConnector: APSConnector;
      const connectorId: APSId = apsConnectorTemplate.connectorId + '_0';
      try {
        apsConnector = await ApsConfigService.setApsConnectorActive({
          connectorId: connectorId
        });
        apsConnector = await ApsConfigService.getActiveApsConnector();
      } catch (e) {
        expect(e instanceof ApiError, `${TestLogger.createNotApiErrorMesssage(e.message)}`).to.be.true;
        expect(false, `${TestLogger.createTestFailMessage('failed')}`).to.be.true;
      }
      expect(apsConnector.connectorId, TestLogger.createLogMessage('unexpected connector is active')).equal(connectorId);
    });

    it(`${scriptName}: should accept host=localhost`, async () => {
      const connectorId: APSId = apsConnectorTemplate.connectorId;
      const toReplace: APSConnectorReplace = {
        ...apsConnectorTemplate,
        connectorClientConfig: {
          ...apsConnectorTemplate.connectorClientConfig,
          locationConfig: {
            configType: APSLocationConfigExternal.configType.EXTERNAL,
            host: 'localhost',
            port: 80,
            protocol: EAPSClientProtocol.HTTP
          }
        }
      };
      try {
        const result: APSConnector  = await ApsConfigService.replaceApsConnector({
          connectorId: connectorId, 
          requestBody: toReplace
        });
      } catch (e) {
        expect(e instanceof ApiError, `${TestLogger.createNotApiErrorMesssage(e.message)}`).to.be.true;
        expect(false, `${TestLogger.createTestFailMessage('failed')}`).to.be.true;
      }      
    });

    it(`${scriptName}: should accept minimal config`, async () => {
      const connectorId: APSId = apsConnectorTemplate.connectorId;
      const toReplace: APSConnectorReplace = {
        ...apsConnectorTemplate,
        connectorClientConfig: {
          locationConfig: {
            configType: APSLocationConfigInternalProxy.configType.INTERNAL_PROXY
          },
          apiVersion: 'v1',
          serviceUser: 'serviceUser',
          serviceUserPwd: 'servicePassword'
        }
      };
      try {
        const result: APSConnector  = await ApsConfigService.replaceApsConnector({
          connectorId: connectorId, 
          requestBody: toReplace
        });
      } catch (e) {
        expect(e instanceof ApiError, `${TestLogger.createNotApiErrorMesssage(e.message)}`).to.be.true;
        expect(false, `${TestLogger.createTestFailMessage('failed')}`).to.be.true;
      }      
    });

    it(`${scriptName}: should accept & return basePath`, async () => {
      const connectorId: APSId = apsConnectorTemplate.connectorId;
      const toReplace: APSConnectorReplace = {
        ...apsConnectorTemplate,
        connectorClientConfig: {
          locationConfig: {
            configType: APSLocationConfigInternalProxy.configType.INTERNAL_PROXY
          },
          apiVersion: 'v1',
          serviceUser: 'serviceUser',
          serviceUserPwd: 'servicePassword',
          basePath: 'basePath'
        }
      };
      let result: APSConnector;
      try {
        result = await ApsConfigService.replaceApsConnector({
          connectorId: connectorId, 
          requestBody: toReplace
        });
      } catch (e) {
        expect(e instanceof ApiError, `${TestLogger.createNotApiErrorMesssage(e.message)}`).to.be.true;
        expect(false, `${TestLogger.createTestFailMessage('failed')}`).to.be.true;
      }      
      const compare: APSConnector = {
        ...toReplace,
        connectorId: connectorId,
        isActive: false
      }
      expect(result, `${TestLogger.createLogMessage('response equals request')}`).to.deep.equal(compare);
    });

    // ****************************************************************************************************************
    // * Raw API Tests *
    // ****************************************************************************************************************

    it(`${scriptName}: create connector should return openapi validation error for external location config`, async() => {
      const toCreate = {
        connectorId: 'requestValidationError',
        displayName: 'displayName',
        connectorClientConfig: {
          locationConfig: {
            configType: APSLocationConfigExternal.configType.EXTERNAL,
            protocol: EAPSClientProtocol.HTTP
          }
        }
      }
      const res = await request(Server)
        .post(apiBase)
        .send(toCreate);

      TestContext.setFromSuperTestRequestResponse(res);
      // TestLogger.logMessageWithId(`res = ${JSON.stringify(res, null, 2)}\nbody-json = ${JSON.stringify(JSON.parse(res.text), null, 2)}`);

      expect(res.status, TestLogger.createTestFailMessage('status code')).equal(400);
      expect(res.body, TestLogger.createTestFailMessage('body.errorId')).to.be.an('object').that.has.property('errorId').equal('openApiRequestValidation');
      expect(res.body, TestLogger.createTestFailMessage('body.meta')).to.have.property('meta').to.be.an('object');
      expect(res.body.meta, TestLogger.createTestFailMessage('body.meta.errors length')).to.have.property('errors').to.be.an('array').of.length(8);
      expect(JSON.stringify(res.body.meta), TestLogger.createTestFailMessage('body.meta.description')).contains('description');
      expect(JSON.stringify(res.body.meta), TestLogger.createTestFailMessage('body.meta.apiUserPwd')).contains('connectorClientConfig');
    });

    it(`${scriptName}: create connector should return openapi validation error`, async() => {
      const toCreate = {
        connectorId: 'requestValidationError',
        displayName: 'displayName',
        connectorClientConfig: {
          host: 'host.org.com'
        }
      }
      const res = await request(Server)
        .post(apiBase)
        .send(toCreate);

      TestContext.setFromSuperTestRequestResponse(res);
      // TestLogger.logMessageWithId(`res = ${JSON.stringify(res, null, 2)}\nbody-json = ${JSON.stringify(JSON.parse(res.text), null, 2)}`);

      expect(res.status, TestLogger.createTestFailMessage('status code')).equal(400);
      expect(res.body, TestLogger.createTestFailMessage('body.errorId')).to.be.an('object').that.has.property('errorId').equal('openApiRequestValidation');
      expect(res.body, TestLogger.createTestFailMessage('body.meta')).to.have.property('meta').to.be.an('object');
      expect(res.body.meta, TestLogger.createTestFailMessage('body.meta.errors length')).to.have.property('errors').to.be.an('array').of.length(5);
      expect(JSON.stringify(res.body.meta), TestLogger.createTestFailMessage('body.meta.description')).contains('description');
      expect(JSON.stringify(res.body.meta), TestLogger.createTestFailMessage('body.meta.apiUserPwd')).contains('serviceUserPwd');
    });

    xit(`${scriptName}: should return forbidden`, async() => {
      // TODO: here or in openapi?
    });

    // xit(`${scriptName}: should return unauthorized request`, async() => {
    //   // TODO
    // });

    // xit(`${scriptName}: should return forbidden request`, async() => {
    //   // TODO
    // });

  });
});

