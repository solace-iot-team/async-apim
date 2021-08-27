
import React from "react";
import { useForm, Controller, FieldError } from 'react-hook-form';

import { DataTable } from 'primereact/datatable';
import { Column } from "primereact/column";
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Button } from 'primereact/button';
import { Toolbar } from 'primereact/toolbar';
import { Divider } from "primereact/divider";
import { classNames } from 'primereact/utils';

import { ApiCallState, TApiCallState } from "../../utils/ApiCallState";
import { EnvironmentsService, Protocol, Endpoint, Environment } from '@solace-iot-team/platform-api-openapi-client-fe';
import { TAPOrganizationId } from "../APComponentsCommon";
import { APClientConnectorOpenApi } from "../../utils/APClientConnectorOpenApi";
import { ListOrganizationServices } from "./ListOrganizationServices";
import { ManageEnvironmentsCommon, E_CALL_STATE_ACTIONS, TManagedObjectId, TOrganizationService } from "./ManageEnvironmentsCommon";
import { ApiCallStatusError } from "../ApiCallStatusError/ApiCallStatusError";

import "../APComponents.css";
import "./ManageEnvironments.css";

export interface INewEnvironmentProps {
  organizationName: TAPOrganizationId;
  onError: (apiCallState: TApiCallState) => void;
  onSuccess: (apiCallState: TApiCallState, newEnvironmentName: TManagedObjectId, newEnvironmentDisplayName: string) => void;
  onCancel: () => void;
  onLoadingChange: (isLoading: boolean) => void;
}

