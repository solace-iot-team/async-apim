export type TAPAttribute = {
  name: string,
  value: string
}
export type TAPAttributeList = Array<TAPAttribute>;

export class APAttributesService {

  public static getApAttributeNameListAsString = (attributeList?: TAPAttributeList): string => {
    if(attributeList) {
      return attributeList.map( (attribute: TAPAttribute) => {
        return attribute.name;
      }).join(', ');
    }
    else return '';
  }

  public static getAttributeNameList = (attributeList?: TAPAttributeList): Array<string> => {
    if(!attributeList) return [];
    return attributeList.map( (attribute: TAPAttribute) => {
      return attribute.name;  
    });
  }

}