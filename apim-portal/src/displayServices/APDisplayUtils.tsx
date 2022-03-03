import { DataTableSortOrderType } from "primereact/datatable";
import { FieldError } from "react-hook-form";
import { EAPSSortDirection } from "../_generated/@solace-iot-team/apim-server-openapi-browser";

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

  public transformTableSortDirectionToApiSortDirection = (tableSortDirection: DataTableSortOrderType): EAPSSortDirection => {
    return tableSortDirection === 1 ? EAPSSortDirection.ASC : EAPSSortDirection.DESC;
  }

}

export default new APDisplayUtils();
