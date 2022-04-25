
import React from "react";
import { useForm, Controller, FieldError } from 'react-hook-form';

import { DataTable } from 'primereact/datatable';
import { Column } from "primereact/column";
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Button } from 'primereact/button';
import { Toolbar } from 'primereact/toolbar';
import { classNames } from 'primereact/utils';

import { 
  EnvironmentsService, 
  EnvironmentResponse, 
  Protocol, 
  Endpoint, 
  EnvironmentPatch, 
  CommonEntityNameList
} from '@solace-iot-team/apim-connector-openapi-browser';

import { APComponentHeader } from "../../../components/APComponentHeader/APComponentHeader";
import { ApiCallState, TApiCallState } from "../../../utils/ApiCallState";
import { APClientConnectorOpenApi } from "../../../utils/APClientConnectorOpenApi";
import { ApiCallStatusError } from "../../../components/ApiCallStatusError/ApiCallStatusError";
import { TAPEnvironmentName, TAPOrganizationId } from "../../../components/deleteme.APComponentsCommon";
import { E_CALL_STATE_ACTIONS } from "./ManageEnvironmentsCommon";

import '../../../components/APComponents.css';
import "./ManageEnvironments.css";

export interface IEditEnvironmentProps {
  organizationName: TAPOrganizationId;
  environmentName: TAPEnvironmentName;
  environmentDisplayName: string;
  onError: (apiCallState: TApiCallState) => void;
  onSuccess: (apiCallState: TApiCallState, updatedDisplayName?: string) => void;
  onCancel: () => void;
  onLoadingChange: (isLoading: boolean) => void;
}

