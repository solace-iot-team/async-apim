
import React from "react";

import { TAPApiChannelParameter, TAPApiChannelParameterList, TAPApiDisplayList } from "../../../../displayServices/APApisDisplayService";
import { TAPControlledChannelParameter, TAPControlledChannelParameterList } from "../../../../displayServices/APApiProductsDisplayService";
import { SelectApiChannelParameter } from "./SelectApiChannelParameter";
import { EditNewApAttributeListForm } from "../../../../components/APManageAttributes/EditNewApAttributeListForm";
import APAdminPortalApisDisplayService from "../../../displayServices/APAdminPortalApisDisplayService";
import APEntityIdsService, { TAPEntityIdList } from "../../../../utils/APEntityIdsService";

import '../../../../components/APComponents.css';
import "../ManageApiProducts.css";

export interface IEditControlledChannelParametersProps {
  apApiDisplayList: TAPApiDisplayList;
  selected_ApControlledChannelParameterList: TAPControlledChannelParameterList;
  onChange: (apControlledChannelParameterList: TAPControlledChannelParameterList) => void;
}

export const EditControlledChannelParameters: React.FC<IEditControlledChannelParametersProps> = (props: IEditControlledChannelParametersProps) => {
  const ComponentName = 'EditControlledChannelParameters';

  type TManagedObject = TAPControlledChannelParameterList;

  const [managedObject, setManagedObject] = React.useState<TManagedObject>();
  const [available_ApChannelParameterEntityIdList, setAvailable_ApChannelParameterEntityIdList] = React.useState<TAPEntityIdList>();
  const [presetApControlledChannelParameter, setPresetApControlledChannelParameter] = React.useState<TAPControlledChannelParameter>();
  const [refreshCounter, setRefreshCounter] = React.useState<number>(0);

  React.useEffect(() => {
    const combined_ApApiChannelParameterList: TAPApiChannelParameterList = APAdminPortalApisDisplayService.create_Combined_ApiChannelParameterList({
      apApiDisplayList: props.apApiDisplayList,
    });
    const availableEntityIdList: TAPEntityIdList = APEntityIdsService.sort_byDisplayName(APEntityIdsService.create_EntityIdList_From_ApDisplayObjectList(combined_ApApiChannelParameterList));
    setAvailable_ApChannelParameterEntityIdList(availableEntityIdList);
    setManagedObject(props.selected_ApControlledChannelParameterList);
  }, []); /* eslint-disable-line react-hooks/exhaustive-deps */


  const onSelect_ApiChannelParameter = (apApiChannelParameter: TAPApiChannelParameter) => {
    // alert(`onSelect_ApiChannelParameter(): apApiChannelParameter=${JSON.stringify(apApiChannelParameter, null, 2)}`);
    // transform to channel parameter
    const apControlledChannelParameter: TAPControlledChannelParameter = {
      apEntityId: apApiChannelParameter.apEntityId,
      value: apApiChannelParameter.valueList.join(','),
    };
    setPresetApControlledChannelParameter(apControlledChannelParameter);
    setRefreshCounter(refreshCounter + 1);
  }
  
  const renderComponent = (): JSX.Element => {
    const funcName = 'renderComponent';
    const logName = `${ComponentName}.${funcName}()`;
    if(managedObject === undefined) throw new Error(`${logName}: managedObject === undefined`);
    const uniqueKey = `${ComponentName}_EditNewApAttributeListForm_managedObject`;
    return (
      <React.Fragment>
        <SelectApiChannelParameter
          apApiDisplayList={props.apApiDisplayList}
          onSelect={onSelect_ApiChannelParameter}
        />
        <div className="p-field">
          <div className="p-mt-4">Select an available <b>API Channel Parameter</b> and add it to the list of <b>Controlled Channel Parameters</b>:</div>
          <EditNewApAttributeListForm
            key={`${uniqueKey}_${refreshCounter}`}
            uniqueKeyPrefix={uniqueKey}
            apAttributeDisplayList={managedObject}
            presetApAttributeDisplay={presetApControlledChannelParameter}
            availableApAttributeEntityIdList={available_ApChannelParameterEntityIdList}
            attributeName_Name="Controlled Channel Parameter"
            attributeValue_Name="Value"
            emptyMessage="No Controlled Channel Parameters defined."
            onChange={props.onChange}
          />
        </div>
      </React.Fragment>  
    );
  }
  
  return (
    <div className="manage-api-products">
      {managedObject && available_ApChannelParameterEntityIdList && renderComponent()}
    </div>
  );
}
