import React from 'react';

import { Toolbar } from 'primereact/toolbar';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';

import { ApiCallState, TApiCallState } from '../../utils/ApiCallState';
import { Loading } from '../../components/Loading/Loading';
import { AdministrationService, Organization } from '@solace-iot-team/platform-api-openapi-client-fe';
import { APClientConnectorOpenApi } from '../../utils/APClientConnectorOpenApi';

type TApiObject = Organization;
type TManagedObject = Organization;
type TManagedObjectList = Array<TManagedObject>;

const managedObjectTemplate: TManagedObject = {
    name: "org",
    "cloud-token": "eyJhbGciOiJSUzI1NiIsImtpZCI6Im1hYXNfcHJvZF8yMDIwMDMyNiIsInR5cCI6IkpXVCJ9.eyJvcmciOiJzb2xhY2Vpb3R0ZWFtIiwib3JnVHlwZSI6IkVOVEVSUFJJU0UiLCJzdWIiOiIyNXM2ZGZyYmwzbHQiLCJwZXJtaXNzaW9ucyI6IkFBQUFBSUFQQUFBQWZ6Z0E0QUVBQUFBQUFBQUFBQUFBQUFDd3pnY2ciLCJhcGlUb2tlbklkIjoiMmtqam81NTFuZTgiLCJpc3MiOiJTb2xhY2UgQ29ycG9yYXRpb24iLCJpYXQiOjE2MTg4MzU2NzR9.o3Vh2_5aXZWCvaFvyj260BAVe1SHXfxsdsHMdaXmgmblk1ivOm1UPNAiQ5vWY6br1i241iUyYB-KsalQ4t9qn6Gktm-s9blHe2nUuUafF4nPEEto6jWd7u8ABn_fS2fMNKVpDLqThUG23K_HsJRY11oP1FwBOyZ2lIpKl5dsgA2iDSw77xi1-p2sJVnqlpXzRuS9eZE-oDugf1kaN5OfrRhjgAC9hS1i57V593oGjgoGpDOz4g76FyjirgbrIu3DPPKAOknv0V85h4LvLelTVNBrWAqbgKLaHAXWv_hAF7kMO00MFa2ksf48j7tChc17xhAAU2fBuhh31isJHTdFng"
};
const numberOfOrganizations2Bootstrap: number = 10;

export const BootstrapOrganizationsPage: React.FC = () => {
  const componentName = 'BootstrapOrganizationsPage';

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

  const apiDeleteAllOrganizations = async(): Promise<TApiCallState> => {
    const funcName = 'apiDeleteAllOrganizations';
    const logName = `${componentName}.${funcName}()`;
    setApiCallStatus(null);
    let callState: TApiCallState = ApiCallState.getInitialCallState(logName, `delete all organizations`);
    try {
      const organizationList: Array<Organization> = await AdministrationService.listOrganizations();
      for (const organization of organizationList) {
        await AdministrationService.deleteOrganization(organization.name);
      }
    } catch(e) {
      APClientConnectorOpenApi.logError(logName, e);
      callState = ApiCallState.addErrorToApiCallState(e, callState);
    }
    setApiCallStatus(callState);
    return callState;
  }

  const replaceManagedObject = async(managedObject: TManagedObject): Promise<TApiCallState> => {
    const funcName = 'createOrReplaceManagedObject';
    const logName = `${componentName}.${funcName}()`;
    setApiCallStatus(null);
    let callState: TApiCallState = ApiCallState.getInitialCallState(logName, `create/replace organization: ${managedObject.name}`);
    console.log(`${logName}: upserting ${JSON.stringify(managedObject, null, 2)}`);
    try { 
      let apiObject: TApiObject = transformManagedObjectToApiObject(managedObject);
      try {
        await AdministrationService.deleteOrganization(apiObject.name);
      } catch(e) {}
      await AdministrationService.createOrganization(apiObject);  
    } catch(e) {
      APClientConnectorOpenApi.logError(logName, e);
      callState = ApiCallState.addErrorToApiCallState(e, callState);
    }
    setApiCallStatus(callState);
    return callState;
  }

  const doBootstrapOrganizations = async () => {
    const funcName = 'doBootstrapOrganizations';
    const logName = `${componentName}.${funcName}()`;
    setShowLoading(true);
    let _managedObjectList: TManagedObjectList = [];
    for (let i=0; i < numberOfOrganizations2Bootstrap; i++) {
      _managedObjectList.push({
        name: managedObjectTemplate.name + i,
        "cloud-token": managedObjectTemplate['cloud-token']
      });
    }
    for (const _managedObject of _managedObjectList) {
      let apiCallState: TApiCallState = await replaceManagedObject(_managedObject);
      if(!apiCallState.success) throw new Error(`${logName}: ${JSON.stringify(apiCallState, null, 2)}`);
    }
    setShowLoading(false);
  }

  const doDeleteAllOrganizations = async () => {
    const funcName = 'doDeleteAllOrganizations';
    const logName = `${componentName}.${funcName}()`;
    setShowLoading(true);
    let apiCallState: TApiCallState = await apiDeleteAllOrganizations();
    if(!apiCallState.success) throw new Error(`${logName}: ${JSON.stringify(apiCallState, null, 2)}`);
    setShowLoading(false);
  }

  const onBootstrapOrganizations = () => {
    doBootstrapOrganizations();
  }

  const onDeleteAllOrganizations = () => {
    doDeleteAllOrganizations();
  }

  const leftToolbarTemplate = () => {
    return (
      <React.Fragment>
        <Button label="Bootstrap Organizations" onClick={onBootstrapOrganizations} className="p-button-text p-button-plain p-button-outlined"/>
        <Button label="Delete All Organizations" onClick={onDeleteAllOrganizations} className="p-button-text p-button-plain p-button-outlined"/>
      </React.Fragment>
    );
  }

  return (
    <React.Fragment>
        <Toast ref={toast} />
        <Loading show={showLoading} />
        <h1>Bootstrap Organizations Page</h1>
        <hr />
        <Toolbar className="p-mb-4" left={leftToolbarTemplate} />
        <hr />
        <p>Number: {numberOfOrganizations2Bootstrap}</p>
        <p>Template:</p>
        <pre style={ { fontSize: '12px' }} >
          {JSON.stringify(managedObjectTemplate, null, 2)}
        </pre>
    </React.Fragment>
);

}

