import React from 'react';

import { Toolbar } from 'primereact/toolbar';
import { Button } from 'primereact/button';

import { UserContext } from '../../components/APContextProviders/APUserContextProvider';
import { Loading } from '../../components/Loading/Loading';
import { ApiCallStatusError } from '../../components/ApiCallStatusError/ApiCallStatusError';
import { ApiCallState, TApiCallState } from '../../utils/ApiCallState';
import APExternalSystemsDisplayService, { TAPExternalSystemDisplayList } from '../../displayServices/APExternalSystemsDisplayService';
import { APClientConnectorOpenApi } from '../../utils/APClientConnectorOpenApi';
import { APSBusinessGroupCreate, ApsBusinessGroupsService } from '../../_generated/@solace-iot-team/apim-server-openapi-browser';

export const BusinessGroupsTestPage: React.FC = () => {
  const ComponentName = 'BusinessGroupsTestPage';

  enum E_CALL_STATE_ACTIONS {
    API_GET_EXTERNAL_SYSTEMS_LIST = "API_GET_EXTERNAL_SYSTEMS_LIST",
    API_GENERATE_BUSINESS_GROUPS = "API_GENERATE_BUSINESS_GROUPS"
  }
  
  const NumParentBusinessGroups = 3;
  const createInternalParentBusinessGroupId = (pbgI: number) => {
    const IStr: string = String(pbgI).padStart(5,'0');
    return `internal-parent-${IStr}`;
  }
  const createExternalParentBusinessGroupId = (extId: string, parentI: number) => {
    const parentIStr: string = String(parentI).padStart(5,'0');
    return `external-parent-${parentIStr}`;
  }
  const NumChildrenBusinessGroups = 3;
  const createInternalChildBusinessGroupId = (parentI: number, childI: number) => {
    const parentIStr: string = String(parentI).padStart(5,'0');
    const childIStr: string = String(childI).padStart(5,'0');    
    return `internal-child-${parentIStr}-${childIStr}`;
  }
  const createExternalChildBusinessGroupId = (externalSystemId: string, parentI: number, childI: number) => {
    const parentIStr: string = String(parentI).padStart(5,'0');
    const childIStr: string = String(childI).padStart(5,'0');    
    return `external-child-${parentIStr}-${childIStr}`;
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
      const list: TAPExternalSystemDisplayList = await APExternalSystemsDisplayService.listApExternalSystemDisplay({
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

  const apiGenerateBusinessGroups = async(organizationId: string, externalSystemsDisplayList: TAPExternalSystemDisplayList): Promise<TApiCallState> => {
    const funcName = 'apiGenerateBusinessGroups';
    const logName = `${ComponentName}.${funcName}()`;
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_GENERATE_BUSINESS_GROUPS, 'generate business groups');
    try {
      // internal
      for(let parentI=0; parentI < NumParentBusinessGroups; parentI++) {
        const parentBusinessGroupId = createInternalParentBusinessGroupId(parentI);
        const create: APSBusinessGroupCreate = {
          businessGroupParentId: organizationId,
          businessGroupId: parentBusinessGroupId,
          displayName: parentBusinessGroupId,
          description: parentBusinessGroupId,
        }
        try {
          await ApsBusinessGroupsService.getApsBusinessGroup({
            organizationId: organizationId,
            businessgroupId: parentBusinessGroupId
          });
        } catch(e) {
          await ApsBusinessGroupsService.createApsBusinessGroup({
            organizationId: organizationId,
            requestBody: create
          });
        }  
        // add children 
        for(let childI=0; childI < NumChildrenBusinessGroups; childI++) {
          const childBusinessGroupId = createInternalChildBusinessGroupId(parentI, childI);
          const create: APSBusinessGroupCreate = {
            businessGroupId: childBusinessGroupId,
            displayName: childBusinessGroupId,
            description: childBusinessGroupId,
            businessGroupParentId: parentBusinessGroupId
          }
          try {
            await ApsBusinessGroupsService.getApsBusinessGroup({
              organizationId: organizationId,
              businessgroupId: childBusinessGroupId
            });
          } catch(e) {
            await ApsBusinessGroupsService.createApsBusinessGroup({
              organizationId: organizationId,
              requestBody: create
            });
          }  
        }
      }
      // external
      for(const externalSystemDisplay of externalSystemsDisplayList) {
        const externalSystemId = externalSystemDisplay.apEntityId.id;
        for(let parentI=0; parentI < NumParentBusinessGroups; parentI++) {
          const parentBusinessGroupId = createExternalParentBusinessGroupId(externalSystemId, parentI);
          const create: APSBusinessGroupCreate = {
            businessGroupParentId: organizationId,
            businessGroupId: parentBusinessGroupId,
            displayName: parentBusinessGroupId,
            description: parentBusinessGroupId,
            externalReference: {
              externalId: parentBusinessGroupId,
              displayName: parentBusinessGroupId,
              externalSystemId: externalSystemId
            }
          }
          try {
            await ApsBusinessGroupsService.getApsBusinessGroup({
              organizationId: organizationId,
              businessgroupId: parentBusinessGroupId
            });
          } catch(e) {
            await ApsBusinessGroupsService.createApsBusinessGroup({
              organizationId: organizationId,
              requestBody: create
            });
          }  
          // add children 
          for(let childI=0; childI < NumChildrenBusinessGroups; childI++) {
            const childBusinessGroupId = createExternalChildBusinessGroupId(externalSystemId, parentI, childI);
            const create: APSBusinessGroupCreate = {
              businessGroupId: childBusinessGroupId,
              displayName: childBusinessGroupId,
              description: childBusinessGroupId,
              businessGroupParentId: parentBusinessGroupId,
              externalReference: {
                externalId: childBusinessGroupId,
                displayName: childBusinessGroupId,
                externalSystemId: externalSystemId  
              }
            }
            try {
              await ApsBusinessGroupsService.getApsBusinessGroup({
                organizationId: organizationId,
                businessgroupId: childBusinessGroupId
              });
            } catch(e) {
              await ApsBusinessGroupsService.createApsBusinessGroup({
                organizationId: organizationId,
                requestBody: create
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

  const doGenerateBusinessGroups = async() => {
    setIsLoading(true);
    await apiGenerateBusinessGroups(organizationId, externalSystemsDisplayList);
    setIsLoading(false);
  }

  const onGenerateBusinessGroups = () => {
    doGenerateBusinessGroups();
  }

  const renderLeftToolbarContent = (): JSX.Element => {
    return (
      <React.Fragment>
        <Button 
          label="Generate Business Groups"
          icon="pi pi-plus" 
          onClick={onGenerateBusinessGroups} 
          className="p-button-text p-button-plain p-button-outlined"
        />
      </React.Fragment>
    );
  }
  const renderToolbar = (): JSX.Element => {
    return (<Toolbar className="p-mb-4" left={renderLeftToolbarContent()} />);
  }

  return (
    <div>
      <h1>Business Groups Test Page for org={userContext.runtimeSettings.currentOrganizationEntityId?.displayName}</h1>
      <hr />

      <Loading show={isLoading} />      

      <ApiCallStatusError apiCallStatus={apiCallStatus} />

      {organizationId && renderToolbar()}
      
    </div>
);

}

