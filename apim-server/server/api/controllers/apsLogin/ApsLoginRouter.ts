import express from 'express';
import { ApsLoginController } from './ApsLoginController';
export default express
  .Router()
  .post('/login', ApsLoginController.login)


