
import React from "react";
import { useForm, Controller } from 'react-hook-form';

import { classNames } from "primereact/utils";
import { Button } from "primereact/button";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { TreeSelect } from "primereact/treeselect";
import { InputText } from "primereact/inputtext";
import { Toolbar } from "primereact/toolbar";

import APBusinessGroupsDisplayService, { TAPBusinessGroupTreeNodeDisplay, TAPBusinessGroupTreeNodeDisplayList } from "../../../../../displayServices/APBusinessGroupsDisplayService";
import APEpSettingsDisplayService, { IApEpSettings_Mapping, TApEpSettings_MappingList } from "../../../../../displayServices/APEpSettingsDisplayService";
import APEntityIdsService from "../../../../../utils/APEntityIdsService";
import APDisplayUtils from "../../../../../displayServices/APDisplayUtils";
import { ManageSelectAppDomain } from "./ManageSelectAppDomain";
import { IAPEpApplicationDomainDisplay } from "../../../../../displayServices/APEpApplicationDomainsDisplayService";
import { TApiCallState } from "../../../../../utils/ApiCallState";

import '../../../../../components/APComponents.css';
import "../../ManageOrganizations.css";

export interface IEditNewApplicationDomainMappingFormProps {
  organizationId: string;
  uniqueFormKeyPrefix: string; /** provide a unique prefix for the formId and button keys so component can be used multiple times on same parent component with different formIds */
  apEpSettings_MappingList: TApEpSettings_MappingList;
  apBusinessGroupTreeNodeDisplayList: TAPBusinessGroupTreeNodeDisplayList;
  onChange: (apEpSettings_MappingList: TApEpSettings_MappingList) => void; /** called every time the list has changed */
  onError: (apiCallState: TApiCallState) => void;
}

