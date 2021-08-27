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
import { ApiServerErrorFromOpenApiResponseValidatorError } from './ServerError';


// import { Request, Response, NextFunction } from 'express';
import { ValidateResponseOpts } from 'express-openapi-validator/dist/framework/types';
import { ApsCatchAllController } from '../api/controllers/apsMisc/ApsCatchAllController';

const app = express();

const corsOptions: cors.CorsOptions = {
  origin: true
};

// export type TListenCallback = () => void;

export class ExpressServer {
  private config: TExpressServerConfig;
  private routes: (app: Application, apiBase: string) => void;

  constructor(config: TExpressServerConfig) {
    this.config = config;
    const root = path.normalize(__dirname + '/../..');
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
    app.use(express.static(`${root}/public`));

    const apiSpecFile = path.join(__dirname, 'api.yml');
    app.use(this.config.openApiSpecPath, express.static(apiSpecFile));

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
    // catch all:
    app.use('*', ApsCatchAllController.all);
    app.use(errorHandler);
    // app.use('/auth', OIDCDIscoveryRouter);
    // app.options('*', cors(corsOptions));
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
