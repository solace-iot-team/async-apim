
import React from "react";

import { APIParameter } from "@solace-iot-team/apim-connector-openapi-browser";
import { TAPAttribute } from "../../utils/APConnectorApiCalls";
import { APViewApiParameterAttribute } from "./APViewApiParameterAttribute";
import { APEditNewApiParameterAttribute } from "./APEditNewApiParameterAttribute";
import { APDeleteApiParameterAttribute } from "./APDeleteApiParameterAttribute";

import "../APComponents.css";
import "./APManageApiParameterAttribute.css";

export const ToolbarInlineStyle = { 
  'background': 'none', 
  'border': 'none', 
  'paddingTop': '0rem', 
  'paddingBottom': '0rem', 
  'marginBottom': '0rem !important' 
}

export type TAPManagedApiParameterAttribute = {
  apiParameter: APIParameter,
  apiAttribute?: TAPAttribute
}

export type TAPManageApiParameterAttributeOptions = {
  mode: 'apiProductValues' | 'general'
}
export interface IAPManageApiParameterAttributeProps {
  apManagedApiParameterAttribute: TAPManagedApiParameterAttribute;
  options: TAPManageApiParameterAttributeOptions;
  onSave: (apManagedApiParameterAttribute: TAPManagedApiParameterAttribute) => void;
  onDelete: (apManagedApiParameterAttribute: TAPManagedApiParameterAttribute) => void;
  // onCancel: () => void;
}

export const APManageApiParameterAttribute: React.FC<IAPManageApiParameterAttributeProps> = (props: IAPManageApiParameterAttributeProps) => {
  const componentName = 'APManageApiParameterAttribute';

  enum E_COMPONENT_STATE {
    UNDEFINED = "UNDEFINED",
    MANAGED_AP_API_PARAMETER_ATTRIBUTE_VIEW = "MANAGED_AP_API_PARAMETER_ATTRIBUTE_VIEW",
    MANAGED_AP_API_PARAMETER_ATTRIBUTE_EDIT = "MANAGED_AP_API_PARAMETER_ATTRIBUTE_EDIT",
    MANAGED_AP_API_PARAMETER_ATTRIBUTE_NEW = "MANAGED_AP_API_PARAMETER_ATTRIBUTE_NEW",
    MANAGED_AP_API_PARAMETER_ATTRIBUTE_DELETE = "MANAGED_AP_API_PARAMETER_ATTRIBUTE_DELETE",
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
  const [componentState, setComponentState] = React.useState<TComponentState>(initialComponentState);
  const [apManagedApiParameterAttribute, setApManagedApiParameterAttribute] = React.useState<TAPManagedApiParameterAttribute>(props.apManagedApiParameterAttribute);
  const [showViewComponent, setShowViewComponent] = React.useState<boolean>(false);
  const [showEditNewComponent, setShowEditNewComponent] = React.useState<boolean>(false);
  const [showDeleteComponent, setShowDeleteComponent] = React.useState<boolean>(false);

  // * useEffect Hooks *
  React.useEffect(() => {
    setNewComponentState(E_COMPONENT_STATE.MANAGED_AP_API_PARAMETER_ATTRIBUTE_VIEW);
  }, []); /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    calculateShowStates(componentState);
  }, [componentState]); /* eslint-disable-line react-hooks/exhaustive-deps */

  const onEditAPManagedApiParameterAttribute = (): void => {
    setNewComponentState(E_COMPONENT_STATE.MANAGED_AP_API_PARAMETER_ATTRIBUTE_EDIT);    
  }
  const onNewAPManagedApiParameterAttribute = (): void => {
    setNewComponentState(E_COMPONENT_STATE.MANAGED_AP_API_PARAMETER_ATTRIBUTE_NEW);    
  }
  const onDeleteAPManagedApiParameterAttribute = (): void => {
    setNewComponentState(E_COMPONENT_STATE.MANAGED_AP_API_PARAMETER_ATTRIBUTE_DELETE);    
  }
  const onSaveAPManagedApiParameterAttribute = (apManagedApiParameterAttribute: TAPManagedApiParameterAttribute): void => {
    setApManagedApiParameterAttribute(apManagedApiParameterAttribute);
    setNewComponentState(E_COMPONENT_STATE.MANAGED_AP_API_PARAMETER_ATTRIBUTE_VIEW);
    props.onSave(apManagedApiParameterAttribute);
  }
  const onDeleteConfirmedAPManagedApiParameterAttribute = (apManagedApiParameterAttribute: TAPManagedApiParameterAttribute): void => {
    setApManagedApiParameterAttribute(apManagedApiParameterAttribute);
    setNewComponentState(E_COMPONENT_STATE.MANAGED_AP_API_PARAMETER_ATTRIBUTE_VIEW);
    props.onDelete(apManagedApiParameterAttribute);
  }
  const onSubComponentCancel = () => {
    setNewComponentState(E_COMPONENT_STATE.MANAGED_AP_API_PARAMETER_ATTRIBUTE_VIEW);
  }

  const calculateShowStates = (componentState: TComponentState) => {
    const funcName = 'calculateShowStates';
    const logName = `${componentName}.${funcName}()`;
    if(!componentState.currentState || componentState.currentState === E_COMPONENT_STATE.UNDEFINED) {
      setShowViewComponent(false);
      setShowEditNewComponent(false);
      setShowDeleteComponent(false);
    }
    else if( componentState.currentState === E_COMPONENT_STATE.MANAGED_AP_API_PARAMETER_ATTRIBUTE_VIEW) {
      setShowViewComponent(true);
      setShowEditNewComponent(false);
      setShowDeleteComponent(false);
    }
    else if(componentState.currentState === E_COMPONENT_STATE.MANAGED_AP_API_PARAMETER_ATTRIBUTE_EDIT ||
            componentState.currentState === E_COMPONENT_STATE.MANAGED_AP_API_PARAMETER_ATTRIBUTE_NEW) {
      setShowViewComponent(false);
      setShowEditNewComponent(true);
      setShowDeleteComponent(false);
    }
    else if( componentState.currentState === E_COMPONENT_STATE.MANAGED_AP_API_PARAMETER_ATTRIBUTE_DELETE) {
      setShowViewComponent(true);
      setShowEditNewComponent(false);
      setShowDeleteComponent(true);
    }
    else {
      throw new Error(`${logName}: unknown state combination, componentState=${JSON.stringify(componentState, null, 2)}`);
    }
  }

  return (
    <div className="manage-attribute">
      {showViewComponent && 
        <APViewApiParameterAttribute
          apManagedApiParameterAttribute={apManagedApiParameterAttribute}
          options={props.options}
          onNew={onNewAPManagedApiParameterAttribute}
          onEdit={onEditAPManagedApiParameterAttribute}
          onDelete={onDeleteAPManagedApiParameterAttribute}
        />
      }
      {showEditNewComponent && 
        <APEditNewApiParameterAttribute
          apManagedApiParameterAttribute={apManagedApiParameterAttribute}
          onSave={onSaveAPManagedApiParameterAttribute}
          onCancel={onSubComponentCancel}
        />
      }
      {showDeleteComponent && 
        <APDeleteApiParameterAttribute
          apManagedApiParameterAttribute={apManagedApiParameterAttribute}
          onConfirmed={onDeleteConfirmedAPManagedApiParameterAttribute}
          onCancel={onSubComponentCancel}
      />
    }
    </div>
  );
}
