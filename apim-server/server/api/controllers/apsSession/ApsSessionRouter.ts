import express from 'express';
import { ApsSessionController } from './ApsSessionController';

const get_logout = '/logout';
const get_test = '/test';

export default express
  .Router()
  .get(get_logout, ApsSessionController.logout)
  // test Jwt protected route
  .get(get_test, ApsSessionController.test)

