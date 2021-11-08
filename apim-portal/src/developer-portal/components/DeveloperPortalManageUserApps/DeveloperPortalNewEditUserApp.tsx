
import React from "react";
import { useForm, Controller, FieldError } from 'react-hook-form';

import { InputText } from 'primereact/inputtext';
import { MultiSelect } from 'primereact/multiselect';
import { Button } from 'primereact/button';
import { Toolbar } from 'primereact/toolbar';
import { Divider } from "primereact/divider";
import { classNames } from 'primereact/utils';

import { 
  AppResponse, 
  AppsService, 
  AppPatch,
  App,
  ApiProductsService,
  APIProduct
} from '@solace-iot-team/apim-connector-openapi-browser';
import { 
  APSUserId
} from '@solace-iot-team/apim-server-openapi-browser';
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
    const updateApiObject: TUpdateApiObject = {
      // apiProducts: APComponentsCommon.transformSelectItemListToSelectItemIdList(managedObject.apiProductSelectItemList),
      apiProducts: managedObject.apiObject.apiProducts,
      attributes: managedObject.apiObject.attributes,
      callbackUrl: managedObject.apiObject.callbackUrl,
      credentials: managedObject.apiObject.credentials,
      displayName: managedObject.apiObject.displayName
    };
    return updateApiObject;
  }
  const transformManagedObjectToCreateApiObject = (managedObject: TManagedObject): TCreateApiObject => {
    // const funcName = 'transformManagedObjectToCreateApiObject';
    // const logName = `${componentName}.${funcName}()`;
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
    }
    // console.log(`${logName}: createApiObject=${JSON.stringify(createApiObject, null, 2)}`);
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
  const [selectedApiProductList, setSelectedApiProductList] = React.useState<Array<APIProduct>>([]);
  const [createdManagedObjectId, setCreatedManagedObjectId] = React.useState<TManagedObjectId>();
  const [createdManagedObjectDisplayName, setCreatedManagedObjectDisplayName] = React.useState<string>();
  const [updatedManagedObjectDisplayName, setUpdatedManagedObjectDisplayName] = React.useState<string>();
  const [managedObject, setManagedObject] = React.useState<TManagedObject>();  
  const [managedObjectFormData, setManagedObjectFormData] = React.useState<TManagedObjectFormData>();
  // inForm: MultiSelect Api Products
  const [inFormCurrentMultiSelectOptionApiProductSelectItemList, setInFormCurrentMultiSelectOptionApiProductSelectItemList] = React.useState<TApiEntitySelectItemList>([]);
  // const [inFormCurrentMultiSelectValueApiProductSelectItemIdList, setInFormCurrentMultiSelectValueApiProductSelectItemIdList] = React.useState<TApiEntitySelectItemIdList>([]);

  const managedObjectUseForm = useForm<TManagedObjectFormData>();
  const formId = componentName;
  const[isFormSubmitted, setIsFormSubmitted] = React.useState<boolean>(false);


  // const transformManagedObjectApiProductSelectItemListToApiProductIdList = (apiProductSelectItemList: TApiProductSelectItemList): Array<string> => {
  //   const apiProductIdList: Array<string> = [];
  //   apiProductSelectItemList.forEach( (apiProductSelectItem: TApiProductSelectItem) => {
  //     apiProductIdList.push(apiProductSelectItem.id);
  //   });
  //   return apiProductIdList;
  // }

  // const createManagedObjectFormDataApiProductSelectItemList = (selectedApiProductList: TApiProductSelectItemList): TManagedObjectFormDataFieldApiProductSelectItemList => {
  //   let formSelectItems: TManagedObjectFormDataFieldApiProductSelectItemList = [];
  //   selectedApiProductList.forEach( (selectedApiProduct: TApiProductSelectItem) => {
  //     formSelectItems.push({
  //       label: selectedApiProduct.displayName,
  //       value: selectedApiProduct.id
  //     });
  //   });
  //   return formSelectItems; 
  // }

  // const transformFormDataFieldApiProductSelectItemListToApiProductSelectItemList = (managedObjectFormDataFieldApiProductSelectItemList: TManagedObjectFormDataFieldApiProductSelectItemList): TApiProductSelectItemList => {
  //   let apiProductSelectItemList: TApiProductSelectItemList = [];
  //   managedObjectFormDataFieldApiProductSelectItemList.forEach( (item: TManagedObjectFormDataFieldApiProductSelectItem) => {
  //     apiProductSelectItemList.push({
  //       id: item.value,
  //       displayName: item.label
  //     });
  //   });
  //   return apiProductSelectItemList;
  // }

  // const transformMultiSelectValueListToApiProductSelectItemList = (eventValueList: Array<string>, apiProductSelectItemList: TApiEntitySelectItemList): TApiEntitySelectItemList => {
  //   const funcName = 'transformMultiSelectValueListToApiProductSelectItemList';
  //   const logName = `${componentName}.${funcName}()`;
  //   let newApiProductSelectItemList: TApiEntitySelectItemList = [];
  //   eventValueList.forEach( (id: string) => {
  //     const found: TApiEntitySelectItem | undefined = apiProductSelectItemList.find( (apiProductSelectItem: TApiEntitySelectItem) => {
  //       return apiProductSelectItem.id === id;
  //     });
  //     if(!found) throw new Error(`${logName}: form data out of sync, cannot find eventValueList.id=${id} in apiProductSelectItemList=${JSON.stringify(apiProductSelectItemList, null, 2)}`);
  //     newApiProductSelectItemList.push( found );
  //   });
  //   return newApiProductSelectItemList;
  // }

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

  // const apiGetSelectedApiProductList = async(apiProductIdList: TApiEntitySelectItemIdList): Promise<TApiCallState> => {
  //   const funcName = 'apiGetSelectedApiProductList';
  //   const logName = `${componentName}.${funcName}()`;
  //   let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_GET_API_PRODUCT_LIST, `retrieve selected api products details`);
  //   try {
  //     let _apiProductList: Array<APIProduct> = [];
  //     for(const apiProductId of apiProductIdList) {
  //       const _apiProduct: APIProduct = await ApiProductsService.getApiProduct({
  //         organizationName: props.organizationId, 
  //         apiProductName: apiProductId
  //       });
  //       _apiProductList.push(_apiProduct);
  //     }
  //     setSelectedApiProductList(_apiProductList);
  //   } catch(e: any) {
  //     APClientConnectorOpenApi.logError(logName, e);
  //     callState = ApiCallState.addErrorToApiCallState(e, callState);
  //   }
  //   setApiCallStatus(callState);
  //   return callState;  
  // }

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
      setManagedObject(emptyManagedObject);
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
  React.useEffect(() => {
    const funcName = 'useEffect[selectedApiProductList]';
    const logName = `${componentName}.${funcName}()`;
    if(selectedApiProductList.length > 0 ) alert(`${logName}: validate selected api product list for not having the same apis ...`);
  }, [selectedApiProductList]) /* eslint-disable-line react-hooks/exhaustive-deps */

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
    // setInFormCurrentMultiSelectValueApiProductSelectItemIdList(modifiedMultiSelectValueApiProductSelectItemIdList);
    managedObjectUseForm.setValue('apiProductSelectItemIdList', modifiedMultiSelectValueApiProductSelectItemIdList);
    managedObjectUseForm.trigger('apiProductSelectItemIdList');
    setShowSelectApiProducts(false);
    // onApiProductsSelect(modifiedMultiSelectValueApiProductSelectItemIdList);
  }
  const onManagedObjectFormSelectApiProductsCancel = () => {
    setShowSelectApiProducts(false);
  }

  // const doUpdateSelectedApiProductInfoList = async(apiProductIdList: TApiEntitySelectItemIdList) => {
  //   // const funcName = 'doUpdateAvailableProtocolList';
  //   // const logName = `${componentName}.${funcName}()`;
  //   // alert(`${logName}: envIdList = ${JSON.stringify(envIdList, null, 2)}`);
  //   props.onLoadingChange(true);
  //   await apiGetSelectedApiProductList(apiProductIdList);
  //   props.onLoadingChange(false);
  // }

  // const onApiProductsSelect = (apiProductIdList: TApiEntitySelectItemIdList) => {
  //   // const funcName = 'onApiProductsSelect';
  //   // const logName = `${componentName}.${funcName}()`;
  //   // alert(`${logName}: apiProductIdList=${JSON.stringify(apiProductIdList)}`);
  //   doUpdateSelectedApiProductInfoList(apiProductIdList);
  // }

  const doPopulateManagedObjectFormDataValues = (managedObjectFormData: TManagedObjectFormData) => {
    const funcName = 'doPopulateManagedObjectFormDataValues';
    const logName = `${componentName}.${funcName}()`;
    // console.log(`${logName}: managedObjectFormData = ${JSON.stringify(managedObjectFormData, null, 2)}`);
    // alert(`${logName}: managedObjectFormData.apiProductSelectItemList=\n${JSON.stringify(managedObjectFormData.apiProductSelectItemList, null, 2)}`);
    managedObjectUseForm.setValue('apiObject', managedObjectFormData.apiObject);
    // managedObjectUseForm.setValue('apiProductSelectItemList', managedObjectFormData.apiProductSelectItemList);
    managedObjectUseForm.setValue('apiProductSelectItemIdList', managedObjectFormData.apiProductSelectItemIdList);
    setInFormCurrentMultiSelectOptionApiProductSelectItemList(managedObjectFormData.apiProductSelectItemList);
    // setInFormCurrentMultiSelectValueApiProductSelectItemIdList(managedObjectFormData.apiProductSelectItemIdList);

    // setManagedObjectApiProductSelectItemList(managedObjectFormData.apiProductSelectItemList);
    // setManagedObjectFormDataCurrentApiProductSelectItemList(managedObjectFormData.apiProductSelectItemList);
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

  // const validateSelectedApiProductList = (selectApiProductsIdList: TApiEntitySelectItemIdList): boolean | string => {
  //   // const funcName = 'validateSelectedApiProductList';
  //   // const logName = `${componentName}.${funcName}()`;
  //   // alert(`${logName}: check if all api products are compatible, \nselectApiProductsIdList=${JSON.stringify(selectApiProductsIdList)} \nselectedApiProductList=${JSON.stringify(selectedApiProductList)}`);
  //   return `validateSelectedApiProductList: \nselectApiProductsIdList=${JSON.stringify(selectApiProductsIdList, null, 2)}\nselectedApiProductList=${JSON.stringify(selectedApiProductList, null, 2)}`;
  // }
  // const isSelectedApiProductListValid = (): boolean => {
  //   const funcName = 'isSelectedApiProductListValid';
  //   const logName = `${componentName}.${funcName}()`;
  //   alert(`${logName}: check if all api products are compatible, selectedApiProductList=${JSON.stringify(selectedApiProductList)}`);
  //   let isValid = true;
  //   // check if all ApiProducts are compatible

  //   isValid = isValid && selectedApiProductList.length > 0;

  //   return isValid;
  // }

  const onSubmitManagedObjectForm = (managedObjectFormData: TManagedObjectFormData) => {
    setIsFormSubmitted(true);
    // if(!isSelectedApiProductListValid()) return false;
    // const _managedObjectFormData: TManagedObjectFormData = {
    //   ...newManagedObjectFormData,
    //   attributeList: managedObjectFormData.attributeList,
    //   selectedProtocolList: selectedProtocolList
    // }
    doSubmitManagedObject(transformFormDataToManagedObject(managedObjectFormData));
  }

  const onCancelManagedObjectForm = () => {
    props.onCancel();
  }

  const onInvalidSubmitManagedObjectForm = () => {
    setIsFormSubmitted(true);
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
    const funcName = 'renderManagedObjectForm';
    const logName = `${componentName}.${funcName}()`;
    const isNew: boolean = (props.action === EAction.NEW);
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
            <div className="p-field">
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
            <div>
              <h1>TODO: add/edit multiple webhooks ...</h1>
            </div>
            {/* <div className="p-field">
              <span className="p-float-label">
                <Controller
                  name="apiObject.apiProducts"
                  control={managedObjectUseForm.control}
                  rules={{
                    required: "Choose at least 1 API Product."
                  }}
                  render={( { field, fieldState }) => {
                      // console.log(`${logName}: field=${JSON.stringify(field)}, fieldState=${JSON.stringify(fieldState)}`);
                      return(
                        <MultiSelect
                          display="chip"
                          value={field.value ? [...field.value] : []} 
                          options={createManagedObjectFormDataApiProductSelectItems()} 
                          onChange={(e) => field.onChange(e.value)}
                          optionLabel="label"
                          optionValue="value"
                          // style={{width: '500px'}} 
                          className={classNames({ 'p-invalid': fieldState.invalid })}                       
                        />
                  )}}
                />
                <label htmlFor="roles" className={classNames({ 'p-error': managedObjectUseForm.formState.errors.roles })}>Roles*</label>
              </span>
              {displayManagedObjectFormFieldErrorMessage4Array(managedObjectUseForm.formState.errors.roles)}
            </div> */}
            <Divider />
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
