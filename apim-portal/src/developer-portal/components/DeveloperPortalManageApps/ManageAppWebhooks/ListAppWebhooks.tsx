
import React from "react";

import { MenuItem } from "primereact/api";

import { APComponentHeader } from "../../../../components/APComponentHeader/APComponentHeader";
import { TApiCallState } from "../../../../utils/ApiCallState";
import { ApiCallStatusError } from "../../../../components/ApiCallStatusError/ApiCallStatusError";
import { 
  TAPDeveloperPortalUserAppDisplay, 
} from "../../../displayServices/APDeveloperPortalUserAppsDisplayService";
import { TAPDeveloperPortalTeamAppDisplay } from "../../../displayServices/APDeveloperPortalTeamAppsDisplayService";
import { 
  IAPAppWebhookDisplay, 
} from "../../../../displayServices/APAppsDisplayService/APAppWebhooksDisplayService";
import { APDisplayAppWebhookList } from "../../../../components/APDisplay/APDisplayWebhooks/APDisplayAppWebhookList";

import '../../../../components/APComponents.css';
import "../DeveloperPortalManageApps.css";

export interface IListAppWebhooksProps {
  organizationId: string;
  apDeveloperPortalAppDisplay: TAPDeveloperPortalUserAppDisplay | TAPDeveloperPortalTeamAppDisplay;
  onError: (apiCallState: TApiCallState) => void;
  onSuccess: (apiCallState: TApiCallState) => void;
  onLoadingChange: (isLoading: boolean) => void;
  onManagedObjectView: (apAppWebhookDisplay: IAPAppWebhookDisplay) => void;
  setBreadCrumbItemList: (itemList: Array<MenuItem>) => void;
}

export const ListAppWebhooks: React.FC<IListAppWebhooksProps> = (props: IListAppWebhooksProps) => {
  // const ComponentName = 'ListAppWebhooks';

  const [apiCallStatus, setApiCallStatus] = React.useState<TApiCallState | null>(null);
  
  React.useEffect(() => {
    if (apiCallStatus !== null) {
      if(apiCallStatus.success) props.onSuccess(apiCallStatus);
      else props.onError(apiCallStatus);
    }
  }, [apiCallStatus]); /* eslint-disable-line react-hooks/exhaustive-deps */

  // * Data Table *

  const renderContent = () => {
    return (
      <APDisplayAppWebhookList
        organizationId={props.organizationId}
        apDeveloperPortalUserAppDisplay={props.apDeveloperPortalAppDisplay}
        onError={setApiCallStatus}
        onLoadingChange={props.onLoadingChange}
        onOpen={props.onManagedObjectView}
      />
    );
  }

  return (
    <div className="apd-manage-user-apps">

      <APComponentHeader header='App Webhooks:' />

      <ApiCallStatusError apiCallStatus={apiCallStatus} />

      <div className="p-mt-2">
        {renderContent()}
      </div>
      
    </div>
  );
}
