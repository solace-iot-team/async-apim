import 'mocha';
import { expect } from 'chai';
import request from 'supertest';
import Server from '../../server/index';
import path from 'path';
import _ from 'lodash';
import { TestContext, TestLogger } from '../lib/test.helpers';
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
} from '../../src/@solace-iot-team/apim-server-openapi-node';
import ServerConfig from '../../server/common/ServerConfig';


const scriptName: string = path.basename(__filename);
TestLogger.logMessage(scriptName, ">>> starting ...");

const ConnectorId_1 = "connectorId_01";
const ConnectorId_1_Host = "connectorId-01.test.com";
const ConnectorId_1_Port = 1111;
const ConnectorId_2 = "connectorId_02";
const ConnectorId_2_Host = "connectorId-02.test.com";
const ConnectorId_2_Port = 2222;
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
    // serviceUser: 'serviceUser',
    // serviceUserPwd: 'serviceUserPwd'
  }
}

describe(`${scriptName}`, () => {
  context(`${scriptName}`, () => {

    beforeEach(() => {
      TestContext.newItId();
    });

    // after(async() => {
    //   TestContext.newItId();      
    //   try {
    //     const result: ListApsConnectorsResponse = await ApsConfigService.listApsConnectors();
    //     const apsConnectorList: Array<APSConnector> = result.list;
    //     for (const apsConnector of apsConnectorList) {
    //       await ApsConfigService.deleteApsConnector({
    //         connectorId: apsConnector.connectorId
    //       });
    //     }
    //   } catch (e) {
    //     expect(e instanceof ApiError, `${TestLogger.createNotApiErrorMesssage(e.message)}`).to.be.true;
    //     expect(false, `${TestLogger.createTestFailMessage('failed')}`).to.be.true;
    //   }
    // });

    // ****************************************************************************************************************
    // * OpenApi API Tests *
    // ****************************************************************************************************************

    it(`${scriptName}: should create two connectors`, async () => {
      const { isActive, ...apsConnectorCreateTemplate } = apsConnectorTemplate;
      try {
        await ApsConfigService.createApsConnector({
          requestBody: {
            ...apsConnectorCreateTemplate,
            connectorId: ConnectorId_1,
            connectorClientConfig: {
              ...apsConnectorCreateTemplate.connectorClientConfig,
              locationConfig: {
                configType: APSLocationConfigExternal.configType.EXTERNAL,
                host: ConnectorId_1_Host,
                protocol: EAPSClientProtocol.HTTP,
                port: ConnectorId_1_Port     
              }
            }
          }
        });
        await ApsConfigService.createApsConnector({
          requestBody: {
            ...apsConnectorCreateTemplate,
            connectorId: ConnectorId_2,
            connectorClientConfig: {
              ...apsConnectorCreateTemplate.connectorClientConfig,
              locationConfig: {
                configType: APSLocationConfigExternal.configType.EXTERNAL,
                host: ConnectorId_2_Host,
                protocol: EAPSClientProtocol.HTTP,
                port: ConnectorId_2_Port            
              }
            }
          }
        });
        // const activeConnectorTarget: string = ServerConfig.getActiveConnectorTarget();
        // expect(false, TestLogger.createLogMessage(`activeConnectorTarget='${activeConnectorTarget}'`)).to.be.true;
        const connectorConfig: APSConnector = ServerConfig.getConnectorConfig()
        expect(connectorConfig, TestLogger.createLogMessage(`connectorConfig='${JSON.stringify(connectorConfig, null, 2)}'`)).to.be.undefined;
      } catch (e) {
        expect(e instanceof ApiError, `${TestLogger.createNotApiErrorMesssage(e.message)}`).to.be.true;
        expect(false, `${TestLogger.createTestFailMessage('failed')}`).to.be.true;
      }
    });

    it(`${scriptName}: should set 01 active`, async () => {
      try {
        await ApsConfigService.setApsConnectorActive({ 
          connectorId: ConnectorId_1
        });
        const activeConnectorTarget: string = ServerConfig.getActiveConnectorTarget();
        // activeConnectorTarget='http://host.com:3000/v1'
        const expectedTarget = `${EAPSClientProtocol.HTTP}://${ConnectorId_1_Host}:${ConnectorId_1_Port}/v1`;
        expect(activeConnectorTarget, TestLogger.createLogMessage(`activeConnectorTarget='${activeConnectorTarget}'`)).to.eq(expectedTarget);
        const connectorConfig: APSConnector = ServerConfig.getConnectorConfig();
        expect(connectorConfig.connectorId, TestLogger.createLogMessage(`connectorConfig='${JSON.stringify(connectorConfig, null, 2)}'`)).to.eq(ConnectorId_1);
      } catch (e) {
        expect(e instanceof ApiError, `${TestLogger.createNotApiErrorMesssage(e.message)}`).to.be.true;
        expect(false, `${TestLogger.createTestFailMessage('failed')}`).to.be.true;
      }
    });

    it(`${scriptName}: should set 02 active`, async () => {
      try {
        await ApsConfigService.setApsConnectorActive({ 
          connectorId: ConnectorId_2
        });
        const activeConnectorTarget: string = ServerConfig.getActiveConnectorTarget();
        // activeConnectorTarget='http://host.com:3000/v1'
        const expectedTarget = `${EAPSClientProtocol.HTTP}://${ConnectorId_2_Host}:${ConnectorId_2_Port}/v1`;
        expect(activeConnectorTarget, TestLogger.createLogMessage(`activeConnectorTarget='${activeConnectorTarget}'`)).to.eq(expectedTarget);
        const connectorConfig: APSConnector = ServerConfig.getConnectorConfig();
        expect(connectorConfig.connectorId, TestLogger.createLogMessage(`connectorConfig='${JSON.stringify(connectorConfig, null, 2)}'`)).to.eq(ConnectorId_2);
      } catch (e) {
        expect(e instanceof ApiError, `${TestLogger.createNotApiErrorMesssage(e.message)}`).to.be.true;
        expect(false, `${TestLogger.createTestFailMessage('failed')}`).to.be.true;
      }
    });

    it(`${scriptName}: should change port on 02 active`, async () => {
      try {
        const activeApsConnector: APSConnector = await ApsConfigService.getActiveApsConnector();
        const newPort = 3333;
        const replacedActiveConnector: APSConnector = await ApsConfigService.replaceApsConnector({
          connectorId: activeApsConnector.connectorId,
          requestBody: {
            ...activeApsConnector,
            connectorClientConfig: {
              ...activeApsConnector.connectorClientConfig,
              locationConfig: {
                configType: APSLocationConfigExternal.configType.EXTERNAL,
                host: ConnectorId_2_Host,
                protocol: EAPSClientProtocol.HTTP,
                port: newPort         
              }
            }
          }
        });
        const connectorConfig: APSConnector = ServerConfig.getConnectorConfig();
        expect(connectorConfig, TestLogger.createLogMessage(`connectorConfig='${JSON.stringify(connectorConfig, null, 2)}'`)).to.deep.eq(replacedActiveConnector);

        const activeConnectorTarget: string = ServerConfig.getActiveConnectorTarget();
        // activeConnectorTarget='http://host.com:3000/v1'
        const expectedTarget = `${EAPSClientProtocol.HTTP}://${ConnectorId_2_Host}:${newPort}/v1`;
        expect(activeConnectorTarget, TestLogger.createLogMessage(`activeConnectorTarget='${activeConnectorTarget}'`)).to.eq(expectedTarget);
      } catch (e) {
        expect(e instanceof ApiError, `${TestLogger.createNotApiErrorMesssage(e.message)}`).to.be.true;
        expect(false, `${TestLogger.createTestFailMessage('failed')}`).to.be.true;
      }
    });

    it(`${scriptName}: should set 01 active`, async () => {
      try {
        const activeConnector: APSConnector = await ApsConfigService.setApsConnectorActive({ 
          connectorId: ConnectorId_1
        });
        // const activeConnectorTarget: string = ServerConfig.getActiveConnectorTarget();
        const connectorConfig: APSConnector = ServerConfig.getConnectorConfig();
        expect(connectorConfig, TestLogger.createLogMessage(`connectorConfig='${JSON.stringify(connectorConfig, null, 2)}'`)).to.deep.eq(activeConnector);

      } catch (e) {
        expect(e instanceof ApiError, `${TestLogger.createNotApiErrorMesssage(e.message)}`).to.be.true;
        expect(false, `${TestLogger.createTestFailMessage('failed')}`).to.be.true;
      }
    });

    it(`${scriptName}: should delete active`, async () => {
      try {
        const activeApsConnector: APSConnector = await ApsConfigService.getActiveApsConnector();
        await ApsConfigService.deleteApsConnector({ 
          connectorId: activeApsConnector.connectorId
        });
        const connectorConfig: APSConnector | undefined = ServerConfig.getConnectorConfig();
        expect(connectorConfig, TestLogger.createLogMessage(`connectorConfig='${JSON.stringify(connectorConfig, null, 2)}'`)).to.be.undefined;
        const activeConnectorTarget: string = ServerConfig.getActiveConnectorTarget();
        expect(activeConnectorTarget, TestLogger.createLogMessage(`activeConnectorTarget='${activeConnectorTarget}'`)).to.eq('undefined');
      } catch (e) {
        expect(e instanceof ApiError, `${TestLogger.createNotApiErrorMesssage(e.message)}`).to.be.true;
        expect(false, `${TestLogger.createTestFailMessage('failed')}`).to.be.true;
      }
    });

  });
});

