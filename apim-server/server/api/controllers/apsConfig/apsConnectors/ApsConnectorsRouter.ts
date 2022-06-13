import express from 'express';
import { ApsConnectorsController } from './ApsConnectorsController';
export default express
  .Router()
  .get('/', ApsConnectorsController.all)
  // public route
  // .get('/active', ApsConnectorsController.byActive)
  .get('/:connector_id', ApsConnectorsController.byId)
  .post('/', ApsConnectorsController.create)
  .put('/:connector_id', ApsConnectorsController.replace)
  .delete('/:connector_id', ApsConnectorsController.delete)
  .post('/:connector_id/active', ApsConnectorsController.setActive)


