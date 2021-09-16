import express, { Application } from 'express';
import cors from 'cors';
import path from 'path';
import bodyParser from 'body-parser';
import http from 'http';
// import os from 'os';
import cookieParser from 'cookie-parser';
import { EServerStatusCodes, ServerLogger } from './ServerLogger';

import errorHandler from '../api/middlewares/error.handler';
import * as OpenApiValidator from 'express-openapi-validator';
import { TExpressServerConfig } from './ServerConfig';
import { ApiPathNotFoundServerError, ApiServerErrorFromOpenApiResponseValidatorError } from './ServerError';


// import { Request, Response, NextFunction } from 'express';
import { ValidateResponseOpts } from 'express-openapi-validator/dist/framework/types';
import { ApsCatchAllController } from '../api/controllers/apsMisc/ApsCatchAllController';
import { nextTick } from 'process';

const app = express();

const corsOptions: cors.CorsOptions = {
  origin: true
};

// export type TListenCallback = () => void;

export class ExpressServer {
  private config: TExpressServerConfig;
  private root: string;
  private routes: (app: Application, apiBase: string) => void;

  constructor(config: TExpressServerConfig) {
    const funcName = 'constructor';
    const logName = `${ExpressServer.name}.${funcName}()`;

    this.config = config;
    this.root = path.normalize(__dirname + '/../..');

    app.use(bodyParser.json({ limit: this.config.requestSizeLimit }));
    app.use(bodyParser.text({ limit: this.config.requestSizeLimit }));
    app.use(cors(corsOptions));
    app.use(
      bodyParser.urlencoded({
        extended: true,
        limit: this.config.requestSizeLimit,
      })
    );
    app.use(cookieParser(this.config.serverSecret));
    // serve the portal/index.html
    // goes to next one if it doesn't exist
    app.use(express.static(`${this.root}/portal`));
    // serve public/index.html
    app.use(express.static(`${this.root}/public`));
    // serve server open api spec file
    const apiSpecFile = path.join(__dirname, 'api.yml');
    app.use(this.config.openApiSpecPath, express.static(apiSpecFile));
    // validate responses 
    const validateResponseOpts: ValidateResponseOpts = {      
      onError: ( (err, body, req) => {
        const logName = `${ExpressServer.name}.OpenApiValidator.validateResponse.onError()`;
        throw new ApiServerErrorFromOpenApiResponseValidatorError(logName, err, body, ServerLogger.getRequestInfo(req));
      })
    }
    let validateResponseValue: ValidateResponseOpts | boolean; 
    if (this.config.enableOpenApiResponseValidation) {
      validateResponseValue = validateResponseOpts;
    } else validateResponseValue = false;
    app.use(
      OpenApiValidator.middleware({
        validateApiSpec: false,
        apiSpec: apiSpecFile,
        validateRequests: true,
        validateResponses: validateResponseValue,
        ignorePaths: /.*\/spec(\/|$)/,
      })
    );
  }

  router(routes: (app: Application, apiBase: string) => void): ExpressServer {
    
    routes(app, this.config.apiBase);
    // app.use('/auth', OIDCDIscoveryRouter);
    // app.options('*', cors(corsOptions));

    // send portal if installed
    app.use('/', (req, res, next) => {
      const funcName = 'sendPortal';
      const logName = `${ExpressServer.name}.${funcName}()`;
      const requestInfo = ServerLogger.getRequestInfo(req);
      ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.INFO, message: 'sendPortal', details: requestInfo }));
      const portalIndexFile = `${this.root}/portal/index.html`;
      res.sendFile(portalIndexFile, {}, (err) => {
        if(err) {
          ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.INFO, message: 'sendPortal error, no portal found', details: { 
            error: err,
            sendFile: portalIndexFile
          } }));
          const apiError =  new ApiPathNotFoundServerError(logName, undefined, { path: req.originalUrl });
          next(apiError);
        }
      });
    });
    // catch all:
    app.use('*', ApsCatchAllController.all);
    app.use(errorHandler);

    return this;
  }

  public start = ( initialize: () => Promise<void>): Application => {
    const funcName = 'start';
    const logName = `${ExpressServer.name}.${funcName}()`;
    ServerLogger.info(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.INITIALIZING, message: 'http server', details: { config: this.config } }));
    http.createServer(app).listen(this.config.port, initialize);
    ServerLogger.info(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.INITIALIZED, message: 'http server', details: { config: this.config } }));
    return app;
  }

  // listenWithCallback(port: number, callback: TListenCallback): Application {

  //   http.createServer(app).listen(port, callback);

  //   return app;
  // }


}
