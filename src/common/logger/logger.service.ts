import { Injectable } from "@nestjs/common";
import { createLogger, format, Logger, transport, transports } from "winston";

@Injectable()
export class LoggerService {
    private logger: Logger;

    constructor() {
        this.logger = createLogger({
            level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
            format: format.combine(
                format.timestamp({format: 'YYYY-MM-DD HH:mm:ss'}),
                format.errors({stack: true}),
                format.splat(),
                format.json(),
                format.printf(({
                    level, message, timestamp, stack, ...meta
                }) => {
                    const metaStr = Object.keys(meta).length ? JSON.stringify(meta) : '';
                    const stackStr = stack ? `\n${stack}` : '';
                    return `${timestamp} [${level.toUpperCase()}]: ${message} ${metaStr}${stackStr}`;
                }) ,
            ),
            transports: [
                new transports.Console({
                    format: format.combine(
                        format.colorize(),
                        format.printf(({ level, message, timestamp, stack, ...meta }) => {
                            const metaStr = Object.keys(meta).length ? JSON.stringify(meta, null, 2) : '';
                            const stackStr = stack ? `\n${stack}` : '';
                            return `${timestamp} [${level}]: ${message} ${metaStr}${stackStr}`;
                        }),
                    ),
                }),
                new transports.File({
                    filename: 'logs/error.log',
                    level: 'error',
                    format: format.combine(
                        format.timestamp(),
                        format.json(),
                    ),
                }),
                new transports.File({
                    filename: 'logs/combined.log',
                    format: format.combine(
                        format.timestamp(),
                        format.json(),
                    ),
                }),
            ]
        })
    }

    log(message: string, context?: string, meta?: any) {
        this.logger.info(message, { context, ...meta });
    }

    error(message: string, trace?: string, context?: string, meta?: any) {
        this.logger.error(message, { trace, context, ...meta });
    }

    warn(message: string, context?: string, meta?: any) {
        this.logger.warn(message, { context, ...meta });
    }

    debug(message: string, context?: string, meta?: any) {
        this.logger.debug(message, { context, ...meta });
    }

    verbose(message: string, context?: string, meta?: any) {
        this.logger.verbose(message, { context, ...meta });
    }

    getLogger(): Logger {
        return this.logger;
    }
}