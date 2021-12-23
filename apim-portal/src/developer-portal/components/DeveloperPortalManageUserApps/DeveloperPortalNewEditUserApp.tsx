
import React from "react";
import { useForm, Controller, FieldError } from 'react-hook-form';

import { InputText } from 'primereact/inputtext';
import { MultiSelect } from 'primereact/multiselect';
import { Button } from 'primereact/button';
import { Toolbar } from 'primereact/toolbar';
import { classNames } from 'primereact/utils';

import { 
  AppResponse, 
  AppsService, 
  AppPatch,
  App,
  ApiProductsService,
  APIProduct,
  AppStatus
} from '@solace-iot-team/apim-connector-openapi-browser';
import { 
  APSUserId
} from "../../../_generated/@solace-iot-team/apim-server-openapi-browser";
import { APClientConnectorOpenApi } from "../../../utils/APClientConnectorOpenApi";
import { APConnectorFormValidationRules } from "../../../utils/APConnectorOpenApiFormValidationRules";
import { APComponentHeader } from "../../../components/APComponentHeader/APComponentHeader";
import { ApiCallState, TApiCallState } from "../../../utils/ApiCallState";
import { ApiCallStatusError } from "../../../components/ApiCallStatusError/ApiCallStatusError";
import { 
  TAPOrganizationId, 
  TApiEntitySelectItemList, 
  TApiEntitySelectItemIdList, 
  APComponentsCommon
} from "../../../components/APComponentsCommon";
import { E_CALL_STATE_ACTIONS } from "./DeveloperPortalManageUserAppsCommon";
import { DeveloperPortalUserAppSelectApiProducts } from "./DeveloperPortalUserAppSelectApiProducts";
import { EApiTopicSyntax, TManagedObjectDisplayName, TManagedObjectId } from "../../../components/APApiObjectsCommon";

import '../../../components/APComponents.css';
import "./DeveloperPortalManageUserApps.css";

export enum EAction {
  EDIT = 'EDIT',
  NEW = 'NEW'
}
export interface IDeveloperPortalNewEditUserAppProps {
  action: EAction,
  organizationId: TAPOrganizationId,
  userId: APSUserId,
  appId?: TManagedObjectId,
  appDisplayName?: TManagedObjectDisplayName,
  presetApiProductSelectItemList?: TApiEntitySelectItemList,
  onError: (apiCallState: TApiCallState) => void;
  onNewSuccess: (apiCallState: TApiCallState, newUserId: TManagedObjectId, newDisplayName: string) => void;
  onEditSuccess: (apiCallState: TApiCallState, updatedDisplayName?: string) => void;
  onCancel: () => void;
  onLoadingChange: (isLoading: boolean) => void;
}

