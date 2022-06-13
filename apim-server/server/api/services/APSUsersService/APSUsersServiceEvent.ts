import { TypedEmitter } from 'tiny-typed-emitter';
import { APSUserResponse, APSUserUpdate } from '../../../../src/@solace-iot-team/apim-server-openapi-node';

interface APSUsersServiceEvents {
  'deleted': (userId: string) => void;
  'created': (userId: string) => void;
  'updated': (apsUserUpdate: APSUserUpdate, apsUserResponse: APSUserResponse) => void;
}

class APSUsersServiceEventEmitter extends TypedEmitter<APSUsersServiceEvents> {
  constructor() { super(); }
}

export default new APSUsersServiceEventEmitter();
