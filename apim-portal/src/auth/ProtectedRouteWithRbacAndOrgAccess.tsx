
import React from "react";
import { Redirect, RouteProps } from "react-router-dom";
import { UserContext } from "../components/UserContextProvider/UserContextProvider";
import { ProtectedRouteWithRbac } from "./ProtectedRouteWithRbac";
import { EUIResourcePaths } from "../utils/Globals";

export interface IProtectedRouteWithRbacAndOrgAccessProps {}

export const ProtectedRouteWithRbacAndOrgAccess: React.FC<IProtectedRouteWithRbacAndOrgAccessProps & RouteProps> = (props: IProtectedRouteWithRbacAndOrgAccessProps & RouteProps) => {

  const [userContext, dispatchUserContextAction] = React.useContext(UserContext);

  return (
    <React.Fragment>
      { userContext.runtimeSettings.currentOrganizationName && 
        <ProtectedRouteWithRbac {...props} />
      }
      { !userContext.runtimeSettings.currentOrganizationName && 
        <Redirect to={EUIResourcePaths.NoOrganization} />
      }
    </React.Fragment>
  );
}
