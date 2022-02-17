import APSId = Components.Schemas.APSId;
import { TypedEmitter } from 'tiny-typed-emitter';

interface APSExternalSystemsServiceEvents {
  'deleted': (apsOrganizationId: APSId, apsExternalSystemId: APSId) => void;
}

class APSExternalSystemssServiceEventEmitter extends TypedEmitter<APSExternalSystemsServiceEvents> {
  constructor() { super(); }
}

export default new APSExternalSystemssServiceEventEmitter();
