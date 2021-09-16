import express from 'express';
import { ExamplesController } from './controller';
export default express
  .Router()
  // .post('/', controller.create)
  .get('/', ExamplesController.all)
  .get('/totalCount', ExamplesController.totalCount)
  // .get('/:id', controller.byId);
 