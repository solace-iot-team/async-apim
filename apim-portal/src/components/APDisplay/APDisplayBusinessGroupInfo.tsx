
import React from "react";
import { TAPManagedAssetBusinessGroupInfo } from "../../displayServices/APManagedAssetDisplayService";
import APEntityIdsService, { TAPEntityIdList } from "../../utils/APEntityIdsService";

import "../APComponents.css";

export interface IAPDisplayBusinessGroupInfoProps {
  apManagedAssetBusinessGroupInfo: TAPManagedAssetBusinessGroupInfo;
  showSharingInfo: boolean;
  className?: string;
  header?: string;
  headerClassName?: string;
}

export const APDisplayBusinessGroupInfo: React.FC<IAPDisplayBusinessGroupInfoProps> = (props: IAPDisplayBusinessGroupInfoProps) => {
  // const ComponentName='APDisplayBusinessGroupInfo';

  const renderComponentHeader = (): JSX.Element => {
    if(!props.header) return (<React.Fragment></React.Fragment>);
    const className: string = props.headerClassName ? props.headerClassName : "ap-display-component-header";
    return (<div className={className}>Business Group</div>);
  }
  const renderComponentContent = (): JSX.Element => {
    const sharingEntityIdList: TAPEntityIdList = props.apManagedAssetBusinessGroupInfo.apBusinessGroupSharingList.map( (x) => {
      return {
        id: x.apEntityId.id,
        displayName: `${x.apEntityId.displayName} (${x.apSharingAccessType})`,
      }
    });
    const sharingDisplayString: string = sharingEntityIdList.length > 0 ? APEntityIdsService.getSortedDisplayNameList_As_String(sharingEntityIdList) : 'None.';
    return (
      <div>
        <div>
          <b>Business Group</b>: {props.apManagedAssetBusinessGroupInfo.apOwningBusinessGroupEntityId.displayName}
        </div>
        {props.showSharingInfo && 
          <div className="p-ml-2">
            <b>Shared with: </b>{sharingDisplayString}
          </div>
        }
      </div>
    );
  }

  const renderComponent = (): JSX.Element => {
    return (
      <React.Fragment>
        {renderComponentHeader()}
        {renderComponentContent()}
      </React.Fragment>
    );
  }

  return (
    <div className={props.className ? props.className : 'card'}>
      {
        renderComponent()
      }
    </div>
  );
}
