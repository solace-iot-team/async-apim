
import React from "react";

import { Button } from 'primereact/button';
import { Toolbar } from 'primereact/toolbar';

import { APIParameter } from "@solace-iot-team/apim-connector-openapi-browser";
import { ApiCallState, TApiCallState } from "../../utils/ApiCallState";
import { TAPApiParameter } from "./APApiParametersCommon";
import { APViewApiParameter } from "./APViewApiParameter";
import { APEditApiParameter } from "./APEditApiParameter";

import "../APComponents.css";
import "./APManageApiParameter.css";


export interface IAPManageApiParameterProps {
  apiParameter: APIParameter;
  // initialCallState: TApiCallState,
  isEditEnabled: boolean;
  onSave: (apApiParameter: TAPApiParameter) => void;
  // onError: (apiCallState: TApiCallState) => void;
  onCancel: () => void;
}

export const APManageApiParameter: React.FC<IAPManageApiParameterProps> = (props: IAPManageApiParameterProps) => {
  const componentName = 'APManageApiParameter';

  type TManagedObject = APIParameter;

  enum E_COMPONENT_STATE {
    UNDEFINED = "UNDEFINED",
    MANAGED_OBJECT_VIEW = "MANAGED_OBJECT_VIEW",
    MANAGED_OBJECT_EDIT = "MANAGED_OBJECT_EDIT",
  }
  type TComponentState = {
    previousState: E_COMPONENT_STATE,
    currentState: E_COMPONENT_STATE
  }
  const initialComponentState: TComponentState = {
    previousState: E_COMPONENT_STATE.UNDEFINED,
    currentState: E_COMPONENT_STATE.UNDEFINED
  }
  const setNewComponentState = (newState: E_COMPONENT_STATE) => {
    setComponentState({
      previousState: componentState.currentState,
      currentState: newState
    });
  }
  const setPreviousComponentState = () => {
    setComponentState({
      previousState: componentState.currentState,
      currentState: componentState.previousState
    });
  }
  
  const ToolbarEditManagedObjectButtonLabel = 'Edit';
  // const ToolbarCancelManagedObjectButtonLabel = 'Cancel';
  // const ToolbarSaveManagedObjectButtonLabel = 'Save';

  // /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  // const [configContext, dispatchConfigContext] = React.useContext(ConfigContext);
  const [componentState, setComponentState] = React.useState<TComponentState>(initialComponentState);
  // const [isLoading, setIsLoading] = React.useState<boolean>(false);
  // const [apiCallStatus, setApiCallStatus] = React.useState<TApiCallState | null>(null);
  const [managedObject, setManagedObject] = React.useState<TManagedObject>(props.apiParameter);
  // const [managedObjectId, setManagedObjectId] = React.useState<TManagedApiProductId>();
  // const [managedObjectDisplayName, setManagedObjectDisplayName] = React.useState<string>();
  // const [viewManagedObject, setViewManagedObject] = React.useState<TViewManagedObject>();
  // const [showListComponent, setShowListComponent] = React.useState<boolean>(false);
  const [showViewComponent, setShowViewComponent] = React.useState<boolean>(false);
  const [showEditComponent, setShowEditComponent] = React.useState<boolean>(false);
  const [editComponentToolbarButtonList, setEditComponentToolbarButtonList] = React.useState<Array<JSX.Element>>();

  // * useEffect Hooks *
  React.useEffect(() => {
    setNewComponentState(E_COMPONENT_STATE.MANAGED_OBJECT_VIEW);
  }, []); /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    calculateShowStates(componentState);
  }, [componentState]); /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    // if( componentState.currentState === E_COMPONENT_STATE.MANAGED_OBJECT_VIEW ||
    //     componentState.currentState === E_COMPONENT_STATE.MANAGED_OBJECT_EDIT
    //   ) props.onBreadCrumbLabelList([managedObjectDisplayName]);
    // else props.onBreadCrumbLabelList([]);
  }, [componentState]); /* eslint-disable-line react-hooks/exhaustive-deps */

  // React.useEffect(() => {
  //   const funcName = 'useEffect([apiCallStatus])';
  //   const logName = `${componentName}.${funcName}()`;

  //   // alert(`${logName}: apiCallStatus=${JSON.stringify(apiCallStatus, null, 2)}`);

  //   if (apiCallStatus !== null) {
  //     if(apiCallStatus.success) {
  //       switch (apiCallStatus.context.action) {
  //         // case E_CALL_STATE_ACTIONS.API_GET_API_PRODUCT_LIST:
  //         // case E_CALL_STATE_ACTIONS.API_GET_API_PRODUCT:
  //         //   break;
  //         default:
  //           props.onSuccess(apiCallStatus, managedObject);
  //         }
  //     } else props.onError(apiCallStatus);
  //   }
  // }, [apiCallStatus]); /* eslint-disable-line react-hooks/exhaustive-deps */

  //  * View Object *
  // const onViewManagedObject = (): void => {
  //   setApiCallStatus(null);
  //   setNewComponentState(E_COMPONENT_STATE.MANAGED_OBJECT_VIEW);
  // }  
  // * Edit Object *
  const onEditManagedObject = (): void => {
    // alert(`onEditManagedObject called - how is this getting to EditNewApiProduct?`);
    // setApiCallStatus(null);
    setNewComponentState(E_COMPONENT_STATE.MANAGED_OBJECT_EDIT);
  }
  const onEditManagedObjectSave = (apApiParameter: TAPApiParameter): void => {
    const funcName = 'onEditManagedObjectSave';
    const logName = `${componentName}.${funcName}()`;
    // alert(`${logName}: apApiParameter=${JSON.stringify(apApiParameter, null, 2)}`);
    setNewComponentState(E_COMPONENT_STATE.MANAGED_OBJECT_VIEW);
    props.onSave(apApiParameter);
  }
  const onSubComponentError = (apiCallState: TApiCallState) => {
    // setApiCallStatus(apiCallState);
  }
  const onSubComponentCancel = () => {
    setPreviousComponentState();
  }
  // * Toolbar *
  const renderViewComponentToolbar = (): JSX.Element => {
    const renderLeftToolbarContent = (): JSX.Element => {
      return (
        <React.Fragment>
          <Button 
            type="button"
            label={ToolbarEditManagedObjectButtonLabel} 
            icon="pi pi-pencil" 
            onClick={onEditManagedObject} 
            className="p-button-text p-button-plain" 
            disabled={!props.isEditEnabled}
          />      
        </React.Fragment>
      );
    } 
    return (
      <Toolbar 
        className="p-mb-4" 
        // style={ { 'background': 'none', 'border': 'none', 'paddingTop': '0rem', 'paddingBottom': '0rem', 'marginBottom': '0rem !important' } } 
        left={renderLeftToolbarContent()} 
      />      
    )
  }
  const renderToolbar = (): JSX.Element => {
    const emptyElement = (<></>);
    if(showViewComponent) return renderViewComponentToolbar();
    return emptyElement;
  }
  
  // * prop callbacks *
  // const onViewManagedObjectsSuccess = (apiCallState: TApiCallState) => {
  //   setApiCallStatus(apiCallState);
  //   setNewComponentState(E_COMPONENT_STATE.MANAGED_OBJECT_VIEW);
  // }
  // const onEditManagedObjectSuccess = (apiCallState: TApiCallState, updatedDisplayName: string | undefined) => {
  //   // setApiCallStatus(apiCallState);
  //   setNewComponentState(E_COMPONENT_STATE.MANAGED_OBJECT_VIEW);
  // }
  // const onSubComponentSuccessNoChange = (apiCallState: TApiCallState) => {
  //   setApiCallStatus(apiCallState);
  // }
  // const onSubComponentSuccess = (apiCallState: TApiCallState) => {
  //   setApiCallStatus(apiCallState);
  //   setPreviousComponentState();
  // }
  // const onSubComponentError = (apiCallState: TApiCallState) => {
  //   // setApiCallStatus(apiCallState);
  // }
  // const onSubComponentCancel = () => {
  //   setPreviousComponentState();
  // }

  const calculateShowStates = (componentState: TComponentState) => {
    const funcName = 'calculateShowStates';
    const logName = `${componentName}.${funcName}()`;
    if(!componentState.currentState || componentState.currentState === E_COMPONENT_STATE.UNDEFINED) {
      setShowViewComponent(false);
      setShowEditComponent(false);
    }
    else if(  componentState.currentState === E_COMPONENT_STATE.MANAGED_OBJECT_VIEW) {
      setShowViewComponent(true);
      setShowEditComponent(false);
    }
    else if( componentState.currentState === E_COMPONENT_STATE.MANAGED_OBJECT_EDIT) {
      setShowViewComponent(false);
      setShowEditComponent(true);
    }
    else {
      throw new Error(`${logName}: unknown state combination, componentState=${JSON.stringify(componentState, null, 2)}`);
    }
  }

  return (
    <div className="manage-api-parameter">

      { renderToolbar() }

      {showViewComponent && 
        <APViewApiParameter
          apiParameter={managedObject}
          onError={onSubComponentError}
        />
      }
      {showEditComponent && 
        <APEditApiParameter
          apiParameter={managedObject}
          onSave={onEditManagedObjectSave}
          onCancel={onSubComponentCancel}
          onError={onSubComponentError}
        />
      }
    </div>
  );
}
