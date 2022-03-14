import { AuthHelper } from '../auth/AuthHelper';
import { TOrganizationContextAction } from '../components/APContextProviders/APOrganizationContextProvider';
import { UserContextAction } from '../components/APContextProviders/APUserContextProvider';
import { AuthContextAction } from '../components/AuthContextProvider/AuthContextProvider';
import { TAPEntityId } from '../utils/APEntityIdsService';
import { APOrganizationsService } from '../utils/APOrganizationsService';
import { 
  APRbac, 
  EAPSCombinedAuthRole, 
  TAPRbacRole, 
} from '../utils/APRbac';
import { EAppState, EUICommonResourcePaths, Globals } from '../utils/Globals';
import APRbacDisplayService from './APRbacDisplayService';
import { TAPLoginUserDisplay } from './APUsersDisplayService/APLoginUsersDisplayService';

class APContextsDisplayService {
  private readonly BaseComponentName = "APContextsDisplayService";

  public get_RoleDisplayName(apsRole: EAPSCombinedAuthRole): string {
    const rbacRole: TAPRbacRole = APRbac.getByRole(apsRole);
    return rbacRole.displayName;
  }

  private async setup_AuthContext({ apLoginUserDisplay, authorizedResourcePathsAsString, dispatchAuthContextAction }:{
    apLoginUserDisplay: TAPLoginUserDisplay;
    authorizedResourcePathsAsString: string;
    dispatchAuthContextAction: React.Dispatch<AuthContextAction>;
  }): Promise<void> {
    dispatchAuthContextAction({ type: 'SET_AUTH_CONTEXT', authContext: { 
      isLoggedIn: true, 
      authorizedResourcePathsAsString: authorizedResourcePathsAsString,
    }});
  }

  private async setup_OrganizationContext({ 
    organizationEntityId, 
    isConnectorAvailable,
    dispatchUserContextAction,
    dispatchOrganizationContextAction,
  }:{
    organizationEntityId: TAPEntityId | undefined;
    isConnectorAvailable: boolean;
    dispatchUserContextAction: React.Dispatch<UserContextAction>;
    dispatchOrganizationContextAction: React.Dispatch<TOrganizationContextAction>;
  }): Promise<void> {
    if(organizationEntityId !== undefined) {
      dispatchUserContextAction({ type: 'SET_CURRENT_ORGANIZATION_ENTITY_ID', currentOrganizationEntityId: organizationEntityId });
      // only if connector is defined & healthy
      if(isConnectorAvailable) {
        dispatchOrganizationContextAction({ type: 'SET_ORGANIZATION_CONTEXT', organizationContext: await APOrganizationsService.getOrganization(organizationEntityId.id)});
      }
    }
  }

  private setup_App({ 
    isConnectorAvailable, 
    authorizedResourcePathsAsString, 
    userContextCurrentAppState, 
    userContextOriginAppState, 
    dispatchUserContextAction, 
    navigateTo 
  }:{
    isConnectorAvailable: boolean;
    authorizedResourcePathsAsString: string;
    userContextCurrentAppState: EAppState;
    userContextOriginAppState: EAppState;
    dispatchUserContextAction: React.Dispatch<UserContextAction>;
    navigateTo: (path: string) => void;
  }): void {
    const funcName = 'setup_App';
    const logName = `${this.BaseComponentName}.${funcName}()`;

    if(!isConnectorAvailable) {
      // no access to admin portal ==> redirect to system unavailable
      if(!AuthHelper.isAuthorizedToAccessAdminPortal(authorizedResourcePathsAsString)) {
        navigateTo(EUICommonResourcePaths.HealthCheckView);
        return;
      }
    }
    let originAppState: EAppState = userContextOriginAppState;
    let newCurrentAppState: EAppState = userContextCurrentAppState;

    if(userContextCurrentAppState !== EAppState.UNDEFINED) {
      newCurrentAppState = userContextCurrentAppState;
      // catch state management errors
      if(originAppState === EAppState.UNDEFINED) throw new Error(`${logName}: orginAppState is undefined, currentAppState=${newCurrentAppState}`);
    } else {
      // came directly to /login url
      // if access to admin portal ==> admin portal, if access to developer portal ==> developer portal, if no access ==> developer portal
      if(AuthHelper.isAuthorizedToAccessAdminPortal(authorizedResourcePathsAsString)) {
        originAppState = EAppState.ADMIN_PORTAL; 
        newCurrentAppState = EAppState.ADMIN_PORTAL;
      } else if(AuthHelper.isAuthorizedToAccessDeveloperPortal(authorizedResourcePathsAsString)) {
        originAppState = EAppState.DEVELOPER_PORTAL; 
        newCurrentAppState = EAppState.DEVELOPER_PORTAL;
      } else {
        originAppState = EAppState.DEVELOPER_PORTAL; 
        newCurrentAppState = EAppState.DEVELOPER_PORTAL;
        // throw new Error(`${logName}: user not authorized to access developer portal nor admin portal.\nauthContext=${JSON.stringify(authContext, null, 2)}\nuserContext=${JSON.stringify(userContext, null, 2)}`);
      }
    }
    dispatchUserContextAction({ type: 'SET_ORIGIN_APP_STATE', appState: originAppState});
    dispatchUserContextAction({ type: 'SET_CURRENT_APP_STATE', appState: newCurrentAppState});
    navigateTo(Globals.getCurrentHomePath(true, newCurrentAppState));
  }

