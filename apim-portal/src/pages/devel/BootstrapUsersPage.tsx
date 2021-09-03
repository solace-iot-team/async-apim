import React from 'react';
import { Toolbar } from 'primereact/toolbar';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';

import { ApiCallState, TApiCallState } from '../../utils/ApiCallState';
import { Loading } from '../../components/Loading/Loading';
import { 
  ApsUsersService,
  APSUser, 
  APSUserList,
  EAPSAuthRole,
  ApiError as APSApiError,
  ListApsUsersResponse,
} from '@solace-iot-team/apim-server-openapi-browser';
import { APSClientOpenApi } from '../../utils/APSClientOpenApi';

type TApiObject = APSUser;
type TManagedObject = APSUser;
type TManagedObjectList = APSUserList;

const apsUserTemplate: APSUser = {
  userId: "userId",
  password: "password",
  isActivated: false,
  profile: {
    first: "first",
    last: "last",
    email: "@aps.com"
  },
  roles: [ EAPSAuthRole.API_CONSUMER ]    
};

const managedObjectList: TManagedObjectList = [
  {
    userId: "master.user@aps.com",
    password: "master.user@aps.com",
    isActivated: true,
    profile: {
      first: "Master",
      last: "User",
      email: "master.user@aps.com"
    },
    roles: [ 
      EAPSAuthRole.SYSTEM_ADMIN, 
      EAPSAuthRole.LOGIN_AS, 
      EAPSAuthRole.ORGANIZATION_ADMIN, 
      EAPSAuthRole.API_TEAM,
      EAPSAuthRole.API_CONSUMER
     ]    
  },
  {
    userId: "cluster.admin@aps.com",
    password: "cluster.admin@aps.com",
    isActivated: true,
    profile: {  
      first: "cluster",
      last: "admin",
      email: "cluster.admin@aps.com"
    },
    roles: [ EAPSAuthRole.LOGIN_AS, EAPSAuthRole.SYSTEM_ADMIN ]    
  },
  {
    userId: "organization.admin@aps.com",
    password: "organization.admin@aps.com",
    isActivated: true,
    profile: {
      first: "Organization",
      last: "Admin",
      email: "organization.admin@aps.com"
    },
    roles: [ EAPSAuthRole.LOGIN_AS, EAPSAuthRole.ORGANIZATION_ADMIN ]    
  },
  {
    userId: "org0.org0@aps.com",
    password: "org0.org0@aps.com",
    isActivated: true,
    profile: {
      first: "org0",
      last: "org0",
      email: "org0.org0@aps.com"
    },
    roles: [ EAPSAuthRole.API_CONSUMER],
    memberOfOrganizations: [ 'org0']
  },
  {
    userId: "org0.org4@aps.com",
    password: "org0.org4@aps.com",
    isActivated: true,
    profile: {
      first: "org0",
      last: "org4",
      email: "org0.org4@aps.com"
    },
    roles: [ EAPSAuthRole.API_CONSUMER],
    memberOfOrganizations: [ 'org0', 'org1', 'org2', 'org3', 'org4']
  },
  {
    userId: "org5.org5@aps.com",
    password: "org5.org5@aps.com",
    isActivated: true,
    profile: {
      first: "org5",
      last: "org5",
      email: "org5.org5@aps.com"
    },
    roles: [ EAPSAuthRole.API_CONSUMER],
    memberOfOrganizations: [ 'org5']
  },
  {
    userId: "org6.org6@aps.com",
    password: "org6.org6@aps.com",
    isActivated: true,
    profile: {
      first: "org6",
      last: "org6",
      email: "org6.org6@aps.com"
    },
    roles: [ EAPSAuthRole.API_CONSUMER],
    memberOfOrganizations: [ 'org6']
  },
] 



