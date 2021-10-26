import {
  $attributes, $ClientOptionsGuaranteedMessaging
} from '@solace-iot-team/apim-connector-openapi-browser';

import { EAPAsyncApiSpecFormat, TAPAsyncApiSpec } from "../components/APComponentsCommon";
import { APConnectorApiHelper } from "./APConnectorApiCalls";

export class APConnectorFormValidationRules {
  
  public static ClientOptionsGuaranteedMessaging_MaxTTL = (): any => {
    return {
      required: "Enter Max TTL.",
      max: {
        value: $ClientOptionsGuaranteedMessaging.properties.maxTtl.maximum,
        message: `Max TTL must be <= ${$ClientOptionsGuaranteedMessaging.properties.maxTtl.maximum}.`
      },
      min: {
        value: 0,
        message: 'Max TTL must be >= 0.',
      }
    }
  }

  public static ClientOptionsGuaranteedMessaging_MaxSpoolUsage = (): any => {
    return {
      required: "Enter Max Spool Usage.",
      max: {
        value: $ClientOptionsGuaranteedMessaging.properties.maxMsgSpoolUsage.maximum,
        message: `Max Spool Usage must be <= ${$ClientOptionsGuaranteedMessaging.properties.maxMsgSpoolUsage.maximum}.`
      },
      min: {
        value: 0,
        message: 'Max Spool Usage must be >= 0.',
      }
    }
  }

  public static AttributeName = (): any => {
    const fixPattern = '^[a-zA-Z0-9_-]*$';
    return {
      required: "Enter name.",
      minLength: {
        value: $attributes.contains.properties.name.minLength,
        message: `Minimum of ${$attributes.contains.properties.name.minLength} chars.`
      },
      maxLength: {
        value: $attributes.contains.properties.name.maxLength,
        message: `Maximum of ${$attributes.contains.properties.name.maxLength} chars.`
      },
      pattern: {
        // value: new RegExp($attributes.contains.properties.name.pattern),
        value: new RegExp(fixPattern),
        message: `Invalid name. Pattern: ${$attributes.contains.properties.name.pattern}`
      }
    };
  }
  public static AttributeValue = (): any => {
    const fixPattern = '^[a-zA-Z0-9_,\*\?-]*$';
    // pattern: [a-zA-Z0-9_\-\s,\*]{1,1024}

    return {
      required: "Enter value.",
      minLength: {
        value: $attributes.contains.properties.value.minLength,
        message: `Minimum of ${$attributes.contains.properties.value.minLength} chars.`
      },
      maxLength: {
        value: $attributes.contains.properties.value.maxLength,
        message: `Maximum of ${$attributes.contains.properties.value.maxLength} chars.`
      },
      pattern: {
        // value: new RegExp($attributes.contains.properties.value.pattern),
        value: new RegExp(fixPattern),
        message: `Invalid name. Pattern: ${$attributes.contains.properties.value.pattern}`
      }
    };
  }
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
    const validate = (specStr: string): string | boolean => {
      // alert(`spec=\n${specStr}`);
      const result: TAPAsyncApiSpec | string =  APConnectorApiHelper.getAsyncApiSpecAsJson({ format: EAPAsyncApiSpecFormat.UNKNOWN, spec: specStr });
      // if(typeof(result) === 'string') alert(`result is string = ${result}`);
      // else alert(`result is not string = ${JSON.stringify(result, null, 2)}`);
      // return 'never validates until problem fixed';
      if(typeof(result) === 'string') return result;
      return true;
    }

    return {
      required: 'Enter Async API Spec.',
      validate: validate
    }
  }

}