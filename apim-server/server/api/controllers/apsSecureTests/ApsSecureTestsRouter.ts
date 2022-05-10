import express from 'express';
import { ApsSecureTestsController } from './ApsSecureTestsController';

const get_test = '/test';

export default express
  .Router()
  .get(get_test, ApsSecureTestsController.test)

