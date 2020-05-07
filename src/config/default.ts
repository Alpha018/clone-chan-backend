import path from 'path';
import { readFileSync } from 'fs';

const config = {
  env: process.env.NODE_ENV || 'development',
  sslPort: process.env.PORT || '3000',
  appName: process.env.APPLICATION_NAME || 'clone-chan',
  httpOptions: {},
  httpsOptions: {
    key: process.env.HTTPS_KEY || readFileSync(
      path.join(__dirname, '..', '..', 'etc', 'ssl', 'server.key'),
    ).toString(),
    cert: process.env.HTTPS_CERT || readFileSync(
      path.join(__dirname, '..', '..', 'etc', 'ssl', 'server.crt'),
    ).toString(),
  },
  mongo: {
    uri: process.env.MONGODB_URI || '',
    host: process.env.MONGO_HOST || 'localhost',
    port: process.env.MONGO_PORT || '27017',
    user: process.env.MONGO_USER || '',
    password: process.env.MONGO_PASSWORD || '',
    database: process.env.MONGO_DATABASE || 'clients',
  },
  s3: {
    endpint: process.env.SPACE_ENDPOINT,
    accessKey: process.env.SPACE_ACCESS_KEY,
    secretKey: process.env.SPACE_SECRET_KEY,
    bucket: process.env.SPACE_BUCKET,
  },
  api: {
    ipInformationBaseUrl: process.env.APPLICATION_IP_INFORMATION || 'http://ip-api.com/json',
    returnedInformationCode: process.env.APPLICATION_IP_INFORMATION_CODE || 3403775,
  },
};

export default config;
