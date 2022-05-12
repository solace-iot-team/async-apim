import express from 'express';
import { ApsSessionController } from './ApsSessionController';

const get_logout = '/logout';
const post_logoutAll = '/logoutAll';

export default express
  .Router()
  .get(get_logout, ApsSessionController.logout)
  .post(post_logoutAll, ApsSessionController.logoutAll)

