import React from "react";
import { GlobalErrorPage } from "../../pages/GlobalErrorPage";
import { APError } from "../../utils/APError";
import { APLogger } from "../../utils/APLogger";


export interface IAPCatchAllProps {}

interface IAPCatchAllState {
  hasError: boolean;
  error: Error | undefined;
  errorInfo: React.ErrorInfo | undefined;
}

export class APCatchAll extends React.Component<IAPCatchAllProps, IAPCatchAllState> {
  private static className = 'CatchAll';

  constructor(props: IAPCatchAllProps) {
    super(props);
    this.state = { 
      hasError: false,
      error: undefined,
      errorInfo: undefined
    };
  }

  public static getDerivedStateFromError = (error: any): Partial<IAPCatchAllState> => {
    // Update state so the next render will show the fallback UI.
    return { 
      hasError: true,
    };
  }

  public componentDidCatch = (error: Error, errorInfo: React.ErrorInfo): void => {
    const funcName = 'componentDidCatch';
    const logName = `${APCatchAll.className}.${funcName}()`;
    this.setState({
      error: error,
      errorInfo: errorInfo
    });

    let apError: APError;
    if(error) {
      apError = new APError(logName, error.message ? error.message : 'no message', error.name ? error.name : 'unknown error');
    } else {
      apError = new APError(logName, 'error is undefined', 'unknown error');
    }
    APLogger.error(APLogger.createLogEntry(logName, { apError: apError.toObject(), errorInfo: errorInfo}));
  }

  render() {
    if (this.state.hasError) {
      return (
        <GlobalErrorPage
          errorStr={this.state.error ? this.state.error.toString() : 'undefined'}
          errorInfo={this.state.errorInfo}
        />
      );
    }

    return this.props.children; 
  }
}
