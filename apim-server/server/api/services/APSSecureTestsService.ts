import { 
  APSSecureTestResponse,
 } from '../../../src/@solace-iot-team/apim-server-openapi-node';


export class APSSecureTestsService {
  // private static collectionName = "apsUsers";
  // private static collectionName = APSUsersService.getCollectionName();
  // private persistenceService: MongoPersistenceService;
  // private collectionMutex = new Mutex();

  constructor() {
    // this.persistenceService = new MongoPersistenceService(APSSessionService.collectionName); 
    // APSOrganizationsServiceEventEmitter.on('deleted', this.onOrganizationDeleted);
  }


  public test = async(): Promise<APSSecureTestResponse> => {
    const response: APSSecureTestResponse = {
      success: true
    };
    return response;
  }
  
}

export default new APSSecureTestsService();
