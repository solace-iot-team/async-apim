import express from 'express';
import { ApsBusinessGroupsController } from './ApsBusinessGroupsController';
export default express
  .Router()
  .get('/:organization_id', ApsBusinessGroupsController.all)
  .get('/:organization_id/:businessgroup_id', ApsBusinessGroupsController.byId)
  .post('/:organization_id', ApsBusinessGroupsController.create)
  .patch('/:organization_id/:businessgroup_id', ApsBusinessGroupsController.update)
  .delete('/:organization_id/:businessgroup_id', ApsBusinessGroupsController.delete)


