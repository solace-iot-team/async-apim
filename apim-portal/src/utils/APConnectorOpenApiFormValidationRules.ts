

export class APConnectorFormValidationRules {
  
  public static APName_ValidationRules = (): any => {
    const funcName = 'APName_ValidationRules';
    const logName = `${APConnectorFormValidationRules.name}.${funcName}()`;
    const minLength: number  = 4;
    const maxLength: number = 256;
    const pattern: string = '^[A-Za-z0-9_-]*$';
    // console.log(`${logName}: $APSId = ${JSON.stringify($APSId, null, 2)}`);
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

}