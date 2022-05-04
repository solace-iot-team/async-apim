import React from "react";
import APSystemOrganizationsDisplayService, { IAPSystemOrganizationDisplay } from "../../displayServices/APOrganizationsDisplayService/APSystemOrganizationsDisplayService";

export type TAPOrganzationContext = IAPSystemOrganizationDisplay;

export interface IOrganizationContextProviderProps {
  children: any
}

export type TOrganizationContextAction = 
  | { type: 'SET_ORGANIZATION_CONTEXT', organizationContext: TAPOrganzationContext }
  | { type: 'CLEAR_ORGANIZATION_CONTEXT' }
  | { type: 'default'};

const OrganizationContextReducer = (state: TAPOrganzationContext, action: TOrganizationContextAction): TAPOrganzationContext => {
  switch (action.type) {
    case 'SET_ORGANIZATION_CONTEXT': {
      return JSON.parse(JSON.stringify(action.organizationContext));
    }
    case 'CLEAR_ORGANIZATION_CONTEXT': {
      return JSON.parse(JSON.stringify(initialContext));
    }
    default: 
      return state;  
  }
}
const initialContext: TAPOrganzationContext = APSystemOrganizationsDisplayService.create_Empty_ApOrganizationDisplay();

const initialAction: React.Dispatch<TOrganizationContextAction> = (value: TOrganizationContextAction) => {};

export const OrganizationContext = React.createContext<[TAPOrganzationContext, React.Dispatch<TOrganizationContextAction>]>([initialContext, initialAction]);

export const OrganizationContextProvider: React.FC<IOrganizationContextProviderProps> = (props: IOrganizationContextProviderProps) => {

  const [state, dispatch] = React.useReducer(OrganizationContextReducer, initialContext);

  return (
    <OrganizationContext.Provider value={[state, dispatch]}>
      {props.children}
    </OrganizationContext.Provider>
  );
}

