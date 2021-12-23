import express from 'express';
import { ApsAboutController } from './ApsAboutController';
export default express
  .Router()
  .get('/', ApsAboutController.about)


