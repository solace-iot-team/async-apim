
class APSSecretsService {

  public createHash(secret: string): string {
    // create salted hash
    return secret;
  }

  public isMatch({ secret, hashed }:{
    secret: string;
    hashed: string;
  }): boolean {
    // create salted hash of secret and compare
    return  secret === hashed;
  }

  
}

export default new APSSecretsService();