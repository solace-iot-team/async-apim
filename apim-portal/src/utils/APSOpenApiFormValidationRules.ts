
import { 
  $APSId,
  $APSHost,
  $APSPort,
  $APSEmail,
  $APSDisplayName
} from "../_generated/@solace-iot-team/apim-server-openapi-browser";

export class APSOpenApiFormValidationRules {

  private static getMaxNumberRule = (schema: any): any => {
    if(schema.maximum) return {
      value: schema.maximum,
      message: `Max: ${schema.maximum}.`
    }
  }

  private static getMinNumberRule = (schema: any): any => {
    if(schema.minimum) return {
      value: schema.minimum,
      message: `Min: ${schema.minimum}.`
    }
  }

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

  private static createFormPattern = (apiPattern: string) => {
    return `^${apiPattern}$`;
  }
  private static getFormPatternRule = (schema: any, message: string): any => {
    if(schema.pattern) return {
      value: new RegExp(APSOpenApiFormValidationRules.createFormPattern(schema.pattern)),
      message: `${message}. Pattern: ${schema.pattern}`
    }
  }


  public static APSId = (requiredMessage: string, isActive: boolean): any => {
    const apiSchema = $APSId;
    const rules: any = {};
    rules['required'] = (isActive ? requiredMessage : false);
    rules['maxLength'] = (isActive ? APSOpenApiFormValidationRules.getMaxLengthRule(apiSchema) : undefined);
    rules['minLength'] = (isActive ? APSOpenApiFormValidationRules.getMinLengthRule(apiSchema) : undefined);
    rules['pattern'] = (isActive ? APSOpenApiFormValidationRules.getPatternRule(apiSchema, 'Invalid Id') : undefined);
    return rules;
  }
  public static APSHost = (requiredMessage: string, isActive: boolean): any => {
    const apiSchema = $APSHost;
    const rules: any = {};
    rules['required'] = (isActive ? requiredMessage : false);
    rules['maxLength'] = (isActive ? APSOpenApiFormValidationRules.getMaxLengthRule(apiSchema) : undefined);
    rules['minLength'] = (isActive ? APSOpenApiFormValidationRules.getMinLengthRule(apiSchema) : undefined);
    rules['pattern'] = (isActive ? APSOpenApiFormValidationRules.getPatternRule(apiSchema, 'Invalid hostname or IP address') : undefined);
    return rules;
  }
  public static APSPort = (requiredMessage: string, isActive: boolean): any => {
    const apiSchema = $APSPort;
    const rules: any = {};
    rules['required'] = (isActive ? requiredMessage : false);
    rules['max'] = (isActive ? APSOpenApiFormValidationRules.getMaxNumberRule(apiSchema) : undefined);
    rules['min'] = (isActive ? APSOpenApiFormValidationRules.getMinNumberRule(apiSchema) : undefined);
    return rules;
  }
  public static APSClientProtocol = (requiredMessage: string, isActive: boolean): any => {
    const rules: any = {};
    rules['required'] = (isActive ? requiredMessage : false);
    return rules;
  }  
  public static APSEmail = (requiredMessage: string, isActive: boolean): any => {
    const apiSchema = $APSEmail;
    const rules: any = {};
    rules['required'] = (isActive ? requiredMessage : false);
    rules['maxLength'] = (isActive ? APSOpenApiFormValidationRules.getMaxLengthRule(apiSchema) : undefined);
    rules['minLength'] = (isActive ? APSOpenApiFormValidationRules.getMinLengthRule(apiSchema) : undefined);
    rules['pattern'] = (isActive ? APSOpenApiFormValidationRules.getPatternRule(apiSchema, 'Invalid E-Mail address') : undefined);
    return rules;
  }
  public static APSDisplayName = (requiredMessage: string, isActive: boolean): any => {
    const apiSchema = $APSDisplayName;
    const rules: any = {};
    rules['required'] = (isActive ? requiredMessage : false);
    rules['maxLength'] = (isActive ? APSOpenApiFormValidationRules.getMaxLengthRule(apiSchema) : undefined);
    rules['minLength'] = (isActive ? APSOpenApiFormValidationRules.getMinLengthRule(apiSchema) : undefined);
    rules['pattern'] = (isActive ? APSOpenApiFormValidationRules.getFormPatternRule(apiSchema, 'Invalid Display Name') : undefined);
    return rules;
  }

}