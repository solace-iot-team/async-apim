
import React from "react";

import { Button } from "primereact/button";
import { Toolbar } from "primereact/toolbar";
import { MenuItem } from "primereact/api";
import { Panel, PanelHeaderTemplateOptions } from "primereact/panel";

import APDeveloperPortalAppApiProductsDisplayService, { 
  TAPDeveloperPortalAppApiProductDisplay, 
  TAPDeveloperPortalAppApiProductDisplayList 
} from "../../../displayServices/APDeveloperPortalAppApiProductsDisplayService";
import { ApiCallState, TApiCallState } from "../../../../utils/ApiCallState";
import { EditApiProductsForm } from "./EditApiProductsForm";
import APDeveloperPortalUserAppsDisplayService, { TAPDeveloperPortalUserAppDisplay } from "../../../displayServices/APDeveloperPortalUserAppsDisplayService";
import { E_CALL_STATE_ACTIONS } from "../DeveloperPortalManageUserAppsCommon";
import { APClientConnectorOpenApi } from "../../../../utils/APClientConnectorOpenApi";
import APEntityIdsService, { TAPEntityId, TAPEntityIdList } from "../../../../utils/APEntityIdsService";
import { DeveloperPortalProductCatalog } from "../../DeveloperPortalProductCatalog/DeveloperPortalProductCatalog";
import { E_Mode } from "../../DeveloperPortalProductCatalog/DeveloperPortalProductCatalogCommon";
import { TAPDeveloperPortalApiProductDisplay } from "../../../displayServices/APDeveloperPortalApiProductsDisplayService";
import { UserContext } from "../../../../components/APContextProviders/APUserContextProvider";

import '../../../../components/APComponents.css';
import "../DeveloperPortalManageUserApps.css";

export interface IEditApiProductsProps {
  organizationId: string;
  apDeveloperPortalUserAppDisplay: TAPDeveloperPortalUserAppDisplay;
  onSaveSuccess: (apiCallState: TApiCallState, apDeveloperPortalAppApiProductDisplayList: TAPDeveloperPortalAppApiProductDisplayList) => void;
  onCancel: () => void;
  onError: (apiCallState: TApiCallState) => void;
  onLoadingChange: (isLoading: boolean) => void;
}