export const BootstrapUsersPage: React.FC = () => {
  const componentName = 'BootstrapUsersPage';

  const [apiCallStatus, setApiCallStatus] = React.useState<TApiCallState | null>(null);
  const [showLoading, setShowLoading] = React.useState<boolean>(false);
  const toast = React.useRef<any>(null);
  const toastLifeSuccess: number = 3000;
  const toastLifeError: number = 10000;

  const onSuccess = (apiCallStatus: TApiCallState) => {
    if(apiCallStatus.context.userDetail) toast.current.show({ severity: 'success', summary: 'Success', detail: `${apiCallStatus.context.userDetail}`, life: toastLifeSuccess });
  }

  const onError = (apiCallStatus: TApiCallState) => {
    toast.current.show({ severity: 'error', summary: 'Error', detail: `${apiCallStatus.context.userDetail}`, life: toastLifeError });
  }

  React.useEffect(() => {
    if (apiCallStatus !== null) {
      if(apiCallStatus.success) onSuccess(apiCallStatus);
      else onError(apiCallStatus);
    }
  }, [apiCallStatus]);

  const transformManagedObjectToApiObject = (managedObject: TManagedObject): TApiObject => {
    return managedObject;
  }

  const apiDeleteAllUsers = async(): Promise<TApiCallState> => {
    const funcName = 'apiDeleteAllUsers';
    const logName = `${componentName}.${funcName}()`;
    setApiCallStatus(null);
    let callState: TApiCallState = ApiCallState.getInitialCallState(logName, `delete all users`);
    try {
      let hasUsers = true;
      while (hasUsers) {
        const response: ListApsUsersResponse = await ApsUsersService.listApsUsers();
        for (const apsUser of response.list) {
          await ApsUsersService.deleteApsUser(apsUser.userId);
        }
        hasUsers = response.meta.totalCount > response.list.length;
      }
    } catch(e) {
      APSClientOpenApi.logError(logName, e);
      callState = ApiCallState.addErrorToApiCallState(e, callState);
    }
    setApiCallStatus(callState);
    return callState;
  }

  const apiCreateOrReplaceManagedObject = async(managedObject: TManagedObject): Promise<TApiCallState> => {
    const funcName = 'apiCreateOrReplaceManagedObject';
    const logName = `${componentName}.${funcName}()`;
    setApiCallStatus(null);
    let callState: TApiCallState = ApiCallState.getInitialCallState(logName, `create/replace user: ${managedObject.userId}`);
    // console.log(`${logName}: upserting ${JSON.stringify(managedObject, null, 2)}`);
    let isCreate: boolean = false;
    const apiObject: APSUser = transformManagedObjectToApiObject(managedObject);
    try {
      try {
        await ApsUsersService.getApsUser(apiObject.userId);
        isCreate = false;
      } catch (e) {
        if(APSClientOpenApi.isInstanceOfApiError(e)) {
          const apiError: APSApiError = e;
          if (apiError.status === 404) isCreate = true;
          else throw e;
        }
      }
      if ( isCreate ) {
        await ApsUsersService.createApsUser(apiObject);
      } else {
        await ApsUsersService.replaceApsUser(apiObject.userId, apiObject);
      }
    } catch(e) {
      APSClientOpenApi.logError(logName, e);
      callState = ApiCallState.addErrorToApiCallState(e, callState);
    }
    setApiCallStatus(callState);
    return callState;
  }

  const doBootstrapPredefinedUsers = async () => {
    const funcName = 'doBootstrapUsers';
    const logName = `${componentName}.${funcName}()`;
    setShowLoading(true);
    for (const managedObject of managedObjectList) {
      let apiCallState: TApiCallState = await apiCreateOrReplaceManagedObject(managedObject);
      if(!apiCallState.success) throw new Error(`${logName}: ${JSON.stringify(apiCallState, null, 2)}`);
    }
    setShowLoading(false);
  }

  const doBootstrap1000Users = async () => {
    const funcName = 'doBootstrap1000Users';
    const logName = `${componentName}.${funcName}()`;
    setShowLoading(true);
    for(let i = 0; i < 1000; i++) {
      const iStr: string = String(i).padStart(5, '0');
      const userId = `x-${iStr}_${apsUserTemplate.userId}@aps.com`;
      const managedObject: TManagedObject = {
        ...apsUserTemplate,
        userId: userId,
        profile: {
          ...apsUserTemplate.profile,
          email: userId
        }
      }
      let apiCallState: TApiCallState = await apiCreateOrReplaceManagedObject(managedObject);
      if(!apiCallState.success) throw new Error(`${logName}: ${JSON.stringify(apiCallState, null, 2)}`);
    }
    for (const managedObject of managedObjectList) {
      let apiCallState: TApiCallState = await apiCreateOrReplaceManagedObject(managedObject);
      if(!apiCallState.success) throw new Error(`${logName}: ${JSON.stringify(apiCallState, null, 2)}`);
    }
    setShowLoading(false);
  }

  const onBootstrapPredefinedUsers = () => {
    doBootstrapPredefinedUsers();
  }

  const onBootstrap1000Users = () => {
    doBootstrap1000Users();
  }

  const doDeleteAllUsers = async () => {
    const funcName = 'doDeleteAllUsers';
    const logName = `${componentName}.${funcName}()`;
    setShowLoading(true);
    let apiCallState: TApiCallState = await apiDeleteAllUsers();
    if(!apiCallState.success) throw new Error(`${logName}: ${JSON.stringify(apiCallState, null, 2)}`);
    setShowLoading(false);
  }

  const onDeleteAllUsers = () => {
    doDeleteAllUsers();
  }

  const leftToolbarTemplate = () => {
    return (
      <React.Fragment>
        <Button label="Bootstrap Predefined Users" onClick={onBootstrapPredefinedUsers} className="p-button-text p-button-plain p-button-outlined"/>
        <Button label="Bootstrap 1000 Users from Template" onClick={onBootstrap1000Users} className="p-button-text p-button-plain p-button-outlined"/>
        <Button label="Delete All Users" onClick={onDeleteAllUsers} className="p-button-text p-button-plain p-button-outlined"/>
      </React.Fragment>
    );
  }

  return (
    <React.Fragment>
        <Toast ref={toast} />
        <Loading show={showLoading} />
        <h1>Bootstrap Users</h1>
        <hr />
        <Toolbar className="p-mb-4" left={leftToolbarTemplate} />
        <hr />
        <h3>User Template:</h3>
        <pre style={ { fontSize: '12px' }} >
          {JSON.stringify(apsUserTemplate, null, 2)}
        </pre>
        <hr />
        <h3>Predefined Users:</h3>
        <pre style={ { fontSize: '12px' }} >
          {JSON.stringify(managedObjectList, null, 2)}
        </pre>
    </React.Fragment>
);

}

