
export type TConnectionTestDetails = {
  lastTested: number;
  success: boolean;
  error?: any;
}
export type TServerStatus = {
  isReady: boolean;
  isInitialized: boolean;
  isBootstrapped: boolean;
  dbConnectionTestDetails?: TConnectionTestDetails;
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

  public setDBConnectionTestDetails = (testDetails: TConnectionTestDetails) => {
    this.serverStatus.dbConnectionTestDetails = testDetails;
    if(!testDetails.success) {
      this.serverStatus.isReady = false;
    }
  }

}

export default new ServerStatus();