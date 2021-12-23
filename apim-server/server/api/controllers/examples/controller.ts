import { Request, Response, NextFunction } from 'express';
import ExamplesService from '../../services/examples.service';
import { TAPSExampleListResponse } from '../../services/examples.service';

import ListExamplesResponses = Paths.ListExamples.Responses;
import ListExamplesWebhooksResponses = Paths.ListExamplesWebhooks.Responses;

export class ExamplesController {

  public static all = (_req: Request, res: Response, next: NextFunction): void => {
    ExamplesService.all()
    .then( (r: TAPSExampleListResponse) => {
      res.set({
        'X-Total-Count': 3
        // 'X-Total-Count': "3fff"
      });
      // res.set('Access-Control-Expose-Headers', ['x-hello', 'X-Total-Count']);

      const listExamples200: ListExamplesResponses.$200 = r.list;
      res.status(200).json(listExamples200);
    })
    .catch( (e) => {
      next(e);
    });
  }

  public static totalCount = (_req: Request, res: Response, next: NextFunction): void => {
    ExamplesService.all()
    .then( (_r: TAPSExampleListResponse) => {
      res.set({
        'X-Total-Count': 3
      });
      // res.set('Access-Control-Expose-Headers', ['x-hello', 'X-Total-Count']);
      res.status(200).send();
    })
    .catch( (e) => {
      next(e);
    });
  }

  
  public static getWebhooks = (_req: Request, res: Response, next: NextFunction): void => {
    ExamplesService.getWebhooks()
    .then( (r: Array<Components.Schemas.ExampleWebHook> ) => {
      const listExamples200: ListExamplesWebhooksResponses.$200 = r;
      res.status(200).json(listExamples200);
    })
    .catch( (e: any) => {
      next(e);
    });
  }

  
  // byId(req: Request, res: Response): void {
  //   const id = Number.parseInt(req.params['id']);
  //   ExamplesService.byId(id).then((r) => {
  //     if (r) res.json(r);
  //     else res.status(404).end();
  //   });
  // }

  // create(req: Request, res: Response): void {
  //   ExamplesService.create(req.body.name).then((r) =>
  //     res.status(201).location(`/api/v1/examples/${r.id}`).json(r)
  //   );
  // }
}
  