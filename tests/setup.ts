import config from './test.settings.json';
import { DbContext } from '../src/config/db.config';

async function reassign() {
  process.env = Object.assign(process.env, {
    ...config.Values
  });
  try {
    console.log('SETUP - Load default connection');
    await loadDefaultConnection();
  } catch (error) {
    console.log(error);
  }
}

async function loadDefaultConnection() {
  if (!DbContext.isInitialised()) {
    await DbContext.initialise();
  }
}

export default reassign;
