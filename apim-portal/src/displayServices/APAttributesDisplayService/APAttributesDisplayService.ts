import { IAPEntityIdDisplay, TAPEntityIdList } from "../../utils/APEntityIdsService";

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


  private create_ApAttributeDisplay(apRawAttribute: TAPRawAttribute): IAPAttributeDisplay {
    return {
      apEntityId: {
        id: apRawAttribute.name,
        displayName: apRawAttribute.name
      },
      value: apRawAttribute.value
    };
  }

  public create_ApAttributeDisplayList({ apRawAttributeList }:{
    apRawAttributeList: TAPRawAttributeList;
  }): TAPAttributeDisplayList {
    const apAttributeDisplayList: TAPAttributeDisplayList = [];
    apRawAttributeList.forEach( (x) => {
      apAttributeDisplayList.push(this.create_ApAttributeDisplay(x));
    });
    return apAttributeDisplayList;
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
    const funcName = 'extract_Not_Prefixed_With';
    const logName = `${this.BaseComponentName}.${funcName}()`;

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
