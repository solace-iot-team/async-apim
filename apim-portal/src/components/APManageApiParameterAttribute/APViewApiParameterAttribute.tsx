
import React from "react";

import { Toolbar } from "primereact/toolbar";
import { Button } from "primereact/button";

import { 
  TAPManageApiParameterAttributeOptions, 
  TAPManagedApiParameterAttribute, 
  ToolbarInlineStyle 
} from "./APManageApiParameterAttribute";

import "../APComponents.css";
import "./APManageApiParameterAttribute.css";

export interface IAPViewApiParameterAttributeProps {
  apManagedApiParameterAttribute: TAPManagedApiParameterAttribute;
  options: TAPManageApiParameterAttributeOptions;
  onNew: () => void;
  onEdit: () => void; 
  onDelete: () => void;
}

export const APViewApiParameterAttribute: React.FC<IAPViewApiParameterAttributeProps> = (props: IAPViewApiParameterAttributeProps) => {
  const componentName = 'APViewApiParameterAttribute';

  const ToolbarEditButtonLabelGeneral = 'Edit Attribute';
  const ToolbarNewButtonLabelGeneral = 'Create Attribute';
  const ToolbarDeleteButtonLabelGeneral = 'Remove Attribute';

  const ToolbarEditButtonLabelApiProductValue = 'Edit';
  const ToolbarNewButtonLabelApiProductValue = 'Create';
  const ToolbarDeleteButtonLabelApiProductValue = 'Remove';

  const [toolbarEditButtonLabel, setToolbarEditButtonLabel] = React.useState<string>(ToolbarEditButtonLabelGeneral);
  const [toolbarNewButtonLabel, setToolbarNewButtonLabel] = React.useState<string>(ToolbarNewButtonLabelGeneral);
  const [toolbarDeleteButtonLabel, setToolbarDeleteButtonLabel] = React.useState<string>(ToolbarDeleteButtonLabelGeneral);

  React.useEffect(() => {
    if(props.options.mode === 'apiProductValues') {
      setToolbarEditButtonLabel(ToolbarEditButtonLabelApiProductValue);
      setToolbarNewButtonLabel(ToolbarNewButtonLabelApiProductValue);
      setToolbarDeleteButtonLabel(ToolbarDeleteButtonLabelApiProductValue);
    }
  }, []); /* eslint-disable-line react-hooks/exhaustive-deps */


  // * Toolbar *
  const renderToolbar = (): JSX.Element => {
    const renderLeftToolbarContent = (): JSX.Element => {
      const isExisting: boolean = props.apManagedApiParameterAttribute.apiAttribute ? true : false;
      return (
        <React.Fragment>
          {isExisting && 
            <React.Fragment>
              <Button 
                type="button"
                label={toolbarEditButtonLabel} 
                icon="pi pi-pencil" 
                onClick={props.onEdit} 
                className="p-button-text p-button-plain" 
              />      
              <Button 
                type="button"
                label={toolbarDeleteButtonLabel} 
                icon="pi pi-times" 
                onClick={props.onDelete} 
                className="p-button-text p-button-plain" 
              />      
            </React.Fragment>              
          }
          {!isExisting && 
            <Button 
              type="button"
              label={toolbarNewButtonLabel} 
              icon="pi pi-plus" 
              onClick={props.onNew} 
              className="p-button-text p-button-plain" 
            />      
          }
        </React.Fragment>
      );
    } 
  return (
      <Toolbar 
        className="p-mb-4" 
        style={ ToolbarInlineStyle }
        // style={ { 'background': 'none', 'border': 'none', 'paddingTop': '0rem', 'paddingBottom': '0rem', 'marginBottom': '0rem !important' } } 
        left={renderLeftToolbarContent()} 
      />      
    )
  }

  const renderView = () => {
    // const funcName = 'renderView';
    // const logName = `${componentName}.${funcName}()`;
    const viewList: Array<JSX.Element> = [];
    const apiParameter = props.apManagedApiParameterAttribute.apiParameter;
    if(props.options.mode === 'general') {
      if(props.apManagedApiParameterAttribute.apiAttribute) {
        const apiAttribute = props.apManagedApiParameterAttribute.apiAttribute;
        viewList.push(
          <>
            <p>Attribute:</p>
            <p>- Name: {apiAttribute.name}</p>
            <p>- Value(s): {apiAttribute.value}</p>
          </>
        );
      } else {
        viewList.push(
          <>
            <p>Attribute: not defined</p>
          </>
        );
      }
    } else if(props.options.mode === 'apiProductValues') {
      if(props.apManagedApiParameterAttribute.apiAttribute) {
        const apiAttribute = props.apManagedApiParameterAttribute.apiAttribute;
        viewList.push(
          <>
            <p>{apiAttribute.value}</p>
          </>
        );
      } else {
        viewList.push(
          <>
            <p>No value(s) defined.</p>
          </>
        );
      }
    }
    if(props.options.mode === 'general') {
      viewList.push(
        <>
          <p>API Parameter:</p>
          <p>- Name: {apiParameter.name}</p>
          <p>- Type: {apiParameter.type}</p>
        </>
      );
      if(apiParameter.enum) {
        viewList.push(
          <>
            <p>- Value(s): {apiParameter.enum.join(',')}</p>
          </>
        );  
      } else {
        viewList.push(
          <>
            <p>- Value(s): not defined.</p>
          </>
        );  
      }
    } 

    return (
      <div className="card">
        {viewList}
      </div>
    )
  }

  return (
    <div className="manage-attribute">
      { renderToolbar() }
      { renderView() }
    </div>

  );
}
