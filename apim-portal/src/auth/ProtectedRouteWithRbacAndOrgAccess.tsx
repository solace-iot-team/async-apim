
import React from "react";
import { Redirect, RouteProps } from "react-router-dom";

import { EUICommonResourcePaths } from "../utils/Globals";
import { UserContext } from "../components/APContextProviders/APUserContextProvider";
import { ProtectedRouteWithRbac } from "./ProtectedRouteWithRbac";

export interface IProtectedRouteWithRbacAndOrgAccessProps {}

export const ProtectedRouteWithRbacAndOrgAccess: React.FC<IProtectedRouteWithRbacAndOrgAccessProps & RouteProps> = (props: IProtectedRouteWithRbacAndOrgAccessProps & RouteProps) => {

  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  const [userContext, dispatchUserContextAction] = React.useContext(UserContext);

  return (
    <React.Fragment>
      { userContext.runtimeSettings.currentOrganizationEntityId && 
        <ProtectedRouteWithRbac {...props} />
      }
      { !userContext.runtimeSettings.currentOrganizationEntityId && 
        <Redirect to={EUICommonResourcePaths.NoOrganization} />
      }
    </React.Fragment>
  );
}
