import { FieldError } from "react-hook-form";

class APDisplayUtils {
  private readonly BaseComponentName = "APDisplayUtils";

  // placeholder for common render functions
  // probably from APRenderUtils.tsx

  public nameOf<T>(name: keyof T) {
    return name;
  }  

  public displayFormFieldErrorMessage = (fieldError: FieldError | undefined) => {
    return fieldError && <small className="p-error">{fieldError.message}</small>    
  }

  public displayFormFieldErrorMessage4Array = (fieldErrorList: Array<FieldError | undefined> | undefined) => {
    let _fieldError: any = fieldErrorList;
    return _fieldError && <small className="p-error">{_fieldError.message}</small>;
  }

}

export default new APDisplayUtils();
