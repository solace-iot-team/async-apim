
import React from "react";

import { Toolbar } from "primereact/toolbar";
import { PickList, PickListChangeParams } from 'primereact/picklist';
import { Button } from "primereact/button";

import { APIParameter } from "@solace-iot-team/apim-connector-openapi-browser";
import { TApiCallState } from "../../utils/ApiCallState";
import { TAPApiParameter } from "./APApiParametersCommon";

import "../APComponents.css";
import { Dialog } from "primereact/dialog";

export interface IAPEditApiParameterProps {
  apiParameter: APIParameter;
  onSave: (apApiParameter: TAPApiParameter) => void;
  onError: (apiCallState: TApiCallState) => void;
  onCancel: () => void;
}

export const APEditApiParameter: React.FC<IAPEditApiParameterProps> = (props: IAPEditApiParameterProps) => {
  const componentName = 'APEditApiParameter';

  type TManagedObject = TAPApiParameter;


  const ToolbarCancelManagedObjectButtonLabel = 'Cancel';
  const ToolbarSaveManagedObjectButtonLabel = 'Save';
  const [managedObject, setManagedObject] = React.useState<TManagedObject>();
  const [showPickList, setShowPickList] = React.useState<boolean>(false);
  const [pickSourceList, setPickSourceList] = React.useState<Array<string> | undefined>();
  const [pickTargetList, setPickTargetList] = React.useState<Array<string> | undefined>();

  const [showPatternEditor, setShowPatternEditor] = React.useState<boolean>(false);
  const [apiParameterPattern, setApiParameterPattern] = React.useState<string>();

  const [isSaved, setIsSaved] = React.useState<boolean>(false);

  const doInitialize = () => {
    const funcName = 'doInitialize';
    const logName = `${componentName}.${funcName}()`;
    setManagedObject({
      apiParameter: props.apiParameter      
    });
    if(props.apiParameter.enum) {
      // HERE: enabled
      setShowPickList(true);
      setPickSourceList(props.apiParameter.enum);
      setPickTargetList([]);
      // HERE: disabled
      setShowPatternEditor(true);
    } else {
      setShowPatternEditor(true);
    }
  }

  React.useEffect(() => {
    doInitialize();
  }, []); /* eslint-disable-line react-hooks/exhaustive-deps */

  // * Actions * 
  const isEditValid = (): boolean => {
    if(showPickList) return isPickListValid();
    if(showPatternEditor) return isPatternValid();
    return false;    
  }

  const onSave = () => {
    const funcName = 'onSave';
    const logName = `${componentName}.${funcName}()`;
    if(!managedObject) throw new Error(`${logName}: managedObject is undefined`);
    // alert(`${logName}: pickTargetList=${JSON.stringify(pickTargetList)}`);
    setIsSaved(true);
    if(!isEditValid()) return;
    if(showPickList) {
      props.onSave({
        apiParameter: {
          ...managedObject.apiParameter,
          enum: pickTargetList
        }
      });  
    } else if(showPatternEditor) {
      props.onSave({
        apiParameter: managedObject.apiParameter,
        pattern: apiParameterPattern
      })
    } else throw new Error(`${logName}: unhandled case`);
  }

  const onCancel = () => {
    props.onCancel();
  }

  // * PickList *
  const itemTemplate = (item: string) => {
    return (
      <p>{item}</p>
    );
  }

  const onChangeEnumPicklist = (event: PickListChangeParams) => {
    setPickSourceList(event.source);
    setPickTargetList(event.target);
  }
  
  const displayPickListErrorMessage = () => {
    if(isSaved && !isPickListValid()) return <p className="p-error ap-error">Select at least 1 value.</p>;
  }
  const isPickListValid = (): boolean => {
    if(!pickTargetList) return true;
    if(pickTargetList.length === 0) return false;
    return true;
  }
  const renderPickList = () => {
    return (
      <div>
        <div className="ap-manage-api-parameter ap-edit-dialog-content ap-message">
          Select values to expose in the API Product.
        </div>
        {displayPickListErrorMessage()}
        <div className="ap-picklist">
          <PickList 
            source={pickSourceList} 
            target={pickTargetList} 
            itemTemplate={itemTemplate}
            sourceHeader="Available" targetHeader="Selected"
            sourceStyle={{ height: '342px' }} targetStyle={{ height: '342px' }}
            onChange={onChangeEnumPicklist}>
          </PickList>
        </div>
      </div>
    );  
  }

  // * Pattern Editor *
  const isPatternValid = (): boolean => {
    const funcName = 'isPatternValid';
    const logName = `${componentName}.${funcName}()`;
    throw new Error(`${logName}: implement me`);
    return false;
  }
  const renderPatternEditor = () => {
    return (
      <div>
        <div className="ap-manage-api-parameter ap-edit-dialog-content ap-message">
          Create a pattern:
        </div>
        <p>TODO: pattern editor for ${JSON.stringify(props.apiParameter)}</p>
      </div>
    );
  }

  // * Toolbar *
  const renderRightToolbarContent = (): JSX.Element => {
    const funcName = 'renderRightToolbarContent';
    const logName = `${componentName}.${funcName}()`;
    return (
      <React.Fragment>
        <Button 
          type="button"
          label={ToolbarCancelManagedObjectButtonLabel} 
          onClick={onCancel} 
          className="p-button-text p-button-plain" 
        />
        <Button 
          type="button"
          label={ToolbarSaveManagedObjectButtonLabel} 
          icon="pi pi-save" 
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
        // style={ { 'background': 'none', 'border': 'none', 'paddingTop': '0rem', 'paddingBottom': '0rem', 'marginBottom': '0rem !important' } } 
        style={ { 'background': 'none', 'border': 'none' } } 
        right={renderRightToolbarContent()} 
      />      
    )
  }
  
  const renderComponent = () => {
    const funcName = 'renderComponent';
    const logName = `${componentName}.${funcName}()`;

// HERE: if show both:
// rework render:
// -options?
// -picklist
// -pattern


    // if(showOptions) return renderOptions();

    if(showPickList) return renderPickList();
    if(showPatternEditor) return renderPatternEditor();
    throw new Error(`${logName}: unsupported apiParameter=${JSON.stringify(props.apiParameter)}`);
  }

  return (  
    <div className='ap-manage-api-parameter'>
      <Dialog
        className="p-fluid"
        header={`API Parameter: ${managedObject?.apiParameter.name}`}
        visible={true} 
        style={{ width: '80%', height: '50rem' }} 
        modal
        closable={false}
        onHide={()=> {}}
      >
        <div className="ap-manage-api-parameter ap-edit-dialog-content">
        {managedObject && renderComponent()}
        {renderToolbar()}    
        </div>
      </Dialog>

      {/* DEBUG */}
      <p>managedObject:</p>
      <pre style={ { fontSize: '10px' }} >
        {JSON.stringify(managedObject, null, 2)}
      </pre>
    </div>
  );
}


