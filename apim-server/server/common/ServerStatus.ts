
export type TConnectionTestDetails = {
  lastTested: number;
  success: boolean;
  error?: any;
}
export type TServerStatus = {
  isReady: boolean;
  isInitialized: boolean;
  isBootstrapped: boolean;
  lastModifiedTimestamp: number;
  dbConnectionTestDetails?: TConnectionTestDetails;
}

export class ServerStatus {
  private serverStatus: TServerStatus;

  constructor() { 
    this.serverStatus = {
      isReady: false,
      isInitialized: false,
      isBootstrapped: false,
      lastModifiedTimestamp: Date.now()
    }
  }

  public getStatus = (): TServerStatus => {
    return this.serverStatus;
  };

  public setIsReady = (isReady: boolean) => {
    this.serverStatus.isReady = isReady;
    this.serverStatus.lastModifiedTimestamp = Date.now();
  }
  
  public setIsInitialized = () => {
    this.serverStatus.isInitialized = true;
    this.serverStatus.lastModifiedTimestamp = Date.now();
  }

  public setIsBootstrapped = () => {
    this.serverStatus.isBootstrapped = true;
    // this.serverStatus.isReady = true;
    this.serverStatus.lastModifiedTimestamp = Date.now();
  }

  public setDBConnectionTestDetails = (testDetails: TConnectionTestDetails) => {
    this.serverStatus.dbConnectionTestDetails = testDetails;
    if(!testDetails.success) {
      this.setIsReady(false);
    }
  }

}

export default new ServerStatus();