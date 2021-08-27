
import React from "react";
import { AuthContext } from '../components/AuthContextProvider/AuthContextProvider';
import { AuthHelper } from "./AuthHelper";

export interface IRenderWithRbacProps {
  resourcePath: string;
  children: any;
}

const componentName: string = "RenderWithRbac";

export const RenderWithRbac: React.FC<IRenderWithRbacProps> = (props: IRenderWithRbacProps) => {

  const [authContext, dispatchAuthContextAction] = React.useContext(AuthContext);

  const isAuthorized: boolean = AuthHelper.isAuthorizedToAccessResource(authContext.authorizedResourcePathsAsString, props.resourcePath);

  return (
    <React.Fragment>
      {isAuthorized && props.children }
    </React.Fragment>
  );

}
