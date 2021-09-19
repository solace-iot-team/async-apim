import { 
  App
} from '@solace-iot-team/platform-api-openapi-client-fe';
import { Globals } from '../../../utils/Globals';

export type TManagedObjectId = string;

export type TViewApiObject = App;

export type TViewManagedObject = {
  id: TManagedObjectId,
  displayName: string,
  globalSearch: string,
  apiObject: TViewApiObject,
}

export enum E_CALL_STATE_ACTIONS {
  API_GET_USER_APP_LIST = "API_GET_USER_APP_LIST",
  API_DELETE_USER_APP = "API_DELETE_USER_APP",
  API_CREATE_USER_APP = "API_CREATE_USER_APP",
  API_GET_USER_APP = "API_GET_USER_APP",
  API_UPDATE_USER_APP = "API_UPDATE_USER_APP",
  API_CREATE_DEVELOPER = "API_CREATE_DEVELOPER",
  API_GET_PRODUCT_LIST = "API_GET_PRODUCT_LIST",
  SELECT_API_PRODUCTS = "SELECT_API_PRODUCTS"
}

export class DeveloperPortalManageUserAppsCommon {

  private static generateGlobalSearchContent = (viewApiObject: TViewApiObject): string => {
    const filteredViewApiObject = {
      ...viewApiObject,
      internalName: undefined,
      credentials: undefined
    }
    return Globals.generateDeepObjectValuesString(filteredViewApiObject);
  }

  public static getNameListAsTableDisplayList = (nameList: Array<string>): string => {
    let _nameStrList: Array<string> = [];
    nameList.forEach( (name: string) => {
      
    });
    return '';

  }

  public static transformViewApiObjectToViewManagedObject = (viewApiObject: TViewApiObject): TViewManagedObject => {
    // const funcName = 'transformViewApiObjectToViewManagedObject';
    // const logName = `${ManageUsersCommon.name}.${funcName}()`;
    return {
      id: viewApiObject.name,
      displayName: viewApiObject.displayName ? viewApiObject.displayName : viewApiObject.name,
      globalSearch: DeveloperPortalManageUserAppsCommon.generateGlobalSearchContent(viewApiObject),
      apiObject: viewApiObject,
    }
  }

  // public static isActiveBodyTemplate = (managedObject: TViewManagedObject) => {
  //   if (managedObject.apiObject.isActivated) return (<span className="pi pi-check badge-active" />)
  //   else return (<span className="pi pi-times badge-active" />)
  // }


}
