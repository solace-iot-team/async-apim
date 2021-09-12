import React from 'react';
import { Toolbar } from 'primereact/toolbar';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';

import { ApiCallState, TApiCallState } from '../../utils/ApiCallState';
import { Loading } from '../../components/Loading/Loading';
import { 
  ApsConfigService,
  APSConnector, 
  APSConnectorList,
  EAPSClientProtocol,
  ApiError as APSApiError,
  ListApsConnectorsResponse,
} from '@solace-iot-team/apim-server-openapi-browser';
import { APSClientOpenApi } from '../../utils/APSClientOpenApi';


type TApiObject = APSConnector;
type TManagedObject = APSConnector;
type TManagedObjectList = APSConnectorList;

const managedObjectList: TManagedObjectList = [
  {
    connectorId: 'localDevelConnectorRelease',
    displayName: 'Local Development Connector (docker/release)',
    description: 'Local Development Connector (docker/release)',
    isActive: false,
    connectorClientConfig: {
      protocol: EAPSClientProtocol.HTTP,
      host: '127.0.0.1',
      port: 9090,
      apiVersion: 'v1',
      serviceUser: 'apim-portal-service-admin',
      serviceUserPwd: 'Solace123!'
    }
  },
  {
    connectorId: 'localDevelConnectorRepo',
    displayName: 'Local Development Connector (repo)',
    description: 'Local Development Connector (repo)',
    isActive: false,
    connectorClientConfig: {
      protocol: EAPSClientProtocol.HTTP,
      host: '127.0.0.1',
      port: 9010,
      apiVersion: 'v1',
      serviceUser: 'apim-portal-service-admin',
      serviceUserPwd: 'Solace123!'
    }
  },
  {
    connectorId: 'teamDevelConnectorAws',
    displayName: 'Team Development Connector (AWS)',
    description: 'Team Development Connector (AWS)',
    isActive: false,
    connectorClientConfig: {
      protocol: EAPSClientProtocol.HTTP,
      host: '18.184.18.52',
      port: 3000,
      apiVersion: 'v1',
      serviceUser: 'apim-portal-service-admin',
      serviceUserPwd: 'Solace123!'
    }
  }
] 

export const BootstrapConnectorsPage: React.FC = () => {
  const componentName = 'BootstrapConnectorsPage';

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

  const apiDeleteAllConnectors = async(): Promise<TApiCallState> => {
    const funcName = 'apiDeleteAllConnectors';
    const logName = `${componentName}.${funcName}()`;
    setApiCallStatus(null);
    let callState: TApiCallState = ApiCallState.getInitialCallState(logName, `delete all connectors`);
    try {
      const listApsConnectorsResponse: ListApsConnectorsResponse = await ApsConfigService.listApsConnectors();
      const apsConnectorList: APSConnectorList = listApsConnectorsResponse.list;
      for (const apsConnector of apsConnectorList) {
        await ApsConfigService.deleteApsConnector(apsConnector.connectorId);
      }
    } catch(e: any) {
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
    let callState: TApiCallState = ApiCallState.getInitialCallState(logName, `create/replace connector: ${managedObject.connectorId}`);
    // console.log(`${logName}: upserting ${JSON.stringify(managedObject, null, 2)}`);
    let isCreate: boolean = false;
    const apiObject: APSConnector = transformManagedObjectToApiObject(managedObject);
    try {
      try {
        await ApsConfigService.getApsConnector(apiObject.connectorId);
        isCreate = false;
      } catch (e: any) {
        if(APSClientOpenApi.isInstanceOfApiError(e)) {
          const apiError: APSApiError = e;
          if (apiError.status === 404) isCreate = true;
          else throw e;
        }
      }
      if ( isCreate ) {
        await ApsConfigService.createApsConnector(apiObject);
      } else {
        await ApsConfigService.replaceApsConnector(apiObject.connectorId, apiObject);
      }
    } catch(e: any) {
      APSClientOpenApi.logError(logName, e);
      callState = ApiCallState.addErrorToApiCallState(e, callState);
    }
    setApiCallStatus(callState);
    return callState;
  }

  const doBootstrapManagedObjectList = async () => {
    const funcName = 'doBootstrapManagedObjectList';
    const logName = `${componentName}.${funcName}()`;
    setShowLoading(true);
    for (const managedObject of managedObjectList) {
      let apiCallState: TApiCallState = await apiCreateOrReplaceManagedObject(managedObject);
      if(!apiCallState.success) throw new Error(`${logName}: ${JSON.stringify(apiCallState, null, 2)}`);
    }
    setShowLoading(false);
  }

  const onBootstrapManagedObjectList = () => {
    doBootstrapManagedObjectList();
  }

  const doDeleteAllManagedObjects = async () => {
    const funcName = 'doDeleteAllManagedObjects';
    const logName = `${componentName}.${funcName}()`;
    setShowLoading(true);
    let apiCallState: TApiCallState = await apiDeleteAllConnectors();
    if(!apiCallState.success) throw new Error(`${logName}: ${JSON.stringify(apiCallState, null, 2)}`);
    setShowLoading(false);
  }

  const onDeleteAllManagedObjects = () => {
    doDeleteAllManagedObjects();
  }

  const leftToolbarTemplate = () => {
    return (
      <React.Fragment>
        <Button label="Bootstrap Connectors" onClick={onBootstrapManagedObjectList} className="p-button-text p-button-plain p-button-outlined"/>
        <Button label="Delete All Connectors" onClick={onDeleteAllManagedObjects} className="p-button-text p-button-plain p-button-outlined"/>
      </React.Fragment>
    );
  }

  return (
    <React.Fragment>
        <Toast ref={toast} />
        <Loading show={showLoading} />
        <h1>Bootstrap Connectors</h1>
        <hr />
        <Toolbar className="p-mb-4" left={leftToolbarTemplate} />
        <hr />
        <pre style={ { fontSize: '12px' }} >
          {JSON.stringify(managedObjectList, null, 2)}
        </pre>
    </React.Fragment>
  );

}

