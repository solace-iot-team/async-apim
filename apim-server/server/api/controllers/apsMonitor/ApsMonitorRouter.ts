import express from 'express';
import { ApsMonitorController } from './ApsMonitorController';
export default express
  .Router()
  .get('/apsStatus', ApsMonitorController.status)
  .get('/apsConnectorStatus', ApsMonitorController.connectorStatus)

