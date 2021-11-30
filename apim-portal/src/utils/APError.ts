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