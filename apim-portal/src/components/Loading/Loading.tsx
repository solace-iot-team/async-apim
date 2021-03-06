
import React from "react";
import { Dialog } from 'primereact/dialog';
import { ProgressBar } from 'primereact/progressbar';
import "../APComponents.css";
import "./Loading.css";

export interface ILoadingProps {
  show: boolean;
  header?: JSX.Element;
}

export const Loading: React.FC<ILoadingProps> = (props: ILoadingProps) => {
  const header: JSX.Element = props.header ? props.header : (<div/>);
  return (
    <React.Fragment>
      {props.show &&
        <div className="card">
          <Dialog 
            style={{ width: '600px' }} 
            visible={true}
            header={header}
            footer={<div/>}
            showHeader={true} 
            modal={true} 
            closable={false}
            onHide={()=> {}}
            >
              {/* <i className="pi pi-spin pi-spinner" style={{'fontSize': '10em'}}></i> */}
              <ProgressBar mode='indeterminate' />
          </Dialog>        
        </div>
      }
    </React.Fragment>
  );
}