export const DeveloperPortalNewEditUserApp: React.FC<IDeveloperPortalNewEditUserAppProps> = (props: IDeveloperPortalNewEditUserAppProps) => {
  const componentName = 'DeveloperPortalNewEditUserApp';

  type TUpdateApiObject = AppPatch;
  type TCreateApiObject = App;
  type TGetApiObject = AppResponse;
  type TManagedObject = {
    apiObject: AppResponse
    apiProductSelectItemList: TApiEntitySelectItemList,
  }
  type TManagedObjectFormData = TManagedObject & {
    apiProductSelectItemIdList: TApiEntitySelectItemIdList,
  };
  const emptyManagedObject: TManagedObject = {
    apiProductSelectItemList: [],
    apiObject: {
      status: AppStatus.PENDING,
      name: '',
      apiProducts: [],
      credentials: {
        expiresAt: -1
      }
    }
  }
  const transformGetApiObjectToManagedObject = (getApiObject: TGetApiObject, apiProductSelectItemList: TApiEntitySelectItemList): TManagedObject => {
    return {
      apiProductSelectItemList: apiProductSelectItemList,
      apiObject: {
        ...getApiObject,
        displayName: getApiObject.displayName ? getApiObject.displayName : getApiObject.name,
      }
    }
  }
  const transformManagedObjectToUpdateApiObject = (managedObject: TManagedObject): TUpdateApiObject => {
    const isApproved: boolean = (managedObject?.apiObject.status === AppStatus.APPROVED);
    const updateApiObject: TUpdateApiObject = {
      // attributes: managedObject.apiObject.attributes, // user not allowed to edit attributes
      callbackUrl: managedObject.apiObject.callbackUrl,
      credentials: managedObject.apiObject.credentials,
      displayName: managedObject.apiObject.displayName,
    };
    if(!isApproved) {
      updateApiObject.apiProducts = managedObject.apiObject.apiProducts
    }
    return updateApiObject;
  }
  const transformManagedObjectToCreateApiObject = (managedObject: TManagedObject): TCreateApiObject => {
    const createApiObject: TCreateApiObject = {
      name: managedObject.apiObject.name,
      displayName: managedObject.apiObject.displayName,
      internalName: managedObject.apiObject.internalName,
      expiresIn: managedObject.apiObject.expiresIn,
      apiProducts: managedObject.apiObject.apiProducts,
      attributes: managedObject.apiObject.attributes,
      callbackUrl: managedObject.apiObject.callbackUrl,
      webHooks: managedObject.apiObject.webHooks,
      credentials: managedObject.apiObject.credentials
    };
    return createApiObject;
  }
  const transformManagedObjectToFormData = (managedObject: TManagedObject): TManagedObjectFormData => {
    return {
      ...managedObject,
      apiProductSelectItemIdList: APComponentsCommon.transformSelectItemListToSelectItemIdList(managedObject.apiProductSelectItemList),
    }
  }

  const transformFormDataToManagedObject = (formData: TManagedObjectFormData): TManagedObject => {
    const managedObject: TManagedObject = {
      apiProductSelectItemList: formData.apiProductSelectItemList,
      apiObject: {
        ...formData.apiObject,
        apiProducts: formData.apiProductSelectItemIdList,
      }
    }
    // console.log(`${logName}: managedObject=${JSON.stringify(managedObject, null, 2)}`);
    return managedObject;
  }

  const [apiCallStatus, setApiCallStatus] = React.useState<TApiCallState | null>(null);
  const [showSelectApiProducts, setShowSelectApiProducts] = React.useState<boolean>(false);
  const [createdManagedObjectId, setCreatedManagedObjectId] = React.useState<TManagedObjectId>();
  const [createdManagedObjectDisplayName, setCreatedManagedObjectDisplayName] = React.useState<string>();
  const [updatedManagedObjectDisplayName, setUpdatedManagedObjectDisplayName] = React.useState<string>();
  const [managedObject, setManagedObject] = React.useState<TManagedObject>();  
  const [managedObjectFormData, setManagedObjectFormData] = React.useState<TManagedObjectFormData>();
  // inForm: MultiSelect Api Products
  const [inFormCurrentMultiSelectOptionApiProductSelectItemList, setInFormCurrentMultiSelectOptionApiProductSelectItemList] = React.useState<TApiEntitySelectItemList>([]);

  const managedObjectUseForm = useForm<TManagedObjectFormData>();
  const formId = componentName;

  // * Api Calls *
  const apiGetManagedObject = async(orgId: TAPOrganizationId, userId: APSUserId, appId: TManagedObjectId, appDisplayName: string): Promise<TApiCallState> => {
    const funcName = 'apiGetManagedObject';
    const logName = `${componentName}.${funcName}()`;
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_GET_USER_APP, `retrieve details for app: ${appDisplayName}`);
    try { 
      const _apiAppResponse: AppResponse = await AppsService.getDeveloperApp({
        organizationName: orgId, 
        developerUsername: userId, 
        appName: appId, 
        topicSyntax: EApiTopicSyntax.SMF
      });
      // get all api products display names
      let _apiProductSelectItemList: TApiEntitySelectItemList = [];
      for(const apiProductName of _apiAppResponse.apiProducts) {
        const apiProduct: APIProduct = await ApiProductsService.getApiProduct({
          organizationName: orgId, 
          apiProductName: apiProductName
        });
        _apiProductSelectItemList.push({
          displayName: apiProduct.displayName,
          id: apiProduct.name
        });
      }
      setManagedObject(transformGetApiObjectToManagedObject(_apiAppResponse, _apiProductSelectItemList));
    } catch(e: any) {
      APClientConnectorOpenApi.logError(logName, e);
      callState = ApiCallState.addErrorToApiCallState(e, callState);
    }
    setApiCallStatus(callState);
    return callState;
  }

  const apiUpdateManagedObject = async(orgId: TAPOrganizationId, userId: APSUserId, appId: TManagedObjectId, appDisplayName: string, managedObject: TManagedObject): Promise<TApiCallState> => {
    const funcName = 'apiUpdateManagedObject';
    const logName = `${componentName}.${funcName}()`;
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_UPDATE_USER_APP, `update app: ${appDisplayName}`);
    try { 
      await AppsService.updateDeveloperApp({
        organizationName: orgId, 
        developerUsername: userId, 
        appName: appId, 
        requestBody: transformManagedObjectToUpdateApiObject(managedObject)
      });
      if(appDisplayName !== managedObject.apiObject.displayName) setUpdatedManagedObjectDisplayName(managedObject.apiObject.displayName);      
    } catch(e: any) {
      APClientConnectorOpenApi.logError(logName, e);
      callState = ApiCallState.addErrorToApiCallState(e, callState);
    }
    setApiCallStatus(callState);
    return callState;
  }

  const apiCreateManagedObject = async(orgId: TAPOrganizationId, userId: APSUserId, managedObject: TManagedObject): Promise<TApiCallState> => {
    const funcName = 'apiCreateManagedObject';
    const logName = `${componentName}.${funcName}()`;
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_CREATE_USER_APP, `create app: ${managedObject.apiObject.displayName}`);
    try { 
      const createdApiObject: App = await AppsService.createDeveloperApp({
        organizationName: orgId, 
        developerUsername: userId, 
        requestBody: transformManagedObjectToCreateApiObject(managedObject)
      });
      setCreatedManagedObjectId(createdApiObject.name);
      setCreatedManagedObjectDisplayName(createdApiObject.displayName);      
    } catch(e: any) {
      APClientConnectorOpenApi.logError(logName, e);
      callState = ApiCallState.addErrorToApiCallState(e, callState);
    }
    setApiCallStatus(callState);
    return callState;
  }

  // * useEffect Hooks *
  const doInitialize = async () => {
    const funcName = 'doInitialize';
    const logName = `${componentName}.${funcName}()`;
    if(props.action === EAction.EDIT) {
      if(!props.appId || !props.appDisplayName) throw new Error(`${logName}: action=${props.action} - one or more props undefined, props=${JSON.stringify(props)}`);
      props.onLoadingChange(true);
      await apiGetManagedObject(props.organizationId, props.userId, props.appId, props.appDisplayName);
      props.onLoadingChange(false);
    } else {
      let mo: TManagedObject = emptyManagedObject;
      if(props.presetApiProductSelectItemList) {
        mo.apiProductSelectItemList = props.presetApiProductSelectItemList;
      }
      setManagedObject(mo);
    }
  }

  React.useEffect(() => {
    doInitialize();
  }, []); /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    if(managedObject) {
      setManagedObjectFormData(transformManagedObjectToFormData(managedObject));
    }
  }, [managedObject]) /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    if(managedObjectFormData) doPopulateManagedObjectFormDataValues(managedObjectFormData);
  }, [managedObjectFormData]) /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    const funcName = 'useEffect[apiCallStatus]';
    const logName = `${componentName}.${funcName}()`;
    if (apiCallStatus !== null) {
      if(!apiCallStatus.success) props.onError(apiCallStatus);
      else if(props.action === EAction.NEW && apiCallStatus.context.action === E_CALL_STATE_ACTIONS.API_CREATE_USER_APP) {
        if(!createdManagedObjectId) throw new Error(`${logName}: createdManagedObjectId is undefined`);
        if(!createdManagedObjectDisplayName) throw new Error(`${logName}: createdManagedObjectDisplayName is undefined`);
        props.onNewSuccess(apiCallStatus, createdManagedObjectId, createdManagedObjectDisplayName);
      }  
      else if(props.action === EAction.EDIT && apiCallStatus.context.action === E_CALL_STATE_ACTIONS.API_UPDATE_USER_APP) {
        props.onEditSuccess(apiCallStatus, updatedManagedObjectDisplayName);
      }
    }
  }, [apiCallStatus]); /* eslint-disable-line react-hooks/exhaustive-deps */

  // * Select Api Products *

  const onSearchApiProducts = () => {
    setShowSelectApiProducts(true);
  }

  const onManagedObjectFormSelectApiProductsSuccess = (apiCallState: TApiCallState, modifiedSelectedApiProductList: TApiEntitySelectItemList) => {
    const funcName = 'onManagedObjectFormSelectApiProductsSuccess';
    const logName = `${componentName}.${funcName}()`;
    // console.log(`${logName}: modifiedSelectedApiProductList=${JSON.stringify(modifiedSelectedApiProductList, null, 2)}`);
    if(!apiCallState.success) throw new Error(`${logName}: apiCallState.success is false, apiCallState=${JSON.stringify(apiCallState, null, 2)}`);
    setInFormCurrentMultiSelectOptionApiProductSelectItemList(modifiedSelectedApiProductList);
    const modifiedMultiSelectValueApiProductSelectItemIdList: TApiEntitySelectItemIdList = APComponentsCommon.transformSelectItemListToSelectItemIdList(modifiedSelectedApiProductList);
    managedObjectUseForm.setValue('apiProductSelectItemIdList', modifiedMultiSelectValueApiProductSelectItemIdList);
    managedObjectUseForm.trigger('apiProductSelectItemIdList');
    setShowSelectApiProducts(false);
  }
  const onManagedObjectFormSelectApiProductsCancel = () => {
    setShowSelectApiProducts(false);
  }

  const doPopulateManagedObjectFormDataValues = (managedObjectFormData: TManagedObjectFormData) => {
    managedObjectUseForm.setValue('apiObject', managedObjectFormData.apiObject);
    managedObjectUseForm.setValue('apiProductSelectItemIdList', managedObjectFormData.apiProductSelectItemIdList);
    setInFormCurrentMultiSelectOptionApiProductSelectItemList(managedObjectFormData.apiProductSelectItemList);
  }

  const doSubmitManagedObject = async (managedObject: TManagedObject) => {
    const funcName = 'doSubmitManagedObject';
    const logName = `${componentName}.${funcName}()`;
    // console.log(`${logName}: managedObject = ${JSON.stringify(managedObject, null, 2)}`);
    props.onLoadingChange(true);
    if(props.action === EAction.NEW) await apiCreateManagedObject(props.organizationId, props.userId, managedObject);
    else {
      if(!props.appId || !props.appDisplayName) throw new Error(`${logName}: action=${props.action} - one or more props undefined, props=${JSON.stringify(props)}`);
      await apiUpdateManagedObject(props.organizationId, props.userId, props.appId, props.appDisplayName, managedObject);
    }
    props.onLoadingChange(false);
  }

  const onSubmitManagedObjectForm = (managedObjectFormData: TManagedObjectFormData) => {
    doSubmitManagedObject(transformFormDataToManagedObject(managedObjectFormData));
  }

  const onCancelManagedObjectForm = () => {
    props.onCancel();
  }

  const onInvalidSubmitManagedObjectForm = () => {
  }

  const displayManagedObjectFormFieldErrorMessage = (fieldError: FieldError | undefined) => {
    return fieldError && <small className="p-error">{fieldError.message}</small>    
  }

  const displayManagedObjectFormFieldErrorMessage4Array = (fieldErrorList: Array<FieldError | undefined> | undefined) => {
    let _fieldError: any = fieldErrorList;
    return _fieldError && <small className="p-error">{_fieldError.message}</small>;
  }

  const managedObjectFormFooterRightToolbarTemplate = () => {
    const getSubmitButtonLabel = (): string => {
      if (props.action === EAction.NEW) return 'Create';
      else return 'Save';
    }
    return (
      <React.Fragment>
        <Button type="button" label="Cancel" className="p-button-text p-button-plain" onClick={onCancelManagedObjectForm} />
        <Button type="submit" label={getSubmitButtonLabel()} icon="pi pi-save" className="p-button-text p-button-plain p-button-outlined" />
      </React.Fragment>
    );
  }

  const renderManagedObjectFormFooter = (): JSX.Element => {
    return (
      <Toolbar className="p-mb-4" right={managedObjectFormFooterRightToolbarTemplate} />
    )
  }

  const renderApiProductsToolbar = () => {
    let jsxButtonList: Array<JSX.Element> = [
      <Button style={ { width: '20rem' } } type="button" label="Search API Products" className="p-button-text p-button-plain p-button-outlined" onClick={() => onSearchApiProducts()} />,
    ];
    return (
      <Toolbar className="p-mb-4" style={ { 'background': 'none', 'border': 'none' } } left={jsxButtonList} />      
    );
  }

  const renderManagedObjectForm = () => {
    // const funcName = 'renderManagedObjectForm';
    // const logName = `${componentName}.${funcName}()`;
    const isNew: boolean = (props.action === EAction.NEW);
    const isApproved: boolean = (managedObject?.apiObject.status === AppStatus.APPROVED);
    return (
      <div className="card p-mt-4">
        <div className="p-fluid">
          <form id={formId} onSubmit={managedObjectUseForm.handleSubmit(onSubmitManagedObjectForm, onInvalidSubmitManagedObjectForm)} className="p-fluid">           
            {/* Id */}
            <div className="p-field">
              <span className="p-float-label p-input-icon-right">
                <i className="pi pi-key" />
                <Controller
                  name="apiObject.name"
                  control={managedObjectUseForm.control}
                  rules={APConnectorFormValidationRules.Name()}
                  render={( { field, fieldState }) => {
                      return(
                        <InputText
                          id={field.name}
                          {...field}
                          autoFocus={isNew}
                          disabled={!isNew}
                          className={classNames({ 'p-invalid': fieldState.invalid })}                       
                        />
                  )}}
                />
                <label htmlFor="apiObject.name" className={classNames({ 'p-error': managedObjectUseForm.formState.errors.apiObject?.name })}>Id*</label>
              </span>
              {displayManagedObjectFormFieldErrorMessage(managedObjectUseForm.formState.errors.apiObject?.name)}
            </div>
            {/* DisplayName */}
            <div className="p-field">
              <span className="p-float-label p-input-icon-right">
                <Controller
                  name="apiObject.displayName"
                  control={managedObjectUseForm.control}
                  rules={APConnectorFormValidationRules.DisplayName()}
                  render={( { field, fieldState }) => {
                      return(
                        <InputText
                          id={field.name}
                          {...field}
                          autoFocus={!isNew}
                          className={classNames({ 'p-invalid': fieldState.invalid })}                       
                        />
                  )}}
                />
                <label htmlFor="apiObject.displayName" className={classNames({ 'p-error': managedObjectUseForm.formState.errors.apiObject?.displayName })}>Display Name*</label>
              </span>
              {displayManagedObjectFormFieldErrorMessage(managedObjectUseForm.formState.errors.apiObject?.displayName)}
            </div>
            {/* API Products */}
            <div className="p-field" hidden={isApproved}>
              <span className="p-float-label">
                <Controller
                  name="apiProductSelectItemIdList"
                  control={managedObjectUseForm.control}
                  rules={{
                    required: "Choose at least 1 API Product.",
                    // validate: validateSelectedApiProductList
                  }}
                  render={( { field, fieldState }) => {
                      // console.log(`${logName}: field=${JSON.stringify(field)}, fieldState=${JSON.stringify(fieldState)}`);
                      // console.log(`${logName}: field.value=${JSON.stringify(field.value)}`);
                      return(
                        <MultiSelect
                          display="chip"
                          value={field.value ? [...field.value] : []} 
                          options={inFormCurrentMultiSelectOptionApiProductSelectItemList} 
                          // onChange={(e) => { field.onChange(e.value); onApiProductsSelect(e.value); }}
                          onChange={(e) => { field.onChange(e.value); }}
                          optionLabel="displayName"
                          optionValue="id"
                          className={classNames({ 'p-invalid': fieldState.invalid })}                       
                        />
                  )}}
                />
                <label htmlFor="apiProductSelectItemIdList" className={classNames({ 'p-error': managedObjectUseForm.formState.errors.apiProductSelectItemIdList })}>API Products*</label>
              </span>
              { displayManagedObjectFormFieldErrorMessage4Array(managedObjectUseForm.formState.errors.apiProductSelectItemIdList) }
              { renderApiProductsToolbar() }
            </div>
            {renderManagedObjectFormFooter()}
          </form>  
        </div>
      </div>
    );
  }

  return (
    <div className="apd-manage-user-apps">

      { props.action === EAction.NEW && <APComponentHeader header='Create App:' /> }

      { props.action === EAction.EDIT && <APComponentHeader header={`Edit App: ${props.appDisplayName}`} /> }

      <ApiCallStatusError apiCallStatus={apiCallStatus} />

      { managedObjectFormData && renderManagedObjectForm() }

      {showSelectApiProducts &&
        <DeveloperPortalUserAppSelectApiProducts 
          organizationId={props.organizationId}
          userId={props.userId}
          currentSelectedApiProductItemList={inFormCurrentMultiSelectOptionApiProductSelectItemList}
          onSave={onManagedObjectFormSelectApiProductsSuccess}
          onError={props.onError}          
          onCancel={onManagedObjectFormSelectApiProductsCancel}
          onLoadingChange={props.onLoadingChange}
        />
      } 

    </div>
  );
}
