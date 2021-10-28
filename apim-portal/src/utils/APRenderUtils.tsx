import React from "react";
import { 
  APIInfo, 
  APIInfoList, 
  Protocol 
} from "@solace-iot-team/apim-connector-openapi-browser";
import { TAPAttribute, TAPAttributeList } from "./APConnectorApiCalls";

export class APRenderUtils {

  public static getApiInfoListAsDisplayStringList = (apiInfoList: APIInfoList ): Array<string> => {
    return apiInfoList.map( (apiInfo: APIInfo) => {
      return `${apiInfo.name} (${apiInfo.source})`;
    });  
  }

  public static getProtocolListAsString = (protocolList?: Protocol[] ): string => {
    if(protocolList) {
      let _protocolList: Array<string> = [];
      protocolList.forEach( (protocol: Protocol) => {
        _protocolList.push(`${protocol.name}(${protocol.version})`);
      });
      return _protocolList.sort().join(', ');
    }
    else return '';
  }

  public static getAttributeNameList = (attributeList?: TAPAttributeList): Array<string> => {
    if(!attributeList) return [];
    return attributeList.map( (attribute: TAPAttribute) => {
      return attribute.name;  
    });
  }

  public static getAttributeListAsString = (attributeList?: TAPAttributeList): string => {
    return APRenderUtils.getAttributeListAsStringList(attributeList).join(' | ');
  }

  public static getAttributeListAsStringList = (attributeList?: TAPAttributeList): Array<string> => {
    if(attributeList) {
      let _attributeList: Array<string> = [];
      attributeList.forEach( (attribute: TAPAttribute) => {
        const attributeStr: string = `${attribute.name}=${attribute.value}`;
        _attributeList.push(attributeStr);
      });
      return _attributeList.sort();
    }
    else return [];
  }

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

