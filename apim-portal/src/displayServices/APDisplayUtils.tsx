import { DataTableSortOrderType } from "primereact/datatable";
import React from "react";
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

  public create_DivList_From_StringList = (stringList?: Array<string>): JSX.Element => {
    const jsxElementList: Array<JSX.Element> = [];

    const addJSXElement = (str: string) => {
      const jsxElem: JSX.Element = (
        <div>{str}</div>
      );
      jsxElementList.push(jsxElem);
    }
    if(stringList) {
      stringList.forEach( (str: string) => {
        addJSXElement(str);
      });  
    }
    return (
      <React.Fragment>
        {jsxElementList}
      </React.Fragment>
    );
  }

}

export default new APDisplayUtils();
