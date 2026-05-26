import pino, { type LoggerOptions } from 'pino';

import { env, isProd } from './env';

const options: LoggerOptions = {
  level: env.LOG_LEVEL,
  base: { service: 'twinspire-api', env: env.NODE_ENV },
  timestamp: pino.stdTimeFunctions.isoTime,
  redact: {
    paths: [
      'req.headers.authorization',
      'req.headers.cookie',
      'res.headers["set-cookie"]',
      '*.password',
      '*.token',
      '*.accessToken',
      '*.refreshToken',
      '*.secret',
    ],
    censor: '[REDACTED]',
  },
  formatters: {
    level: (label) => ({ level: label }),
  },
};

export const logger = env.LOG_PRETTY && !isProd
  ? pino({
      ...options,
      transport: {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:HH:MM:ss.l',
          ignore: 'pid,hostname,service,env',
          singleLine: false,
        },
      },
    })
  : pino(options);

export type Logger = typeof logger;
