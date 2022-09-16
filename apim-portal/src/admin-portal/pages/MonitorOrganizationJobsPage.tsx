import React from 'react';

import { Toast } from 'primereact/toast';
import { MenuItem } from 'primereact/components/menuitem/MenuItem';
import { BreadCrumb } from 'primereact/breadcrumb';

import { TApiCallState } from "../../utils/ApiCallState";
import { GlobalElementStyles } from '../../utils/Globals';
import { UserContext } from "../../components/APContextProviders/APUserContextProvider";
import { MonitorOrganizationJobs } from '../components/MonitorOrganizationJobs/MonitorOrganizationJobs';
import { TAPEntityId } from '../../utils/APEntityIdsService';

import "../../pages/Pages.css";

export const MonitorOrganizationJobsPage: React.FC = () => {
  const ComponentName = 'MonitorOrganizationJobsPage';

  const [userContext] = React.useContext(UserContext);  

  const toast = React.useRef<any>(null);
  const toastLifeSuccess: number = 1000;
  const toastLifeError: number = 10000;

  const [breadCrumbItemList, setBreadCrumbItemList] = React.useState<Array<MenuItem>>([]);
  const [organizationEntityId, setOrganizationEntityId] = React.useState<TAPEntityId>();

  const onSuccess = (apiCallStatus: TApiCallState) => {
    toast.current.show({ severity: 'success', summary: 'Success', detail: `${apiCallStatus.context.userDetail}`, life: toastLifeSuccess });
  }

  const onError = (apiCallStatus: TApiCallState) => {
    toast.current.show({ severity: 'error', summary: 'Error', detail: `${apiCallStatus.context.userDetail}`, life: toastLifeError });
  }

  const renderBreadcrumbs = (organizationDisplayName: string) => {
    const breadcrumbItems: Array<MenuItem> = [
      { 
        label: `Organization: ${organizationDisplayName}`
      },
      // { 
      //   label: 'Jobs',
      //   style: GlobalElementStyles.breadcrumbLink(),
      //   command: () => { navigateTo(EUIAdminPortalResourcePaths.MonitorOrganizationJobs) }
      // }
    ];
    breadCrumbItemList.forEach( (item: MenuItem) => {
      breadcrumbItems.push({
        ...item,
        style: (item.command ? GlobalElementStyles.breadcrumbLink() : {})
      });
    });
    return (
      <React.Fragment>
        <BreadCrumb model={breadcrumbItems} />
      </React.Fragment>
    )
  }

  React.useEffect(() => {
    const funcName = 'useEffect([])';
    const logName = `${ComponentName}.${funcName}()`;
    if(!userContext.runtimeSettings.currentOrganizationEntityId) throw new Error(`${logName}: userContext.runtimeSettings.currentOrganizationEntityId is undefined`);
    // alert(`${logName}: location.state=${JSON.stringify(location.state, null, 2)}`);
    setOrganizationEntityId(userContext.runtimeSettings.currentOrganizationEntityId);
  }, []); /* eslint-disable-line react-hooks/exhaustive-deps */

  return (
    <div className="ap-pages">
      <Toast ref={toast} />
      {organizationEntityId && renderBreadcrumbs(organizationEntityId.displayName)}
      {organizationEntityId &&
        <MonitorOrganizationJobs
          organizationId={organizationEntityId.id}
          onSuccess={onSuccess}
          onError={onError}
          setBreadCrumbItemList={setBreadCrumbItemList}
        />
      }
    </div>
  );
}
