
import React from "react";
import { useForm, Controller, FieldError } from 'react-hook-form';

import { classNames } from "primereact/utils";
import { Button } from "primereact/button";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Dropdown } from "primereact/dropdown";
import { MultiSelect } from "primereact/multiselect";
import { TreeSelect } from 'primereact/treeselect';

import { CommonDisplayName, CommonName } from "@solace-iot-team/apim-connector-openapi-browser";
import { 
  APSBusinessGroupAuthRoleList,
  APSOrganizationAuthRoleList, 
  APSOrganizationRolesResponse, 
  APSOrganizationRolesResponseList,
  EAPSOrganizationAuthRole, 
} from "../../_generated/@solace-iot-team/apim-server-openapi-browser";
import { ConfigHelper, TRoleSelectItemList } from "../ConfigContextProvider/ConfigHelper";
import { ConfigContext } from "../ConfigContextProvider/ConfigContextProvider";
import { TAPOrganization, TAPOrganizationList } from "../../utils/APOrganizationsService";
import APEntityIdsService, { TAPEntityId, TAPEntityIdList } from "../../utils/APEntityIdsService";

import "../APComponents.css";
import 'primeflex/primeflex.css';
import APUsersDisplayService, { 
  TAPMemberOfBusinessGroupDisplay, 
  TAPMemberOfBusinessGroupDisplayList, 
  TAPMemberOfOrganizationGroupsDisplay, 
  TAPMemberOfOrganizationGroupsDisplayList 
} from "../../displayServices/old.APUsersDisplayService";
import APRbacDisplayService from "../../displayServices/APRbacDisplayService";
import APBusinessGroupsDisplayService, { TAPBusinessGroupDisplay, TAPBusinessGroupDisplayList, TAPBusinessGroupTreeNodeDisplayList } from "../../displayServices/APBusinessGroupsDisplayService";
import { ApiCallState, TApiCallState } from "../../utils/ApiCallState";
import { APClientConnectorOpenApi } from "../../utils/APClientConnectorOpenApi";
import { Toolbar } from "primereact/toolbar";

export interface IAPManageUserMemberOfBusinessGroupsProps {
  formId: string;
  // one org
  organizationEntityId: TAPEntityId;
  completeOrganizationApBusinessGroupDisplayList: TAPBusinessGroupDisplayList;
  // existing 
  // existingApMemberOfOrganizationGroupsDisplayList: TAPMemberOfOrganizationGroupsDisplayList;
  existingOrganizationApMemberOfBusinessGroupDisplayList: TAPMemberOfBusinessGroupDisplayList;

  onChange: (apMemberOfOrganizationGroupsDisplayList: TAPMemberOfOrganizationGroupsDisplayList) => void;
  registerTriggerFormValidationFunc: (formValidationFunc: () => void) => void;

}

