import express from 'express';
import { ApsServiceAccountsController } from './ApsServiceAccountsController';
export default express
  .Router()
  .get('/', ApsServiceAccountsController.all)
  .get('/:service_account_id', ApsServiceAccountsController.byId)
  .post('/', ApsServiceAccountsController.create)
  .delete('/:service_account_id', ApsServiceAccountsController.delete)


