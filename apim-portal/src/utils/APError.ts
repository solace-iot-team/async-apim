import { APFetchResult } from "./APFetch";
import { APLogger } from "./APLogger";

export class APError extends Error {
  private internalStack: Array<string>;
  private internalLogName: string;
  private internalMessage: string | undefined;

  private createArrayFromStack = (stack: any): Array<string> => {
    return stack.split('\n');
  }

  constructor(internalLogName: string, internalMessage?: string) {
    super(internalMessage?internalMessage:internalLogName);
    this.name = this.constructor.name;
    this.internalMessage = internalMessage;
    this.internalLogName = internalLogName;
    this.internalStack = this.createArrayFromStack(this.stack);
  }

  public toString = (): string => {
    return 'hello world';
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
  constructor(internalLogName: string, internalMessage?: string) {
    super(internalLogName, internalMessage);
  }
}

export class APContextError extends APError {
  private context: any;
  
  constructor(internalLogName: string, internalMessage: string, context: any) {
    super(internalLogName, internalMessage);
    this.context = context;
  }  
}

export class APTimeoutError extends APError {
  private context: any;
  constructor(internalLogName: string, internalMessage: string, context: any) {
    super(internalLogName, internalMessage);
    this.context = context;
  }  
}

export class APFetchError extends APError {
  private fetchResult: APFetchResult;
  constructor(internalLogName: string, internalMessage: string, fetchResult: APFetchResult) {
    super(internalLogName, internalMessage);
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
  readonly url: string;
  readonly status: number;
  readonly statusText: string;
  readonly body: any;
  constructor(response: APSApiResult, message: string) {
    super(message);
    this.url = response.url;
    this.status = response.status;
    this.statusText = response.statusText;
    this.body = response.body;
  }
}
