import React from 'react';
import { useHistory } from 'react-router-dom';

import { MenuItem } from 'primereact/api';
import { Toast } from 'primereact/toast';
import { BreadCrumb } from 'primereact/breadcrumb';

import { TApiCallState } from "../../utils/ApiCallState";
import { EUIAdminPortalResourcePaths, GlobalElementStyles } from '../../utils/Globals';
import { MonitorSystemHealth } from '../components/MonitorSystemHealth/MonitorSystemHealth';

import "../../pages/Pages.css";

export const MonitorSystemHealthPage: React.FC = () => {

  const toast = React.useRef<any>(null);
  const toastLifeSuccess: number = 3000;
  const toastLifeError: number = 10000;

  const [breadCrumbItemList, setBreadCrumbItemList] = React.useState<Array<MenuItem>>([]);
  const history = useHistory();
  const navigateTo = (path: string): void => { history.push(path); }
  
  const onSuccess = (apiCallStatus: TApiCallState) => {
    toast.current.show({ severity: 'success', summary: 'Success', detail: `${apiCallStatus.context.userDetail}`, life: toastLifeSuccess });
  }
  const onError = (apiCallStatus: TApiCallState) => {
    toast.current.show({ severity: 'error', summary: 'Error', detail: `${apiCallStatus.context.userDetail}`, life: toastLifeError });
  }
  
  const renderBreadcrumbs = () => {
    const breadcrumbItems: Array<MenuItem> = [
      { 
        label: 'System'
      },
      { 
        label: 'Monitor'
      },
      { 
        label: 'Health',
        style: GlobalElementStyles.breadcrumbLink(),
        command: () => { navigateTo(EUIAdminPortalResourcePaths.MonitorSystemHealth) }
      }
    ];
    breadCrumbItemList.forEach( (item: MenuItem) => {
      breadcrumbItems.push({
        ...item,
        style: (item.command ? GlobalElementStyles.breadcrumbLink() : {})
      });
    })
    return (
      <React.Fragment>
        <BreadCrumb model={breadcrumbItems} />
      </React.Fragment>
    )
  }

  return (
    <React.Fragment>
      <Toast ref={toast} />
      {renderBreadcrumbs()}

      <MonitorSystemHealth 
        onSuccess={onSuccess} 
        onError={onError} 
        setBreadCrumbItemList={setBreadCrumbItemList}      
      />
    </React.Fragment>
  );
}
 