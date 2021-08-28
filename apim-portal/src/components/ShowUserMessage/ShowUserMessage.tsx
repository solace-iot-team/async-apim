import React from 'react';
import { Toast } from 'primereact/toast';
import { UserContext } from '../UserContextProvider/UserContextProvider';

export interface IShowUserMessageProps {}

export const ShowUserMessage: React.FC<IShowUserMessageProps> = (props: IShowUserMessageProps) => {
  const componentName = 'ShowUserMessage';

  const toast = React.useRef<any>(null);
  const toastLifeSuccess: number = 1000;  
  const toastLifeError: number = 10000;  
  const [userContext, dispatchUserContextAction] = React.useContext(UserContext);

  const doShowUserMessage = () => {
    const funcName = 'doShowUserMessage';
    const logName = `${componentName}.${funcName}()`;
    if(!userContext.userMessage) throw new Error(`${logName}: userContext.userMessage is undefined`);
    const severity: string = userContext.userMessage.success ? 'success' : 'error';
    const summary: string = userContext.userMessage.success ? 'Success' : 'Error';
    const detail: string = userContext.userMessage.context.userAction + ':' + userContext.userMessage.context.userMessage;
    const toastLife: number = userContext.userMessage.success ? toastLifeSuccess : toastLifeError;
    toast.current.show({ severity: severity, summary: summary, detail: detail, life: toastLife });
  }

  React.useEffect(() => {
    if(userContext.userMessage) doShowUserMessage();
    dispatchUserContextAction({ type: 'CLEAR_USER_MESSAGE' });
    }, [userContext.userMessage]); /* eslint-disable-line react-hooks/exhaustive-deps */

  return (
    <React.Fragment>
      <Toast ref={toast} />
    </React.Fragment>
  );
}

