import {
  $attributes, $ClientOptionsGuaranteedMessaging, $WebHook, $WebHookBasicAuth, $WebHookHeaderAuth
} from '@solace-iot-team/apim-connector-openapi-browser';

import { EAPAsyncApiSpecFormat, TAPAsyncApiSpec } from "../components/APComponentsCommon";
import { APConnectorApiHelper } from "./APConnectorApiCalls";

export class APConnectorFormValidationRules {
  
  private static getMaxLengthRule = (schema: any): any => {
    if(schema.maxLength) return {
      value: schema.maxLength,
      message: `Maximum of ${schema.maxLength} chars.`
    }
  }

  private static getMinLengthRule = (schema: any): any => {
    if(schema.minLength) return {
      value: schema.minLength,
      message: `Minimum of ${schema.minLength} chars.`
    }
  }

  private static getPatternRule = (schema: any, message: string): any => {
    if(schema.pattern) return {
      value: new RegExp(schema.pattern),
      message: `${message}. Pattern: ${schema.pattern}`
    }
  }

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

  public static Webhook_Uri = (): any => {
    // const fixPattern = '^[a-zA-Z0-9_,\*\?-]*$';
    const fixPattern = 'https?:\\/\\/[A-Za-z\\.:0-9\\-]*.';
    // pattern: 'https?:\\/\\/[A-Za-z\\.:0-9\\-]*.{0,200}$',
    return {
      required: "Enter fully qualified URI. Example: http://my.callback.com.",
      maxLength: {
        value: $WebHook.properties.uri.maxLength,
        message: `Maximum of ${$WebHook.properties.uri.maxLength} chars.`
      },
      pattern: {
        // value: new RegExp($attributes.contains.properties.value.pattern),
        value: new RegExp(fixPattern),
        message: `Invalid name. Pattern: ${$WebHook.properties.uri.pattern}`
      }
    };
  }

  public static WebhookBasicAuth_Username = (): any => {
    const schema = $WebHookBasicAuth.properties.username;
    const rules: any = {
    }
    if(schema.isRequired) rules['required'] = 'Enter username';
    return rules;
  }

  public static WebhookBasicAuth_Password = (): any => {
    const fixPattern = '^[\\S]*$';
    // pattern: '[\\S]{8,256}',
    const schema = $WebHookBasicAuth.properties.password;
    const rules: any = {
      pattern: {
        value: new RegExp(fixPattern),
        message: `Invalid password. Pattern: ${schema.pattern}`
      }
    }
    if(schema.isRequired) rules['required'] = 'Enter password';
    rules['maxLength'] = APConnectorFormValidationRules.getMaxLengthRule(schema);
    rules['minLength'] = APConnectorFormValidationRules.getMinLengthRule(schema);
    return rules;
  }

  public static WebhookHeaderAuth_HeaderName = (): any => {
    const schema = $WebHookHeaderAuth.properties.headerName;
    // pattern: '[\\s\\S]{1,512}',
    const fixPattern = '^[\\S]*$';
    schema.pattern = fixPattern;
    const rules: any = {};
    if(schema.isRequired) rules['required'] = 'Enter header name.';
    rules['maxLength'] = APConnectorFormValidationRules.getMaxLengthRule(schema);
    rules['minLength'] = APConnectorFormValidationRules.getMinLengthRule(schema);
    rules['pattern'] = APConnectorFormValidationRules.getPatternRule(schema, 'Invalid header name');
    return rules;
  }

  public static WebhookHeaderAuth_HeaderValue = (): any => {
    const schema = $WebHookHeaderAuth.properties.headerValue;
    // pattern: '[\\s\\S]{1,512}',
    const fixPattern = '^[\\S]*$';
    schema.pattern = fixPattern;
    const rules: any = {};
    if(schema.isRequired) rules['required'] = 'Enter header value.';
    rules['maxLength'] = APConnectorFormValidationRules.getMaxLengthRule(schema);
    rules['minLength'] = APConnectorFormValidationRules.getMinLengthRule(schema);
    rules['pattern'] = APConnectorFormValidationRules.getPatternRule(schema, 'Invalid header value');
    return rules;
  }

  public static TrustedCN = (): any => {
    const schema = {
      type: 'string',
      isRequired: true,
      maxLength: 512,
      minLength: 1,
      pattern: '^[\\S]*$',
    };
    const rules: any = {};
    if(schema.isRequired) rules['required'] = 'Enter trusted CN.';
    rules['maxLength'] = APConnectorFormValidationRules.getMaxLengthRule(schema);
    rules['minLength'] = APConnectorFormValidationRules.getMinLengthRule(schema);
    rules['pattern'] = APConnectorFormValidationRules.getPatternRule(schema, 'Invalid trusted CN');
    return rules;
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