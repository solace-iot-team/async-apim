import { TypedEmitter } from 'tiny-typed-emitter';

interface APSOrganizationsServiceEvents {
  'deleted': (organizationId: string) => void;
  'created': (organizationId: string, displayName: string) => void;
}

class APSOrganizationsServiceEventEmitter extends TypedEmitter<APSOrganizationsServiceEvents> {
  constructor() { super(); }
}

export default new APSOrganizationsServiceEventEmitter();
