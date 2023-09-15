import { getAllDashboards, iterateDashboard, getDashboardsPanelsInfo, getDashboardImg } from './business_logic';
import 'dotenv/config';

const millisecondsInHour = 3600000;

const creds = `${process.env.LOGIN}:${process.env.PASSWORD}`;
const grafanaUrl = process.env.URL;

const headers = {
  Authorization: 'Basic ' + btoa(creds),
  'Content-Type': 'application/json',
  Accept: 'application/json',
};

console.log(creds, grafanaUrl);
