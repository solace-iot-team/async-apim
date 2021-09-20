import { EAPAsyncApiSpecFormat, TAPAsyncApiSpec } from "../components/APComponentsCommon";
import { APConnectorApiHelper } from "./APConnectorApiCalls";


export class APConnectorFormValidationRules {
  
  public static Name = (): any => {
    const minLength: number  = 4;
    const maxLength: number = 256;
    const pattern: string = '^[A-Za-z0-9_-]*$';
    return {
      required: "Enter unique Name.",
      minLength: {
        value: minLength,
        message: `Minimum of ${minLength} chars.`
      },
      maxLength: {
        value: maxLength,
        message: `Maximum of ${maxLength} chars.`
      },
      pattern: {
        value: new RegExp(pattern),
        message: `Invalid Name. Use numbers, letters, '_', '-' only. Pattern: ${pattern}`
      }
    }
  }

  public static DisplayName = (): any => {
    const minLength: number  = 4;
    const maxLength: number = 256;
    return {
      required: "Enter Display Name.",
      minLength: {
        value: minLength,
        message: `Minimum of ${minLength} chars.`
      },
      maxLength: {
        value: maxLength,
        message: `Maximum of ${maxLength} chars.`
      }
    }
  }

  public static AsyncApiSpec = (): any => {
// example: https://www.carlrippon.com/custom-validation-rules-in-react-hook-form/
// https://react-hook-form.com/api/useform/register
// could be async ==> call a server api to validate spec properly
    const validate = (spec: string) => {
      const result: TAPAsyncApiSpec | string =  APConnectorApiHelper.getAsyncApiSpecAsJson({ format: EAPAsyncApiSpecFormat.UNKNOWN, spec: spec });
      if(typeof(result) === 'string') return result;
      return true;
    }

    return {
      required: 'Enter Async API Spec.',
      validate: validate
    }
  }

}