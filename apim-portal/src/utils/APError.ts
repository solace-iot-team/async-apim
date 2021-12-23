import { APFetchResult } from "./APFetch";
import { APLogger } from "./APLogger";

export class APError extends Error {
  protected static className = 'APError';
  private internalStack: Array<string>;
  private internalLogName: string;
  private internalMessage: string | undefined;

  private createArrayFromStack = (stack: any): Array<string> => {
    return stack.split('\n');
  }

  constructor(internalLogName: string, internalMessage?: string, errorName: string = APError.className) {
    super(internalMessage?internalMessage:internalLogName);
    this.name = errorName;
    this.internalMessage = internalMessage;
    this.internalLogName = internalLogName;
    this.internalStack = this.createArrayFromStack(this.stack);
  }

  public toString = (): string => {
    return JSON.stringify(this.toObject(), null, 2);
  }

  public toObject = (): any => {
    const funcName = 'toObject';
    const logName = `${APError.name}.${funcName}()`;
    try {
      return JSON.parse(JSON.stringify(this));
    } catch (e: any) {
      APLogger.error(APLogger.createLogEntry(logName, { name: e.name, message: e.message } ));    
      return {
        internalLogName: this.internalLogName,
        internalMessage: this.internalMessage ? this.internalMessage : `JSON.parse error: ${e.name}: ${e.message}`,
        internalStack: this.internalStack
      }
    }
  }

}

export class APConnectorApiMismatchError extends APError {
  protected static className = 'APConnectorApiMismatchError';

  constructor(internalLogName: string, internalMessage?: string) {
    super(internalLogName, internalMessage, APConnectorApiMismatchError.className);
  }
}

export class APContextError extends APError {
  protected static className = 'APContextError';
  private context: any;
  
  constructor(internalLogName: string, internalMessage: string, context: any) {
    super(internalLogName, internalMessage, APContextError.className);
    this.context = context;
  }  
}

export class APTimeoutError extends APError {
  protected static className = 'APTimeoutError';
  private context: any;
  constructor(internalLogName: string, internalMessage: string, context: any) {
    super(internalLogName, internalMessage, APTimeoutError.className);
    this.context = context;
  }  
}

export class APFetchError extends APError {
  protected static className = 'APFetchError';
  private fetchResult: APFetchResult;
  constructor(internalLogName: string, internalMessage: string, fetchResult: APFetchResult) {
    super(internalLogName, internalMessage, APFetchError.className);
    this.fetchResult = fetchResult;
  }
}

export declare type APSApiResult = {
  readonly url: string;
  readonly ok: boolean;
  readonly status: number;
  readonly statusText: string;
  readonly body: any;
};

export class APSApiError extends Error {
  protected static className = 'APSApiError';
  readonly url: string;
  readonly status: number;
  readonly statusText: string;
  readonly body: any;
  constructor(response: APSApiResult, message: string, errorName: string = APSApiError.className) {
    super(message);
    this.name = errorName;
    this.url = response.url;
    this.status = response.status;
    this.statusText = response.statusText;
    this.body = response.body;
  }
}
