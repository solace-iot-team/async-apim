import { TypedEmitter } from 'tiny-typed-emitter';

interface IAPSExternalSystemsServiceEvents {
  'deleted': (apsOrganizationId: string, apsExternalSystemId: string) => void;
  // enable when wait emitting is solved
  // 'await_request_delete': (apsOrganizationId: string, apsExternalSystemId: string, resolveCallback: (value: unknown) => void, rejectCallback: (reason: any) => void) => void;
}

class APSExternalSystemsServiceEventEmitter extends TypedEmitter<IAPSExternalSystemsServiceEvents> {
  constructor() { super(); }
}

export default new APSExternalSystemsServiceEventEmitter();
