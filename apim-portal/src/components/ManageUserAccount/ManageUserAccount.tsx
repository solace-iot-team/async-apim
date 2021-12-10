
import React from "react";

import { Toolbar } from 'primereact/toolbar';
import { Button } from 'primereact/button';

import { TApiCallState } from "../../utils/ApiCallState";
import { E_CALL_STATE_ACTIONS } from "./ManageUserAccountCommon";
import { Loading } from "../Loading/Loading";
import { EditUserProfile } from "./EditUserProfile";
import { EditUserCredentials } from "./EditUserCredentials";
import { EditUserSettings } from "./EditUserSettings";
import { ShowUserInfo } from "./ShowUserInfo";

import "../APComponents.css";
import "./ManageUserAccount.css";

export interface IManageUserAccountProps {
  onError: (apiCallState: TApiCallState) => void;
  onSuccess: (apiCallState: TApiCallState) => void;
  onCancel: () => void;
  onBreadCrumbLabelList: (breadCrumbLableList: Array<string>) => void;
}

export const ManageUserAccount: React.FC<IManageUserAccountProps> = (props: IManageUserAccountProps) => {
  const componentName = 'ManageUserAccount';

  enum E_COMPONENT_STATE {
    UNDEFINED = "UNDEFINED",
    VIEW_USER_INFO = "VIEW_USER_INFO",
    MANAGE_USER_PROFILE = "MANAGE_USER_PROFILE",
    MANAGE_USER_CREDENTIALS = "MANAGE_USER_CREDENTIALS",
    MANAGE_USER_SETTINGS = "MANAGE_USER_SETTINGS",
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
  // const setPreviousComponentState = () => {
  //   setComponentState({
  //     previousState: componentState.currentState,
  //     currentState: componentState.previousState
  //   });
  // }

  const [componentState, setComponentState] = React.useState<TComponentState>(initialComponentState);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [apiCallStatus, setApiCallStatus] = React.useState<TApiCallState | null>(null);
  const [showUserInfoComponent, setShowUserInfoComponent] = React.useState<boolean>(false);
  const [showUserProfileComponent, setShowUserProfileComponent] = React.useState<boolean>(false);
  const [showUserCredentialsComponent, setShowUserCredentialsComponent] = React.useState<boolean>(false);
  const [showUserSettingsComponent, setShowUserSettingsComponent] = React.useState<boolean>(false);

  // * useEffect Hooks *
  React.useEffect(() => {
    setNewComponentState(E_COMPONENT_STATE.VIEW_USER_INFO);
  }, []); /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    calculateShowStates(componentState); 
  }, [componentState]); /* eslint-disable-line react-hooks/exhaustive-deps */
  
  React.useEffect(() => {
    if (apiCallStatus !== null) {
      if(apiCallStatus.success) {
        switch (apiCallStatus.context.action) {
          case E_CALL_STATE_ACTIONS.API_UPDATE_USER:
              props.onSuccess(apiCallStatus);
            break;
          default:
        }
      } else props.onError(apiCallStatus);
    }
  }, [apiCallStatus]); /* eslint-disable-line react-hooks/exhaustive-deps */


  const onViewUserInfo = (): void => {
    setNewComponentState(E_COMPONENT_STATE.VIEW_USER_INFO);
  }

  const onManageUserProfile = (): void => {
    setNewComponentState(E_COMPONENT_STATE.MANAGE_USER_PROFILE);
  }

  const onManageUserCredentials = (): void => {
    setNewComponentState(E_COMPONENT_STATE.MANAGE_USER_CREDENTIALS);
  }

  const onManageUserSettings = (): void => {
    setNewComponentState(E_COMPONENT_STATE.MANAGE_USER_SETTINGS);
  }

  // * Toolbar *
  const renderLeftToolbarContent = (): JSX.Element | undefined => {
    if(!componentState.currentState) return undefined;

    return (
      <React.Fragment>
        <Button label="Info" icon="pi pi-fw pi-info-circle" className="p-button-text p-button-plain p-button-outlined" onClick={onViewUserInfo} />
        <Button label="Profile" icon="pi pi-fw pi-user" className="p-button-text p-button-plain p-button-outlined" onClick={onManageUserProfile} />
        <Button label="Credentials" icon="pi pi-fw pi-lock" className="p-button-text p-button-plain p-button-outlined" onClick={onManageUserCredentials} />
        {/* <Button label="Settings" icon="pi pi-fw pi-cog" className="p-button-text p-button-plain p-button-outlined" onClick={onManageUserSettings} /> */}
      </React.Fragment>
    );
  }

  const renderToolbar = (): JSX.Element => {
    const leftToolbarTemplate: JSX.Element | undefined = renderLeftToolbarContent();
    if(leftToolbarTemplate) return (<Toolbar className="p-mb-4" left={leftToolbarTemplate} />);
    else return (<React.Fragment></React.Fragment>);
  }

  // * prop callbacks *
  const onSubComponentSuccess = (apiCallState: TApiCallState) => {
    setApiCallStatus(apiCallState);
    // setPreviousComponentState();
  }
  const onSubComponentError = (apiCallState: TApiCallState) => {
    setApiCallStatus(apiCallState);
  }

  const onSubComponentCancel = () => {
    props.onCancel();
  }

  const calculateShowStates = (componentState: TComponentState) => {
    const funcName = 'calculateShowStates';
    const logName = `${componentName}.${funcName}()`;
    if(!componentState.currentState || componentState.currentState === E_COMPONENT_STATE.UNDEFINED) {
      setShowUserProfileComponent(false);
      setShowUserCredentialsComponent(false);
      setShowUserSettingsComponent(false);
      setShowUserInfoComponent(false);
    }
    else if(componentState.currentState === E_COMPONENT_STATE.VIEW_USER_INFO) {
      setShowUserProfileComponent(false);
      setShowUserCredentialsComponent(false);
      setShowUserSettingsComponent(false);
      setShowUserInfoComponent(true);
    }
    else if(componentState.currentState === E_COMPONENT_STATE.MANAGE_USER_PROFILE) {
      setShowUserProfileComponent(true);
      setShowUserCredentialsComponent(false);
      setShowUserSettingsComponent(false);
      setShowUserInfoComponent(false);
    }
    else if(componentState.currentState === E_COMPONENT_STATE.MANAGE_USER_CREDENTIALS) {
      setShowUserProfileComponent(false);
      setShowUserCredentialsComponent(true);
      setShowUserSettingsComponent(false);
      setShowUserInfoComponent(false);
    }
    else if(componentState.currentState === E_COMPONENT_STATE.MANAGE_USER_SETTINGS) {
      setShowUserProfileComponent(false);
      setShowUserCredentialsComponent(false);
      setShowUserSettingsComponent(true);
      setShowUserInfoComponent(false);
    } else {
      throw new Error(`${logName}: unhandled state combination. componentState=${JSON.stringify(componentState)}`);
    }
  }

  return (
    <div className="manage-user-account">

      <Loading show={isLoading} />      

      {!isLoading &&
        renderToolbar()
      }

      {showUserInfoComponent && 
        <ShowUserInfo
          onSuccess={onSubComponentSuccess} 
          onError={onSubComponentError} 
          onCancel={onSubComponentCancel}
          onLoadingChange={setIsLoading} 
        />
      }
      {showUserProfileComponent && 
        <EditUserProfile
          onSuccess={onSubComponentSuccess} 
          onError={onSubComponentError} 
          onCancel={onSubComponentCancel}
          onLoadingChange={setIsLoading} 
        />
      }
      {showUserCredentialsComponent && 
        <EditUserCredentials
          onSuccess={onSubComponentSuccess} 
          onError={onSubComponentError} 
          onCancel={onSubComponentCancel}
          onLoadingChange={setIsLoading} 
        />
      }
      {showUserSettingsComponent && 
        <EditUserSettings
          onSuccess={onSubComponentSuccess} 
          onError={onSubComponentError} 
          onCancel={onSubComponentCancel}
          onLoadingChange={setIsLoading} 
        />
      }
    </div>  
  );
}
