import { Request, Response, NextFunction } from 'express';
import httpProxy, { ProxyReqCallback, ServerOptions } from 'http-proxy';
import queryString from 'querystring';
import * as http from "http";
import { EServerStatusCodes, ServerLogger } from '../../common/ServerLogger';
import { APSSessionUser } from '../services/APSSessionService';
import APSAuthStrategyService from '../../common/authstrategies/APSAuthStrategyService';
import ServerConfig from '../../common/ServerConfig';
import { ConnectorProxyError } from '../../common/ServerError';

// const connectorResponseCallback: ProxyResCallback = (
//   proxyRes: http.IncomingMessage,
//   req: http.IncomingMessage,
//   res: http.ServerResponse,
// ): void => {
//   const funcName = 'connectorResponseCallback';
//   const logName = `${ComponentName}.${funcName}()`;

//   req;
//   res;
//   const bodyChunk: Uint8Array[] = [];
//   proxyRes.on('data', function(chunk) {
//     bodyChunk.push(chunk);
//   });
//   proxyRes.on('end', function() {
//     let body = Buffer.concat(bodyChunk).toString();
//     ServerLogger.debug(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.CONNECTOR_PROXY, details: { 
//       response_body: JSON.parse(body)
//     } } ));
//     if(res.statusCode >= 300) {
//       const error = new ConnectorProxyError(logName, undefined, {
//         connectorError: body
//       });
//       body = JSON.stringify(error.toAPSError());
//     }
//     // TODO: replace original body with new body to make it work
//     res.end(body);
//   });
// }



export class ApsConnectorProxyController {

  public static connectorRequestCallback: ProxyReqCallback = function (
    proxyReq: http.ClientRequest,
    req: http.IncomingMessage,
    res: http.ServerResponse,
    options: ServerOptions
    ) {
      const funcName = 'connectorRequestCallback';
      const logName = `${ApsConnectorProxyController.name}.${funcName}()`;

      res;
      options;  
      const anyReq = req as any;

      ServerLogger.debug(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.CONNECTOR_PROXY, details: { 
        request_body: anyReq.body
      } } ));
  
      if (!anyReq.body || !Object.keys(anyReq.body).length) {
        return;
      }

      const contentType = proxyReq.getHeader('Content-Type');
      let bodyData: any | undefined = undefined;

      if (contentType === 'application/json') {
        bodyData = JSON.stringify(anyReq.body);
      } else if (contentType === 'text/plain') {
        bodyData = anyReq.body;
      } else if (contentType === 'application/x-www-form-urlencoded') {
        bodyData = queryString.stringify(anyReq.body);
      }

      if(bodyData !== undefined) {
        proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
        proxyReq.write(bodyData);
      } 
  };

  public static all = (req: Request, res: Response, next: NextFunction): void => {
    const funcName = 'all';
    const logName = `${ApsConnectorProxyController.name}.${funcName}()`;

    const anyReq: any = req as any;
    // ServerLogger.debug(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.CONNECTOR_PROXY, message: 'request', details: {
    //   user: anyReq.user,
    // } }));
    // throw new ServerError(logName, `continue with ${logName}`);
    const apsSessionUser: APSSessionUser = anyReq.user;
    ServerLogger.debug(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.CONNECTOR_PROXY, message: 'apsSessionUser', details: {
      apsSessionUser: apsSessionUser,
    } }));
    req.headers.authorization = APSAuthStrategyService.generateConnectorProxyAuthHeader();
    ConnectorProxy.web(req, res, {
      // target: "http://18.184.18.52:3000/v1",
      target: ServerConfig.getActiveConnectorTarget()
    }, function (err) {
      // called when network errors occur 
      const funcName = 'ConnectorProxy.web.errorCallback';
      const logName = `${ApsConnectorProxyController.name}.${funcName}()`;
      // ServerLogger.error(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.CONNECTOR_PROXY, details: { 
      //   error: err 
      // } } ));
      const connectorError = new ConnectorProxyError(logName, undefined, {
        connectorError: err
      });
      next(connectorError);
     
    });
  }
}

const ConnectorProxy = httpProxy.createProxyServer({
  // target: 'http://localhost:9095/v1',
  // target: "http://18.184.18.52:3000/v1",
  //changeOrigin: true,
  // selfHandleResponse : true
});
ConnectorProxy.on('proxyReq', ApsConnectorProxyController.connectorRequestCallback);
// connectorProxy.on('proxyRes', connectorResponseCallback);
