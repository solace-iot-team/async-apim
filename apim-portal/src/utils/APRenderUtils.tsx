import React from "react";
import { 
  APIInfo, 
  APIInfoList, 
  CommonEntityNameList, 
  CommonEntityNames, 
  Endpoint, 
  Protocol 
} from "@solace-iot-team/apim-connector-openapi-browser";

export type TAPAttribute = {
  name: string,
  value: string
}
export type TAPAttributeList = Array<TAPAttribute>;

export class APRenderUtils {

  public static getFormattedMessagesQueuedMBs = (messagesQueuedMB: number | undefined) => {
    if(messagesQueuedMB === undefined) return ('not available');
    return ( Math.round((messagesQueuedMB + Number.EPSILON) * 1000) / 1000 );
  }
  public static getApiInfoListAsDisplayStringList = (apiInfoList: APIInfoList ): Array<string> => {
    return apiInfoList.map( (apiInfo: APIInfo) => {
      return `${apiInfo.name} (${apiInfo.source})`;
      // return `${apiInfo.name}`;
    });  
  }

  // TODO: REFACTOR-OUT
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

  public static getEndpointAttributesAsString = (endpoint: Endpoint): string => {
    if(endpoint.secure ==='yes' && endpoint.compressed === 'yes') return 'secure+compressed';
    if(endpoint.secure === 'yes') return 'secure';
    if(endpoint.compressed === 'yes') return 'compressed';
    return 'plain';
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

  public static getCommonEntityNameListAsStringList = (commonEntityNameList: CommonEntityNameList): Array<string> => {
    return commonEntityNameList.map( (commonEntityNames: CommonEntityNames) => {
      return commonEntityNames.displayName ? commonEntityNames.displayName : 'unknown';
    });    
  }

  public static renderStringListAsDivList = (stringList?: Array<string>): JSX.Element => {
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

