import APEntityIdsService, { IAPEntityIdDisplay, TAPEntityId } from "../../utils/APEntityIdsService";

/** not defined in connector API */
export type TAPRawAttribute = {
  name: string;
  value: string;
}
export type TAPRawAttributeList = Array<TAPRawAttribute>;


/**
 * apEntityId.id === apEntityId.displayName === attribute name
 */
export interface IAPAttributeDisplay extends IAPEntityIdDisplay {
  value: string;
}
export type TAPAttributeDisplayList = Array<IAPAttributeDisplay>;

export type TAPExtractEntities_From_ApConnectorAttributeList_Result = {
  extractedList: TAPAttributeDisplayList;
  remainingList: TAPAttributeDisplayList;
}

class APAttributesDisplayService {
  private readonly BaseComponentName = "APAttributesDisplayService";

  public nameOf<T extends IAPAttributeDisplay>(name: keyof T) {
    return name;
  }
  public nameOf_ApEntityId(name: keyof TAPEntityId) {
    return `${this.nameOf('apEntityId')}.${name}`;
  }

  // private construct_RawAttributeValue(value: string): string {
  //   const constructed = value.replaceAll(" ", "_x_");
  //   alert(`construct_RawAttributeValue: value: ${value}, constructed=${constructed}`);
  //   return value.replaceAll(" ", "_x_");
  // }

  // private reconstruct_RawAttributeValue(value: string): string {
  //   const reconstructed = value.replaceAll("_x_", " ");
  //   alert(`reconstruct_RawAttributeValue: value: ${value}, reconstructed=${reconstructed}`);
  //   return value.replaceAll("_x_", " ");
  // }

  public create_Empty_ApAttributeDisplay(): IAPAttributeDisplay {
    return {
      apEntityId: APEntityIdsService.create_EmptyObject_NoId(),
      value: ''
    };
  }
  
  public create_ApAttributeDisplay(apRawAttribute: TAPRawAttribute): IAPAttributeDisplay {
    return {
      apEntityId: {
        id: apRawAttribute.name,
        displayName: apRawAttribute.name
      },
      // value: this.reconstruct_RawAttributeValue(apRawAttribute.value)
      value: apRawAttribute.value
    };
  }

  public create_CopyOf({ apAttributeDisplayList }:{
    apAttributeDisplayList: TAPAttributeDisplayList;
  }): TAPAttributeDisplayList {
    return JSON.parse(JSON.stringify(apAttributeDisplayList));
  }
  /**
   * Creates a new list.
   */
  public create_ApAttributeDisplayList({ apRawAttributeList }:{
    apRawAttributeList: TAPRawAttributeList;
  }): TAPAttributeDisplayList {
    const apAttributeDisplayList: TAPAttributeDisplayList = [];
    apRawAttributeList.forEach( (x) => {
      apAttributeDisplayList.push(this.create_ApAttributeDisplay(x));
    });
    return apAttributeDisplayList;
  }

  public create_ApRawAttribute(apAttributeDisplay: IAPAttributeDisplay): TAPRawAttribute {
    return {
      name: apAttributeDisplay.apEntityId.id,
      // value: this.construct_RawAttributeValue(apAttributeDisplay.value)
      value: apAttributeDisplay.value
    };    
  }

  public create_ApRawAttributeList({ apAttributeDisplayList }:{
    apAttributeDisplayList: TAPAttributeDisplayList;
  }): TAPRawAttributeList {
    const apRawAttributeList: TAPRawAttributeList = [];
    apAttributeDisplayList.forEach( (x) => {
      apRawAttributeList.push(this.create_ApRawAttribute(x));
    });
    return apRawAttributeList;
  }

  public add_ApAttributeDisplay_To_ApAttributeDisplayList({ apAttributeDisplay, apAttributeDisplayList }:{
    apAttributeDisplay: IAPAttributeDisplay;
    apAttributeDisplayList: TAPAttributeDisplayList;
  }): TAPAttributeDisplayList {
    apAttributeDisplayList.push(apAttributeDisplay);
    return APEntityIdsService.sort_ApDisplayObjectList_By_DisplayName(apAttributeDisplayList);
  }

