
export interface IAPSearchContent {
  apSearchContent: string;
}

class APSearchContentService {
  // private readonly ComponentName = "APSearchContentService";

  // private generateSearchContentString = (source: any, result: string = ''): string => {
  //   const isObject = (obj:any ) => obj && typeof obj === 'object';
  //   Object.keys(source).forEach( key => {
  //     const value = source[key];
  //     if (Array.isArray(value)) {
  //       value.forEach( (elem) => {
  //         result += this.generateSearchContentString(elem);
  //       });
  //     }
  //     else if (isObject(value)) result += this.generateSearchContentString(value);
  //     // else if(typeof value === 'string') result += value !== undefined ? value + ',' + value.toLowerCase() + ',' : '';
  //     else if(typeof value === 'string') result += value + ',' + value.toLowerCase() + ',';
  //   });
  //   return result;
  // }

  /**
   * 
   * @param source - must be an object or string to start with, cannot start with array 
   * @param result 
   * @returns result
  */
  private generateSearchContentString = (source: any, result: string = ''): string => {
    const isObject = (obj:any ) => obj && typeof obj === 'object' && !Array.isArray(obj);
    const isArray = (obj:any) => obj && Array.isArray(obj) && typeof obj !== 'string';
    const isString = (obj:any) => obj && typeof obj === 'string';
    if(source === undefined || source === null) return result;
    if(isString(source)) return result += source.toLowerCase() + ',';
    if(!isObject(source)) return result;
    for(const key of Object.keys(source)) {
      const value = source[key];
      if (isArray(value) && value.length > 0) {
        for(const elem of value) {
          result += this.generateSearchContentString(elem);
        }
      }
      else result += this.generateSearchContentString(value);
    }
    return result;
  }

  public add_SearchContent<T extends IAPSearchContent>(apObject: T): T {
    apObject.apSearchContent = this.generateSearchContentString(apObject).toLowerCase();
    return apObject;
  }

}

export default new APSearchContentService();
