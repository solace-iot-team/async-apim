
import React from "react";
import { Route, RouteProps } from "react-router-dom";
import { withAuthAndRbac } from "./withAuthAndRbac";
import { HomePage } from '../pages/HomePage';

export interface IProtectedRouteWithRbacProps {}

// const defaultOnRedirecting = (): JSX.Element => <></>;

export const ProtectedRouteWithRbac: React.FC<IProtectedRouteWithRbacProps & RouteProps> = (props: IProtectedRouteWithRbacProps & RouteProps) => {

  // const _onRedirecting: () => JSX.Element = props.onRedirecting ? props.onRedirecting : defaultOnRedirecting;

  const _rp: string = props.path as string;

  return (
    <Route
      {...props}
      component={withAuthAndRbac(props.component ? props.component : HomePage, { resourcePath: _rp })}
    />  
  );

}
