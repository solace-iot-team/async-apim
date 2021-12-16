
export type TServerStatus = {
  isReady: boolean;
  isInitialized: boolean;
  isBootstrapped: boolean;
}

export class ServerStatus {
  private serverStatus: TServerStatus;

  constructor() { 
    this.serverStatus = {
      isReady: false,
      isInitialized: false,
      isBootstrapped: false
    }
  }

  public getStatus = (): TServerStatus => {
    return this.serverStatus;
  };

  public setIsReady = () => {
    this.serverStatus.isReady = true;
  }
  
  public setIsInitialized = () => {
    this.serverStatus.isInitialized = true;
  }

  public setIsBootstrapped = () => {
    this.serverStatus.isBootstrapped = true;
    this.serverStatus.isReady = true;
  }
}

export default new ServerStatus();