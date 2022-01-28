import express from 'express';
import { ApsOrganizationsController } from './ApsOrganizationsController';
export default express
  .Router()
  // .get('/', ApsConnectorsController.all)
  // .get('/:connector_id', ApsConnectorsController.byId)
  // .post('/', ApsConnectorsController.create)
  // .put('/:connector_id', ApsConnectorsController.replace)
  .delete('/:organization_id', ApsOrganizationsController.delete)


