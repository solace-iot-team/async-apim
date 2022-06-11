import React from 'react';
import { useLocation } from 'react-router-dom';

import { Toast } from 'primereact/toast';

import { TApiCallState } from '../utils/ApiCallState';
import { ManageLoginAndSelect } from '../components/ManageLoginAndSelect/deleteme.ManageLoginAndSelect';
import { TAPUserLoginCredentials } from '../displayServices/APUsersDisplayService/APLoginUsersDisplayService';

import "./Pages.css";

export const UserLoginPage: React.FC = () => {
  // const componentName="UserLoginPage";

  const toast = React.useRef<any>(null);
  const toastLifeSuccess: number = 3000;
  const toastLifeError: number = 10000;

  const location = useLocation<TAPUserLoginCredentials>();
  
  const onSuccess = (apiCallStatus: TApiCallState) => {
    toast.current.show({ severity: 'success', summary: 'Success', detail: `${apiCallStatus.context.userDetail}`, life: toastLifeSuccess });
  }
  
  const onError = (apiCallStatus: TApiCallState) => {
    toast.current.show({ severity: 'error', summary: 'Error', detail: `${apiCallStatus.context.userDetail}`, life: toastLifeError });
  }

  return (
    <div className="ap-pages">
      
      <Toast ref={toast} />
      
      <ManageLoginAndSelect
        onSuccess={onSuccess} 
        onError={onError} 
        userCredentials={location.state}
      />

    </div>
  );
}
