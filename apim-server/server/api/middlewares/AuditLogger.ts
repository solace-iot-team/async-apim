import { Request, Response, NextFunction, Send } from "express";

import { EServerStatusCodes, ServerLogger } from "../../common/ServerLogger";

export class AuditLogger {

  private static body2Object = (body: any): any => {
    if(body && typeof body === 'string') {
      try {
        return JSON.parse(body);
      } catch (e) {
        return body;
      }
    }
    return body;
  }

  private static getRequestInfo = (req: Request): any => {
    const anyReq = req as any;
    const requestInfo = {
      method: req.method,
      url_route: req.originalUrl,
      url_params: req.params,
      url_query: req.query,
      headers: req.headers,
      body: req.body,
      timestamp: anyReq._auditTimestamp,
      timestamp_utc: (new Date(anyReq._auditTimestamp)).toUTCString()
    }
    return requestInfo;
  }

  private static getResponseInfo = (res: Response): any => {
    const anyRes = res as any;
    const responseInfo = {
      status_code: res.statusCode,
      status_text: res.statusMessage,
      headers: res.getHeaders(),
      body: anyRes._auditBodyJson,
      timestamp: anyRes._auditTimestamp,
      timestamp_utc: (new Date(anyRes._auditTimestamp)).toUTCString()
    };
    return responseInfo;
  }

  private static logRequest = (logName: string, req: Request): void => {
    const reqInfo = AuditLogger.getRequestInfo(req);
    ServerLogger.info(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.INBOUND_TRANSACTION_LOG, message: 'request info', details: reqInfo }));
  }
  
  private static logRequestResponse = (logName: string, req: Request, res: Response): void => {
    const anyReq = req as any;
    const anyRes = res as any;
    const elapsed_ms: number = req && res ? (anyRes._auditTimestamp - anyReq._auditTimestamp) : 0;
    const log = {
      request: AuditLogger.getRequestInfo(req),
      response: AuditLogger.getResponseInfo(res),
      elapsed_ms: elapsed_ms
    };
    ServerLogger.info(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.INBOUND_TRANSACTION_LOG, message: 'request response log', details: log }));
  }
  public static requestLogger(req: Request, _res: Response, next: NextFunction): void {
    const funcName = 'requestLogger';
    const logName = `${AuditLogger.name}.${funcName}()`;
    AuditLogger.logRequest(logName, req);
    next();
  }
  
  public static requestResponseLogger(req: Request, res: Response, next: NextFunction): void {
    const funcName = 'requestResponseLogger';
    const logName = `${AuditLogger.name}.${funcName}()`;

    var orgJsonFunc = res.json;
    var orgEndFunc = res.end;

    const anyReq = req as any;
    anyReq._auditTimestamp = Date.now();

    res.json = (bodyJson: any): Response<any, Record<string, any>> => {
      const anyRes = res as any;
      anyRes._auditBodyJson = bodyJson;
      return orgJsonFunc(bodyJson);
    }

    res.end = (chunk: any) => {
      const anyRes = res as any;
      anyRes._auditTimestamp = Date.now();
      AuditLogger.logRequestResponse(logName, req, res);
      return orgEndFunc(chunk);
    }

    next();
  }
}
