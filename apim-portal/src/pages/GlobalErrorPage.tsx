import React from 'react';

import { Button } from 'primereact/button';
import { Toolbar } from 'primereact/toolbar';
import { Globals } from '../utils/Globals';


export interface IGlobalErrorPageProps {
  errorStr: string;
  errorInfo: React.ErrorInfo | undefined;
}

export const GlobalErrorPage: React.FC<IGlobalErrorPageProps> = (props: IGlobalErrorPageProps) => {
  // const componentName = 'GlobalErrorPage';

  const Title="Something went wrong!";
  const ToolbarBack2AppButtonLabel = "Get me out of here!";
  const Toolbar2IssuesButtonLabel = "Report the Error";


  const onBack2App = () => {
    Globals.reloadApp();
  }

  const onReportIssue = () => {
    Globals.openUrlInNewTab(Globals.IssuesUrl);
  }

  const renderRightToolbarContent = (): JSX.Element => {
    return (
      <React.Fragment>
        <Button label={ToolbarBack2AppButtonLabel} icon="pi pi-directions-alt" onClick={onBack2App} className="p-button-text p-button-plain p-button-outlined"/>
        <Button label={Toolbar2IssuesButtonLabel} icon="pi pi-file" onClick={onReportIssue} className="p-button-text p-button-plain p-button-outlined"/>        
      </React.Fragment>
    );
  }

  const renderLeftToolbarContent = (): JSX.Element => {
    return (
      <React.Fragment>
        <h1 className='p-p-2' style={{fontSize: 'xx-large', color: 'red'}}>{Title}</h1>
      </React.Fragment>
    );
  }

  const renderToolbar = (): JSX.Element => {
    return (<Toolbar className="p-mb-4" left={renderLeftToolbarContent()} right={renderRightToolbarContent()} />);
  }

  const renderContent = () => {
    return (
      <div className='p-p-4 card' style={{ color: 'red'}}>
        {renderToolbar()}
        <div className='card p-p-2' >
          <pre>
            error: {props.errorStr}
          </pre>
          <pre>
            componentStack = {props.errorInfo ? props.errorInfo.componentStack : 'undefined'}
          </pre>
        </div>
      </div>
    );
  }

  return (
    <React.Fragment>
      {renderContent()}
    </React.Fragment>
  );
}
