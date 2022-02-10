
import React from "react";
import { useForm, Controller, FieldError } from 'react-hook-form';

import { classNames } from "primereact/utils";
import { Button } from "primereact/button";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Dropdown } from "primereact/dropdown";
import { MultiSelect } from "primereact/multiselect";

import { CommonDisplayName, CommonName } from "@solace-iot-team/apim-connector-openapi-browser";
import { 
  APSOrganizationAuthRoleList, 
  APSOrganizationRolesResponse, 
  APSOrganizationRolesResponseList, 
} from "../../_generated/@solace-iot-team/apim-server-openapi-browser";
import { ConfigHelper, TRoleSelectItemList } from "../ConfigContextProvider/ConfigHelper";
import { ConfigContext } from "../ConfigContextProvider/ConfigContextProvider";
import { TAPOrganization, TAPOrganizationList } from "../../utils/APOrganizationsService";
import APEntityIdsService, { TAPEntityIdList } from "../../utils/APEntityIdsService";

import "../APComponents.css";
import 'primeflex/primeflex.css';

export interface IAPManageUserOrganizationsProps {
  formId: string;
  availableOrganizationList: TAPOrganizationList;
  organizationRolesList: APSOrganizationRolesResponseList;
  organizationId?: CommonName;
  organizationDisplayName?: CommonDisplayName;
  onChange: (organizationRolesResponseList: APSOrganizationRolesResponseList) => void;
  registerTriggerFormValidationFunc: (formValidationFunc: () => void) => void;
}