  public remove_ApAttributeDisplay_From_ApAttributeDisplayList({ apAttributeDisplay, apAttributeDisplayList }:{
    apAttributeDisplay: IAPAttributeDisplay;
    apAttributeDisplayList: TAPAttributeDisplayList;
  }): TAPAttributeDisplayList {
    const idx = apAttributeDisplayList.findIndex( (x) => {
      return x.apEntityId.id === apAttributeDisplay.apEntityId.id;
    });
    if(idx > -1) apAttributeDisplayList.splice(idx, 1);
    return apAttributeDisplayList;
  }

  public is_Empty_ApAttributeDisplay(apAttributeDisplay: IAPAttributeDisplay): boolean {
    return (apAttributeDisplay.apEntityId.id === '');
  }

  public exists_ApAttributeDisplayId_In_ApAttributeDisplayList({ id, apAttributeDisplayList }:{
    id: string;
    apAttributeDisplayList: TAPAttributeDisplayList;
  }): boolean {
    const found: IAPAttributeDisplay | undefined = apAttributeDisplayList.find( (x) => {
      return x.apEntityId.id === id;
    });
    return (found !== undefined);
  }

  /**
   * Extracts attribute names NOT prefixed with prefix.
   * 
   * @param apAttributeDisplayList - modified without the extracted attributes 
   * @returns 
   */
  public extract_Not_Prefixed_With({ not_prefixed_with, apAttributeDisplayList }:{
    not_prefixed_with: string;
    apAttributeDisplayList: TAPAttributeDisplayList;
  }): TAPAttributeDisplayList {
    // const funcName = 'extract_Not_Prefixed_With';
    // const logName = `${this.BaseComponentName}.${funcName}()`;

    const not_prefixed_list: TAPAttributeDisplayList = [];
    // alert(`${logName}: before deleting, apAttributeDisplayList=${JSON.stringify(apAttributeDisplayList)}`);
    for(let idx=0; idx<apAttributeDisplayList.length; idx++) {
      if(!apAttributeDisplayList[idx].apEntityId.id.startsWith(not_prefixed_with)) {
        not_prefixed_list.push(apAttributeDisplayList[idx]);
        apAttributeDisplayList.splice(idx, 1);
        idx--;
      }
    }
    // alert(`${logName}: after deleting idxList, apAttributeDisplayList=${JSON.stringify(apAttributeDisplayList)}`);
    return not_prefixed_list;
  }

  /**
   * Extracts attribute names prefixed with prefix.
   * 
   * @param apAttributeDisplayList - modified without the extracted attributes 
   * @returns 
   */
     public extract_Prefixed_With({ prefixed_with, apAttributeDisplayList }:{
      prefixed_with: string;
      apAttributeDisplayList: TAPAttributeDisplayList;
    }): TAPAttributeDisplayList {
      const prefixed_list: TAPAttributeDisplayList = [];
      for(let idx=0; idx<apAttributeDisplayList.length; idx++) {
        if(apAttributeDisplayList[idx].apEntityId.id.startsWith(prefixed_with)) {
          prefixed_list.push(apAttributeDisplayList[idx]);
          apAttributeDisplayList.splice(idx, 1);
          idx--;
        }
      }
      return prefixed_list;
    }
  
  /**
   * Returns the extracted list.
   * @param apAttributeDisplayList - the list is modified and reflects the remaining list
   */
  public extract_ByEntityIdList({ idList_To_extract, apAttributeDisplayList }: {
    idList_To_extract: Array<string>;
    apAttributeDisplayList: TAPAttributeDisplayList;
  }): TAPAttributeDisplayList {

    const extractedList: TAPAttributeDisplayList = [];

    for(const id of idList_To_extract) {
      const idx: number = apAttributeDisplayList.findIndex( (apAttributeDisplay: IAPAttributeDisplay) => {
        return apAttributeDisplay.apEntityId.id === id;
      });
      if(idx > -1) {
        extractedList.push(apAttributeDisplayList[idx]);
        apAttributeDisplayList.splice(idx, 1);
      }
    }
    return extractedList;
  }

}

export default new APAttributesDisplayService();
