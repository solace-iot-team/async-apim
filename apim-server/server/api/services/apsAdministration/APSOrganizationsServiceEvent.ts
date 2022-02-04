import APSId = Components.Schemas.APSId;
import { TypedEmitter } from 'tiny-typed-emitter';

interface APSOrganizationsServiceEvents {
  'deleted': (apsOrganizationId: APSId) => void;
}

class APSOrganizationsServiceEventEmitter extends TypedEmitter<APSOrganizationsServiceEvents> {
  constructor() { super(); }
}

export default new APSOrganizationsServiceEventEmitter();