export const APManageUserOrganizations: React.FC<IAPManageUserOrganizationsProps> = (props: IAPManageUserOrganizationsProps) => {
  const componentName = 'APManageUserOrganizations';

  type TOrganizationRolesFormData = APSOrganizationRolesResponse;
  const emptyManagedOrganizationRoles: APSOrganizationRolesResponse = {
    organizationId: '',
    organizationDisplayName: '',
    roles: []
  }

  const [configContext] = React.useContext(ConfigContext); 

  const transformManagedOrganinzationRolesToFormData = (mor: APSOrganizationRolesResponse): TOrganizationRolesFormData => {
    return {
      ...mor
    }
  }
  const transformFormDataToManagedOrganizationRoles = (formData: TOrganizationRolesFormData): APSOrganizationRolesResponse => {
    return {
      ...formData
    }
  }

  const createOrganizationSelectItems = (): TAPEntityIdList => {
    let selectItems: TAPEntityIdList = [];
    if(props.organizationId === undefined && props.organizationDisplayName === undefined) {
      props.availableOrganizationList.forEach( (availableOrganization: TAPOrganization) => {
        const alreadySelected = selectedOrganizationRolesList.find((apsOrganizationRoles: APSOrganizationRolesResponse) => {
          return availableOrganization.name === apsOrganizationRoles.organizationId;
        });
        if(!alreadySelected) {
          selectItems.push({
            id: availableOrganization.name,
            displayName: availableOrganization.displayName
          });
        }
      });
    } else if(props.organizationId !== undefined && props.organizationDisplayName !== undefined) {
        selectItems.push({
          id: props.organizationId,
          displayName: props.organizationDisplayName ? props.organizationDisplayName : props.organizationId
        });  
    }
    return APEntityIdsService.sort_byDisplayName(selectItems);
  }

  const organizationRolesSelectItemList: TRoleSelectItemList = ConfigHelper.createOrganizationRolesSelectItems(configContext);
  const organizationRolesUseForm = useForm<TOrganizationRolesFormData>();
  const [managedOrganizationRoles, setManagedOrganizationRoles] = React.useState<APSOrganizationRolesResponse>(emptyManagedOrganizationRoles);
  const [selectedOrganizationRolesList, setSelectedOrganizationRolesList] = React.useState<APSOrganizationRolesResponseList>(props.organizationRolesList);
  const [isManagedOrganizationRolesListChanged, setIsManagedOrganizationRolesListChanged] = React.useState<boolean>(false);
  const [organizationRolesFormData, setOrganizationRolesFormData] = React.useState<TOrganizationRolesFormData>();
  const organizationRolesListDataTableRef = React.useRef<any>(null);

  const APManageUserOrganizations_triggerFormValidation = (): void => {
    // alert('APManageUserOrganizations_triggerFormValidation: do the form validation');
    organizationRolesUseForm.trigger();
  }

  React.useEffect(() => {
    const funcName = 'useEffect[]';
    const logName = `${componentName}.${funcName}()`;
    // alert(`${componentName}: mounting: props.organizationRolesList=${JSON.stringify(props.organizationRolesList, null, 2)}`);
    // alert(`${componentName}: mounting:  props.availableOrganizationList=${JSON.stringify(props.availableOrganizationList, null, 2)}`);
    const validInputCombination: boolean = (props.organizationId !== undefined && props.organizationDisplayName !== undefined) || (props.organizationId === undefined && props.organizationDisplayName === undefined);
    if(!validInputCombination) {
      throw new Error(`${logName}: invalid input combination: props.organizationId=${props.organizationId}, props.organizationDisplayName=${props.organizationDisplayName}`);
    }
    if(props.organizationId)
    if(props.organizationId !== undefined && props.organizationDisplayName !== undefined) {
      let initialOrganizationRoles: APSOrganizationRolesResponse = {
        organizationId: props.organizationId,
        organizationDisplayName: props.organizationDisplayName,
        roles: []
      }
      if(props.organizationRolesList.length > 0) {
        const roles = props.organizationRolesList.find( (apsOrganizationRoles: APSOrganizationRolesResponse) => {
          return apsOrganizationRoles.organizationId === props.organizationId;
        });
        if(!roles) throw new Error(`${logName}: roles is undefined`);
        initialOrganizationRoles = roles
      }
      setManagedOrganizationRoles(initialOrganizationRoles);
    }
    // register with caller
    props.registerTriggerFormValidationFunc(APManageUserOrganizations_triggerFormValidation);
  }, []); /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    if(managedOrganizationRoles) setOrganizationRolesFormData(transformManagedOrganinzationRolesToFormData(managedOrganizationRoles));
  }, [managedOrganizationRoles]) /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    if(isManagedOrganizationRolesListChanged) {
      organizationRolesUseForm.clearErrors();
      if(organizationRolesUseForm.getValues('organizationId') !== '') organizationRolesUseForm.trigger();
      props.onChange(selectedOrganizationRolesList);
    }
  }, [selectedOrganizationRolesList]) /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    if(organizationRolesFormData) doPopulateOrganizationRolesFormDataValues(organizationRolesFormData);
  }, [organizationRolesFormData]) /* eslint-disable-line react-hooks/exhaustive-deps */

  const doPopulateOrganizationRolesFormDataValues = (organizationRolesFormData: TOrganizationRolesFormData) => {
    organizationRolesUseForm.setValue('organizationId', organizationRolesFormData.organizationId);
    organizationRolesUseForm.setValue('roles', organizationRolesFormData.roles);
  }

  const doAddManagedOrganizationRoles = (mor: APSOrganizationRolesResponse) => {
    setManagedOrganizationRoles(emptyManagedOrganizationRoles);
    setIsManagedOrganizationRolesListChanged(true);
    const _morl = [...selectedOrganizationRolesList];
    _morl.push(mor);
    setSelectedOrganizationRolesList(_morl);
    setIsManagedOrganizationRolesListChanged(true);
  }
  const doRemoveManagedOrganizationRoles = (mor: APSOrganizationRolesResponse) => {
    const idx = selectedOrganizationRolesList.findIndex((organizationRoles: APSOrganizationRolesResponse) => {
      return mor.organizationId === organizationRoles.organizationId;
    });
    const _morl = [...selectedOrganizationRolesList];
    _morl.splice(idx, 1);
    setSelectedOrganizationRolesList(_morl);
    setIsManagedOrganizationRolesListChanged(true);
  }
  const doUpdateManagedOrganizationRoles = (mor: APSOrganizationRolesResponse) => {
    const idx = selectedOrganizationRolesList.findIndex((organizationRoles: APSOrganizationRolesResponse) => {
      return mor.organizationId === organizationRoles.organizationId;
    });
    const _morl = [...selectedOrganizationRolesList];
    _morl[idx] = mor;
    setSelectedOrganizationRolesList(_morl);
    setIsManagedOrganizationRolesListChanged(true);
  }
  const onSubmitOrganizationRolesForm = (organizationRolesFormData: TOrganizationRolesFormData) => {
    // alert(`organizationRolesFormData = ${JSON.stringify(organizationRolesFormData, null, 2)}`);
    const found = props.availableOrganizationList.find((x) => {
      return x.name === organizationRolesFormData.organizationId;
    });
    const fd: TOrganizationRolesFormData = {
      ...organizationRolesFormData,
      organizationDisplayName: found ? found.displayName : organizationRolesFormData.organizationId
    }
    // alert(`fd = ${JSON.stringify(fd, null, 2)}`);
    doAddManagedOrganizationRoles(transformFormDataToManagedOrganizationRoles(fd));
  }
  const onInvalidSubmitOrganizationRolesForm = () => {
    // placeholder
  }

  const onSelectedRolesChanged = (authRoleList: APSOrganizationAuthRoleList) => {
    if(props.organizationId !== undefined && props.organizationDisplayName !== undefined) {
      doUpdateManagedOrganizationRoles({
        organizationId: props.organizationId,
        organizationDisplayName: props.organizationDisplayName,
        roles: authRoleList
      });
    }
  }

  const displayManagedOrganizationRolesFormFieldErrorMessage = (fieldError: FieldError | undefined) => {
    return fieldError && <small className="p-error">{fieldError.message}</small>    
  }
  const displayManagedOrganizationRolesFormFieldErrorMessage4Array = (fieldErrorList: Array<FieldError | undefined> | undefined) => {
    let _fieldError: any = fieldErrorList;
    return _fieldError && <small className="p-error">{_fieldError.message}</small>;
  }

  const renderOrganizationRolesListTable = (): JSX.Element => {

    const organizationBodyTemplate = (row: APSOrganizationRolesResponse) => {
      return row.organizationDisplayName;
    }
    const rolesBodyTemplate = (row: APSOrganizationRolesResponse) => {
      if(row.roles.length > 0) {
        return ConfigHelper.getAuthorizedOrgRolesDisplayNameList(configContext, row.roles).join(', ');
      } else {
        return ('None');
      }
    }
    const actionBodyTemplate = (row: APSOrganizationRolesResponse) => {
      return (
          <React.Fragment>
            <Button 
              key={componentName+'remove'+row.organizationId} 
              type='button'
              icon="pi pi-times" 
              className="p-button-rounded p-button-outlined p-button-secondary p-mr-2" 
              onClick={() => doRemoveManagedOrganizationRoles(row)} 
            />
          </React.Fragment>
      );
    }  

    return (
      <React.Fragment>
        <DataTable
          ref={organizationRolesListDataTableRef}
          className="p-datatable-sm"
          showGridlines={false}
          value={selectedOrganizationRolesList}
          emptyMessage='No organizations defined.'
          scrollable 
          dataKey="organizationId"  
          sortMode='single'
          sortField="organizationDisplayName"
          sortOrder={1}
        >
          {/* <Column header="Id" field="organizationId" /> */}
          <Column header="Organization" headerStyle={{ width: "30em", textAlign: 'left' }} body={organizationBodyTemplate} bodyStyle={{ textAlign: 'left'}} sortField="organizationDisplayName" sortable />
          <Column header="Roles" body={rolesBodyTemplate}  bodyStyle={{ overflowWrap: 'break-word', wordWrap: 'break-word', textAlign: 'left' }} />
          <Column body={actionBodyTemplate} bodyStyle={{ width: '3em', textAlign: 'end' }} />
        </DataTable>
      </React.Fragment>        
    );
  }

  const renderRolesField = () => {
    const width = props.organizationId === undefined ? '75%' : '100%';
    return (
      <div className="p-field" style={{ width: width }} >
        <span className="p-float-label">
          <Controller
            name="roles"
            control={organizationRolesUseForm.control}
            rules={{
              required: "Choose at least 1 Role."
            }}
            render={( { field, fieldState }) => {
                return(
                  <MultiSelect
                    display="chip"
                    value={field.value ? [...field.value] : []} 
                    options={organizationRolesSelectItemList} 
                    onChange={(e) => { field.onChange(e.value); onSelectedRolesChanged(e.value); }}
                    optionLabel="label"
                    optionValue="value"
                    className={classNames({ 'p-invalid': fieldState.invalid })}                       
                  />
            )}}
          />
          <label htmlFor="roles" className={classNames({ 'p-error': organizationRolesUseForm.formState.errors.roles })}>Role(s)*</label>
        </span>
        { displayManagedOrganizationRolesFormFieldErrorMessage4Array(organizationRolesUseForm.formState.errors.roles) }
      </div>
    );
  }

  const renderAllOrgsForm = () => {
    return (
      <div className="card">
        <div className="p-fluid">
          <form id={props.formId} onSubmit={organizationRolesUseForm.handleSubmit(onSubmitOrganizationRolesForm, onInvalidSubmitOrganizationRolesForm)} className="p-fluid">           
            <div className="p-formgroup-inline">
              {/* OrganizationId */}
              <div className="p-field" style={{ width: '20%' }} >
                <span className="p-float-label p-input-icon-right">
                  <i className="pi pi-key" />
                  <Controller
                    name="organizationId"
                    control={organizationRolesUseForm.control}
                    rules={{
                      required: "Select an Organization.",
                    }}
                    render={( { field, fieldState }) => {
                      return(
                        <Dropdown
                          id={field.name}
                          {...field}
                          options={createOrganizationSelectItems()}
                          onChange={(e) => field.onChange(e.value) }
                          className={classNames({ 'p-invalid': fieldState.invalid })}   
                          optionLabel="displayName"
                          optionValue="id"  
                          // disabled={isDisabled}                                   
                        />                        
                    )}}
                  />
                  <label htmlFor="organizationId" className={classNames({ 'p-error': organizationRolesUseForm.formState.errors.organizationId })}>Organization*</label>
                </span>
                {displayManagedOrganizationRolesFormFieldErrorMessage(organizationRolesUseForm.formState.errors.organizationId)}
              </div>
              {/* Roles */}
              { renderRolesField() }
              <div>          
                <Button key={componentName+'submit'} form={props.formId} type="submit" icon="pi pi-plus" className="p-button-text p-button-plain p-button-outlined" />
              </div>  
            </div>
            {renderOrganizationRolesListTable()}
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

  const renderOneOrgForm = (orgId: CommonName) => {
    return (
      <div className="card">
        <div className="p-fluid">
          {/* <form id={props.formId} onSubmit={organizationRolesUseForm.handleSubmit(onSubmitOrganizationRolesForm, onInvalidSubmitOrganizationRolesForm)} className="p-fluid">            */}
            { renderRolesField() }
            {/* DEBUG */}
            {/* <p>selectedOrganizationRolesList:</p>
            <pre style={ { fontSize: '10px' }} >
              {JSON.stringify(selectedOrganizationRolesList, null, 2)}
            </pre> */}
          {/* </form>   */}
        </div>
      </div>
    );
  }

  const renderForm = () => {
    if(props.organizationId === undefined) return renderAllOrgsForm();
    else return renderOneOrgForm(props.organizationId);
  }

  return renderForm();
}
