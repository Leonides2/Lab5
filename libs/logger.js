
import pino from 'pino';


const isDev = process.env.NODE_ENV !== 'production';

const logger = pino(
  isDev ? {
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        ignore: 'pid,hostname',
        translateTime: 'SYS:dd-mm-yyyy HH:MM:ss',
      }
    }} : {}
);

export default logger;
