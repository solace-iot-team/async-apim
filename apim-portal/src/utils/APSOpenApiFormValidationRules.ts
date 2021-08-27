
import { 
  $APSId,
  $APSHost,
  $APSPort,
  $APSEmail
} from '@solace-iot-team/apim-server-openapi-browser';

export class APSOpenApiFormValidationRules {
  
  public static APSId_ValidationRules = (): any => {
    const funcName = 'APSId_ValidationRules';
    const logName = `${APSOpenApiFormValidationRules.name}.${funcName}()`;
    // console.log(`${logName}: $APSId = ${JSON.stringify($APSId, null, 2)}`);
    return {
      required: "Enter unique Id.",
      minLength: {
        value: $APSId.minLength,
        message: `Minimum of ${$APSId.minLength} chars.`
      },
      maxLength: {
        value: $APSId.maxLength,
        message: `Maximum of ${$APSId.maxLength} chars.`
      },
      pattern: {
        value: new RegExp($APSId.pattern),
        message: `Invalid Id. Use numbers, letters, '_', '-' only. Pattern: ${$APSId.pattern}`
      }
    }
  }
  
  public static APSHost_ValidationRules = (): any => {
    const funcName = 'APSHost_ValidationRules';
    const logName = `${APSOpenApiFormValidationRules.name}.${funcName}()`;
    // console.log(`${logName}: $APSHost = ${JSON.stringify($APSHost, null, 2)}`);
    return {
      required: "Enter hostname or IP address.",
      maxLength: {
        value: $APSHost.maxLength,
        message: `Maximum of ${$APSHost.maxLength} chars.`
      },
      pattern: {
        value: new RegExp($APSHost.pattern),
        message: `Invalid hostname or IP address. Pattern: ${$APSHost.pattern}`
      }
    }
  }

  public static APSPort_ValidationRules = (): any => {
    const funcName = 'APSPort_ValidationRules';
    const logName = `${APSOpenApiFormValidationRules.name}.${funcName}()`;
    // console.log(`${logName}: $APSPort = ${JSON.stringify($APSPort, null, 2)}`);
    return {
      required: "Enter Port Number.",
      max: {
        value: $APSPort.maximum,
        message: `Port Number must be <= ${$APSPort.maximum}.`
      },
      min: {
        value: 0,
        message: 'Port Number must be >= 0.',
      }
    }
  }
  
  public static APSEmail_ValidationRules = (): any => {
    const funcName = 'APSEmail_ValidationRules';
    const logName = `${APSOpenApiFormValidationRules.name}.${funcName}()`;
    // console.log(`${logName}: $APSEmail = ${JSON.stringify($APSEmail, null, 2)}`);
    return {
      required: "Enter E-Mail.",
      pattern: {
        value: new RegExp($APSEmail.pattern),
        message: `Invalid E-Mail address. Pattern: ${$APSEmail.pattern}`
      }
    }
  }

}