export const EditApiProducts: React.FC<IEditApiProductsProps> = (props: IEditApiProductsProps) => {
  const ComponentName = 'EditApiProducts';

  type TManagedObjectElement = TAPDeveloperPortalAppApiProductDisplay;
  type TManagedObject = Array<TManagedObjectElement>;

  const FormId = `DeveloperPortalManageUserApps_ManageApiProducts_${ComponentName}`;

  const [managedObject, setManagedObject] = React.useState<TManagedObject>();
  const [updatedManagedObject, setUpdatedManagedObject] = React.useState<TManagedObject>();
  const [apiCallStatus, setApiCallStatus] = React.useState<TApiCallState | null>(null);
  const [refreshCounter, setRefreshCounter] = React.useState<number>(0);
  const [duplicateApiDisplayNameList, setDuplicateApiDisplayNameList] = React.useState<Array<string>>();
  const [userContext] = React.useContext(UserContext);


  const hasApiProductListChanged = (): boolean => {
    const funcName = 'hasApiProductListChanged';
    const logName = `${ComponentName}.${funcName}()`;
    if(managedObject === undefined) throw new Error(`${logName}: managedObject === undefined`);
    // compare original with managedObject
    let hasChanged: boolean = false;
    managedObject.forEach( (moElem: TManagedObjectElement) => {
      const exists = props.apDeveloperPortalUserAppDisplay.apAppApiProductDisplayList.find( (x) => {
        return x.apEntityId.id === moElem.apEntityId.id;
      });
      if(exists === undefined) hasChanged = true;
    });
    // test if managedObject is empty
    if(!hasChanged) {
      if(managedObject.length === 0 && props.apDeveloperPortalUserAppDisplay.apAppApiProductDisplayList.length > 0) hasChanged = true;
    }
    return hasChanged;
  }

  const apiUpdateManagedObject = async(mo: TManagedObject): Promise<TApiCallState> => {
    const funcName = 'apiUpdateManagedObject';
    const logName = `${ComponentName}.${funcName}()`;
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_UPDATE_USER_APP_API_PRODUCTS, `update api products for app: ${props.apDeveloperPortalUserAppDisplay.apEntityId.displayName}`);
    try {
      await APDeveloperPortalUserAppsDisplayService.apiUpdate_ApDeveloperPortalUserAppDisplay_AppApiProductDisplayList({
        organizationId: props.organizationId,
        apDeveloperPortalUserAppDisplay: props.apDeveloperPortalUserAppDisplay,
        apDeveloperPortalAppApiProductDisplayList: mo
      });
      setUpdatedManagedObject(mo);
    } catch(e: any) {
      APClientConnectorOpenApi.logError(logName, e);
      callState = ApiCallState.addErrorToApiCallState(e, callState);
    }
    setApiCallStatus(callState);
    return callState;
  }

  const isNewApiProductValidAddition = (apDeveloperPortalApiProductDisplay: TAPDeveloperPortalApiProductDisplay): boolean => {
    const funcName = 'isNewApiProductValidAddition';
    const logName = `${ComponentName}.${funcName}()`;
    if(managedObject === undefined) throw new Error(`${logName}: managedObject === undefined`);

    const getDupes = (input: Array<string>): Array<string> => {
      return input.reduce( (acc: Array<string>, currentValue: string, currentIndex: number, arr: Array<string>) => {
        if(arr.indexOf(currentValue) !== currentIndex && acc.indexOf(currentValue) < 0) acc.push(currentValue); 
        return acc;
      }, []);
    }

    // validate if new api product does not contain any api that any other api product already contains
    // otherwise set a state to display a dialog

    // create apEntityIdList of all apis for all existing products
    const existing_ApiEntityIdList: TAPEntityIdList = APDeveloperPortalAppApiProductsDisplayService.get_ListOf_ApiEntityIds({
      apAppApiProductDisplayList: managedObject
    });
    const combined_ApiEntityIdList: TAPEntityIdList = existing_ApiEntityIdList.concat(APEntityIdsService.create_EntityIdList_From_ApDisplayObjectList(apDeveloperPortalApiProductDisplay.apApiDisplayList));
    // check if any of the new product entityIds are in existing list
    const _dupes: Array<string> = getDupes(APEntityIdsService.create_DisplayNameList(combined_ApiEntityIdList));
    if(_dupes.length > 0) {
      setDuplicateApiDisplayNameList(_dupes);
      return false;
    }
    setDuplicateApiDisplayNameList(undefined);
    return true;
  }

  const apiAddApiProductToApp = async(apiProductEntityId: TAPEntityId): Promise<TApiCallState> => {
    const funcName = 'apiAddApiProductToApp';
    const logName = `${ComponentName}.${funcName}()`;
    if(managedObject === undefined) throw new Error(`${logName}: managedObject === undefined`);
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_ADD_API_PRODUCT_TO_APP, `add api product: ${apiProductEntityId.displayName}`);
    try {
      // check if api product is already on the app
      const existing: TAPDeveloperPortalAppApiProductDisplay | undefined = props.apDeveloperPortalUserAppDisplay.apAppApiProductDisplayList.find((x) => {
        return x.apEntityId.id === apiProductEntityId.id;
      });
      if(existing) {
        const newMo: TManagedObject = APDeveloperPortalAppApiProductsDisplayService.add_ApDeveloperPortalApiProductDisplay_To_List({
          apDeveloperPortalAppApiProductDisplay: existing,
          apDeveloperPortalAppApiProductDisplayList: managedObject
        });
        setManagedObject(newMo);
      } else {
        // get the api product
        const apDeveloperPortalApiProductDisplay: TAPDeveloperPortalApiProductDisplay = await APDeveloperPortalAppApiProductsDisplayService.apiGet_DeveloperPortalApApiProductDisplay({
          organizationId: props.organizationId,
          apiProductId: apiProductEntityId.id,
          default_ownerId: userContext.apLoginUserDisplay.apEntityId.id,
          fetch_revision_list: false,
        });
        if(isNewApiProductValidAddition(apDeveloperPortalApiProductDisplay)) {
          // add it to the list
          const newMo: TManagedObject = APDeveloperPortalAppApiProductsDisplayService.add_ApDeveloperPortalApiProductDisplay_To_List({
            apDeveloperPortalAppApiProductDisplay: APDeveloperPortalAppApiProductsDisplayService.create_ApDeveloperPortalAppApiProductDisplay_From_ApDeveloperPortalApiProductDisplay({
              apDeveloperPortalApiProductDisplay: apDeveloperPortalApiProductDisplay
            }),
            apDeveloperPortalAppApiProductDisplayList: managedObject
          });
          setManagedObject(newMo);
        }
      }
      setRefreshCounter(refreshCounter + 1);
    } catch(e: any) {
      APClientConnectorOpenApi.logError(logName, e);
      callState = ApiCallState.addErrorToApiCallState(e, callState);
    }
    setApiCallStatus(callState);
    return callState;
  }

  const doInitialize = async () => {
    // work on a copy 
    setManagedObject(JSON.parse(JSON.stringify(props.apDeveloperPortalUserAppDisplay.apAppApiProductDisplayList)));
  }

  React.useEffect(() => {
    doInitialize();
  }, []); /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    if(managedObject === undefined) return;
    if(refreshCounter > 0) setRefreshCounter(refreshCounter + 1);
  }, [managedObject]); /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    const funcName = 'useEffect[apiCallStatus]';
    const logName = `${ComponentName}.${funcName}()`;
    if (apiCallStatus !== null) {
      if(!apiCallStatus.success) props.onError(apiCallStatus);
      else if(apiCallStatus.context.action === E_CALL_STATE_ACTIONS.API_UPDATE_USER_APP_API_PRODUCTS) {
          if(updatedManagedObject === undefined) throw new Error(`${logName}: updatedManagedObject === undefined`);
          props.onSaveSuccess(apiCallStatus, updatedManagedObject);
      }
    }
  }, [apiCallStatus]); /* eslint-disable-line react-hooks/exhaustive-deps */

  const doSubmitManagedObject = async (mo: TManagedObject) => {
    props.onLoadingChange(true);
    await apiUpdateManagedObject(mo);
    props.onLoadingChange(false);
  }

  const onSubmit = (mo: TManagedObject) => {
    doSubmitManagedObject(mo);
  }

  const onRemove = (moElem: TManagedObjectElement) => {
    const funcName = 'onRemove';
    const logName = `${ComponentName}.${funcName}()`;
    if(managedObject === undefined) throw new Error(`${logName}: managedObject === undefined`);

    setManagedObject(APDeveloperPortalAppApiProductsDisplayService.remove_ApDeveloperPortalAppApiProductDisplay_From_List({
      apiProductEntityId: moElem.apEntityId,
      apDeveloperPortalAppApiProductDisplayList: managedObject
    }));
    setRefreshCounter(refreshCounter + 1);
  }

  const renderManagedObjectFormFooter = (): JSX.Element => {
    const managedObjectFormFooterLeftToolbarTemplate = () => {
      return (
        <React.Fragment>
          <Button type="button" label="Cancel" className="p-button-text p-button-plain" onClick={props.onCancel} />
        </React.Fragment>
      );
    }
    const managedObjectFormFooterRightToolbarTemplate = () => {
      return (
        <React.Fragment>
          <Button key={ComponentName+'Save'} form={FormId} type="submit" label="Save" icon="pi pi-save" className="p-button-text p-button-plain p-button-outlined" disabled={!hasApiProductListChanged()} />
        </React.Fragment>
      );
    }  
    return (
      <Toolbar className="p-mb-4" left={managedObjectFormFooterLeftToolbarTemplate} right={managedObjectFormFooterRightToolbarTemplate} />
    )
  }


  const onAddApiProductToApp = (apiProductEntityId: TAPEntityId) => {
    apiAddApiProductToApp(apiProductEntityId);
  }

  const renderSearchApiProducts = (): JSX.Element => {
    const funcName = 'renderSearchApiProducts';
    const logName = `${ComponentName}.${funcName}()`;

    const onSuccess_From_ProductCatalog = (apiCallState: TApiCallState) => {};
    const setBreadCrumbItemList_From_ProductCatalog = (itemList: Array<MenuItem>) => {};
    const panelHeaderTemplate = (options: PanelHeaderTemplateOptions) => {
      const toggleIcon = options.collapsed ? 'pi pi-search' : 'pi pi-search';
      const className = `${options.className} p-jc-start`;
      const titleClassName = `${options.titleClassName} p-pl-1`;
      return (
        <div className={className} style={{ justifyContent: 'left'}} >
          <button className={options.togglerClassName} onClick={options.onTogglerClick} style={{ width: '13em', borderRadius: 'unset'}}>
            <span className={toggleIcon}></span>
            <span className={titleClassName}>
              Search API Products
            </span>
          </button>
          {/* <span className={titleClassName}>
            Search API Products
          </span> */}
        </div>
      );
    }

    if(managedObject === undefined) throw new Error(`${logName}: managedObject === undefined`);

    return (
      <Panel 
        headerTemplate={panelHeaderTemplate} 
        toggleable
        collapsed={true}
        className="p-pt-2"
      >
        <DeveloperPortalProductCatalog
          key={ComponentName + '_DeveloperPortalProductCatalog_' + refreshCounter}
          mode={E_Mode.ADD_TO_APP}
          // title="Search API Products & Add to App"
          exclude_ApiProductIdList={APEntityIdsService.create_IdList_From_ApDisplayObjectList(managedObject)}
          onAddToApp={onAddApiProductToApp}
          organizationId={props.organizationId}
          // viewApiProductEntityId={locationState}
          onSuccess={onSuccess_From_ProductCatalog} 
          onError={props.onError} 
          setBreadCrumbItemList={setBreadCrumbItemList_From_ProductCatalog}
        />
      </Panel>
    );
  }

  const renderErrorMessage = (): JSX.Element => {
    if(duplicateApiDisplayNameList === undefined) return (<></>);
    return(
      <React.Fragment>
        <div className="card p-mb-2">
            <div style={{ color: 'red' }} >
              <p>Cannot select API Products that contain the same APIs as already selected API Products.</p> 
              <p>Duplicate APIs:</p>
              <div className="p-ml-2">
                {duplicateApiDisplayNameList.join(', ')}.
              </div>
          </div>
        </div>
      </React.Fragment>
    );
  }

  const renderManagedObjectForm = (mo: TManagedObject) => {
    return (
      <div className="card p-mt-2">
        <div className="p-fluid">
        {/* <div className="p-mt-4">Instructions for the user - remove & save ?:</div> */}
          <EditApiProductsForm 
            key={ComponentName + '_EditApiProductsForm_' + refreshCounter}
            organizationId={props.organizationId}
            formId={FormId}
            apDeveloperPortalApp_ApiProductDisplayList={mo}
            onSubmit={onSubmit}
            onRemove={onRemove}
          />
          {/* footer */}
          { renderManagedObjectFormFooter() }
        </div>
        {renderErrorMessage()}
        {renderSearchApiProducts()}
      </div>
    );
  }
  
  return (
    <div className="apd-manage-user-apps">

      { managedObject && renderManagedObjectForm(managedObject) }

    </div>
  );
}
