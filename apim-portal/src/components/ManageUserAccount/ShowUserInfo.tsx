
import React from "react";

import { APComponentHeader } from "../APComponentHeader/APComponentHeader";
import { TApiCallState } from "../../utils/ApiCallState";
import { ManageUserAccountCommon, TApiCallResult, TManagedObject } from "./ManageUserAccountCommon";
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

  const [userContext] = React.useContext(UserContext);
  const [configContext] = React.useContext(ConfigContext);
  const [managedObject, setManagedObject] = React.useState<TManagedObject>();  
  const [viewManagedObject, setViewManagedObject] = React.useState<TViewManagedObject>();
  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
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
