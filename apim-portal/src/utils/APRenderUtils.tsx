import React from "react";

export class APRenderUtils {

  public static renderStringListAsDivList = (stringList: Array<string>): JSX.Element => {
    let jsxElementList: Array<JSX.Element> = [];

    const addJSXElement = (str: string) => {
      const jsxElem: JSX.Element = (
        <div>{str}</div>
      );
      jsxElementList.push(jsxElem);
    }

    stringList.forEach( (str: string) => {
      addJSXElement(str);
    });
    return (
      <React.Fragment>
        {jsxElementList}
      </React.Fragment>
    );
  }

}

