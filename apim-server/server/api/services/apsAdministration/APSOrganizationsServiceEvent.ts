import { TypedEmitter } from 'tiny-typed-emitter';
import { 
  APSOrganization,
} from '../../../../src/@solace-iot-team/apim-server-openapi-node';

interface APSOrganizationsServiceEvents {
  'deleted': (organizationId: string) => void;
  'created': (organizationId: string, apsOrganization: APSOrganization) => void;
  'updated': (organizationId: string, apsOrganization: APSOrganization) => void;
}

class APSOrganizationsServiceEventEmitter extends TypedEmitter<APSOrganizationsServiceEvents> {
  constructor() { super(); }
}

export default new APSOrganizationsServiceEventEmitter();
