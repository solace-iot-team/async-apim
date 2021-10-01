
import React from "react";
import { useForm, Controller, FieldError } from 'react-hook-form';

import { InputText } from 'primereact/inputtext';
import { InputTextarea } from "primereact/inputtextarea";
import { MultiSelect } from "primereact/multiselect";
import { Dropdown } from "primereact/dropdown";
import { Button } from 'primereact/button';
import { Toolbar } from 'primereact/toolbar';
import { Divider } from "primereact/divider";
import { classNames } from 'primereact/utils';

import { 
  ApisService, 
  APIInfo, 
  APIProduct, 
  APIProductPatch,
  ApiProductsService,
  APIInfoList,
  EnvironmentsService
} from '@solace-iot-team/apim-connector-openapi-browser';
import { APClientConnectorOpenApi } from "../../../utils/APClientConnectorOpenApi";
import { APConnectorFormValidationRules } from "../../../utils/APConnectorOpenApiFormValidationRules";
import { ApiCallState, TApiCallState } from "../../../utils/ApiCallState";
import { ApiCallStatusError } from "../../../components/ApiCallStatusError/ApiCallStatusError";
import { APComponentHeader } from "../../../components/APComponentHeader/APComponentHeader";
import { APApiObjectsCommon, APEnvironmentObjectsCommon, TAPEnvironmentViewManagedObject, TAPEnvironmentViewManagedOjbectList } from "../../../components/APApiObjectsCommon";
import { 
  APComponentsCommon,
  TApiEntitySelectItem, 
  TApiEntitySelectItemIdList, 
  TApiEntitySelectItemList, 
  TAPOrganizationId 
} from "../../../components/APComponentsCommon";
import { E_CALL_STATE_ACTIONS, TManagedObjectId} from "./ManageApiProductsCommon";
import { SelectApis } from "./SelectApis";

import '../../../components/APComponents.css';
import "./ManageApiProducts.css";
import { SelectEnvironments } from "./SelectEnvironments";

export enum EAction {
  EDIT = 'EDIT',
  NEW = 'NEW'
}
export interface IEditNewApiProductProps {
  action: EAction,
  organizationId: TAPOrganizationId,
  apiProductId?: TManagedObjectId;
  apiProductDisplayName?: string;
  onError: (apiCallState: TApiCallState) => void;
  onNewSuccess: (apiCallState: TApiCallState, newId: TManagedObjectId, newDisplayName: string) => void;
  onEditSuccess: (apiCallState: TApiCallState, updatedDisplayName?: string) => void;
  onCancel: () => void;
  onLoadingChange: (isLoading: boolean) => void;
}

