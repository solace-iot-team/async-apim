import express from 'express';
import { ApsUsersController } from './ApsUsersController';
export default express
  .Router()
  .get('/', ApsUsersController.all)
  .get('/:user_id', ApsUsersController.byId)
  .post('/', ApsUsersController.create)
  .patch('/:user_id', ApsUsersController.update)
  .delete('/:user_id', ApsUsersController.delete)