export const APManageUserMemberOfBusinessGroups: React.FC<IAPManageUserMemberOfBusinessGroupsProps> = (props: IAPManageUserMemberOfBusinessGroupsProps) => {
  const ComponentName = 'APManageUserMemberOfBusinessGroups';


  const ButtonLabel_AddBusinessGroup = "Add";

  type TBusinessGroupRolesFormData = {
    businessGroupId: string;
    roles: Array<string>;
  }
  type TBusinessGroupRolesFormDataEnvelope = {
    formData: TBusinessGroupRolesFormData;
  }

  const transform_BusinessGroupRolesFormDataEnvelope_To_MemberOfBusinessGroupDisplay = (bgrFde: TBusinessGroupRolesFormDataEnvelope): TAPMemberOfBusinessGroupDisplay => {
    const funcName = 'transform_BusinessGroupRolesFormDataEnvelope_To_MemberOfBusinessGroupDisplay';
    const logName = `${ComponentName}.${funcName}()`;

    const roleEntityIdList: TAPEntityIdList = APRbacDisplayService.create_BusinessGroupRoles_EntityIdList({apsBusinessGroupAuthRoleList: bgrFde.formData.roles as APSBusinessGroupAuthRoleList});

    const found = props.completeOrganizationApBusinessGroupDisplayList.find( (apBusinessGroupDisplay: TAPBusinessGroupDisplay) => {
      return apBusinessGroupDisplay.apEntityId.id === bgrFde.formData.businessGroupId;
    });
    if(found === undefined) throw new Error(`${logName}: found === undefined`);

    const apMemberOfBusinessGroupDisplay: TAPMemberOfBusinessGroupDisplay = {
      apBusinessGroupDisplay: found,
      apConfiguredBusinessGroupRoleEntityIdList: roleEntityIdList,
      apCalculatedBusinessGroupRoleEntityIdList: []
    }
    return apMemberOfBusinessGroupDisplay;
  }

  const [completeOrganizationApBusinessGroupTreeNodeDisplayList, setCompleteOrganizationApBusinessGroupTreeNodeDisplayList] = React.useState<TAPBusinessGroupTreeNodeDisplayList>([]);
  const [newOrganizationApMemberOfBusinessGroupDisplayList, setNewOrganizationApMemberOfBusinessGroupDisplayList] = React.useState<TAPMemberOfBusinessGroupDisplayList>([]);
  const businessGroupsUseForm = useForm<TBusinessGroupRolesFormDataEnvelope>();
  

  const APManageUserMemberOfBusinessGroups_triggerFormValidation = (): void => {
    alert('APManageUserMemberOfBusinessGroups_triggerFormValidation: do the form validation');
    // organizationRolesUseForm.trigger();
  }


  const doInitialize = () => {
    const funcName = 'doInitialize';
    const logName = `${ComponentName}.${funcName}()`;

    // copy the existing list
    setNewOrganizationApMemberOfBusinessGroupDisplayList(JSON.parse(JSON.stringify(props.existingOrganizationApMemberOfBusinessGroupDisplayList)));
    // generate the tree node
    const apBusinessGroupTreeNodeDisplayList: TAPBusinessGroupTreeNodeDisplayList = APBusinessGroupsDisplayService.generate_ApBusinessGroupTreeNodeDisplayList_From_ApBusinessGroupDisplayList(props.completeOrganizationApBusinessGroupDisplayList);
    setCompleteOrganizationApBusinessGroupTreeNodeDisplayList(apBusinessGroupTreeNodeDisplayList);

    // register with caller
    props.registerTriggerFormValidationFunc(APManageUserMemberOfBusinessGroups_triggerFormValidation);

    // set the form
    // const formDataEnvelope: TBusinessGroupRolesFormDataEnvelope = {
    //   formData: apBusinessGroupTreeNodeDisplayList
    // }
    // businessGroupsUseForm.setValue('formData', managedObjectFormDataEnvelope.formData);


  }

  const validateInputCombination = () => {
    // placeholder
  }
  React.useEffect(() => {
    const funcName = 'useEffect[]';
    const logName = `${ComponentName}.${funcName}()`;
    validateInputCombination();
    doInitialize();
  }, []); /* eslint-disable-line react-hooks/exhaustive-deps */

  const doAdd_ApMemberOfBusinessGroupDisplay = (selectedApMemberOfBusinessGroupDisplay: TAPMemberOfBusinessGroupDisplay) => {
    const funcName = 'doAdd_ApMemberOfBusinessGroupDisplay';
    const logName = `${ComponentName}.${funcName}()`;

    const organizationApMemberOfBusinessGroupDisplayList = newOrganizationApMemberOfBusinessGroupDisplayList;
    const existingIndex = organizationApMemberOfBusinessGroupDisplayList.findIndex( (apMemberOfBusinessGroupDisplay: TAPMemberOfBusinessGroupDisplay) => {
      return apMemberOfBusinessGroupDisplay.apBusinessGroupDisplay.apEntityId.id === selectedApMemberOfBusinessGroupDisplay.apBusinessGroupDisplay.apEntityId.id;
    });
    if(existingIndex > -1) {
      // replace
      organizationApMemberOfBusinessGroupDisplayList[existingIndex] = selectedApMemberOfBusinessGroupDisplay;
    } else {
      // add
      organizationApMemberOfBusinessGroupDisplayList.push(selectedApMemberOfBusinessGroupDisplay);
    }
    setNewOrganizationApMemberOfBusinessGroupDisplayList(organizationApMemberOfBusinessGroupDisplayList);
  }

  // const doAddManagedOrganizationRoles = (mor: APSOrganizationRolesResponse) => {
  //   setManagedOrganizationRoles(emptyManagedOrganizationRoles);
  //   setIsManagedOrganizationRolesListChanged(true);
  //   const _morl = [...selectedOrganizationRolesList];
  //   _morl.push(mor);
  //   setSelectedOrganizationRolesList(_morl);
  //   setIsManagedOrganizationRolesListChanged(true);
  // }
  // const doRemoveManagedOrganizationRoles = (mor: APSOrganizationRolesResponse) => {
  //   const idx = selectedOrganizationRolesList.findIndex((organizationRoles: APSOrganizationRolesResponse) => {
  //     return mor.organizationId === organizationRoles.organizationId;
  //   });
  //   const _morl = [...selectedOrganizationRolesList];
  //   _morl.splice(idx, 1);
  //   setSelectedOrganizationRolesList(_morl);
  //   setIsManagedOrganizationRolesListChanged(true);
  // }
  // const doUpdateManagedOrganizationRoles = (mor: APSOrganizationRolesResponse) => {
  //   const idx = selectedOrganizationRolesList.findIndex((organizationRoles: APSOrganizationRolesResponse) => {
  //     return mor.organizationId === organizationRoles.organizationId;
  //   });
  //   const _morl = [...selectedOrganizationRolesList];
  //   _morl[idx] = mor;
  //   setSelectedOrganizationRolesList(_morl);
  //   setIsManagedOrganizationRolesListChanged(true);
  // }
  // const onSubmitOrganizationRolesForm = (organizationRolesFormData: TOrganizationRolesFormData) => {
  //   // alert(`organizationRolesFormData = ${JSON.stringify(organizationRolesFormData, null, 2)}`);
  //   const found = props.availableOrganizationList.find((x) => {
  //     return x.name === organizationRolesFormData.organizationId;
  //   });
  //   const fd: TOrganizationRolesFormData = {
  //     ...organizationRolesFormData,
  //     organizationDisplayName: found ? found.displayName : organizationRolesFormData.organizationId
  //   }
  //   // alert(`fd = ${JSON.stringify(fd, null, 2)}`);
  //   doAddManagedOrganizationRoles(transformFormDataToManagedOrganizationRoles(fd));
  // }
  // const onInvalidSubmitOrganizationRolesForm = () => {
  //   // placeholder
  // }

  // const onSelectedRolesChanged = (authRoleList: APSOrganizationAuthRoleList) => {
  //   if(props.organizationId !== undefined && props.organizationDisplayName !== undefined) {
  //     doUpdateManagedOrganizationRoles({
  //       organizationId: props.organizationId,
  //       organizationDisplayName: props.organizationDisplayName,
  //       roles: authRoleList
  //     });
  //   }
  // }

  const displayFormFieldErrorMessage = (fieldError: FieldError | undefined) => {
    return fieldError && <small className="p-error">{fieldError.message}</small>    
  }
  const displayFormFieldErrorMessage4Array = (fieldErrorList: Array<FieldError | undefined> | undefined) => {
    let _fieldError: any = fieldErrorList;
    return _fieldError && <small className="p-error">{_fieldError.message}</small>;
  }

  const formFooterRightToolbarTemplate = () => {
    return (
      <React.Fragment>
        <Button key={ComponentName+'submit'} label={ButtonLabel_AddBusinessGroup} form={props.formId} type="submit" icon="pi pi-plus" className="p-button-text p-button-plain p-button-outlined" />
      </React.Fragment>
    );
  }

  const renderFormFooter = (): JSX.Element => {
    return (
      <Toolbar className="p-mb-4" right={formFooterRightToolbarTemplate} />
    )
  }

  const renderRolesField = () => {
    // const width = props.organizationId === undefined ? '75%' : '100%';
    const width = '100%';
    return (
      <div className="p-field" style={{ width: width }} >
        <span className="p-float-label">
          <Controller
            control={businessGroupsUseForm.control}
            name="formData.roles"
            rules={{
              required: "Choose at least 1 Role."
            }}
            render={( { field, fieldState }) => {
                return(
                  <MultiSelect
                    display="chip"
                    value={field.value ? [...field.value] : []} 
                    options={APRbacDisplayService.create_BusinessGroupRoles_SelectEntityIdList()} 
                    onChange={(e) => field.onChange(e.value)}
                    optionLabel={APEntityIdsService.nameOf('displayName')}
                    optionValue={APEntityIdsService.nameOf('id')}
                    className={classNames({ 'p-invalid': fieldState.invalid })}                       
                  />
            )}}
          />
          <label className={classNames({ 'p-error': businessGroupsUseForm.formState.errors.formData?.roles })}>Role(s)*</label>
        </span>
        { displayFormFieldErrorMessage4Array(businessGroupsUseForm.formState.errors.formData?.roles) }
      </div>
    );
  }

  const renderBusinessGroupsRolesListTable = () => {
    return (
      <React.Fragment>
        <p><b>renderBusinessGroupsRolesListTable: TODO: render the selected groups/roles tree table with remove button (see ListAsTreeTableBusinessGroups)</b></p>
        {/* DEBUG */}
        <p>newOrganizationApMemberOfBusinessGroupDisplayList:</p>
        <pre style={ { fontSize: '10px' }} >
          {JSON.stringify(newOrganizationApMemberOfBusinessGroupDisplayList, null, 2)}
        </pre>
      </React.Fragment>
    );
  }

  const onSubmitForm = (newMofde: TBusinessGroupRolesFormDataEnvelope) => {
    // const funcName = 'onSubmitForm';
    // const logName = `${ComponentName}.${funcName}()`;
    doAdd_ApMemberOfBusinessGroupDisplay(transform_BusinessGroupRolesFormDataEnvelope_To_MemberOfBusinessGroupDisplay(newMofde));
  }
  const onInvalidSubmitForm = () => {
    // placeholder
  }

  const renderForm = () => {
    return (
      <div className="card">
        <div className="p-fluid">
          <form id={props.formId} onSubmit={businessGroupsUseForm.handleSubmit(onSubmitForm, onInvalidSubmitForm)} className="p-fluid">           
            {/* <div className="p-formgroup-inline"> */}
              {/* businessGroupId */}
              {/* <div className="p-field" style={{ width: '20%' }} > */}
              <div className="p-field">
                <span className="p-float-label p-input-icon-right">
                  <i className="pi pi-key" />
                  <Controller
                    control={businessGroupsUseForm.control}
                    name="formData.businessGroupId"
                    rules={{
                      required: "Select a Business Group.",
                    }}
                    render={( { field, fieldState }) => {
                      return(
                        <TreeSelect
                          id={field.name}
                          className={classNames({ 'p-invalid': fieldState.invalid })}   
                          {...field}
                          options={completeOrganizationApBusinessGroupTreeNodeDisplayList}
                          onChange={(e) => field.onChange(e.value) }
                          filter
                        />
                    )}}
                  />
                  <label className={classNames({ 'p-error': businessGroupsUseForm.formState.errors.formData?.businessGroupId })}>Business Group*</label>
                </span>
                {displayFormFieldErrorMessage(businessGroupsUseForm.formState.errors.formData?.businessGroupId)}
              </div>
              {/* Roles */}
              { renderRolesField() }
              <div>          
                { renderFormFooter() }
              </div>  
            {/* </div> */}
            {renderBusinessGroupsRolesListTable()}
            {/* DEBUG */}
            {/* <p>selectedOrganizationRolesList:</p>
            <pre style={ { fontSize: '10px' }} >
              {JSON.stringify(selectedOrganizationRolesList, null, 2)}
            </pre> */}
          </form> 
        </div>
      </div>
    );
  }

  return renderForm();

}
