
import React from "react";

import { TAPAttribute, TAPAttributeList } from "../../utils/APConnectorApiCalls";

import "../APComponents.css";

export interface IAPDisplayAttributesProps {
  attributeList?: TAPAttributeList;
  emptyMessage: string;
  className?: string;
}

export const APDisplayAttributes: React.FC<IAPDisplayAttributesProps> = (props: IAPDisplayAttributesProps) => {
  const componentName='APDisplayAttributes';

  const [jsxElementList, setJsxElementList] = React.useState<Array<JSX.Element>>();

  const doInitialize = () => {
    let attributesJSXElementList: Array<JSX.Element> = [];    
    const addAttributeJSXElement = (attribute: TAPAttribute) => {
      const jsxElem: JSX.Element = (
        <li>
          {attribute.name}: {attribute.value}
        </li>
      );
      attributesJSXElementList.push(jsxElem);
    }
    if(props.attributeList && props.attributeList.length > 0) {
      const sortedList: TAPAttributeList = props.attributeList.sort( (first: TAPAttribute, second: TAPAttribute) => {
        if(first.name < second.name) return -1;
        else return 1;
      });
      sortedList.forEach( (attribute: TAPAttribute) => {
        addAttributeJSXElement(attribute);  
      });
      setJsxElementList(attributesJSXElementList);
    }
  }

  React.useEffect(() => {
    doInitialize();
  }, []); /* eslint-disable-line react-hooks/exhaustive-deps */

  return (
    <div className={props.className ? props.className : 'card'}>
      <ul style={{ "listStyle": "disc" }}>
        { jsxElementList }
        { !jsxElementList && <li>{props.emptyMessage}</li> }
      </ul>
    </div>
  );
}
