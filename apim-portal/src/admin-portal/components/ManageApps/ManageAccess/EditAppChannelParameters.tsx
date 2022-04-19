
import React from "react";

import { Divider } from "primereact/divider";

import { TAPControlledChannelParameterList } from "../../../../displayServices/APApiProductsDisplayService";
import { EditNewApAttributeListForm } from "../../../../components/APManageAttributes/EditNewApAttributeListForm";
import APEntityIdsService, { TAPEntityIdList } from "../../../../utils/APEntityIdsService";
import { TAPAppChannelParameter, TAPAppChannelParameterList } from "../../../../displayServices/APAppsDisplayService/APAppsDisplayService";
import { SelectApAppChannelParameter } from "./SelectApAppChannelParameter";

import '../../../../components/APComponents.css';
import "../ManageApps.css";

export interface IEditAppChannelParametersProps {
  apAppChannelParameterList : TAPAppChannelParameterList;
  combined_ApControlledChannelParamterList: TAPControlledChannelParameterList;
  onChange: (apAppChannelParameterList: TAPAppChannelParameterList) => void;
}

export const EditAppChannelParameters: React.FC<IEditAppChannelParametersProps> = (props: IEditAppChannelParametersProps) => {
  const ComponentName = 'EditAppChannelParameters';

  type TManagedObject = TAPAppChannelParameterList;

  const [managedObject, setManagedObject] = React.useState<TManagedObject>();
  const [available_ApAppChannelParameterEntityIdList, setAvailable_ApAppChannelParameterEntityIdList] = React.useState<TAPEntityIdList>();
  const [presetAppChannelParameter, setPresetAppChannelParameter] = React.useState<TAPAppChannelParameter>();
  const [refreshCounter, setRefreshCounter] = React.useState<number>(0);

  React.useEffect(() => {
    const availableEntityIdList: TAPEntityIdList = APEntityIdsService.sort_byDisplayName(APEntityIdsService.create_EntityIdList_From_ApDisplayObjectList(props.combined_ApControlledChannelParamterList));
    setAvailable_ApAppChannelParameterEntityIdList(availableEntityIdList);
    setManagedObject(props.apAppChannelParameterList);
  }, []); /* eslint-disable-line react-hooks/exhaustive-deps */


  const onSelect_AppChannelParameter = (apAppChannelParameter: TAPAppChannelParameter) => {
    // const funcName = 'onSelect_AppChannelParameter';
    // const logName = `${ComponentName}.${funcName}()`;
    // alert(`${logName}: apAppChannelParameter=${JSON.stringify(apAppChannelParameter, null, 2)}`);
    setPresetAppChannelParameter(apAppChannelParameter);
    setRefreshCounter(refreshCounter + 1);
  }
  
  const renderComponent = (): JSX.Element => {
    const funcName = 'renderComponent';
    const logName = `${ComponentName}.${funcName}()`;
    if(managedObject === undefined) throw new Error(`${logName}: managedObject === undefined`);
    const uniqueKey = `${ComponentName}_EditNewApAttributeListForm_managedObject`;
    return (
      <React.Fragment>
        <SelectApAppChannelParameter
          combined_ApControlledChannelParamterList={props.combined_ApControlledChannelParamterList}
          onSelect={onSelect_AppChannelParameter}
        />
        <div className="p-field">
          <Divider />
          <div className="p-mt-4 p-mb-4">Select an available <b>Controlled Channel Parameter</b> and add it to the list of <b>App Channel Parameters</b>:</div>
          <EditNewApAttributeListForm
            key={`${uniqueKey}_${refreshCounter}`}
            uniqueKeyPrefix={uniqueKey}
            apAttributeDisplayList={managedObject}
            presetApAttributeDisplay={presetAppChannelParameter}
            availableApAttributeEntityIdList={available_ApAppChannelParameterEntityIdList}
            attributeName_Name="App Channel Parameter"
            attributeValue_Name="Value"
            emptyMessage="No App Channel Parameters defined."
            onChange={props.onChange}
          />
        </div>
      </React.Fragment>  
    );
  }
  
  return (
    <div className="ap-manage-apps">

      {managedObject && available_ApAppChannelParameterEntityIdList && renderComponent()}

    </div>
  );
}
