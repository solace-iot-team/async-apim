
import React from "react";

import { Tree } from 'primereact/tree';

import APBusinessGroupsDisplayService, { 
  TAPBusinessGroupDisplayList, 
  TAPBusinessGroupTreeNodeDisplay, 
  TAPBusinessGroupTreeNodeDisplayList, 
  TAPTreeTableExpandedKeysType
} from "../../displayServices/APBusinessGroupsDisplayService";

import "../APComponents.css";

export interface IAPDisplayApBusinessGroupDisplayListProps {
  apBusinessGroupDisplayList: TAPBusinessGroupDisplayList;
  emptyMessage: string;
  className?: string;
}

export const APDisplayApBusinessGroupDisplayList: React.FC<IAPDisplayApBusinessGroupDisplayListProps> = (props: IAPDisplayApBusinessGroupDisplayListProps) => {
  // const componentName='APDisplayApBusinessGroupDisplayList';

  const [treeTableNodeList] = React.useState<TAPBusinessGroupTreeNodeDisplayList>(APBusinessGroupsDisplayService.generate_ApBusinessGroupTreeNodeDisplayList_From_ApBusinessGroupDisplayList(props.apBusinessGroupDisplayList));
  const [expandedKeys, setExpandedKeys] = React.useState<TAPTreeTableExpandedKeysType>({});

 
  const initializeExpandedKeys = () => {
    const expandNode = (node: TAPBusinessGroupTreeNodeDisplay, _expandedKeys: TAPTreeTableExpandedKeysType) => {
      if (node.children && node.children.length) {
        _expandedKeys[node.key] = true;  
        for (let child of node.children) {
            expandNode(child, _expandedKeys);
        }
      }
    }
    let _expandedKeys = {};
    for(let node of treeTableNodeList) {
      expandNode(node, _expandedKeys);
    }
    setExpandedKeys(_expandedKeys);
  }

  React.useEffect(() => {
    initializeExpandedKeys()
  }, []); /* eslint-disable-line react-hooks/exhaustive-deps */

  
  const renderComponent = (): JSX.Element => {
    return (
      <React.Fragment>
        <Tree 
          style={{ border: 'none' }}
          value={treeTableNodeList}
          expandedKeys={expandedKeys}
          onToggle={e => setExpandedKeys(e.value)}
        />
        {/* DEBUG */}
        {/* <p>treeTableNodeList=</p>
        <pre style={ { fontSize: '10px' }} >
          {JSON.stringify(treeTableNodeList, null, 2)}
        </pre>
        <p>apBusinessGroupDisplayList=</p>
        <pre style={ { fontSize: '10px' }} >
          {JSON.stringify(apBusinessGroupDisplayList, null, 2)}
        </pre> */}
      </React.Fragment>
    );
  }

  return (
    <div className={props.className ? props.className : 'card'}>
    {props.apBusinessGroupDisplayList.length > 0 &&
      renderComponent()
    }
    {(props.apBusinessGroupDisplayList.length === 0) && 
      <span>{props.emptyMessage}</span>
    }
  </div>

  );
}
