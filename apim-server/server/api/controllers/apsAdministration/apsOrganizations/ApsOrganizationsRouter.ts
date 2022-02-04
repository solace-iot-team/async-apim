import express from 'express';
import { ApsOrganizationsController } from './ApsOrganizationsController';
export default express
  .Router()
  .get('/', ApsOrganizationsController.all)
  .get('/:organization_id', ApsOrganizationsController.byId)
  .post('/', ApsOrganizationsController.create)
  .patch('/:organization_id', ApsOrganizationsController.update)
  .delete('/:organization_id', ApsOrganizationsController.delete)