export const EditEnvironment: React.FC<IEditEnvironmentProps> = (props: IEditEnvironmentProps) => {
  const componentName = 'EditEnvironment';

  type TUpdateApiObject = EnvironmentPatch;
  type TGetApiObject = EnvironmentResponse;
  type TManagedObject = TGetApiObject & {
    apiUsedBy_ApiProductEntityNameList: CommonEntityNameList
  }
  type TServiceEndpoint = Endpoint;
  type TServiceEndpointList = Array<TServiceEndpoint>;
  type TManagedObjectFormData = TManagedObject;
  type TManagedObjectTableDataRow = TManagedObject & {
    transformedServiceClassDisplayedAttributes: {
      highAvailability: string
    },
    exposedServiceEndpointList: TServiceEndpointList,
    availableServiceEndpointList: TServiceEndpointList
  }; 
  type TManagedObjectTableDataList = Array<TManagedObjectTableDataRow>; 

  const transformGetApiObjectToManagedObject = (getApiObject: TGetApiObject, usedByApiProductEntityNameList: CommonEntityNameList): TManagedObject => {
    return {
      ...getApiObject,
      apiUsedBy_ApiProductEntityNameList: usedByApiProductEntityNameList
    }
  }

  const transformManagedObjectToUpdateApiObject = (managedObject: TManagedObject): TUpdateApiObject => {
    return {
      displayName: managedObject.displayName,
      description: managedObject.description,
      serviceId: managedObject.serviceId,
      exposedProtocols: managedObject.exposedProtocols
    }
  }

  const transformManagedObjectToFormData = (managedObject: TManagedObject): TManagedObjectFormData => {
    return managedObject;
  }

  const transformServiceEndpointListToProtocolList = (serviceEndpointList: TServiceEndpointList): Array<Protocol> => {
    const funcName = 'transformServiceEndpointListToProtocolList';
    const logName = `${componentName}.${funcName}()`;
    let _protocolList: Array<Protocol> = [];
    if(!serviceEndpointList || serviceEndpointList.length === 0) throw new Error(`${logName}: serviceEndpointList undefined or empty`);
    serviceEndpointList.forEach((serviceEndpoint: TServiceEndpoint) => {
      if(!serviceEndpoint.protocol) throw new Error(`${logName}: serviceEndpoint has no protocol defined`);
      _protocolList.push({
        name: serviceEndpoint.protocol.name,
        version: serviceEndpoint.protocol.version
      })
    });
    return _protocolList;
  }

  const transformFormDataToManagedObject = (formData: TManagedObjectFormData): TManagedObject => {
    return formData;
  }

  const _transformManagedObjectMessagingProtocolsToTableDataRow = (messagingProtocolList: Array<Endpoint>): TServiceEndpointList => {
    return messagingProtocolList;
  }

  const _transformManagedObjectExposedProtocolsToTableDataRow = (exposedProtocolList: Array<Protocol>, messagingProtocolList: Array<Endpoint>): TServiceEndpointList => {
    let _exposedServiceEndpointList: Array<TServiceEndpoint> = [];
    exposedProtocolList.forEach( (exposedProtocol: Protocol) => {
      const exposedServiceEndpoint: TServiceEndpoint | undefined = messagingProtocolList.find( (endpoint: Endpoint) => {
        if(endpoint.protocol) return (endpoint.protocol?.name === exposedProtocol.name)
        else return false;
      });
      if(exposedServiceEndpoint) _exposedServiceEndpointList.push(exposedServiceEndpoint);
    });
    return _exposedServiceEndpointList;
  }

  const transformManagedObjectToTableDataRow = (managedObject: TManagedObject): TManagedObjectTableDataRow => {
    const highAvailability: string | undefined = managedObject.serviceClassDisplayedAttributes?.["High Availability"];
    const exposedProtocols: Array<Protocol> = managedObject.exposedProtocols ? managedObject.exposedProtocols : [];
    const messagingProtocols: Array<Endpoint> = managedObject.messagingProtocols ? managedObject.messagingProtocols : [];
    const managedObjectTableDataRow: TManagedObjectTableDataRow = {
      ...managedObject,
      transformedServiceClassDisplayedAttributes: {
        highAvailability: highAvailability ? highAvailability : 'unknown'
      },
      exposedServiceEndpointList: _transformManagedObjectExposedProtocolsToTableDataRow(exposedProtocols, messagingProtocols),
      availableServiceEndpointList: _transformManagedObjectMessagingProtocolsToTableDataRow(messagingProtocols)
    }
    return managedObjectTableDataRow;
  }
  const transformManagedObjectTableDataRowToTableDataList = (managedObjectTableDataRow: TManagedObjectTableDataRow): TManagedObjectTableDataList => {
    return [managedObjectTableDataRow];
  }

  const [managedObject, setManagedObject] = React.useState<TManagedObject>();  
  const [updatedManagedObjectDisplayName, setUpdatedManagedObjectDisplayName] = React.useState<string>();
  const [managedObjectTableDataRow, setManagedObjectTableDataRow] = React.useState<TManagedObjectTableDataRow>();  
  const [managedObjectFormData, setManagedObjectFormData] = React.useState<TManagedObjectFormData>();
  const [selectedExposedServiceEndpointList, setSelectedExposedServiceEndpointList] = React.useState<TServiceEndpointList>([]);
  const [apiCallStatus, setApiCallStatus] = React.useState<TApiCallState | null>(null);
  
  const managedObjectUseForm = useForm<TManagedObjectFormData>();
  const dt = React.useRef<any>(null);

  // * Api Calls *
  const apiGetManagedObject = async(): Promise<TApiCallState> => {
    const funcName = 'apiGetManagedObject';
    const logName = `${componentName}.${funcName}()`;
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_GET_ENVIRONMENT, `retrieve details for environment: ${props.environmentDisplayName}`);
    try { 
      const apiObject: TGetApiObject = await EnvironmentsService.getEnvironment({
        organizationName: props.organizationName, 
        envName: props.environmentName
      });
      const apiApiProductEntityNameList: CommonEntityNameList = await EnvironmentsService.getEnvironmentReferencedByApiProducts({
        organizationName: props.organizationName,
        envName: props.environmentName
      });
      setManagedObject(transformGetApiObjectToManagedObject(apiObject, apiApiProductEntityNameList));
    } catch(e) {
      APClientConnectorOpenApi.logError(logName, e);
      callState = ApiCallState.addErrorToApiCallState(e, callState);
    }
    setApiCallStatus(callState);
    return callState;
  }
  const apiUpdateManagedObject = async(managedObject: TManagedObject): Promise<TApiCallState> => {
    const funcName = 'apiCreateManagedObject';
    const logName = `${componentName}.${funcName}()`;
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_UPDATE_ENVIRONMENT, `update environment: ${props.environmentDisplayName}`);
    try { 
      const apiObject: TUpdateApiObject = transformManagedObjectToUpdateApiObject(managedObject);
      
      // await EnvironmentsService.updateEnvironment(props.organizationName, props.environmentName, apiObject);

      await EnvironmentsService.updateEnvironment({
        organizationName: props.organizationName, 
        envName: props.environmentName, 
        requestBody: apiObject
      });

      setUpdatedManagedObjectDisplayName(apiObject.displayName);
    } catch(e) {
      APClientConnectorOpenApi.logError(logName, e);
      callState = ApiCallState.addErrorToApiCallState(e, callState);
    }
    setApiCallStatus(callState);
    return callState;
  }

  // * useEffect Hooks *
  const doInitialize = async () => {
    props.onLoadingChange(true);
    await apiGetManagedObject();
    props.onLoadingChange(false);
  }

  React.useEffect(() => {
    doInitialize();
  }, []); /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    if(managedObject) {
      const managedObjectTableDataRow: TManagedObjectTableDataRow = transformManagedObjectToTableDataRow(managedObject);
      setManagedObjectTableDataRow(managedObjectTableDataRow);
      setSelectedExposedServiceEndpointList(managedObjectTableDataRow.exposedServiceEndpointList);  
      setManagedObjectFormData(transformManagedObjectToFormData(managedObject));
    }
  }, [managedObject]); /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    if(managedObjectFormData) doPopulateManagedObjectFormDataValues(managedObjectFormData);
  }, [managedObjectFormData]); /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    if (apiCallStatus !== null) {
      if(!apiCallStatus.success) props.onError(apiCallStatus);
      else if(apiCallStatus.context.action === E_CALL_STATE_ACTIONS.API_UPDATE_ENVIRONMENT) props.onSuccess(apiCallStatus, updatedManagedObjectDisplayName);
    }
  }, [apiCallStatus]); /* eslint-disable-line react-hooks/exhaustive-deps */

  const renderManagedObject = () => {
    const funcName = 'renderManagedObject';
    const logName = `${componentName}.${funcName}()`;
    if(!managedObject) throw new Error(`${logName}: managedObject is undefined`);
    if(!managedObjectTableDataRow) throw new Error(`${logName}: managedObjectTableDataRow is undefined`);
    const _managedObjectTableDataList: TManagedObjectTableDataList = transformManagedObjectTableDataRowToTableDataList(managedObjectTableDataRow);
    let expandedRows: any = {};
    expandedRows[`${_managedObjectTableDataList[0].name}`] = true;

    const rowExpansionTemplate = (managedObjectTableDataRow: TManagedObjectTableDataRow) => {
      return (
        <div>
          {/* <h5>Endpoints</h5> */}
          {displayEditManagedObjectErrorMessage()}
          <DataTable 
            className="p-datatable-sm"
            value={managedObjectTableDataRow.availableServiceEndpointList}
            autoLayout={true}
            selection={selectedExposedServiceEndpointList}
            onSelectionChange={(e) => setSelectedExposedServiceEndpointList(e.value)}
          >
            <Column selectionMode="multiple" style={{width:'3em'}}/>
            <Column field="protocol.name" header="Exposed Protocol" />
            <Column field="protocol.version" header="Version" />
            <Column field="secure" header='Secure?' />
            <Column field="compressed" header='Compressed?' />
            <Column field="uri" header="Endpoint" />
          </DataTable>
        </div>
      )
    }

    return (
      <div className="card">
        <DataTable
          ref={dt}
          header="PubSub+ Service:"
          value={_managedObjectTableDataList}
          expandedRows={expandedRows}
          rowExpansionTemplate={rowExpansionTemplate}
          dataKey="name"
          >
            <Column field="serviceName" header="Service Name" />
            <Column field="serviceId" header="Service Id" />
            <Column field="msgVpnName" header="Msg Vpn" />
            <Column field="datacenterProvider" header="Datacenter Provider" />
            <Column field="datacenterId" header="Datacenter Id" />
            <Column field="serviceTypeId" header="Service Type" />
            <Column field="transformedServiceClassDisplayedAttributes.highAvailability" header="Availability" />
        </DataTable>
      </div>
    )
  }

  const doPopulateManagedObjectFormDataValues = (managedObjectFormData: TManagedObjectFormData) => {
    managedObjectUseForm.setValue('displayName', managedObjectFormData.displayName);
    managedObjectUseForm.setValue('name', managedObjectFormData.name);
    managedObjectUseForm.setValue('description', managedObjectFormData.description);
  }

  const doSubmitManagedObject = async (managedObject: TManagedObject) => {
    props.onLoadingChange(true);
    await apiUpdateManagedObject(managedObject);
    props.onLoadingChange(false);
  }

  const isCustomValid = (): boolean => {
    return (selectedExposedServiceEndpointList.length > 0);
  }
  const onSubmitManagedObjectForm = (managedObjectFormData: TManagedObjectFormData) => {
    // const funcName = 'onSubmitManagedObjectForm';
    // const logName = `${componentName}.${funcName}()`;
    // console.log(`${logName}: submitting managedObjectFormData=${JSON.stringify(managedObjectFormData)}`);
    // console.log(`${logName}: submitting selectedExposedServiceEndpointList=${JSON.stringify(selectedExposedServiceEndpointList)}`);
    if(!isCustomValid()) return false;
    const _managedObjectFormData: TManagedObjectFormData = {
      ...managedObjectFormData,
      exposedProtocols: transformServiceEndpointListToProtocolList(selectedExposedServiceEndpointList)
    }
    doSubmitManagedObject(transformFormDataToManagedObject(_managedObjectFormData));
  }
  const onCancelManagedObjectForm = () => {
    props.onCancel();
  }
  const displayEditManagedObjectFormFieldErrorMessage = (fieldError: FieldError | undefined) => {
    return fieldError && <small className="p-error">{fieldError.message}</small>    
  }
  const displayEditManagedObjectErrorMessage = () => {
    if(!isCustomValid()) return <p className="p-error">Select at least 1 protocol to expose.</p>;
  }
  const managedObjectFormFooterRightToolbarTemplate = () => {
    return (
      <React.Fragment>
        <Button type="button" label="Cancel" className="p-button-text p-button-plain" onClick={onCancelManagedObjectForm} />
        <Button type="submit" label="Save" icon="pi pi-save" className="p-button-text p-button-plain p-button-outlined" />
      </React.Fragment>
    );
  }
  const renderManagedObjectFormFooter = (): JSX.Element => {
    return (
      <Toolbar className="p-mb-4" right={managedObjectFormFooterRightToolbarTemplate} />
    )
  }

  const renderManagedObjectEditForm = () => {
    return (
      <div className="card">
        <div className="p-fluid">
          <form onSubmit={managedObjectUseForm.handleSubmit(onSubmitManagedObjectForm)} className="p-fluid">            
            {/* name */}
            <div className="p-field">
              <span className="p-float-label p-input-icon-right">
                <i className="pi pi-key" />
                <Controller
                  name="name"
                  control={managedObjectUseForm.control}
                  rules={{
                    required: "Enter unique name.",
                  }}
                  render={( { field, fieldState }) => {
                      return(
                        <InputText
                          id={field.name}
                          {...field}
                          autoFocus={false}
                          disabled={true}
                          className={classNames({ 'p-invalid': fieldState.invalid })}                       
                        />
                  )}}
                />
                <label htmlFor="name" className={classNames({ 'p-error': managedObjectUseForm.formState.errors.name })}>Name*</label>
              </span>
              {displayEditManagedObjectFormFieldErrorMessage(managedObjectUseForm.formState.errors.name)}
            </div>
            {/* displayName */}
            <div className="p-field">
              <span className="p-float-label p-input-icon-right">
                <i className="pi pi-key" />
                <Controller
                  name="displayName"
                  control={managedObjectUseForm.control}
                  rules={{
                    required: "Enter display name.",
                  }}
                  render={( { field, fieldState }) => {
                      return(
                        <InputText
                          id={field.name}
                          {...field}
                          autoFocus={true}
                          className={classNames({ 'p-invalid': fieldState.invalid })}                       
                        />
                  )}}
                />
                <label htmlFor="displayName" className={classNames({ 'p-error': managedObjectUseForm.formState.errors.displayName })}>Display Name*</label>
              </span>
              {displayEditManagedObjectFormFieldErrorMessage(managedObjectUseForm.formState.errors.displayName)}
            </div>
            {/* description */}
            <div className="p-field">
              <span className="p-float-label">
                <Controller
                  name="description"
                  control={managedObjectUseForm.control}
                  rules={{
                    required: "Enter description.",
                  }}
                  render={( { field, fieldState }) => {
                      return(
                        <InputTextarea
                          id={field.name}
                          {...field}
                          className={classNames({ 'p-invalid': fieldState.invalid })}                       
                        />
                      )}}
                />
                <label htmlFor="description" className={classNames({ 'p-error': managedObjectUseForm.formState.errors.description })}>Description*</label>
              </span>
              {displayEditManagedObjectFormFieldErrorMessage(managedObjectUseForm.formState.errors.description)}
            </div>
            {renderManagedObject()}
            {renderManagedObjectFormFooter()}
          </form>  
        </div>
      </div>
    );
  }
  
  const getEditNotes = (mo: TManagedObject): string => {
    // if(mo.apiUsedBy_ApiProductEntityNameList.length === 0) return 'Not used by any API Products.';
    // return `Used by API Products: ${APRenderUtils.getCommonEntityNameListAsStringList(mo.apiUsedBy_ApiProductEntityNameList).join(', ')}.`;
    return `Used by API Products: ${mo.apiUsedBy_ApiProductEntityNameList.length}.`;
  }

  return (
    <div className="ap-environments">

      {managedObject && 
        <APComponentHeader 
          header={`Edit Environment: ${props.environmentDisplayName}`} 
          notes={getEditNotes(managedObject)}
        />
      }

      <ApiCallStatusError apiCallStatus={apiCallStatus} />

      {managedObject && managedObjectTableDataRow &&
        renderManagedObjectEditForm()
      }
    </div>
  );
}
