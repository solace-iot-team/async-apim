
import React from "react";

import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';

import { 
  AppsService, 
} from '@solace-iot-team/apim-connector-openapi-browser';

import { 
  APSUserId, 
} from '@solace-iot-team/apim-server-openapi-browser';

import { APClientConnectorOpenApi } from "../../../utils/APClientConnectorOpenApi";
import { ApiCallState, TApiCallState } from "../../../utils/ApiCallState";
import { ApiCallStatusError } from "../../../components/ApiCallStatusError/ApiCallStatusError";
import { TApiEntitySelectItemList, TAPOrganizationId } from "../../../components/APComponentsCommon";
import { 
  E_CALL_STATE_ACTIONS, 
  DeveloperPortalManageUserAppsCommon, 
  TManagedObjectId,
} from "./DeveloperPortalManageUserAppsCommon";

import '../../../components/APComponents.css';
import "./DeveloperPortalManageUserApps.css";
import { TManagedObject } from "../../../components/ManageUserAccount/ManageUserAccountCommon";
import { DeveloperPortalUserAppSearchSelectApiProducts } from "./DeveloperPortalUserAppSearchSelectApiProducts";

export interface IDeveloperPortalUserAppSelectApiProductsProps {
  organizationId: TAPOrganizationId,
  userId: APSUserId,
  currentSelectedApiProductItemList: TApiEntitySelectItemList,
  // appId: TManagedObjectId,
  // appDisplayName: string,
  onError: (apiCallState: TApiCallState) => void;
  onSave: (apiCallState: TApiCallState, modifiedSelectedApiProductItemList: TApiEntitySelectItemList) => void;
  onCancel: () => void;
  onLoadingChange: (isLoading: boolean) => void;
}

export const DeveloperPortalUserAppSelectApiProducts: React.FC<IDeveloperPortalUserAppSelectApiProductsProps> = (props: IDeveloperPortalUserAppSelectApiProductsProps) => {
  const componentName = 'DeveloperPortalUserAppSelectApiProducts';

  const [apiCallStatus, setApiCallStatus] = React.useState<TApiCallState | null>(null);
  // const [showSelectDialog, setShowSelectDialog] = React.useState<boolean>(true);
  // const [selectedApiProductItemList, setSelectedApiProductItemList] = React.useState<TApiProductSelectItemList>([]);


  // * useEffect Hooks *
  React.useEffect(() => {
    if (apiCallStatus !== null) {
      if(!apiCallStatus.success) props.onError(apiCallStatus);
    }
  }, [apiCallStatus]); /* eslint-disable-line react-hooks/exhaustive-deps */

  
  // // BEGIN TEST
  // React.useEffect(() => {
  //   testSetSelectedApiProductItemList();
  // }, []); /* eslint-disable-line react-hooks/exhaustive-deps */
  
  // const testSetSelectedApiProductItemList = () => {
  //   const selectedApiProductList: TApiProductSelectItemList = [
  //     {
  //       id: 'id-1',
  //       displayName: 'api product 1'
  //     },
  //     {
  //       id: 'id-2',
  //       displayName: 'api product 2'
  //     },
  //     {
  //       id: 'id-3',
  //       displayName: 'api product 3'
  //     }
  //   ];
  //   setSelectedApiProductItemList(selectedApiProductList);
  // }
  // // END TEST


  // * UI Controls *
  // const doDeleteManagedObject = async () => {
  //   props.onLoadingChange(true);
  //   await apiDeleteManagedObject(props.organizationId, props.userId, props.appId, props.appDisplayName);
  //   props.onLoadingChange(false);
  // }

  // const onDeleteManagedObject = () => {
  //   doDeleteManagedObject();
  // }

  // const onDeleteManagedObjectCancel = () => {
  //   setShowManagedObjectDeleteDialog(false);
  //   props.onCancel();
  // }

  // const onSaveSelectedApiProducts = () => {
  //   alert('this button is obsolete?')
  //   // props.onSuccess(ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.SELECT_API_PRODUCTS, `select api products`), selectedApiProductItemList);
  // }

  const renderSelectDialogContent = (): JSX.Element => {
    // const funcName = 'renderDeleteManagedObjectDialogContent';
    // const logName = `${componentName}.${funcName}()`;
    return (
      <React.Fragment>
        {/* DEBUG  */}
        {/* <pre style={ { fontSize: '10px' }} >props: {JSON.stringify(props)}</pre> */}
        <DeveloperPortalUserAppSearchSelectApiProducts 
          organizationId={props.organizationId}
          userId={props.userId}
          currentSelectedApiProductItemList={props.currentSelectedApiProductItemList}
          onError={props.onError}
          onSave={props.onSave}
          onCancel={props.onCancel}
          onLoadingChange={props.onLoadingChange}
        />
      </React.Fragment>  
    );
  }

  // const renderSelectDialogFooter = (): JSX.Element =>{
  //   return (
  //     <React.Fragment>
  //         {/* <Button type="button" label="Cancel" className="p-button-text p-button-plain" onClick={props.onCancel} />
  //         <Button type="button" label="Save" className="p-button-text p-button-plain p-button-outlined" onClick={onSaveSelectedApiProducts} /> */}
  //     </React.Fragment>
  //   );
  // } 

  const renderSelectDialog = (): JSX.Element => {
    return (
      <Dialog
        className="p-fluid"
        visible={true} 
        style={{ width: '80%', height: '50rem' }} 
        modal
        closable={false}
        onHide={()=> {}}
        // footer={renderSelectDialogFooter()}
        >
        <div className="apd-select-products-dialog-content">
            {renderSelectDialogContent()}
        </div>
        <ApiCallStatusError apiCallStatus={apiCallStatus} />
      </Dialog>
    );
  } 
  
  return (
    <div className="apd-manageuserapps">
      {renderSelectDialog()}
    </div>
  );
}
