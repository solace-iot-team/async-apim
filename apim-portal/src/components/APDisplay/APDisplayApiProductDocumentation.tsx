import React from "react";
import DOMPurify from 'dompurify';

import { SelectButton, SelectButtonChangeParams } from "primereact/selectbutton";

import { TAPApiProductDocumentationDisplay } from "../../displayServices/APApiProductsDisplayService";
import APEntityIdsService, { TAPEntityIdList } from "../../utils/APEntityIdsService";

import "../APComponents.css";

export interface IAPDisplayApiProductDocumentationProps {
  apApiProductDocumentationDisplay: TAPApiProductDocumentationDisplay;
  className?: string;
}

export const APDisplayApiProductDocumentation: React.FC<IAPDisplayApiProductDocumentationProps> = (props: IAPDisplayApiProductDocumentationProps) => {
  // const ComponentName='APDisplayApiProductDocumentation';

  type TManagedObject = TAPApiProductDocumentationDisplay;

  const [managedObject] = React.useState<TManagedObject>(props.apApiProductDocumentationDisplay);  
  const SelectReferenceDocId = "SelectReferenceDocId";
  const SelectSupportDocId = "SelectSupportDocId";
  const SelectAllFilterOptions: TAPEntityIdList = [
    { id: SelectReferenceDocId, displayName: 'Reference Documentation' },
    { id: SelectSupportDocId, displayName: 'Support Documentation' },
  ];
  const [selectedDocOptionId, setSelectedDocOptionId] = React.useState<string>(SelectReferenceDocId);

  const getSelectButton = () => {
    const onSelectOptionChange = (params: SelectButtonChangeParams) => {
      if(params.value !== null) {
        setSelectedDocOptionId(params.value);
      }
    }
    return(
      <SelectButton
        value={selectedDocOptionId} 
        options={SelectAllFilterOptions} 
        optionLabel={APEntityIdsService.nameOf('displayName')}
        optionValue={APEntityIdsService.nameOf('id')}
        onChange={onSelectOptionChange} 
        // style={{ textAlign: 'end' }}
      />
    );
  }

  // React.useEffect(() => {

  //   alert(`selectedDocOptionId = ${selectedDocOptionId}`);
  // }, [selectedDocOptionId]); /* eslint-disable-line react-hooks/exhaustive-deps */

  const renderDoc = () => {
    if(selectedDocOptionId === SelectReferenceDocId) {
      if(managedObject.apReferenceDocumentation !== undefined) {
        return (
          <div>
            <div
              dangerouslySetInnerHTML={{__html: DOMPurify.sanitize(managedObject.apReferenceDocumentation)}}
            />
            {/* <pre>{JSON.stringify(managedObject.apReferenceDocumentation)}</pre> */}
          </div>
        );  
      } else {
        return (
          <div>None.</div>
        );
      }
    }
    if(selectedDocOptionId === SelectSupportDocId) {
      if(managedObject.apSupportDocumentation !== undefined) {
        return (
          <div>
            <div
              dangerouslySetInnerHTML={{__html: DOMPurify.sanitize(managedObject.apSupportDocumentation)}}
            />
            {/* <pre>{JSON.stringify(managedObject.apSupportDocumentation)}</pre> */}
          </div>
        );
      } else {
        return (
          <div>None.</div>
        );
      }
    }
  }

  const renderComponent = (): JSX.Element => {
    return (
      <div className="card p-mt-4">
        <div>{getSelectButton()}</div>
        <div>{renderDoc()}</div>
      </div>
    );
  }

  return (
    <div className={props.className ? props.className : 'card'}>
      {renderComponent()}
    </div>
  );
}