  public async setup_Contexts({
    apLoginUserDisplay,
    organizationEntityId,
    isConnectorAvailable,
    dispatchAuthContextAction,
    userContextCurrentAppState,
    userContextOriginAppState,
    dispatchUserContextAction,
    dispatchOrganizationContextAction,
    navigateTo,
    onLoadingChange,
  }:{
    apLoginUserDisplay: TAPLoginUserDisplay;
    organizationEntityId: TAPEntityId | undefined;
    isConnectorAvailable: boolean;
    dispatchAuthContextAction: React.Dispatch<AuthContextAction>;
    userContextCurrentAppState: EAppState;
    userContextOriginAppState: EAppState;
    dispatchUserContextAction: React.Dispatch<UserContextAction>;
    dispatchOrganizationContextAction: React.Dispatch<TOrganizationContextAction>;
    navigateTo: (path: string) => void;
    onLoadingChange: (isLoading: boolean) => void;
  }): Promise<void> {

    const internalNavigateTo = (path: string) => {
      onLoadingChange(false);
      navigateTo(path);
    }

    onLoadingChange(true);

    const authorizedResourcePathsAsString: string = await APRbacDisplayService.create_AuthorizedResourcePathListAsString({
      apLoginUserDisplay: apLoginUserDisplay,
      organizationId: organizationEntityId?.id
    });
  
    await this.setup_AuthContext({
      apLoginUserDisplay: apLoginUserDisplay,
      authorizedResourcePathsAsString: authorizedResourcePathsAsString,
      dispatchAuthContextAction: dispatchAuthContextAction
    });

    await this.setup_OrganizationContext({
      organizationEntityId: organizationEntityId,
      isConnectorAvailable: isConnectorAvailable,
      dispatchUserContextAction: dispatchUserContextAction,
      dispatchOrganizationContextAction: dispatchOrganizationContextAction
    });

    this.setup_App({
      isConnectorAvailable: isConnectorAvailable,
      authorizedResourcePathsAsString: authorizedResourcePathsAsString,
      userContextCurrentAppState: userContextCurrentAppState,
      userContextOriginAppState: userContextOriginAppState,
      dispatchUserContextAction: dispatchUserContextAction,
      navigateTo: internalNavigateTo
    });

  }

  public clear_Contexts({
    dispatchAuthContextAction,
    dispatchUserContextAction,
    dispatchOrganizationContextAction,
  }:{
    dispatchAuthContextAction: React.Dispatch<AuthContextAction>;
    dispatchUserContextAction: React.Dispatch<UserContextAction>;
    dispatchOrganizationContextAction: React.Dispatch<TOrganizationContextAction>;
  }): void {

    dispatchAuthContextAction({ type: 'CLEAR_AUTH_CONTEXT' });
    dispatchUserContextAction({ type: 'CLEAR_USER_CONTEXT' });
    dispatchOrganizationContextAction({ type: 'CLEAR_ORGANIZATION_CONTEXT' });

  }
  
}

export default new APContextsDisplayService();
