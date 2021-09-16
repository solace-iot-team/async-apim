
import { EServerStatusCodes, ServerLogger } from '../../common/ServerLogger';
import ExampleList = Components.Schemas.ExampleList;

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

  public all = async(): Promise<TAPSExampleListResponse> => {
    return {
      totalCount: exampleList.length,
      list: exampleList
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
