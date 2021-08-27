import { APClientConnectorOpenApi } from "./APClientConnectorOpenApi";
import { APSApiError } from "./APSClient";
import { APSClientOpenApi } from "./APSClientOpenApi";
import { APSError, APSErrorIds } from '@solace-iot-team/apim-server-openapi-browser';

export type TApiCallState = {
  success: boolean;
  isAPSApiError?: boolean;
  isConnectorApiError?: boolean,
  error?: any;
  context: {
    action: string;
    userDetail?: string;
  }  
}

export class ApiCallState {

  public static getInitialCallState = (action: string, userDetail: any): TApiCallState => {
    return {
      success: true,
      context: {
        action: action,
        userDetail: userDetail
      }
    }
  }

  public static addErrorToApiCallState = (err: any, apiCallState: TApiCallState): TApiCallState => {
    apiCallState.success = false;
    apiCallState.isAPSApiError = APSClientOpenApi.isInstanceOfApiError(err);
    apiCallState.isConnectorApiError = APClientConnectorOpenApi.isInstanceOfApiError(err);
    if(apiCallState.isAPSApiError || apiCallState.isConnectorApiError ) apiCallState.error = err;
    else apiCallState.error = err.toString();
    return apiCallState;
  }

  public static getUserErrorMessageFromApiCallState = (apiCallStatus: TApiCallState): string => {
    const funcName = 'getUserErrorMessageFromApiCallState';
    const logName = `${ApiCallState.name}.${funcName}()`;
    // console.log(`${logName}: apiCallStatus=${JSON.stringify(apiCallStatus, null, 2)}`);
    if(apiCallStatus.success) return '';
    if(apiCallStatus.isAPSApiError && apiCallStatus.error) {
      const apsApiError: APSApiError = apiCallStatus.error;
      // console.log(`${logName}: apsApiError=${JSON.stringify(apsApiError, null, 2)}`);
      // body may not be a json but could be text
      if('body' in apsApiError) {
        try {
          const bodyJsonStr = JSON.stringify(apsApiError.body);
          const apsError: APSError = apsApiError.body;
          let userMessage: string;
          if(apiCallStatus.context.userDetail) {
            userMessage = `${apiCallStatus.context.userDetail}. ${ApiCallState.getUserErrorMessageDescriptionByErrorId(apsError)}.`;
          } else {
            userMessage = apsApiError.statusText;
            const userDescription: string | undefined= ApiCallState.getUserErrorMessageDescriptionByErrorId(apsError);
            userMessage += userDescription ? `: ${userDescription}`: '';  
          }
          return userMessage;
          // if('error' in apiCallStatus.error.body && 'description' in apiCallStatus.error.body.error) {
          //   // console.log(`${logName}: apiCallStatus.error.body.error=${JSON.stringify(apiCallStatus.error.body.error)}`);
          //   let message: string = apiCallStatus.error.body.error.description;
          //   if( 'details' in apiCallStatus.error.body.error && 
          //       Object.keys(apiCallStatus.error.body.error.details).length > 0 ) {
          //         message = message + '\n' + JSON.stringify(apiCallStatus.error.body.error.details);
          //         return message;
          //       }
          // } else {
          //   if('statusText' in apiCallStatus.error) return apiCallStatus.error.statusText;
          //   else return 'Internal Server Error';  
          // }
        } catch (jsonParseError) {
          // console.log(`${logName}: jsonParseError=${jsonParseError}`);
          if('statusText' in apsApiError) return apsApiError.statusText;
          else return 'Internal Server Error';
        }
      }  
    }
    if(apiCallStatus.isConnectorApiError && apiCallStatus.error) {
        if('body' in apiCallStatus.error) {
          return JSON.stringify(apiCallStatus.error.body);
        }
    }
    if(apiCallStatus.error) {
      return apiCallStatus.error;
    }
    return apiCallStatus.context.userDetail ? apiCallStatus.context.userDetail : 'unknown error';
  }  

  private static getUserErrorMessageDescriptionByErrorId = (apsError: APSError): string | undefined => {
    const funcName = 'getUserErrorMessageDescriptionByErrorId';
    const logName = `${ApiCallState.name}.${funcName}()`;
    // console.log(`${logName}: apsError=${JSON.stringify(apsError, null, 2)}`);
    switch(apsError.errorId) {
      case APSErrorIds.OPEN_API_REQUEST_VALIDATION:
        if(apsError.meta) {
          return apsError.description + '\n' + JSON.stringify(apsError.meta.errors, null, 2);
        } else return apsError.description;
      case APSErrorIds.DUPLICATE_KEY:
        return `${apsError.description}. id=${apsError.meta?.id}`;
      default:
        return apsError.description;
    }
  }
}
