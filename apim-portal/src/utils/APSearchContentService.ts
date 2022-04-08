
export interface IAPSearchContent {
  apSearchContent: string;
}

class APSearchContentService {
  private readonly ComponentName = "APSearchContentService";

  private generateSearchContentString = (source: any, result: string = ''): string => {
    const isObject = (obj:any ) => obj && typeof obj === 'object';
    Object.keys(source).forEach( key => {
      const value = source[key];
      if (Array.isArray(value)) {
        value.forEach( (elem) => {
          result += this.generateSearchContentString(elem);
        });
      }
      else if (isObject(value)) result += this.generateSearchContentString(value);
      // else if(typeof value === 'string') result += value !== undefined ? value + ',' + value.toLowerCase() + ',' : '';
      else if(typeof value === 'string') result += value + ',' + value.toLowerCase() + ',';
    });
    return result;
  }

  public add_SearchContent<T extends IAPSearchContent>(apObject: T): T {
    apObject.apSearchContent = this.generateSearchContentString(apObject).toLowerCase();
    return apObject;
  }

}

export default new APSearchContentService();
