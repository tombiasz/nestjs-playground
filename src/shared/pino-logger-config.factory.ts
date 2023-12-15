import { v4 } from 'uuid';
import type { Params as PinoLoggerParams } from 'nestjs-pino';
import type { AppConfig } from '../config';
import type { Options as PinoHttpOptions } from 'pino-http';

const corelationIdHeaderName = 'X-Correlation-Id';

export function pinoLoggerConfigFactory(config: AppConfig): PinoLoggerParams {
  let transport: PinoHttpOptions['transport'] = undefined;

  if (config.isDev()) {
    transport = {
      target: 'pino-pretty',
      options: {
        singleLine: true,
      },
    };
  }

  return {
    pinoHttp: {
      transport,
      level: config.isDev() ? 'debug' : 'info',
      customProps: () => ({
        app: process.env.npm_package_name,
        version: process.env.npm_package_version,
      }),
      customAttributeKeys: {
        reqId: 'correlationId',
      },
      // set correlation id for each request (pino request id / reqId)
      genReqId: (req, res) => {
        const existingID =
          req.id ?? req.headers[corelationIdHeaderName.toLowerCase()];

        if (existingID) return existingID;

        const id = v4();
        res.setHeader(corelationIdHeaderName, id);

        return id;
      },
      customReceivedMessage: () => 'request started',
      quietReqLogger: true, // do not propagate request info to child logger
      serializers: {
        req: (req) => ({
          method: req.method,
          url: req.url,
          headers: {
            'user-agent': req.headers['user-agent'],
            // expose more if needed, but watch out for auth header
          },
        }),
      },
    },
  };
}
