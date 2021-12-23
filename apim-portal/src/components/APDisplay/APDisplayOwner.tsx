
import React from "react";

import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { Divider } from "primereact/divider";

import { 
  APSUser 
} from "../../_generated/@solace-iot-team/apim-server-openapi-browser";
import { Globals } from "../../utils/Globals";

import "../APComponents.css";

export interface IAPDisplayOwnerProps {
  label: string;
  ownerId: string;
  ownerType: 'apsUser' | 'apsTeam';
  apsUser?: APSUser;
  className?: string;
  buttonStyle?: React.CSSProperties;
}

export const APDisplayOwner: React.FC<IAPDisplayOwnerProps> = (props: IAPDisplayOwnerProps) => {
  const componentName='APDisplayOwner';

  const defaultButtonStyle: React.CSSProperties = {
    whiteSpace: 'nowrap', 
    padding: 'unset', 
    width: 'unset' 
  }

  const [showOwnerDetails, setShowOwnerDetails] = React.useState<boolean>(false);

  // const doInitialize = async () => {
  //   // placeholder
  //   // fetch additional owner data from external system as configured in portal server
  // }

  const doValidateProps = () => {
    const funcName = 'doValidateProps';
    const logName = `${componentName}.${funcName}()`;
    switch (props.ownerType) {
      case 'apsUser':
        if(!props.apsUser) throw new Error(`${logName}: props.apsUser is undefined for props.ownerType=${props.ownerType}`);
        break;
      case 'apsTeam':
        throw new Error(`${logName}: props.ownerType=${props.ownerType} not supported`);
        // break;
      default: Globals.assertNever(logName, props.ownerType);
    }
  }

  React.useEffect(() => {
    doValidateProps();
  }, []); /* eslint-disable-line react-hooks/exhaustive-deps */

  const getOwnerDisplayStr = (): string => {
    const funcName = 'getOwnerDisplayStr';
    const logName = `${componentName}.${funcName}()`;
    switch (props.ownerType) {
      case 'apsUser': {
        if(!props.apsUser) throw new Error(`${logName}: props.apsUser is undefined`);
        return props.apsUser.userId;
      } 
      case 'apsTeam': {
        throw new Error(`${logName}: props.ownerType=${props.ownerType} not supported`);
      } 
      default: Globals.assertNever(logName, props.ownerType);
    }
    return '';
  }

  const renderApsUserDetails = (apsUser: APSUser): JSX.Element => {
    return(
      <Dialog 
        header={`User Id: ${getOwnerDisplayStr()}`} 
        visible={true} 
        position='top-right' 
        modal={false}
        style={{ width: '50vw' }} 
        onHide={()=> {setShowOwnerDetails(false)}}
        draggable={true} 
        resizable={true}
      >
        <div className="p-m-0">
          <div><b>First</b>: {apsUser.profile.first}</div>
          <div><b>Last</b>: {apsUser.profile.last}</div>
          <div><b>E-Mail</b>: {apsUser.profile.email}</div>
          <Divider />
          <div>Fetch additional user info from external system ...</div>
          {/* DEBUG */}
          {/* <pre style={ { fontSize: '8px' }} > {JSON.stringify(apsUser, null, 2)};</pre> */}
        </div>
      </Dialog>
    );
  }

  const renderOwnerDetails = (): JSX.Element => {
    const funcName = 'renderOwnerDetails';
    const logName = `${componentName}.${funcName}()`;
    switch (props.ownerType) {
      case 'apsUser': {
        if(!props.apsUser) throw new Error(`${logName}: props.apsUser is undefined`);
        return renderApsUserDetails(props.apsUser);
      } 
      case 'apsTeam': {
        throw new Error(`${logName}: props.ownerType=${props.ownerType} not supported`);
      } 
      default: Globals.assertNever(logName, props.ownerType);
    }
    return (<></>);
  }

  const renderComponent = (): JSX.Element => {
    const onClick = (event: any): void => {
      setShowOwnerDetails(true);
    }
    
    let buttonStyle: React.CSSProperties;
    if(props.buttonStyle) buttonStyle = props.buttonStyle;
    else buttonStyle = defaultButtonStyle;
    return (
      <Button
        label={getOwnerDisplayStr()}
        key={`${componentName+props.ownerId}`}
        data-id={props.ownerId}
        className="p-button-text p-button-plain" 
        style={buttonStyle}          
        onClick={onClick}
      />
    );
  }

  return (
    <React.Fragment>
      <div className={props.className ? props.className : 'card'}>
        <b>{props.label}</b>:&nbsp;
        {renderComponent()}
      </div>
      {showOwnerDetails && renderOwnerDetails()}
    </React.Fragment>
  );
}
