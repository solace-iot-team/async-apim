
import React from "react";

import { Dialog } from "primereact/dialog";
import { Toolbar } from "primereact/toolbar";
import { PickList, PickListChangeParams } from 'primereact/picklist';
import { Button } from "primereact/button";
import { SelectButton } from 'primereact/selectbutton';
import { InputTextarea } from "primereact/inputtextarea";

import { Globals } from "../../utils/Globals";
import { TAPManagedApiParameterAttribute, ToolbarInlineStyle } from "./APManageApiParameterAttribute";

import "../APComponents.css";
import "./APManageApiParameterAttribute.css";

export interface IAPEditNewApiParameterAttributeProps {
  apManagedApiParameterAttribute: TAPManagedApiParameterAttribute,
  onSave: (apManagedApiParameterAttribute: TAPManagedApiParameterAttribute) => void;
  onCancel: () => void;
}

export const APEditNewApiParameterAttribute: React.FC<IAPEditNewApiParameterAttributeProps> = (props: IAPEditNewApiParameterAttributeProps) => {
  const componentName = 'APEditNewApiParameterAttribute';

  const ToolbarCreateButtonLabel = 'Create';
  const ToolbarSaveButtonLabel = 'Save';
  const ToolbarCancelButtonLabel = 'Cancel';

  // matches Id in css
  const disabledComponentId = 'disabledComponent';
  enum EInputType {
    PICKLIST = 'Use Picklist',
    CUSTOM_VALUE = 'Use Custom Value'
  }
  enum EAction {
    EDIT = 'EDIT',
    NEW = 'NEW'
  }
  
  const [apManagedApiParameterAttribute, setApManagedApiParameterAttribute] = React.useState<TAPManagedApiParameterAttribute>(JSON.parse(JSON.stringify(props.apManagedApiParameterAttribute)));
  const [action, setAction] = React.useState<EAction>();

  const [showSelectInputType, setShowSelectInputType] = React.useState<boolean>(false);
  const [selectedInputType, setSelectedInputType] = React.useState<EInputType>(EInputType.PICKLIST);
  const selectInputTypeOptions =  Object.values(EInputType)

  const [showAttributePickList, setShowAttributePickList] = React.useState<boolean>(false);
  const [pickAttributeSourceList, setPickAttributeSourceList] = React.useState<Array<string> | undefined>();
  const [pickAttributeTargetList, setPickAttributeTargetList] = React.useState<Array<string> | undefined>();

  const [showAttributeValueEditor, setShowAttributeValueEditor] = React.useState<boolean>(false);
  const [attributeValue, setAttributeValue] = React.useState<string>();

  const [isInitialized, setIsInitialized] = React.useState<boolean>(false);
  const [isSaved, setIsSaved] = React.useState<boolean>(false);

  const doInitialize = () => {
    const funcName = 'doInitialize';
    const logName = `${componentName}.${funcName}()`;
    apManagedApiParameterAttribute.apiAttribute ? setAction(EAction.EDIT) : setAction(EAction.NEW);
    if(apManagedApiParameterAttribute.apiParameter.enum) {
      setShowSelectInputType(true);
      setShowAttributePickList(true);
      setPickAttributeSourceList(apManagedApiParameterAttribute.apiParameter.enum);
      setPickAttributeTargetList([]);
      setSelectedInputType(EInputType.PICKLIST);
    } else {
      setSelectedInputType(EInputType.CUSTOM_VALUE);
    }
    if(!apManagedApiParameterAttribute.apiAttribute) {
      apManagedApiParameterAttribute.apiAttribute = {
        name: apManagedApiParameterAttribute.apiParameter.name,
        value: apManagedApiParameterAttribute.apiParameter.enum ? '' : '*'
      }
    }
    if(apManagedApiParameterAttribute.apiAttribute) {
      setShowAttributeValueEditor(true);
      setAttributeValue(apManagedApiParameterAttribute.apiAttribute.value);
      if(apManagedApiParameterAttribute.apiAttribute.value.length > 0) setSelectedInputType(EInputType.CUSTOM_VALUE);
    }
    setIsInitialized(true);
  }

  React.useEffect(() => {
    doInitialize();
  }, []); /* eslint-disable-line react-hooks/exhaustive-deps */

  // * Actions * 
  const isInputValid = (): boolean => {
    const funcName = 'isInputValid';
    const logName = `${componentName}.${funcName}()`;
    switch(selectedInputType) {
      case EInputType.PICKLIST: 
        return isAttributePickListValid();
      case EInputType.CUSTOM_VALUE: 
        return isAttributeValueValid();
      default: 
        return Globals.assertNever(logName, selectedInputType);
    }   
  }

  const onSave = () => {
    const funcName = 'onSave';
    const logName = `${componentName}.${funcName}()`;
    if(!apManagedApiParameterAttribute.apiAttribute) throw new Error(`${logName}: apManagedApiParameterAttribute.apiAttribute is undefined`);

    const getAttributeValue = (): string => {
      switch(selectedInputType) {
        case EInputType.PICKLIST: 
          if(!pickAttributeTargetList) throw new Error(`${logName}: pickAttributeTargetList is undefined`);
          return pickAttributeTargetList.join(',');
        case EInputType.CUSTOM_VALUE: 
          if(!attributeValue) throw new Error(`${logName}: attributeValue is undefined`);
          return attributeValue;
        default: 
          return Globals.assertNever(logName, selectedInputType);
      }   
    }
    
    setIsSaved(true);
    if(!isInputValid()) return;
    props.onSave({
      ...apManagedApiParameterAttribute,
      apiAttribute: {
        ...apManagedApiParameterAttribute.apiAttribute,
        value: getAttributeValue()
      }
    });
  }

  const onCancel = () => {
    props.onCancel();
  }

  const renderApiParameterInfo = (): JSX.Element => {
    return (
      <div className='ap-api-parameter-info'>
        <p><b>API Parameter: {apManagedApiParameterAttribute.apiParameter.name}</b></p>
        <p>- Type: {apManagedApiParameterAttribute.apiParameter.type}</p>
        {apManagedApiParameterAttribute.apiParameter.enum && 
          <p>- Value(s): {apManagedApiParameterAttribute.apiParameter.enum.join(',')}</p>
        }
        {!apManagedApiParameterAttribute.apiParameter.enum && 
          <p>- Value(s): no API values defined.</p>
        }
      </div>
    );
  }
  // * Select Input *
  const renderSelectInput = (): JSX.Element => {
    return (
      <div className="manage-attribute ap-edit-dialog-content ap-select-input" style={{ width: '25rem' }}>
        <SelectButton 
          value={selectedInputType} 
          options={selectInputTypeOptions} 
          onChange={(e) => { setSelectedInputType(e.value); setIsSaved(false); } } 
        />
      </div>
    );
  }
  // * PickList *
  const itemTemplate = (item: string) => {
    return (
      <div className='ap-picklist-item'>{item}</div>
    );
  }

  const onChangeEnumPicklist = (event: PickListChangeParams) => {
    setPickAttributeSourceList(event.source);
    setPickAttributeTargetList(event.target);
  }
  
  const displayPickListErrorMessage = () => {
    if(selectedInputType !== EInputType.PICKLIST) return;
    if(isSaved && !isAttributePickListValid()) return <p className="p-error ap-error">Select at least 1 value.</p>;
  }
  const isAttributePickListValid = (): boolean => {
    if(!pickAttributeTargetList) return false;
    if(pickAttributeTargetList.length === 0) return false;
    return true;
  }
  const renderAttributePickList = (): JSX.Element => {
    let id = '';
    if(selectedInputType !== EInputType.PICKLIST) id=disabledComponentId;
    return (
      <div id={id}>
        <div className="manage-attribute ap-edit-dialog-content ap-label">
          Select values. (CMD/CTRL for selecting multiple)
        </div>
        {displayPickListErrorMessage()}
        <div 
          className="ap-picklist" 
        >
          <PickList 
            source={pickAttributeSourceList} 
            target={pickAttributeTargetList} 
            itemTemplate={itemTemplate}
            sourceHeader='Available' 
            targetHeader='Selected'
            sourceStyle={{ height: '250px' }} 
            targetStyle={{ height: '250px' }}
            onChange={onChangeEnumPicklist}
            showSourceControls={false}
            showTargetControls={false}
            metaKeySelection={true}
          />
        </div>
      </div>
    );  
  }

  // * Value Editor *
  const displayAttributeValueErrorMessage = () => {
    if(selectedInputType !== EInputType.CUSTOM_VALUE) return;
    if(isSaved && !isAttributeValueValid()) return <p className="p-error ap-error">Enter a value/pattern or a comma separated list of values/patterns.</p>;
  }
  const isAttributeValueValid = (): boolean => {
    if(!attributeValue) return false;
    if(attributeValue.length === 0) return false;
    return true;
  }
  const renderAttributeValueEditor = () => {
    let id = '';
    let isDisabled = false;
    if(selectedInputType !== EInputType.CUSTOM_VALUE) {
      id=disabledComponentId;
      isDisabled=true;
    }

    return (
      <div>
        <div id={id} className="manage-attribute ap-edit-dialog-content ap-label">
          Custom Value(s)/Pattern(s). (comma separated list for multiple values/patterns)
        </div>
        {displayAttributeValueErrorMessage()}
        <InputTextarea
          // name='helloworld'
          // id='myveryspecialid'
          rows={1} 
          // cols={30} 
          // onFocus={(e) => alert('onFocus')}
          // onFocusCapture={(e) => alert('onFocusCaputre')}
          autoResize
          value={attributeValue} 
          onChange={(e) => setAttributeValue(e.target.value)}
          disabled={isDisabled}
          autoFocus={!isDisabled}
        />
      </div>
    );
  }
  // * Toolbar *
  const renderRightToolbarContent = (): JSX.Element => {
    const saveButtonLabel = (action === EAction.EDIT ? ToolbarSaveButtonLabel : ToolbarCreateButtonLabel);
    const saveIconString = (action === EAction.EDIT ? "pi pi-save" : "pi pi-plus");
    return (
      <React.Fragment>
        <Button 
          type="button"
          label={ToolbarCancelButtonLabel} 
          onClick={onCancel} 
          className="p-button-text p-button-plain" 
        />
        <Button 
          type="button"
          label={saveButtonLabel} 
          icon={saveIconString} 
          onClick={onSave} 
          className="p-button-text p-button-plain" 
        />      
      </React.Fragment>
    );
  } 
  
  const renderToolbar = (): JSX.Element => {
    return (
      <Toolbar 
        className="p-mb-4" 
        // style={ { 'background': 'none', 'border': 'none' } } 
        style={ ToolbarInlineStyle }
        right={renderRightToolbarContent()} 
      />      
    )
  }
  
  const renderComponent = (): Array<JSX.Element> => {
    const funcName = 'renderComponent';
    const logName = `${componentName}.${funcName}()`;
    const jsxList: Array<JSX.Element> = [];
    jsxList.push(renderApiParameterInfo());
    if(showSelectInputType) jsxList.push(renderSelectInput());
    if(showAttributePickList) jsxList.push(renderAttributePickList());
    if(showAttributeValueEditor) jsxList.push(renderAttributeValueEditor());
    return jsxList;
  }

  const createDialogHeader = (): string => {
    const funcName = 'createDialogHeader';
    const logName = `${componentName}.${funcName}()`;
    if(!action) throw new Error(`${logName}: action is undefined`);
    switch (action) {
      case EAction.EDIT:
        return `Edit Attribute for API Parameter`;
      case EAction.NEW:
        return `Create Attribute for API Parameter`;
      default:
        return Globals.assertNever(logName, action);
    }
  }
  
  return (  
    <div className='manage-attribute'>
      {isInitialized && 
        <Dialog
          className="p-fluid"
          header={createDialogHeader()}
          visible={true} 
          style={{ width: '80%', height: '50rem' }} 
          modal={true}
          blockScroll={true}
          closable={false}
          onHide={()=> {}}
        >
          <div className="manage-attribute ap-edit-dialog-content">
            {renderComponent()}
            {renderToolbar()}
          </div>
          {/* DEBUG */}
          {/* <p>managedAPAttribute:</p>
          <pre style={ { fontSize: '10px' }} >
            {JSON.stringify(managedAPAttribute, null, 2)}
          </pre> */}
        </Dialog>
      }
    </div>
  );
}


