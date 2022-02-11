export type TAPAttribute = {
  name: string,
  value: string
}
export type TAPAttributeList = Array<TAPAttribute>;

export class APAttributesService {
  private readonly BaseComponentName = "APAttributesService";

  public getApAttributeNameListAsString(attributeList?: TAPAttributeList): string {
    if(attributeList) {
      return attributeList.map( (attribute: TAPAttribute) => {
        return attribute.name;
      }).join(', ');
    }
    else return '';
  }

  public getAttributeNameList(attributeList?: TAPAttributeList): Array<string> {
    if(!attributeList) return [];
    return attributeList.map( (attribute: TAPAttribute) => {
      return attribute.name;  
    });
  }

}

export default new APAttributesService();
