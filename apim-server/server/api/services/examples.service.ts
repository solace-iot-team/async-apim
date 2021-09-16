
import { EServerStatusCodes, ServerLogger } from '../../common/ServerLogger';
import ExampleList = Components.Schemas.ExampleList;
import ExampleWebhook = Components.Schemas.ExampleWebHook;

const exampleList: ExampleList = [
  "example-1",
  "example-2",
  "example-3"
];

export type TAPSExampleListResponse = { 
  totalCount: number,
  list: ExampleList 
};

export class ExamplesService {
  private counter: number =0;

  public all = async(): Promise<TAPSExampleListResponse> => {
    return {
      totalCount: exampleList.length,
      list: exampleList
    }
  }

  public getWebhooks = async(): Promise<Array<ExampleWebhook>> => {
    let baseExampleWebhook: ExampleWebhook = {
      uri: 'http://my.callback.com/my-basic-auth',
      method: 'POST'
    }

    if(this.counter++ % 2 === 0) {
      // Basic Auth
     const exampleWebhook: ExampleWebhook = {
       ...baseExampleWebhook,
        authentication: {
          authMethod: 'Basic',
          username: 'username',
          password: 'password' 
        }
      }
      return [exampleWebhook];
    } else {
      // Header Auth
      const exampleWebhook: ExampleWebhook = {
        ...baseExampleWebhook,
          authentication: {
            authMethod: 'Header',
            headerName: 'headerName',
            headerValue: 'headerValue'
         }
       }
       return [exampleWebhook];
      }
    }
}

//   byId(id: number): Promise<Example> {
//     L.info(`fetch example with id ${id}`);
//     return this.all().then((r) => r[id]);
//   }

//   create(name: string): Promise<Example> {
//     L.info(`create example with name ${name}`);
//     const example: Example = {
//       id: id++,
//       name,
//     };
//     examples.push(example);
//     return Promise.resolve(example);
//   }
// }

export default new ExamplesService();
 