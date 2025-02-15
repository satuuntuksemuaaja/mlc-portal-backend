import pine from 'pine';

/**
 * calling of pine function
 */
const logger = pine();

export class APILogger {
  /**
   * Logs info message with data(if exists)
   * @param message
   * @param data
   */
  info(message, data) {
    logger.info(
      `${message}   ${undefined != data ? JSON.stringify(data) : ''}`
    );
  }
  /**
   * Logs error message
   * @param message
   */
  error(message) {
    logger.error(message);
  }
}

const apiLogger: APILogger = new APILogger();
export default apiLogger;