export const EditNewApplicationDomainMappingForm: React.FC<IEditNewApplicationDomainMappingFormProps> = (props: IEditNewApplicationDomainMappingFormProps) => {
  const ComponentName = 'EditNewApplicationDomainMappingForm';

  type TManagedObject = IApEpSettings_Mapping; 
  type TManagedObjectList = Array<TManagedObject>;

  type TManagedObjectUseFormData = {
    applicationDomainName: string;
    businessGroupId: string;
  };
  type TManagedObjectExtFormData = {
    selected_apEpApplicationDomainDisplay: IAPEpApplicationDomainDisplay;
  };
  type TManagedObjectFormDataEnvelope = {
    useFormData: TManagedObjectUseFormData;
    extFormData: TManagedObjectExtFormData;
  }

  const transform_ManagedObject_To_FormDataEnvelope = (mo: TManagedObject): TManagedObjectFormDataEnvelope => {
    const ufd: TManagedObjectUseFormData = {
      businessGroupId: mo.businessGroupEntityId.id,
      applicationDomainName: mo.apEntityId.displayName,
    };
    const efd: TManagedObjectExtFormData = {
      selected_apEpApplicationDomainDisplay: {
        apEntityId: mo.apEntityId,
        apSearchContent: ''
      }
    }
    return {
      useFormData: ufd,
      extFormData: efd
    };
  }

  const update_FormDataEnvelope_With_Ext_IAPEpApplicationDomainDisplay = ({ selected_apEpApplicationDomainDisplay }:{
    selected_apEpApplicationDomainDisplay: IAPEpApplicationDomainDisplay;
  }): TManagedObjectFormDataEnvelope => {
    const funcName = 'update_FormDataEnvelope_With_Ext_IAPEpApplicationDomainDisplay';
    const logName = `${ComponentName}.${funcName}()`;
    if(managedObjectFormDataEnvelope === undefined) throw new Error(`${logName}: managedObjectFormDataEnvelope === undefined`);

    const ufd: TManagedObjectUseFormData = {
      ...managedObjectFormDataEnvelope.useFormData,
      applicationDomainName: selected_apEpApplicationDomainDisplay.apEntityId.displayName
    };
    const efd: TManagedObjectExtFormData = {
      selected_apEpApplicationDomainDisplay: selected_apEpApplicationDomainDisplay
    }
    return {
      useFormData: ufd,
      extFormData: efd
    };
  }

  const create_ManagedObject_From_FormEntities = ({formDataEnvelope}: {
    formDataEnvelope: TManagedObjectFormDataEnvelope;
  }): TManagedObject => {
    const mo: TManagedObject = {
      apEntityId: formDataEnvelope.extFormData.selected_apEpApplicationDomainDisplay.apEntityId,
      businessGroupEntityId: {
        id: formDataEnvelope.useFormData.businessGroupId,
        displayName: 'set later for ' + formDataEnvelope.useFormData.businessGroupId
      },
      isValid: true,
      apSearchContent: ''
    }
    return mo;
  }

  const EmptyManagedObject: TManagedObject = APEpSettingsDisplayService.create_Empty_ApEpSettingsDisplay_Mapping();
  const UniqueKeyPrefix: string = props.uniqueFormKeyPrefix + '_' + ComponentName;
  const FormId: string = UniqueKeyPrefix + '_Form';
  const EmptyMessage: string = 'No business groups defined.';
  const ButtonLabel_SelectAppDomain = "Select Application Domain";

  const [managedObject, setManagedObject] = React.useState<TManagedObject>();
  const [managedObjectList, setManagedObjectList] = React.useState<TManagedObjectList>(props.apEpSettings_MappingList);
  const [isManagedObjectListChanged, setIsManagedObjectListChanged] = React.useState<boolean>(false);
  const [managedObjectFormDataEnvelope, setManagedObjectFormDataEnvelope] = React.useState<TManagedObjectFormDataEnvelope>();
  const [showSelectAppDomain, setShowSelectAppDomain] = React.useState<boolean>(false);
  const managedObjectDataTableRef = React.useRef<any>(null);
  const managedObjectUseForm = useForm<TManagedObjectFormDataEnvelope>();

  // const doSetApMemberOfBusinessGroupTreeTableNodeList = (apExcludeBusinessGroupIdList: Array<string>) => {
  //   setApMemberOfBusinessGroupTreeTableNodeList(APMemberOfService.create_ApMemberOfBusinessGroupTreeTableNodeList_From_ApMemberOfBusinessGroupDisplayTreeNodeList({
  //     apMemberOfBusinessGroupDisplayTreeNodeList: props.apMemberOfBusinessGroupDisplayTreeNodeList,
  //     includeBusinessGroupIsSelectable: true,
  //     accessOnly_To_BusinessGroupManageAssets: true,
  //     excludeAccess_To_BusinessGroupIdList: props.apExcludeBusinessGroupIdList
  //   }));
  //   apExcludeBusinessGroupIdList.forEach( (x) => {
  //     doRemoveManagedObjectId_From_ManagedObjectList(x);
  //   });
  // }

  React.useEffect(() => {
    setManagedObject(EmptyManagedObject);
    // doSetApMemberOfBusinessGroupTreeTableNodeList(props.apExcludeBusinessGroupIdList);
    managedObjectUseForm.clearErrors();
  }, []); /* eslint-disable-line react-hooks/exhaustive-deps */

  // React.useEffect(() => {
  //   doSetApMemberOfBusinessGroupTreeTableNodeList(props.apExcludeBusinessGroupIdList);
  // }, [props.apExcludeBusinessGroupIdList]); /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    if(managedObject === undefined) return;
    setManagedObjectFormDataEnvelope(transform_ManagedObject_To_FormDataEnvelope(managedObject));
    managedObjectUseForm.clearErrors();

    const businessGroupId: string | undefined = managedObjectUseForm.getValues('useFormData.businessGroupId');
    if(businessGroupId !== undefined && businessGroupId !== '') managedObjectUseForm.trigger();
  }, [managedObject]) /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    if(isManagedObjectListChanged) {
      props.onChange(managedObjectList);
      setIsManagedObjectListChanged(false);
      setManagedObject(EmptyManagedObject);
    }
  }, [managedObjectList, isManagedObjectListChanged]) /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    if(managedObjectFormDataEnvelope === undefined) return;
    managedObjectUseForm.setValue('useFormData', managedObjectFormDataEnvelope.useFormData);
    // setSelectedApis_RefreshCounter(selectedApis_RefreshCounter + 1);
  }, [managedObjectFormDataEnvelope]) /* eslint-disable-line react-hooks/exhaustive-deps */

  const doAddManagedObject = (mo: TManagedObject) => {
    const funcName = 'doAddManagedObject';
    const logName = `${ComponentName}.${funcName}()`;

    setManagedObject(EmptyManagedObject);

    // find the businessGroupDisplay by id to get the displayName
    const apBusinessGroupTreeNodeDisplay: TAPBusinessGroupTreeNodeDisplay | undefined = APBusinessGroupsDisplayService.find_ApBusinessGroupDisplay_From_ApBusinessGroupDisplayTreeNodeList({ 
      apBusinessGroupTreeNodeDisplayList: props.apBusinessGroupTreeNodeDisplayList,
      businessGroupId: mo.businessGroupEntityId.id 
    });
    if(apBusinessGroupTreeNodeDisplay === undefined) throw new Error(`${logName}: apBusinessGroupTreeNodeDisplay === undefined`);
    mo.businessGroupEntityId = {
      id: apBusinessGroupTreeNodeDisplay.key,
      displayName: apBusinessGroupTreeNodeDisplay.label
    };
    // apEntityId already set fully? for applicationDomainEntityId
    const _newMoList: TManagedObjectList = JSON.parse(JSON.stringify(managedObjectList));
    _newMoList.push(mo);
    setManagedObjectList(APEntityIdsService.sort_ApDisplayObjectList_By_DisplayName(_newMoList));
    setIsManagedObjectListChanged(true);
  }

  const doRemoveManagedObjectId_From_ManagedObjectList = (id: string) => {
    if(managedObjectList === undefined || managedObjectList.length === 0) return;
    const _newMoList: TManagedObjectList = JSON.parse(JSON.stringify(managedObjectList));
    const idx = _newMoList.findIndex( (x) => {
      return x.apEntityId.id === id;
    });
    if(idx > -1) {
      _newMoList.splice(idx, 1);
      setManagedObjectList(_newMoList);
      setIsManagedObjectListChanged(true);
    }
  }
  const doRemoveManagedObject = (mo: TManagedObject) => {
    doRemoveManagedObjectId_From_ManagedObjectList(mo.apEntityId.id);
  }

  const onSelectAppDomain = () => {
    setShowSelectAppDomain(true);
  }

  const onSelectAppDomainCancel = () => {
    setShowSelectAppDomain(false);
  }
  const onSelectAppDomainSuccess = (apEpApplicationDomainDisplay: IAPEpApplicationDomainDisplay) => {
    setManagedObjectFormDataEnvelope(update_FormDataEnvelope_With_Ext_IAPEpApplicationDomainDisplay({
      selected_apEpApplicationDomainDisplay: apEpApplicationDomainDisplay
    }));
    setShowSelectAppDomain(false);
  }
  const onSubmitManagedObjectForm = (newMofde: TManagedObjectFormDataEnvelope) => {
    const funcName = 'onSubmitManagedObjectForm';
    const logName = `${ComponentName}.${funcName}()`;
    if(managedObjectFormDataEnvelope === undefined) throw new Error(`${logName}: managedObjectFormDataEnvelope === undefined`);
    // newMofde: only carries the useFormData
    // add the extFormData from state
    const complete_mofde: TManagedObjectFormDataEnvelope = managedObjectFormDataEnvelope;
    complete_mofde.useFormData = newMofde.useFormData;
    doAddManagedObject(create_ManagedObject_From_FormEntities({ formDataEnvelope: complete_mofde }));
  }

  const onInvalidSubmitManagedObjectForm = () => {
    // placeholder
  }

  const applicationDomainNameBodyTemplate = (mo: TManagedObject): JSX.Element => {
    if(mo.isValid) return (<span>{mo.apEntityId.displayName}</span>);
    return <span style={{ color: 'red' }}>{mo.apEntityId.displayName}</span>
  }

  const renderTable = (): JSX.Element => {
    const actionBodyTemplate = (mo: TManagedObject) => {
      return (
        <React.Fragment>
          <Button 
            key={UniqueKeyPrefix+'_remove_'+mo.apEntityId.id} 
            type='button'
            icon="pi pi-times" 
            className="p-button-rounded p-button-outlined p-button-secondary p-mr-2" 
            onClick={() => doRemoveManagedObject(mo)} 
          />
        </React.Fragment>
      );
    }
    const dataKey = APDisplayUtils.nameOf<TManagedObject>('apEntityId.id');
    const sortField = APDisplayUtils.nameOf<TManagedObject>('apEntityId.displayName');
    const applicationDomainNameField = APDisplayUtils.nameOf<TManagedObject>('apEntityId.displayName');
    const businessGroupNameField = APDisplayUtils.nameOf<TManagedObject>('businessGroupEntityId.displayName');

    return (
      <React.Fragment>
        <DataTable
          ref={managedObjectDataTableRef}
          className="p-datatable-sm"
          showGridlines={false}
          value={managedObjectList}
          emptyMessage={EmptyMessage}
          scrollable 
          dataKey={dataKey}  
          sortMode='single'
          sortField={sortField}
          sortOrder={1}
          // resizableColumns 
          // columnResizeMode="fit"
          autoLayout={true}
        >
          <Column 
            header="Application Domain" 
            body={applicationDomainNameBodyTemplate}
            style={{width: '20%'}}
            field={applicationDomainNameField} 
            sortable 
          />
          <Column 
            header="Business Group" 
            // headerStyle={{ width: "20em"}} 
            bodyStyle={{ overflowWrap: 'break-word', wordWrap: 'break-word' }}
            field={businessGroupNameField} 
            sortable 
          />
          <Column body={actionBodyTemplate} bodyStyle={{ width: '3em', textAlign: 'end' }} />
        </DataTable>
      </React.Fragment>        
    );
  }

  const validateApplicationDomainName = (applicationDomainName: string): string | boolean => {
    // check that id is unique
    if(managedObjectList.find((x) => {
      return x.apEntityId.displayName === applicationDomainName;
    })) {
      return 'Application Domain already exists. Delete it first.';
    }
    return true;
  }

  const renderAppDomainToolbar = () => {
    let jsxButtonList: Array<JSX.Element> = [
      <Button style={ { width: '20rem' } } type="button" label={ButtonLabel_SelectAppDomain} className="p-button-text p-button-plain p-button-outlined" onClick={() => onSelectAppDomain()} />,
    ];
    return (
      <Toolbar className="p-mb-4" style={ { 'background': 'none', 'border': 'none' } } left={jsxButtonList} />      
    );
  }

  const renderComponent = () => {
    // const funcName = 'renderComponent';
    // const logName = `${ComponentName}.${funcName}()`;

    return (
      <div className="card">
        <div className="p-fluid">
          <form id={FormId} onSubmit={managedObjectUseForm.handleSubmit(onSubmitManagedObjectForm, onInvalidSubmitManagedObjectForm)} className="p-fluid">           
            <div className="p-formgroup-inline">
              {/* Application Domain */}
              <div className="p-field" style={{ width: '20%' }} >
                <span className="p-float-label p-input-icon-right">
                  <i className="pi pi-key" />
                  <Controller
                    control={managedObjectUseForm.control}
                    name="useFormData.applicationDomainName"
                    rules={{
                      required: 'Enter an Application Domain Name.',
                      validate: validateApplicationDomainName,
                    }}
                    render={( { field, fieldState }) => {
                      return(
                        <InputText
                          id={field.name}
                          {...field}
                          className={classNames({ 'p-invalid': fieldState.invalid })}
                          disabled={true}                       
                        />
                    )}}
                  />
                <label className={classNames({ 'p-error': managedObjectUseForm.formState.errors.useFormData?.applicationDomainName })}>Application Domain*</label>
                </span>
                {APDisplayUtils.displayFormFieldErrorMessage(managedObjectUseForm.formState.errors.useFormData?.applicationDomainName)}
                { renderAppDomainToolbar() }
              </div>
              {/* Business Group */}
              <div className="p-field" style={{ width: '75%' }} >
                <span className="p-float-label">
                  <Controller
                    control={managedObjectUseForm.control}
                    name="useFormData.businessGroupId"
                    rules={{
                      required: 'Select a business group.',
                    }}
                    render={( { field, fieldState }) => {
                      return(
                        <TreeSelect
                          id={field.name}
                          {...field}
                          options={props.apBusinessGroupTreeNodeDisplayList}
                          onChange={(e) => field.onChange(e.value)}
                          filter={true}
                          selectionMode="single"
                          className={classNames({ 'p-invalid': fieldState.invalid })}                       
                        />
                    )}}
                  />
                <label className={classNames({ 'p-error': managedObjectUseForm.formState.errors.useFormData?.businessGroupId })}>Business Group*</label>
                </span>
                {APDisplayUtils.displayFormFieldErrorMessage(managedObjectUseForm.formState.errors.useFormData?.businessGroupId)}
              </div>
              <div>          
                <Button key={UniqueKeyPrefix+'submit'} form={FormId} type="submit" icon="pi pi-plus" className="p-button-text p-button-plain p-button-outlined" />
              </div>  
            </div>
            {renderTable()}
            {/* DEBUG */}
            {/* <p>managedAttributeList:</p>
            <pre style={ { fontSize: '10px' }} >
              {JSON.stringify(managedAttributeList, null, 2)}
            </pre> */}
          </form>  
        </div>
      </div>
    );
  }

  const renderManageAppDomainSelection = () => {
    const funcName = 'renderManageAppDomainSelection';
    const logName = `${ComponentName}.${funcName}()`;
    if(managedObjectFormDataEnvelope === undefined) throw new Error(`${logName}: managedObjectFormDataEnvelope === undefined`);
    return(
      <ManageSelectAppDomain
        organizationId={props.organizationId}
        currentSelected_apEpApplicationDomainDisplay={managedObjectFormDataEnvelope.extFormData.selected_apEpApplicationDomainDisplay}
        excludeFromSelection_TAPEpApplicationDomainDisplayList={props.apEpSettings_MappingList}
        onSave={onSelectAppDomainSuccess}
        onCancel={onSelectAppDomainCancel}
        onError={props.onError}
      />
    );
  }

  return(
    <React.Fragment>

      { managedObjectFormDataEnvelope && renderComponent() }

      {showSelectAppDomain && managedObjectFormDataEnvelope && 
        renderManageAppDomainSelection()
      } 

    </React.Fragment>
  );
}
