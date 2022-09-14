
import React from "react";

import { Divider } from "primereact/divider";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";

import { ApiCallState, TApiCallState } from "../../../utils/ApiCallState";
import { ApiCallStatusError } from "../../../components/ApiCallStatusError/ApiCallStatusError";
import { APClientConnectorOpenApi } from "../../../utils/APClientConnectorOpenApi";
import APEntityIdsService, { TAPEntityId } from "../../../utils/APEntityIdsService";
import { IAPApiDisplay } from "../../../displayServices/APApisDisplayService";
import { E_CALL_STATE_ACTIONS } from "./ManageApisCommon";
import { UserContext } from "../../../components/APContextProviders/APUserContextProvider";
import APAdminPortalApiProductsDisplayService, { TAPAdminPortalApiProductDisplay4List, TAPAdminPortalApiProductDisplay4ListList } from "../../displayServices/APAdminPortalApiProductsDisplayService";
import APDisplayUtils from "../../../displayServices/APDisplayUtils";
import { Loading } from "../../../components/Loading/Loading";

import '../../../components/APComponents.css';
import "./ManageApis.css";

export interface IDisplayAdminPortalApiProductReferenceListProps {
  organizationId: string;
  apApiDisplay: IAPApiDisplay;
  onSuccess: (apiCallState: TApiCallState) => void;
  onError: (apiCallState: TApiCallState) => void;
  onViewApiProductReference: (apiProductEntityId: TAPEntityId) => void;
}

