import React from 'react';

import { Toolbar } from 'primereact/toolbar';
import { Button } from 'primereact/button';

import { UserContext } from '../../components/APContextProviders/APUserContextProvider';
import { Loading } from '../../components/Loading/Loading';
import { ApiCallStatusError } from '../../components/ApiCallStatusError/ApiCallStatusError';
import { ApiCallState, TApiCallState } from '../../utils/ApiCallState';
import APExternalSystemsDisplayService, { TAPExternalSystemDisplayList } from '../../displayServices/APExternalSystemsDisplayService';
import { APClientConnectorOpenApi } from '../../utils/APClientConnectorOpenApi';
import { APSBusinessGroupCreate, ApsBusinessGroupsService, APSExternalReference } from '../../_generated/@solace-iot-team/apim-server-openapi-browser';
import APEntityIdsService from "../../utils/APEntityIdsService";

export const BusinessGroupsTestPage: React.FC = () => {
  const ComponentName = 'BusinessGroupsTestPage';

  enum E_CALL_STATE_ACTIONS {
    API_GET_EXTERNAL_SYSTEMS_LIST = "API_GET_EXTERNAL_SYSTEMS_LIST",
    API_GENERATE_INTERNAL_BUSINESS_GROUPS = "API_GENERATE_INTERNAL_BUSINESS_GROUPS",
    API_GENERATE_EXTERNAL_BUSINESS_GROUPS = "API_GENERATE_EXTERNAL_BUSINESS_GROUPS"
  }
  
  const NumDomains = 2;
  const NumProductLines = 2;
  const NumProducts = 2;

  const createDomainId = (num: number) => {
    const IStr: string = String(num).padStart(2,'0');
    return `domain-${IStr}`;
  }
  const createExternalDomainId = (num: number) => {
    const domainId = createDomainId(num);
    return `ext-${domainId}`;
  }
  const createProductLineId = (domainNum: number, num: number) => {
    const domainStr: string = String(domainNum).padStart(2,'0');
    const productLineStr: string = String(num).padStart(2,'0');
    return `product-line-${domainStr}_${productLineStr}`;
  }
  const createExternalProductLineId = (domainNum: number, num: number) => {
    const productLineId = createProductLineId(domainNum, num);
    return `ext-${productLineId}`;
  }
  const createProductId = (domainNum: number, productLineNum: number, num: number) => {
    const domainStr: string = String(domainNum).padStart(2,'0');
    const productLineStr: string = String(productLineNum).padStart(2,'0');
    const productStr: string = String(num).padStart(2,'0');
    return `product-${domainStr}_${productLineStr}_${productStr}`;
  }
  const createExternalProductId = (domainNum: number, productLineNum: number, num: number) => {
    const productId = createProductId(domainNum, productLineNum, num);
    return `ext-${productId}`;
  }
 

  const [userContext] = React.useContext(UserContext);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [apiCallStatus, setApiCallStatus] = React.useState<TApiCallState | null>(null);
  const [externalSystemsDisplayList, setExternalSystemsDisplayList] = React.useState<TAPExternalSystemDisplayList>([]);
  const [organizationId, setOrganizationId] = React.useState<string>('');
  
  const apiGetExternalSystemsList = async(organizationId: string): Promise<TApiCallState> => {
    const funcName = 'apiGetExternalSystemsList';
    const logName = `${ComponentName}.${funcName}()`;
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_GET_EXTERNAL_SYSTEMS_LIST, 'retrieve list of external systems');
    try {
      const list: TAPExternalSystemDisplayList = await APExternalSystemsDisplayService.apiGetList_ApExternalSystemDisplay({
        organizationId: organizationId
      });
      setExternalSystemsDisplayList(list);
    } catch(e: any) {
      APClientConnectorOpenApi.logError(logName, e);
      callState = ApiCallState.addErrorToApiCallState(e, callState);
    }
    setApiCallStatus(callState);
    return callState;
  }

  const apiCreateBusinessGroup = async({ organizationId, businessGroupId, businessGroupParentId, externalReference }:{
    organizationId: string;
    businessGroupId: string;
    businessGroupParentId?: string;
    externalReference?: APSExternalReference;
  }) => {
    const funcName = 'apiCreateBusinessGroup';
    const logName = `${ComponentName}.${funcName}()`;
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_GENERATE_INTERNAL_BUSINESS_GROUPS, 'generate internal business groups');
    try {
      const create: APSBusinessGroupCreate = {
        businessGroupParentId: businessGroupParentId ? businessGroupParentId : organizationId,
        businessGroupId: businessGroupId,
        displayName: businessGroupId,
        description: businessGroupId,
        externalReference: externalReference
      };
      try {
        await ApsBusinessGroupsService.getApsBusinessGroup({
          organizationId: organizationId,
          businessgroupId: businessGroupId
        });
      } catch(e) {
        await ApsBusinessGroupsService.createApsBusinessGroup({
          organizationId: organizationId,
          requestBody: create
        });
      }  
    } catch(e: any) {
      APClientConnectorOpenApi.logError(logName, e);
      callState = ApiCallState.addErrorToApiCallState(e, callState);
    }
    setApiCallStatus(callState);
    return callState;
  }
  const apiGenerateInternalBusinessGroups = async(organizationId: string): Promise<TApiCallState> => {
    const funcName = 'apiGenerateInternalBusinessGroups';
    const logName = `${ComponentName}.${funcName}()`;
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_GENERATE_INTERNAL_BUSINESS_GROUPS, 'generate internal business groups');
    try {
      for(let domainI=0; domainI < NumDomains; domainI++) {
        const domainBusinessGroupId = createDomainId(domainI);
        await apiCreateBusinessGroup({
          organizationId: organizationId, 
          businessGroupId: domainBusinessGroupId
        });
        // add product lines 
        for(let productLineI=0; productLineI < NumProductLines; productLineI++) {
          const productLineBusinessGroupId = createProductLineId(domainI, productLineI);
          await apiCreateBusinessGroup({
            organizationId: organizationId, 
            businessGroupId: productLineBusinessGroupId, 
            businessGroupParentId: domainBusinessGroupId
          });
          // add products
          for(let productI=0; productI < NumProducts; productI++) {
            const productBusinessGroupId = createProductId(domainI, productLineI, productI);
            await apiCreateBusinessGroup({
              organizationId: organizationId, 
              businessGroupId: productBusinessGroupId, 
              businessGroupParentId: productLineBusinessGroupId
            });
          }
        }
      }    
    } catch(e: any) {
      APClientConnectorOpenApi.logError(logName, e);
      callState = ApiCallState.addErrorToApiCallState(e, callState);
    }
    setApiCallStatus(callState);
    return callState;
  }

  const apiGenerateExternalBusinessGroups = async(organizationId: string, externalSystemsDisplayList: TAPExternalSystemDisplayList): Promise<TApiCallState> => {
    const funcName = 'apiGenerateExternalBusinessGroups';
    const logName = `${ComponentName}.${funcName}()`;
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_GENERATE_EXTERNAL_BUSINESS_GROUPS, 'generate external business groups');
    try {
      for(const externalSystemDisplay of externalSystemsDisplayList) {
        const externalSystemId = externalSystemDisplay.apEntityId.id;
        for(let domainI=0; domainI < NumDomains; domainI++) {
          const domainBusinessGroupId = createExternalDomainId(domainI);
          const externalReference: APSExternalReference = {
            externalId: domainBusinessGroupId,
            displayName: domainBusinessGroupId,
            externalSystemId: externalSystemId
          };
          await apiCreateBusinessGroup({
            organizationId: organizationId, 
            businessGroupId: domainBusinessGroupId, 
            externalReference: externalReference
          });
          // add product lines 
          for(let productLineI=0; productLineI < NumProductLines; productLineI++) {
            const productLineBusinessGroupId = createExternalProductLineId(domainI, productLineI);
            const externalReference: APSExternalReference = {
              externalId: productLineBusinessGroupId,
              displayName: productLineBusinessGroupId,
              externalSystemId: externalSystemId
            };
            await apiCreateBusinessGroup({
              organizationId: organizationId, 
              businessGroupId: productLineBusinessGroupId, 
              businessGroupParentId: domainBusinessGroupId,
              externalReference: externalReference
            });
            // add products
            for(let productI=0; productI < NumProducts; productI++) {
              const productBusinessGroupId = createExternalProductId(domainI, productLineI, productI);
              const externalReference: APSExternalReference = {
                externalId: productBusinessGroupId,
                displayName: productBusinessGroupId,
                externalSystemId: externalSystemId
              };  
              await apiCreateBusinessGroup({
                organizationId: organizationId, 
                businessGroupId: productBusinessGroupId, 
                businessGroupParentId: productLineBusinessGroupId,
                externalReference: externalReference
              });
            }
          }
        }      
      }
    } catch(e: any) {
      APClientConnectorOpenApi.logError(logName, e);
      callState = ApiCallState.addErrorToApiCallState(e, callState);
    }
    setApiCallStatus(callState);
    return callState;
  }

  const doInitialize = async (organizationId: string) => {
    setIsLoading(true);
    await apiGetExternalSystemsList(organizationId);
    setIsLoading(false);
  }

  React.useEffect(() => {
    // const funcName = 'useEffect([])';
    // const logName = `${ComponentName}.${funcName}()`;
    if(userContext.runtimeSettings.currentOrganizationEntityId === undefined) {
      const callState = ApiCallState.getInitialCallState('initializing', 'check for organization');
      setApiCallStatus(ApiCallState.addErrorToApiCallState('no organization found in user context', callState));
    } else {
      setOrganizationId(userContext.runtimeSettings.currentOrganizationEntityId.id);
      doInitialize(userContext.runtimeSettings.currentOrganizationEntityId.id);
    }
  }, []); /* eslint-disable-line react-hooks/exhaustive-deps */

  const doGenerateInternalBusinessGroups = async() => {
    setIsLoading(true);
    await apiGenerateInternalBusinessGroups(organizationId);
    setIsLoading(false);
  }

  const onGenerateInternalBusinessGroups = () => {
    doGenerateInternalBusinessGroups();
  }

  const doGenerateExternalBusinessGroups = async() => {
    setIsLoading(true);
    await apiGenerateExternalBusinessGroups(organizationId, externalSystemsDisplayList);
    setIsLoading(false);
  }

  const onGenerateExternalBusinessGroups = () => {
    doGenerateExternalBusinessGroups();
  }

  const renderLeftToolbarContent = (): JSX.Element => {
    return (
      <React.Fragment>
        <Button 
          label="Generate Internal Business Groups"
          icon="pi pi-plus" 
          onClick={onGenerateInternalBusinessGroups} 
          className="p-button-text p-button-plain p-button-outlined"
        />
        <Button 
          label="Generate Extternal Business Groups"
          icon="pi pi-plus" 
          onClick={onGenerateExternalBusinessGroups} 
          className="p-button-text p-button-plain p-button-outlined"
        />
      </React.Fragment>
    );
  }
  const renderToolbar = (): JSX.Element => {
    return (<Toolbar className="p-mb-4" left={renderLeftToolbarContent()} />);
  }

  const renderExternalSystems = (): JSX.Element => {
    if(externalSystemsDisplayList.length === 0) {
      return (
        <p>External Systems: None. <b>Setup at least 1 External System first.</b></p>
      );
    } else {
      const s: string =  APEntityIdsService.create_SortedDisplayNameList_From_ApDisplayObjectList(externalSystemsDisplayList).join(', ');
      return (
        <p>External Systems: {s}</p>
      );
    }
  }

  return (
    <div>
      <h1>Business Groups Test Page for org={userContext.runtimeSettings.currentOrganizationEntityId?.displayName}</h1>
      <hr />

      <Loading show={isLoading} />      

      <ApiCallStatusError apiCallStatus={apiCallStatus} />

      {organizationId && renderExternalSystems()}

      {organizationId && renderToolbar()}
      
    </div>
);

}

