
import React from "react";
import { Route, RouteProps } from "react-router-dom";
import { withAuth } from "./withAuth";
import { HomePage } from '../pages/HomePage';

export interface IProtectedRouteProps {}

export const ProtectedRoute: React.FC<IProtectedRouteProps & RouteProps> = (props: IProtectedRouteProps & RouteProps) => {

  const _rp: string = props.path as string;

  return (
    <Route
      {...props}
      component={withAuth(props.component ? props.component : HomePage )}
    />  
  );

}
