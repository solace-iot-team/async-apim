import { TypedEmitter } from 'tiny-typed-emitter';

interface APSExternalSystemsServiceEvents {
  'deleted': (apsOrganizationId: string, apsExternalSystemId: string) => void;
  'await_request_delete': (apsOrganizationId: string, apsExternalSystemId: string, resolveCallback: (value: unknown) => void, rejectCallback: (reason: any) => void) => void;
}

class APSExternalSystemsServiceEventEmitter extends TypedEmitter<APSExternalSystemsServiceEvents> {
  constructor() { super(); }
}

export default new APSExternalSystemsServiceEventEmitter();
