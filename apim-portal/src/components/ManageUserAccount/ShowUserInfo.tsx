
import React from "react";
import { useForm, Controller, FieldError } from 'react-hook-form';

import { InputText } from 'primereact/inputtext';
import { Password } from "primereact/password";
import { Button } from 'primereact/button';
import { Toolbar } from "primereact/toolbar";
import { Divider } from "primereact/divider";
import { classNames } from 'primereact/utils';

import { APComponentHeader } from "../APComponentHeader/APComponentHeader";
import { TApiCallState } from "../../utils/ApiCallState";
import { ApiCallStatusError } from "../ApiCallStatusError/ApiCallStatusError";
import { E_CALL_STATE_ACTIONS, ManageUserAccountCommon, TApiCallResult, TManagedObject, TUpdateApiObject } from "./ManageUserAccountCommon";
import { APSOpenApiFormValidationRules } from "../../utils/APSOpenApiFormValidationRules";
import { UserContext } from "../UserContextProvider/UserContextProvider";
import { ConfigContext } from "../ConfigContextProvider/ConfigContextProvider";
import { ConfigHelper } from "../ConfigContextProvider/ConfigHelper";

import "../APComponents.css";
import "./ManageUserAccount.css";

export interface IShowUserInfoProps {
  onError: (apiCallState: TApiCallState) => void;
  onSuccess: (apiCallState: TApiCallState) => void;
  onCancel: () => void;
  onLoadingChange: (isLoading: boolean) => void;
}

export const ShowUserInfo: React.FC<IShowUserInfoProps> = (props: IShowUserInfoProps) => {
  // const componentName = 'ShowUserInfo';

  type TViewManagedObject = TManagedObject & {
    roleDisplayNameListAsString: string
  }

  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  const [userContext, dispatchUserContextAction] = React.useContext(UserContext);
  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  const [configContext, dispatchConfigContextAction] = React.useContext(ConfigContext);
  const [managedObject, setManagedObject] = React.useState<TManagedObject>();  
  const [viewManagedObject, setViewManagedObject] = React.useState<TViewManagedObject>();
  const [apiCallStatus, setApiCallStatus] = React.useState<TApiCallState | null>(null);

  const transformManagedObjectToViewManagedObject = (managedObject: TManagedObject): TViewManagedObject => {
    return {
      ...managedObject,
      roleDisplayNameListAsString: ConfigHelper.getAuthorizedRolesDisplayNameList(managedObject.roles, configContext).join(', ')
    }
  }

  // * useEffect Hooks *
  const doInitialize = async () => {
    props.onLoadingChange(true);
    const apiCallResult: TApiCallResult = await ManageUserAccountCommon.apiGetManagedObject(userContext.user.userId);
    setApiCallStatus(apiCallResult.apiCallState);
    setManagedObject(apiCallResult.managedObject);
    props.onLoadingChange(false);
  }

  React.useEffect(() => {
    doInitialize();
  }, []); /* eslint-disable-line react-hooks/exhaustive-deps */
  
  React.useEffect(() => {
    if(managedObject) {
      setViewManagedObject(transformManagedObjectToViewManagedObject(managedObject));
    }
  }, [managedObject]) /* eslint-disable-line react-hooks/exhaustive-deps */

  const renderViewManagedObject = () => {
    // const funcName = 'renderManagedObjectForm';
    // const logName = `${componentName}.${funcName}()`;
    return (
      <div className="p-col-12">
        <div className="view-user-info">
          <div>Id: {viewManagedObject?.userId}</div>
          <div>E-Mail: {viewManagedObject?.profile.email}</div>
          <div>Name: {viewManagedObject?.profile.first} {viewManagedObject?.profile.last}</div>
          <div>Roles: {viewManagedObject?.roleDisplayNameListAsString}</div>
        </div>
        </div>
    );
  }

  return (
    <div className="manage-user-account">

      <APComponentHeader header='Info:' />

      {/* <ApiCallStatusError apiCallStatus={apiCallStatus} /> */}

      {viewManagedObject && 
        renderViewManagedObject()
      }
    </div>
  );
}