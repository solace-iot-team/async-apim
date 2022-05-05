import express from 'express';
import { ApsUserInfoController } from './ApsUserInfoController';


export default express
  .Router()
  .get('/', ApsUserInfoController.info)
