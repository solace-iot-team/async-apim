import fs from 'fs';
import path from 'path';

export type APSOptional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>;

export class ServerUtils {

  public static sleep = async(millis = 500) => {
    if(millis > 0) await new Promise(resolve => setTimeout(resolve, millis));
  }
  
  public static validateFilePathWithReadPermission = (filePath: string): string | undefined => {
    try {
      const absoluteFilePath = path.resolve(filePath);
      // console.log(`validateFilePathWithReadPermission: absoluteFilePath=${absoluteFilePath}`);
      fs.accessSync(absoluteFilePath, fs.constants.R_OK);
      return absoluteFilePath;
    } catch (e) {
      // console.log(`validateFilePathWithReadPermission: filePath=${filePath}`);
      // console.log(`e=${e}`);
      return undefined;
    }
  }

  public static readFileContentsAsJson = (filePath: string): any => {
    const b: Buffer = fs.readFileSync(filePath);
    try {
      return JSON.parse(b.toString());
    } catch(e) {
      throw e;
    }
  }

  public static assertNever = (extLogName: string, x: never): never => {
    const funcName = 'assertNever';
    const logName = `${ServerUtils.name}.${funcName}()`;
    throw new Error(`${logName}:${extLogName}: unexpected object: ${JSON.stringify(x)}`);
  }

  public static getPropertyNameString = <T extends Record<string, unknown>>(obj: T, selector: (x: Record<keyof T, keyof T>) => keyof T): keyof T => {
    const keyRecord = Object.keys(obj).reduce((res, key) => {
      const typedKey = key as keyof T
      res[typedKey] = typedKey
      return res
    }, {} as Record<keyof T, keyof T>)
    return selector(keyRecord)
  }
  
}