export const DisplayAdminPortalApiProductReferenceList: React.FC<IDisplayAdminPortalApiProductReferenceListProps> = (props: IDisplayAdminPortalApiProductReferenceListProps) => {
  const ComponentName = 'DisplayAdminPortalApiProductReferenceList';

  const MessageNoManagedObjectsFound = 'No API Products defined.';

  type TManagedObject = TAPAdminPortalApiProductDisplay4List;
  type TManagedObjectList = Array<TManagedObject>;

  const [userContext] = React.useContext(UserContext);
  const [managedObjectList, setManagedObjectList] = React.useState<TManagedObjectList>();  
  const [isInitialized, setIsInitialized] = React.useState<boolean>(false); 
  const [selectedManagedObject, setSelectedManagedObject] = React.useState<TManagedObject>();
  const [apiCallStatus, setApiCallStatus] = React.useState<TApiCallState | null>(null);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const dt = React.useRef<any>(null);


  // * Api Calls *
  const apiGetManagedObjectList = async(): Promise<TApiCallState> => {
    const funcName = 'apiGetManagedObject';
    const logName = `${ComponentName}.${funcName}()`;
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_GET_API_PRODUCT_REFERENCE_LIST, `retrieve api product reference list for api: ${props.apApiDisplay.apEntityId.displayName}, version: ${props.apApiDisplay.apVersionInfo.apCurrentVersion}`);
    try { 
      const apApiProductReferenceList: TAPAdminPortalApiProductDisplay4ListList = await APAdminPortalApiProductsDisplayService.apiGetList_ApAdminPortalApiProductDisplay4ListList_For_ApiProductEntityIdList({ 
        organizationId: props.organizationId,
        default_ownerId: userContext.apLoginUserDisplay.apEntityId.id,
        apiProductEntityIdList: props.apApiDisplay.apApiProductReferenceEntityIdList,
      });
      setManagedObjectList(apApiProductReferenceList);
    } catch(e) {
      APClientConnectorOpenApi.logError(logName, e);
      callState = ApiCallState.addErrorToApiCallState(e, callState);
    }
    setApiCallStatus(callState);
    return callState;
  }

  const doInitialize = async () => {
    setIsLoading(true);
    await apiGetManagedObjectList();
    setIsLoading(false);
  }

  // * useEffect Hooks *

  React.useEffect(() => {
    doInitialize();
  }, []); /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    if(managedObjectList === undefined) return;
    setIsInitialized(true);
  }, [managedObjectList]); /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    if(apiCallStatus === null) return;
    if(!apiCallStatus.success) props.onError(apiCallStatus);
  }, [apiCallStatus]); /* eslint-disable-line react-hooks/exhaustive-deps */

  // * Data Table *
  const onManagedObjectSelect = (event: any): void => {
    setSelectedManagedObject(event.data);
  }  
  const onManagedObjectOpen = (event: any): void => {
    const mo: TManagedObject = event.data as TManagedObject;
    props.onViewApiProductReference(mo.apEntityId);
  }
  const nameBodyTemplate = (row: TManagedObject): string => {
    return row.apEntityId.displayName;
  }
  const revisionBodyTemplate = (row: TManagedObject): JSX.Element => {
    return (<div>{row.apVersionInfo.apLastVersion}</div>);
  }
  const stateTemplate = (row: TManagedObject): string => {
    return row.apLifecycleStageInfo.stage;
  }
  const publishedTemplate = (row: TManagedObject): JSX.Element => {
    if(row.apPublishDestinationInfo.apExternalSystemEntityIdList.length === 0) return (<div>False</div>);
    return APDisplayUtils.create_DivList_From_StringList(APEntityIdsService.create_SortedDisplayNameList(row.apPublishDestinationInfo.apExternalSystemEntityIdList));
  }
  const renderManagedObjectDataTable = () => {
    const dataKey = APDisplayUtils.nameOf<TAPAdminPortalApiProductDisplay4List>('apEntityId.id');
    const sortField = APDisplayUtils.nameOf<TAPAdminPortalApiProductDisplay4List>('apEntityId.displayName');
    const filterField = APDisplayUtils.nameOf<TAPAdminPortalApiProductDisplay4List>('apSearchContent');

    return (
      <div className="card">
        <DataTable
          ref={dt}
          className="p-datatable-sm"
          // autoLayout={true}
          resizableColumns 
          columnResizeMode="fit"
          showGridlines={false}
          header='API Product(s)'
          value={managedObjectList}
          selectionMode="single"
          selection={selectedManagedObject}
          onRowClick={onManagedObjectSelect}
          onRowDoubleClick={(e) => onManagedObjectOpen(e)}
          scrollable 
          // scrollHeight="800px" 
          dataKey={dataKey}
          // sorting
          sortMode='single'
          sortField={sortField}
          sortOrder={1}
        >
          <Column header="Name" body={nameBodyTemplate} bodyStyle={{ verticalAlign: 'top' }} filterField={filterField} sortField={sortField} sortable />
          <Column header="Revision" headerStyle={{width: '7em' }} body={revisionBodyTemplate} bodyStyle={{verticalAlign: 'top'}} />
          <Column header="State" headerStyle={{width: '7em'}} body={stateTemplate} bodyStyle={{ verticalAlign: 'top' }} />
          <Column header="Published" headerStyle={{width: '7em'}} body={publishedTemplate} bodyStyle={{ verticalAlign: 'top' }} />
        </DataTable>
     </div>
    );
  }

  const renderContent = () => {
    const funcName = 'renderContent';
    const logName = `${ComponentName}.${funcName}()`;
    if(managedObjectList === undefined) throw new Error(`${logName}: managedObjectList === undefined`);

    if(managedObjectList.length === 0) {
      return (
        <React.Fragment>
          <Divider />
          {MessageNoManagedObjectsFound}
          <Divider />
        </React.Fragment>
      );
    }
    if(managedObjectList.length > 0) {
      return renderManagedObjectDataTable();
    } 
  }

  return (
    <React.Fragment>
      <div className="manage-apis">

        <Loading key={ComponentName} show={isLoading} />      

        <ApiCallStatusError apiCallStatus={apiCallStatus} />

        <div className="p-mt-2">
          {isInitialized && renderContent()}
        </div>

      </div>
    </React.Fragment>
  );
}