export const EditNewApiProduct: React.FC<IEditNewApiProductProps> = (props: IEditNewApiProductProps) => {
  const componentName = 'EditNewApiProduct';

  type TUpdateApiObject = APIProductPatch;
  type TCreateApiObject = APIProduct;
  type TManagedObject = {
    apiProduct: APIProduct,
    apiInfoList: APIInfoList,
    environmentList: TAPEnvironmentViewManagedOjbectList
  }
  type TManagedObjectFormData = TManagedObject & {
    apiSelectItemIdList: TApiEntitySelectItemIdList, 
    environmentSelectItemIdList: TApiEntitySelectItemIdList, 
  }
  
  const emptyManagedObject: TManagedObject = {
    apiProduct: {
      apis: [],
      attributes: [],
      name: '',
      displayName: '',
      description: '',
      pubResources: [],
      subResources: []
    },
    apiInfoList: [],
    environmentList: []
  }

  const [createdManagedObjectId, setCreatedManagedObjectId] = React.useState<TManagedObjectId>();
  const [createdManagedObjectDisplayName, setCreatedManagedObjectDisplayName] = React.useState<string>();
  const [updatedManagedObjectDisplayName, setUpdatedManagedObjectDisplayName] = React.useState<string>();
  const [managedObject, setManagedObject] = React.useState<TManagedObject>();  
  const [managedObjectFormData, setManagedObjectFormData] = React.useState<TManagedObjectFormData>();
  const [apiCallStatus, setApiCallStatus] = React.useState<TApiCallState | null>(null);
  const [showSelectApis, setShowSelectApis] = React.useState<boolean>(false);
  const [showSelectEnvironments, setShowSelectEnvironments] = React.useState<boolean>(false);

  // inForm: MultiSelect
  const [inFormCurrentMultiSelectOptionApiSelectItemList, setInFormCurrentMultiSelectOptionApiSelectItemList] = React.useState<TApiEntitySelectItemList>([]);
  const [inFormCurrentMultiSelectOptionEnvironmentSelectItemList, setInFormCurrentMultiSelectOptionEnvironmentSelectItemList] = React.useState<TApiEntitySelectItemList>([]);
  const managedObjectUseForm = useForm<TManagedObjectFormData>();

  const transformGetApiObjectsToManagedObject = (apiProduct: APIProduct, apiInfoList: APIInfoList, environmentList: TAPEnvironmentViewManagedOjbectList): TManagedObject => {
    return {
      apiProduct: {
        ...apiProduct,
        approvalType: apiProduct.approvalType ? apiProduct.approvalType : APIProduct.approvalType.AUTO
      },
      apiInfoList: apiInfoList,
      environmentList: environmentList
    }
  }
  const transformManagedObjectToCreateApiObject = (managedObject: TManagedObject): TCreateApiObject => {
    return managedObject.apiProduct;
  }
  const transformManagedObjectToUpdateApiObject = (managedObject: TManagedObject): TUpdateApiObject => {
    return managedObject.apiProduct;
  }


  // BEGIN COMMON 
  // const transformSelectItemListToSelectItemIdList = (selectItemList: TApiEntitySelectItemList): TApiEntitySelectItemIdList => {
  //   return selectItemList.map( (selectItem: TApiEntitySelectItem) => {
  //     return selectItem.id;
  //   });
  // }

  // * ApiInfo *
  // const transformApiInfoListToSelectItemIdList = (apiInfoList: APIInfoList): TApiEntitySelectItemIdList => {
  //   const funcName = 'transformApiInfoListToSelectItemIdList';
  //   const logName = `${componentName}.${funcName}()`;
  //   return apiInfoList.map( (apiInfo: APIInfo) => {
  //     if(!apiInfo.name) throw new Error(`${logName}: apiInfo.name is undefined`);
  //     return apiInfo.name;
  //   });
  // }
  // const transformApiInfoListToSelectItemList = (apiInfoList: APIInfoList): TApiEntitySelectItemList => {
  //   const funcName = 'transformManagedObjectApiInfoListToSelectItemList';
  //   const logName = `${componentName}.${funcName}()`;
  //   return apiInfoList.map( (apiInfo: APIInfo) => {
  //     if(!apiInfo.name) throw new Error(`${logName}: apiInfo.name is undefined`);
  //     return {
  //       id: apiInfo.name,
  //       displayName: apiInfo.name
  //     }
  //   });
  // }

  // * Environment *
  // const transformManagedObjectEnvironmentListToSelectItemIdList = (environmentList: TAPEnvironmentViewManagedOjbectList): TApiEntitySelectItemIdList => {
  //   const funcName = 'transformManagedObjectEnvironmentListToSelectItemIdList';
  //   const logName = `${componentName}.${funcName}()`;
  //   return environmentList.map( (environment: TAPEnvironmentViewManagedObject) => {
  //     return environment.name;
  //   });
  // }
  // const transformManagedObjectApiInfoListToSelectItemList = (apiInfoList: APIInfoList): TApiEntitySelectItemList => {
  //   const funcName = 'transformManagedObjectApiInfoListToSelectItemList';
  //   const logName = `${componentName}.${funcName}()`;
  //   return apiInfoList.map( (apiInfo: APIInfo) => {
  //     if(!apiInfo.name) throw new Error(`${logName}: apiInfo.name is undefined`);
  //     return {
  //       id: apiInfo.name,
  //       displayName: apiInfo.name
  //     }
  //   });
  // }

  // END COMMON

  const transformManagedObjectToFormData = (managedObject: TManagedObject): TManagedObjectFormData => {
    return {
      ...managedObject,
      apiSelectItemIdList: APApiObjectsCommon.transformApiInfoListToSelectItemIdList(managedObject.apiInfoList),
      environmentSelectItemIdList: APEnvironmentObjectsCommon.transformEnvironmentListToSelectItemIdList(managedObject.environmentList),
    };
  }
  const transformFormDataToManagedObject = (formData: TManagedObjectFormData): TManagedObject => {
    // const funcName = 'transformFormDataToManagedObject';
    // const logName = `${componentName}.${funcName}()`;
    // console.log(`${logName}: formData=${JSON.stringify(formData, null, 2)}`);
    return {
      apiProduct: {
        ...formData.apiProduct,
        apis: formData.apiSelectItemIdList,
        attributes: [],
        environments: formData.environmentSelectItemIdList,
        pubResources: [],
        subResources: [],
        // protocols: [],
        // clientOptions:   
      },
      apiInfoList: [],
      environmentList: []
    }
  }

  // * Api Calls *
  const apiGetManagedObject = async(managedObjectId: TManagedObjectId, managedObjectDisplayName: string): Promise<TApiCallState> => {
    const funcName = 'apiGetManagedObject';
    const logName = `${componentName}.${funcName}()`;
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_GET_API_PRODUCT, `retrieve details for api product: ${managedObjectDisplayName}`);
    try {
      const apiProduct: APIProduct = await ApiProductsService.getApiProduct({
        organizationName: props.organizationId,
        apiProductName: managedObjectId
      });
      // get all api infos
      let apiInfoList: APIInfoList = [];
      for(const apiId of apiProduct.apis) {
        const apiInfo: APIInfo = await ApisService.getApiInfo({
          organizationName: props.organizationId,
          apiName: apiId
        });
        apiInfoList.push(apiInfo);
      }
      // get environment 
      let environmentList: TAPEnvironmentViewManagedOjbectList = [];
      if(apiProduct.environments) {
        for(const environmentName of apiProduct.environments) {
          const envResponse = await EnvironmentsService.getEnvironment({
            organizationName: props.organizationId,
            envName: environmentName
          });
          environmentList.push(APEnvironmentObjectsCommon.transformEnvironmentResponseToEnvironmentViewManagedObject(envResponse));
        }
      }
      setManagedObject(transformGetApiObjectsToManagedObject(apiProduct, apiInfoList, environmentList));
    } catch(e: any) {
      APClientConnectorOpenApi.logError(logName, e);
      callState = ApiCallState.addErrorToApiCallState(e, callState);
    }
    setApiCallStatus(callState);
    return callState;
  }

  const apiCreateManagedObject = async(managedObject: TManagedObject): Promise<TApiCallState> => {
    const funcName = 'apiCreateManagedObject';
    const logName = `${componentName}.${funcName}()`;
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_CREATE_API_PRODUCT, `create api product: ${managedObject.apiProduct.displayName}`);
    try { 
      await ApiProductsService.createApiProduct({
        organizationName: props.organizationId,
        requestBody: transformManagedObjectToCreateApiObject(managedObject)
      });
      setCreatedManagedObjectId(managedObject.apiProduct.name);
      setCreatedManagedObjectDisplayName(managedObject.apiProduct.displayName);      
    } catch(e: any) {
      APClientConnectorOpenApi.logError(logName, e);
      callState = ApiCallState.addErrorToApiCallState(e, callState);
    }
    setApiCallStatus(callState);
    return callState;
  }

  const apiUpdateManagedObject = async(managedObject: TManagedObject): Promise<TApiCallState> => {
    const funcName = 'apiUpdateManagedObject';
    const logName = `${componentName}.${funcName}()`;
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_UPDATE_API_PRODUCT, `update api product: ${managedObject.apiProduct.displayName}`);
    try { 
      await ApiProductsService.updateApiProduct({
        organizationName: props.organizationId,
        apiProductName: managedObject.apiProduct.name,
        requestBody: transformManagedObjectToUpdateApiObject(managedObject)
      });  
      setUpdatedManagedObjectDisplayName(managedObject.apiProduct.displayName);
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
    props.onLoadingChange(true);
    if(props.action === EAction.EDIT) {
      if(!props.apiProductId) throw new Error(`${logName}: props.action=${props.action}: props.apiProductId is undefined`);
      if(!props.apiProductDisplayName) throw new Error(`${logName}: props.action=${props.action}: props.apiDisplayName is undefined`);
      await apiGetManagedObject(props.apiProductId, props.apiProductDisplayName);
    } else {
      setManagedObject(emptyManagedObject);
    }
    props.onLoadingChange(false);
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
      else if(props.action === EAction.NEW && apiCallStatus.context.action === E_CALL_STATE_ACTIONS.API_CREATE_API_PRODUCT) {
        if(!createdManagedObjectId) throw new Error(`${logName}: createdManagedObjectId is undefined`);
        if(!createdManagedObjectDisplayName) throw new Error(`${logName}: createdManagedObjectDisplayName is undefined`);
        props.onNewSuccess(apiCallStatus, createdManagedObjectId, createdManagedObjectDisplayName);
      }  
      else if(props.action === EAction.EDIT && apiCallStatus.context.action === E_CALL_STATE_ACTIONS.API_UPDATE_API_PRODUCT) {
        props.onEditSuccess(apiCallStatus, updatedManagedObjectDisplayName);
      }
    }
  }, [apiCallStatus]); /* eslint-disable-line react-hooks/exhaustive-deps */

  // * Search + Select APIs *
  const onSearchApis = () => {
    setShowSelectApis(true);
  }

  const onManagedObjectFormSelectApisSuccess = (apiCallState: TApiCallState, modifiedSelectedApiEntityList: TApiEntitySelectItemList) => {
    const funcName = 'onManagedObjectFormSelectApisSuccess';
    const logName = `${componentName}.${funcName}()`;
    // console.log(`${logName}: modifiedSelectedApiEntityList=${JSON.stringify(modifiedSelectedApiEntityList, null, 2)}`);
    if(!apiCallState.success) throw new Error(`${logName}: apiCallState.success is false, apiCallState=${JSON.stringify(apiCallState, null, 2)}`);
    setInFormCurrentMultiSelectOptionApiSelectItemList(modifiedSelectedApiEntityList);
    const modifiedIdList: TApiEntitySelectItemIdList = APComponentsCommon.transformSelectItemListToSelectItemIdList(modifiedSelectedApiEntityList);
    managedObjectUseForm.setValue('apiSelectItemIdList', modifiedIdList);
    setShowSelectApis(false);
  }

  const onManagedObjectFormSelectApisCancel = () => {
    setShowSelectApis(false);
  }

  // * Search + Select Environments *
  const onSearchEnvironments = () => {
    setShowSelectEnvironments(true);
  }

  const onManagedObjectFormSelectEnvironmentsSuccess = (apiCallState: TApiCallState, modifiedSelectedApiEntityList: TApiEntitySelectItemList) => {
    const funcName = 'onManagedObjectFormSelectEnvironmentsSuccess';
    const logName = `${componentName}.${funcName}()`;
    // console.log(`${logName}: modifiedSelectedApiEntityList=${JSON.stringify(modifiedSelectedApiEntityList, null, 2)}`);
    if(!apiCallState.success) throw new Error(`${logName}: apiCallState.success is false, apiCallState=${JSON.stringify(apiCallState, null, 2)}`);
    setInFormCurrentMultiSelectOptionEnvironmentSelectItemList(modifiedSelectedApiEntityList);
    const modifiedIdList: TApiEntitySelectItemIdList = APComponentsCommon.transformSelectItemListToSelectItemIdList(modifiedSelectedApiEntityList);
    managedObjectUseForm.setValue('environmentSelectItemIdList', modifiedIdList);
    setShowSelectEnvironments(false);
  }

  const onManagedObjectFormSelectEnvironmentsCancel = () => {
    setShowSelectEnvironments(false);
  }

  // * Form *
  const doPopulateManagedObjectFormDataValues = (managedObjectFormData: TManagedObjectFormData) => {
    const funcName = 'doPopulateManagedObjectFormDataValues';
    const logName = `${componentName}.${funcName}()`;
    // console.log(`${logName}: managedObjectFormData=${JSON.stringify(managedObjectFormData, null, 2)}`);
    managedObjectUseForm.setValue('apiProduct.name', managedObjectFormData.apiProduct.name);
    managedObjectUseForm.setValue('apiProduct.displayName', managedObjectFormData.apiProduct.displayName);
    managedObjectUseForm.setValue('apiProduct.description', managedObjectFormData.apiProduct.description);
    managedObjectUseForm.setValue('apiProduct.approvalType', managedObjectFormData.apiProduct.approvalType);
    managedObjectUseForm.setValue('apiSelectItemIdList', managedObjectFormData.apiSelectItemIdList);
    setInFormCurrentMultiSelectOptionApiSelectItemList(APApiObjectsCommon.transformApiInfoListToSelectItemList(managedObjectFormData.apiInfoList));
    managedObjectUseForm.setValue('environmentSelectItemIdList', managedObjectFormData.environmentSelectItemIdList);
    setInFormCurrentMultiSelectOptionEnvironmentSelectItemList(APEnvironmentObjectsCommon.transformEnvironmentListToSelectItemList(managedObjectFormData.environmentList));
  }

  const doSubmitManagedObject = async (managedObject: TManagedObject) => {
    const funcName = 'doSubmitManagedObject';
    const logName = `${componentName}.${funcName}()`;
    props.onLoadingChange(true);
    if(props.action === EAction.NEW) await apiCreateManagedObject(managedObject);
    else await apiUpdateManagedObject(managedObject);
    props.onLoadingChange(false);
  }

  const onSubmitManagedObjectForm = (managedObjectFormData: TManagedObjectFormData) => {
    doSubmitManagedObject(transformFormDataToManagedObject(managedObjectFormData));
  }

  const onCancelManagedObjectForm = () => {
    props.onCancel();
  }

  const onInvalidSubmitManagedObjectForm = () => {
    // setIsFormSubmitted(true);
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

  const renderApisToolbar = () => {
    let jsxButtonList: Array<JSX.Element> = [
      <Button style={ { width: '20rem' } } type="button" label="Search APIs" className="p-button-text p-button-plain p-button-outlined" onClick={() => onSearchApis()} />,
    ];
    return (
      <Toolbar className="p-mb-4" style={ { 'background': 'none', 'border': 'none' } } left={jsxButtonList} />      
    );
  }

  const renderEnvironmentsToolbar = () => {
    let jsxButtonList: Array<JSX.Element> = [
      <Button style={ { width: '20rem' } } type="button" label="Search Environments" className="p-button-text p-button-plain p-button-outlined" onClick={() => onSearchEnvironments()} />,
    ];
    return (
      <Toolbar className="p-mb-4" style={ { 'background': 'none', 'border': 'none' } } left={jsxButtonList} />      
    );
  }

  const renderManagedObjectForm = () => {
    const funcName = 'renderManagedObjectForm';
    const logName = `${componentName}.${funcName}()`;
    const isNewObject: boolean = (props.action === EAction.NEW);
    return (
      <div className="card">
        <div className="p-fluid">
          <form onSubmit={managedObjectUseForm.handleSubmit(onSubmitManagedObjectForm, onInvalidSubmitManagedObjectForm)} className="p-fluid">           
            {/* Id */}
            <div className="p-field">
              <span className="p-float-label p-input-icon-right">
                <i className="pi pi-key" />
                <Controller
                  name="apiProduct.name"
                  control={managedObjectUseForm.control}
                  rules={APConnectorFormValidationRules.Name()}
                  render={( { field, fieldState }) => {
                      // console.log(`field=${field.name}, fieldState=${JSON.stringify(fieldState)}`);
                      return(
                        <InputText
                          id={field.name}
                          {...field}
                          autoFocus={isNewObject}
                          disabled={!isNewObject}
                          className={classNames({ 'p-invalid': fieldState.invalid })}                       
                        />
                  )}}
                />
                <label htmlFor="apiProduct.name" className={classNames({ 'p-error': managedObjectUseForm.formState.errors.apiProduct?.name })}>Name/Id*</label>
              </span>
              {displayManagedObjectFormFieldErrorMessage(managedObjectUseForm.formState.errors.apiProduct?.name)}
            </div>
            {/* Display Name */}
            <div className="p-field">
              <span className="p-float-label">
                <Controller
                  name="apiProduct.displayName"
                  control={managedObjectUseForm.control}
                  rules={APConnectorFormValidationRules.DisplayName()}
                  render={( { field, fieldState }) => {
                      // console.log(`field=${field.name}, fieldState=${JSON.stringify(fieldState)}`);
                      return(
                        <InputText
                          id={field.name}
                          {...field}
                          autoFocus={!isNewObject}
                          className={classNames({ 'p-invalid': fieldState.invalid })}                       
                        />
                  )}}
                />
                <label htmlFor="apiProduct.displayName" className={classNames({ 'p-error': managedObjectUseForm.formState.errors.apiProduct?.displayName })}>Display Name*</label>
              </span>
              {displayManagedObjectFormFieldErrorMessage(managedObjectUseForm.formState.errors.apiProduct?.displayName)}
            </div>
            {/* description */}
            <div className="p-field">
              <span className="p-float-label">
                <Controller
                  name="apiProduct.description"
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
                <label htmlFor="apiProduct.description" className={classNames({ 'p-error': managedObjectUseForm.formState.errors.apiProduct?.description })}>Description*</label>
              </span>
              {displayManagedObjectFormFieldErrorMessage(managedObjectUseForm.formState.errors.apiProduct?.description)}
            </div>
            {/* approvalType */}
            <div className="p-field">
              <span className="p-float-label">
                <Controller
                  name="apiProduct.approvalType"
                  control={managedObjectUseForm.control}
                  rules={{
                    required: "Select approval type.",
                  }}
                  render={( { field, fieldState }) => {
                      return(
                        <Dropdown
                          id={field.name}
                          {...field}
                          options={APApiObjectsCommon.getApprovalTypeSelectList()} 
                          onChange={(e) => field.onChange(e.value)}
                          className={classNames({ 'p-invalid': fieldState.invalid })}                       
                        />                        
                      )}}
                />
                <label htmlFor="apiProduct.approvalType" className={classNames({ 'p-error': managedObjectUseForm.formState.errors.apiProduct?.approvalType })}>Approval Type*</label>
              </span>
              {displayManagedObjectFormFieldErrorMessage(managedObjectUseForm.formState.errors.apiProduct?.approvalType)}
            </div>
            {/* apis */}
            <div className="p-field">
              <span className="p-float-label">
                <Controller
                  name="apiSelectItemIdList"
                  control={managedObjectUseForm.control}
                  rules={{
                    required: "Choose at least 1 API."
                  }}
                  render={( { field, fieldState }) => {
                      return(
                        <MultiSelect
                          display="chip"
                          value={field.value ? [...field.value] : []} 
                          options={inFormCurrentMultiSelectOptionApiSelectItemList} 
                          onChange={(e) => { field.onChange(e.value); }}
                          optionLabel="displayName"
                          optionValue="id"
                          // style={{width: '500px'}} 
                          className={classNames({ 'p-invalid': fieldState.invalid })}                       
                        />
                  )}}
                />
                <label htmlFor="apiSelectItemIdList" className={classNames({ 'p-error': managedObjectUseForm.formState.errors.apiSelectItemIdList })}>APIs*</label>
              </span>
              { displayManagedObjectFormFieldErrorMessage4Array(managedObjectUseForm.formState.errors.apiSelectItemIdList) }
              { renderApisToolbar() }
            </div>
            {/* environments */}
            <div className="p-field">
              <span className="p-float-label">
                <Controller
                  name="environmentSelectItemIdList"
                  control={managedObjectUseForm.control}
                  rules={{
                    required: "Choose at least 1 Environment."
                  }}
                  render={( { field, fieldState }) => {
                      return(
                        <MultiSelect
                          display="chip"
                          value={field.value ? [...field.value] : []} 
                          options={inFormCurrentMultiSelectOptionEnvironmentSelectItemList} 
                          onChange={(e) => { field.onChange(e.value); }}
                          optionLabel="displayName"
                          optionValue="id"
                          // style={{width: '500px'}} 
                          className={classNames({ 'p-invalid': fieldState.invalid })}                       
                        />
                  )}}
                />
                <label htmlFor="environmentSelectItemIdList" className={classNames({ 'p-error': managedObjectUseForm.formState.errors.environmentSelectItemIdList })}>Environments*</label>
              </span>
              { displayManagedObjectFormFieldErrorMessage4Array(managedObjectUseForm.formState.errors.environmentSelectItemIdList) }
              { renderEnvironmentsToolbar() }
            </div>
            <Divider />
            {renderManagedObjectFormFooter()}
          </form>  
        </div>
      </div>
    );
  }
  
  return (
    <div className="manage-api-products">

      {props.action === EAction.NEW && 
        <APComponentHeader header='Create API Product:' />
      }

      {props.action === EAction.EDIT && 
        <APComponentHeader header={`Edit API Product: ${props.apiProductDisplayName}`} />
      }

      <ApiCallStatusError apiCallStatus={apiCallStatus} />

      {managedObject && 
        renderManagedObjectForm()
      }

      {showSelectApis &&
        <SelectApis 
          organizationId={props.organizationId}
          currentSelectedApiItemList={inFormCurrentMultiSelectOptionApiSelectItemList}
          onSave={onManagedObjectFormSelectApisSuccess}
          onError={props.onError}          
          onCancel={onManagedObjectFormSelectApisCancel}
          onLoadingChange={props.onLoadingChange}
        />
      } 

      {showSelectEnvironments &&
        <SelectEnvironments
          organizationId={props.organizationId}
          currentSelectedEnvironmentItemList={inFormCurrentMultiSelectOptionEnvironmentSelectItemList}
          onSave={onManagedObjectFormSelectEnvironmentsSuccess}
          onError={props.onError}          
          onCancel={onManagedObjectFormSelectEnvironmentsCancel}
          onLoadingChange={props.onLoadingChange}
        />
      } 

      {/* DEBUG */}
      {/* {managedObject && 
        <React.Fragment>
          <p>managedObject:</p>
          <pre style={ { fontSize: '10px' }} >
            {JSON.stringify(managedObject.asyncApiSpec, null, 2)}
          </pre>
        </React.Fragment>
      } */}
      {managedObjectFormData && 
        <React.Fragment>
          <p>managedObjectUseForm:</p>
          <pre style={ { fontSize: '10px' }} >
            {JSON.stringify(managedObjectUseForm.getValues(), null, 2)}
          </pre>
          <p>managedObjectFormData:</p>
          <pre style={ { fontSize: '10px' }} >
            {JSON.stringify(managedObjectFormData, null, 2)}
          </pre>
        </React.Fragment>
      }
    </div>
  );
}
