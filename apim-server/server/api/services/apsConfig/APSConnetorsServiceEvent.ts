import { TypedEmitter } from 'tiny-typed-emitter';

interface APConnectorsServiceEvents {
  'activeChanged': (connectorId: string) => void;
}

class APSConnectorsServiceEventEmitter extends TypedEmitter<APConnectorsServiceEvents> {
  constructor() { super(); }
}

export default new APSConnectorsServiceEventEmitter();
