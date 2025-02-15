import { Notifier } from '@airbrake/node';

export class AirBrake {

  public static async notify(ex) {
    if (ex) {
      if (process.env['ENV'] != 'LOCAL') {
        try {

          const airbrakeConfig = {
            projectId: process.env['AIRBREAK_PROJECT_ID'] as unknown as number,
            projectKey: process.env['AIRBREAK_PROJECT_KEY'],
            environment: process.env['AIRBREAK_ENV']
          };

          console.log('airbrakeConfig', airbrakeConfig);
          const airBrake = new Notifier(airbrakeConfig);
          
          await airBrake.notify(ex);
        }catch(err) {
          console.log('airBrake Failure', err);
          console.log('orig error', ex);
        }
      }
    }
  }

}