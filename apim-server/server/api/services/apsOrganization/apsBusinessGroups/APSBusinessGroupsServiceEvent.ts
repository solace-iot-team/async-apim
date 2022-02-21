import { TypedEmitter } from 'tiny-typed-emitter';

interface IAPSBusinessGroupsServiceEvents {
  'deleted': (apsOrganizationId: string, apsBusinessGroupId: string) => void;
}

class APSBusinessGroupsServiceEventEmitter extends TypedEmitter<IAPSBusinessGroupsServiceEvents> {
  constructor() { super(); }
}

export default new APSBusinessGroupsServiceEventEmitter();
