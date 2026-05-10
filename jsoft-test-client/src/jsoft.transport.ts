import Transport from 'winston-transport';
import axios from 'axios';

export class JSoftTransport extends Transport {
  constructor(opts?: any) {
    super(opts);
  }

  log(info: any, callback: () => void) {
    if (info.logData) {
      const backendUrl = process.env.BACKEND_URL || 'http://backend:3005';
      axios
        .post(`${backendUrl}/api/logs`, info.logData)
        .catch((err) =>
          console.error('Error sending to JSoft Monitor:', err.message),
        );
    }

    if (callback) {
      callback();
    }
  }
}
