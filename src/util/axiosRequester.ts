import axios from 'axios';
import apiLogger from '../logger/api.logger';

export class AxiosRequester {
  async makeGetCall(URL, headers = {}) {
    try {
      const result = await axios.get(URL, { headers: headers });
      return result.data;
    } catch (error) {
      console.log(error);
      apiLogger.error(`Error in axios - staus = ${error}, error - ${error}.`);
      // throw error;
      return false;
    }
  }

  async makePostCall(URL, postData, headers = {}) {
    try {
      const result = await axios.post(URL, postData, { headers: headers });
      return result.data;
    } catch (error) {
      console.log(error);
      apiLogger.error(`Error in axios - staus = ${error}, error - ${error}.`);
      // throw error;
      return false;
    }
  }

  async makePutCall(URL, putData, headers = {}) {
    try {
      const result = await axios.put(URL, putData, { headers: headers });
      return result.data;
    } catch (error) {
      console.log(error);
      apiLogger.error(
        `Error in axios - staus = ${error.response ? error : error}, error - ${
          error.response ? error.message : error
        }.`
      );
      // throw error;
      return false;
    }
  }

  async makePatchCall(URL, patchData, headers = {}) {
    try {
      const result = await axios.patch(URL, patchData, { headers: headers });
      return result.data;
    } catch (error) {
      console.log(error);
      apiLogger.error(`Error in axios - staus = ${error}, error - ${error}.`);
      // throw error;
      return false;
    }
  }

  async makeDeleteCall(URL, headers = {}) {
    try {
      const result = await axios.delete(URL, { headers: headers });
      return result.data;
    } catch (error) {
      console.log(error);
      apiLogger.error(`Error in axios - staus = ${error}, error - ${error}.`);
      // throw error;
      return false;
    }
  }
}
