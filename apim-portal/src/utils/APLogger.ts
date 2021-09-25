import { APError } from "./APError";

export type TAPLogEntry = {
  logName: string
  details: any
};

export class APLogger {

  public static createLogEntry = (logName: string, detailsOrAPError: APError | any): TAPLogEntry => {
    return {
      logName: logName,
      details: (detailsOrAPError instanceof APError ? detailsOrAPError.toObject() : detailsOrAPError)
    };
  }

  public static error = (logEntry: TAPLogEntry): void => {
    console.error(`${JSON.stringify(logEntry)}`);
  }
}