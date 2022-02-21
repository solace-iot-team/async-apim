
import React from "react";

import { Tree } from 'primereact/tree';

import APBusinessGroupsService, { 
  TAPBusinessGroupDisplayList, 
  TAPBusinessGroupTreeNodeDisplayList 
} from "../../services/APBusinessGroupsService";

import "../APComponents.css";

export interface IAPDisplayApBusinessGroupDisplayListProps {
  apBusinessGroupDisplayList: TAPBusinessGroupDisplayList;
  emptyMessage: string;
  className?: string;
}

export const APDisplayApBusinessGroupDisplayList: React.FC<IAPDisplayApBusinessGroupDisplayListProps> = (props: IAPDisplayApBusinessGroupDisplayListProps) => {
  // const componentName='APDisplayApBusinessGroupDisplayList';

  const renderComponent = (apBusinessGroupDisplayList: TAPBusinessGroupDisplayList): JSX.Element => {

    const treeTableNodeList: TAPBusinessGroupTreeNodeDisplayList = APBusinessGroupsService.generate_ApBusinessGroupTreeNodeDisplayList_From_ApBusinessGroupDisplayList(apBusinessGroupDisplayList);

    return (
      <React.Fragment>
        <Tree 
          style={{ border: 'none' }}
          value={treeTableNodeList}
        />
        {/* DEBUG */}
        {/* <pre style={ { fontSize: '10px' }} >
          {JSON.stringify(treeTableNodeList, null, 2)}
        </pre> */}
      </React.Fragment>
    );
  }

  return (
    <div className={props.className ? props.className : 'card'}>
    {props.apBusinessGroupDisplayList.length > 0 &&
      renderComponent(props.apBusinessGroupDisplayList)
    }
    {(props.apBusinessGroupDisplayList.length === 0) && 
      <span>{props.emptyMessage}</span>
    }
  </div>

  );
}
