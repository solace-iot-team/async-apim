import { DataTableSortOrderType } from "primereact/datatable";
import React from "react";
import { FieldError } from "react-hook-form";
import { EAPSSortDirection } from "../_generated/@solace-iot-team/apim-server-openapi-browser";

type DotPrefix<T extends string> = T extends "" ? "" : `.${T}`;
type DotNestedKeys<T> = (T extends object ?
    { [K in Exclude<keyof T, symbol>]: `${K}${DotPrefix<DotNestedKeys<T[K]>>}` }[Exclude<keyof T, symbol>]
    : "") extends infer D ? Extract<D, string> : never;

class APDisplayUtils {
  private readonly BaseComponentName = "APDisplayUtils";

  public nameOf<T>(name: DotNestedKeys<T>) {
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

  public convertMilliseconds_To_Days = (ms: number): number => {
    let d, h, m, s: number;
    s = Math.floor(ms / 1000);
    m = Math.floor(s / 60);
    s = s % 60;
    h = Math.floor(m / 60);
    m = m % 60;
    d = Math.floor(h / 24);
    h = h % 24;
    return d;
  }
  public convertDays_To_Milliseconds = (days: number): number => {
    return (days * 24 * 3600 * 1000);
  }
  public convertMilliseconds = (ms: number): string => {
    let d, h, m, s;
    s = Math.floor(ms / 1000);
    m = Math.floor(s / 60);
    s = s % 60;
    h = Math.floor(m / 60);
    m = m % 60;
    d = Math.floor(h / 24);
    h = h % 24;
  
    const pad = (n: number) => { 
      return n < 10 ? '0' + n : n; 
    };
  
    const result = d + ' days, ' + pad(h) + ' hours, ' + pad(m) + ' mins';
    return result;
  };
}

export default new APDisplayUtils();
