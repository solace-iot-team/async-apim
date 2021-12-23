
import React from "react";

import { ClientOptions, ClientOptionsGuaranteedMessaging } from "@solace-iot-team/apim-connector-openapi-browser";

import "../APComponents.css";

export interface IAPDisplayClientOptionsProps {
  clientOptions?: ClientOptions;
  className?: string;
}

export const APDisplayClientOptions: React.FC<IAPDisplayClientOptionsProps> = (props: IAPDisplayClientOptionsProps) => {
  // const componentName='APDisplayClientOptions';

  const NoClientOptionsMessage = 'Not defined';
  const [jsxElement, setJsxElement] = React.useState<JSX.Element>();

  const createJsxElement = (content: JSX.Element): JSX.Element => {
    return (
      <div className={props.className ? props.className : 'card'}>
        {content}
      </div>
    );
  }

  const createGuaranteedMessagingJsxElement = (cogm?: ClientOptionsGuaranteedMessaging): JSX.Element => {
    const createGMString = (cogm: ClientOptionsGuaranteedMessaging): string => {
      let s: string = `${cogm.requireQueue ? 'enabled' : 'Not available.'}`;
      if(cogm.requireQueue) {
        s += ` (queue access=${cogm.accessType}, max TTL (secs)=${cogm.maxTtl}, max spool (MB)=${cogm.maxMsgSpoolUsage})`;
      }
      return s;
    }
    if(cogm) {
      return(
        <li>
          <b>Guaranteed Messaging: </b>
          {createGMString(cogm)}
        </li>
      );
    } else {
      return (
        <li>
          <b>Guaranteed Messaging: </b>
          Not available.
        </li>
      );
    }
  }
  const doInitialize = () => {
    if(props.clientOptions) {
      setJsxElement(createGuaranteedMessagingJsxElement(props.clientOptions.guaranteedMessaging));
    } else {
      setJsxElement(createJsxElement(<p>{NoClientOptionsMessage}</p>));
    }
  }

  React.useEffect(() => {
    doInitialize();
  }, []); /* eslint-disable-line react-hooks/exhaustive-deps */

  return (
    <div className={props.className ? props.className : 'card'}>
      <ul style={{ "listStyle": "disc" }}>
        { jsxElement }
      </ul>
    </div>
  );
}
