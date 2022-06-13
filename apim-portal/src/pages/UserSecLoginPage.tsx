import React from 'react';

import { Toast } from 'primereact/toast';

import { TApiCallState } from '../utils/ApiCallState';
import { ManageSecLoginAndSelect } from '../components/ManageLoginAndSelect/ManageSecLoginAndSelect';

import "./Pages.css";

export const UserSecLoginPage: React.FC = () => {
  // const componentName="UserLoginPage";

  const toast = React.useRef<any>(null);
  const toastLifeSuccess: number = 3000;
  const toastLifeError: number = 10000;

  const onSuccess = (apiCallStatus: TApiCallState) => {
    toast.current.show({ severity: 'success', summary: 'Success', detail: `${apiCallStatus.context.userDetail}`, life: toastLifeSuccess });
  }
  
  const onError = (apiCallStatus: TApiCallState) => {
    toast.current.show({ severity: 'error', summary: 'Error', detail: `${apiCallStatus.context.userDetail}`, life: toastLifeError });
  }

  return (
    <div className="ap-pages">
      
      <Toast ref={toast} />

      <ManageSecLoginAndSelect
        onSuccess={onSuccess} 
        onError={onError} 
      />

    </div>
  );
}