export const NewEnvironment: React.FC<INewEnvironmentProps> = (props: INewEnvironmentProps) => {
  const componentName = 'NewEnvironment';

  type TCreateApiObject = Environment;
  type TManagedObject = TCreateApiObject;
  type TServiceEndpoint = Endpoint;
  type TServiceEndpointList = Array<TServiceEndpoint>;
  type TManagedObjectFormData = TManagedObject;

  const emptyManagedObjectFormData: TManagedObjectFormData = {
    name: '',
    displayName: '',
    description: '',
    serviceId: '',
    exposedProtocols: []
  }

  const transformManagedObjectToCreateApiObject = (managedObject: TManagedObject): TCreateApiObject => {
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

  const transformOrganizationServiceToEndpointList = (organizationService: TOrganizationService): TServiceEndpointList => {
    if(organizationService.messagingProtocols) return organizationService.messagingProtocols;
    else return [];
  }

  const [selectedOrganizationService, setSelectedOrganizationService] = React.useState<TOrganizationService>();
  const [selectedExposedServiceEndpointList, setSelectedExposedServiceEndpointList] = React.useState<TServiceEndpointList>([]);
  const [apiCallStatus, setApiCallStatus] = React.useState<TApiCallState | null>(null);
  const [createdManagedObjectId, setCreatedManagedObjectId] = React.useState<TManagedObjectId>();
  const [createdManagedObjectDisplayName, setCreatedManagedObjectDisplayName] = React.useState<string>();

  const managedObjectUseForm = useForm<TManagedObjectFormData>();
  const[isFormSubmitted, setIsFormSubmitted] = React.useState<boolean>(false);

  // * Api Calls *
  const apiCreateManagedObject = async(managedObject: TManagedObject): Promise<TApiCallState> => {
    const funcName = 'apiCreateManagedObject';
    const logName = `${componentName}.${funcName}()`;
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_CREATE_ENIRONMENT, `create environment: ${managedObject.displayName}`);
    try { 
      const apiObject: TCreateApiObject = transformManagedObjectToCreateApiObject(managedObject);
      const apiObjectResult: Environment = await EnvironmentsService.createEnvironment(props.organizationName, apiObject);
      setCreatedManagedObjectId(apiObjectResult.name);
      setCreatedManagedObjectDisplayName(apiObjectResult.displayName);      
    } catch(e) {
      APClientConnectorOpenApi.logError(logName, e);
      callState = ApiCallState.addErrorToApiCallState(e, callState);
    }
    setApiCallStatus(callState);
    return callState;
  }

  // * useEffect Hooks *
  React.useEffect(() => {
    const funcName = 'useEffect[]';
    const logName = `${componentName}.${funcName}()`;
    if(props.organizationName === '') throw new Error(`${logName}: props.organizationName is empty`);
    doPopulateManagedObjectFormDataValues(emptyManagedObjectFormData);
  }, []);

  React.useEffect(() => {
    const funcName = 'useEffect[apiCallStatus]';
    const logName = `${componentName}.${funcName}()`;
    if (apiCallStatus !== null) {
      if(apiCallStatus.success) {
        if(!createdManagedObjectId) throw new Error(`${logName}: createdManagedObjectId is undefined`);
        if(!createdManagedObjectDisplayName) throw new Error(`${logName}: createdManagedObjectDisplayName is undefined`);
        props.onSuccess(apiCallStatus, createdManagedObjectId, createdManagedObjectDisplayName);
      }
      else props.onError(apiCallStatus);
    }
  }, [apiCallStatus]);

  const onListOrganizationServicesSuccess = (apiCallState: TApiCallState) => {
    // do nothing
  }

  // * UI Controls *
  const doPopulateManagedObjectFormDataValues = (managedObjectFormData: TManagedObjectFormData) => {
    managedObjectUseForm.setValue('displayName', managedObjectFormData.displayName);
    managedObjectUseForm.setValue('name', managedObjectFormData.name);
    managedObjectUseForm.setValue('description', managedObjectFormData.description);
  }

  const renderEndpointSelectionTable = () => {
    const funcName = 'renderEndpointSelectionTable';
    const logName = `${componentName}.${funcName}()`;
    if(!selectedOrganizationService) return;
    const _availableServiceEndpointList: TServiceEndpointList = transformOrganizationServiceToEndpointList(selectedOrganizationService);
    return (  
      <React.Fragment>
        {displaySelectedProtocolsErrorMessage()}
        <DataTable 
          className="p-datatable-sm"
          header="Select protocols to expose:"
          value={_availableServiceEndpointList}
          autoLayout={true}
          selection={selectedExposedServiceEndpointList}
          onSelectionChange={(e) => setSelectedExposedServiceEndpointList(e.value)}
        >
          <Column selectionMode="multiple" style={{width:'3em'}}/>
          <Column field="protocol.name" header="Protocol" />
          <Column field="protocol.version" header="Version" />
          <Column field="secure" header='Secure?' />
          <Column field="compressed" header='Compressed?' />
          <Column field="uri" header="Endpoint" />
        </DataTable>
      </React.Fragment>
    );
  }

  const doSubmitManagedObject = async (managedObject: TManagedObject) => {
    props.onLoadingChange(true);
    const apiCallState: TApiCallState = await apiCreateManagedObject(managedObject);
    props.onLoadingChange(false);
  }

  const isSelectedOrganizationServiceValid = (): boolean => {
    return (selectedOrganizationService !== undefined);
  }

  const isSelectedProtocolsValid = (): boolean => {
    return (selectedExposedServiceEndpointList.length > 0);
  }

  const isCustomValid = (): boolean => {
    return isSelectedOrganizationServiceValid() && isSelectedProtocolsValid();
  }

  const onInvalidSubmitManagedObjectForm = () => {
    setIsFormSubmitted(true);
  }

  const onSubmitManagedObjectForm = (managedObjectFormData: TManagedObjectFormData) => {
    const funcName = 'onSubmitManagedObjectForm';
    const logName = `${componentName}.${funcName}()`;
    setIsFormSubmitted(true);
    if(!isCustomValid()) return false;
    if(!selectedOrganizationService) throw new Error(`${logName}: selectedOrganizationService is undefined`);
    if(!selectedOrganizationService.serviceId) throw new Error(`${logName}: selectedOrganizationService.serviceId is undefined`);
    const _managedObjectFormData: TManagedObjectFormData = {
      ...managedObjectFormData,
      exposedProtocols: transformServiceEndpointListToProtocolList(selectedExposedServiceEndpointList),
      serviceId: selectedOrganizationService.serviceId
    }
    doSubmitManagedObject(transformFormDataToManagedObject(_managedObjectFormData));
  }

  const onCancelManagedObjectForm = () => {
    props.onCancel();
  }

  const displayEditManagedObjectFormFieldErrorMessage = (fieldError: FieldError | undefined) => {
    return fieldError && <small className="p-error">{fieldError.message}</small>    
  }

  const displaySelectedServiceErrorMessage = () => {
    if(isFormSubmitted && !isSelectedOrganizationServiceValid()) return <p className="p-error">Select a PubSub+ Service and Protocols.</p>;
  }

  const displaySelectedProtocolsErrorMessage = () => {
    if(isFormSubmitted && !isSelectedProtocolsValid()) return <p className="p-error">Select at least 1 protocol to expose.</p>;
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

  const renderManagedObjectCreateForm = () => {
    return (
      <div className="card">
        <div className="p-fluid">
          <form onSubmit={managedObjectUseForm.handleSubmit(onSubmitManagedObjectForm, onInvalidSubmitManagedObjectForm)} className="p-fluid">            
            {/* name */}
            <div className="p-field">
              <span className="p-float-label p-input-icon-right">
                <i className="pi pi-key" />
                <Controller
                  name="name"
                  control={managedObjectUseForm.control}
                  rules={{
                    required: "Enter unique name/id.",
                    pattern: { value: /^[A-Z0-9_-]*$/i, message: 'Use chars, numbers, "-" and "_" only. No whitespace.' },
                    minLength: { value: 3, message: 'Min of 3 chars.' },
                    maxLength: { value: 64, message: 'Max of 64 chars.' }
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
                <label htmlFor="name" className={classNames({ 'p-error': managedObjectUseForm.formState.errors.name })}>Name/Id*</label>
              </span>
              {displayEditManagedObjectFormFieldErrorMessage(managedObjectUseForm.formState.errors.name)}
            </div>
            {/* displayName */}
            <div className="p-field">
              <span className="p-float-label p-input-icon-right">
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
            {displaySelectedServiceErrorMessage()}
            <ListOrganizationServices
              organizationName={props.organizationName}
              onSuccess={onListOrganizationServicesSuccess} 
              onError={props.onError} 
              onLoadingChange={props.onLoadingChange}
              tableHeader="Select a PubSub+ Service:"
              onSelectOrganizationService={onSelectOrganizationService}
              onNoOrganizationServicesFound={onNoOrganizationServicesFound}
            />
            <Divider />
            {renderEndpointSelectionTable()}
            {renderManagedObjectFormFooter()}
          </form>  
        </div>
      </div>
    );
  }

  const onNoOrganizationServicesFound = () => {
    // alert('no organization services found ');
  }
  
  const onSelectOrganizationService = (organizationService: TOrganizationService) => {
    setSelectedOrganizationService(organizationService);
    setSelectedExposedServiceEndpointList([]);
  }

  return (
    <div className="ap-environments">

      {ManageEnvironmentsCommon.renderSubComponentHeader('Create Environment')}

      <ApiCallStatusError apiCallStatus={apiCallStatus} />

      {renderManagedObjectCreateForm()}

    </div>
  );
}
