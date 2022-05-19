import React from 'react';
import { useHistory } from 'react-router-dom';

import { Toast } from 'primereact/toast';

import { TApiCallState } from '../utils/ApiCallState';
import { ManageGetLogin } from '../components/ManageLoginAndSelect/ManageGetLogin';
import { EUICommonResourcePaths } from '../utils/Globals';

import "./Pages.css";

export const UserGetLoginPage: React.FC = () => {
  // const componentName="UserGetLoginPage";

  const toast = React.useRef<any>(null);
  // const toastLifeSuccess: number = 3000;
  const toastLifeError: number = 10000;
  
  // const onSuccess = (apiCallStatus: TApiCallState) => {
  //   toast.current.show({ severity: 'success', summary: 'Success', detail: `${apiCallStatus.context.userDetail}`, life: toastLifeSuccess });
  // }
  
  const history = useHistory();
  const navigateTo = (path: string): void => { history.push(path); }

  const onError = (apiCallStatus: TApiCallState) => {
    toast.current.show({ severity: 'error', summary: 'Error', detail: `${apiCallStatus.context.userDetail}`, life: toastLifeError });
  }

  const onLoginInternal = () => {
    navigateTo(EUICommonResourcePaths.SecLogin);
  }


  return (
    <div className="ap-pages">
      
      <Toast ref={toast} />
      
      <ManageGetLogin
        onError={onError} 
        onLoginInternal={onLoginInternal}
      />
      
    </div>
  );
}
