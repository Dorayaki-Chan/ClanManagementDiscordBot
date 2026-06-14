import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

const fmt = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.printf(({ timestamp, level, label, message }) =>
        `${timestamp} [${String(level).toUpperCase().padEnd(5)}] [${label ?? 'App'}] ${message}`
    )
);

const logger = winston.createLogger({
    level: process.env.LOG_LEVEL ?? 'info',
    format: fmt,
    transports: [
        new winston.transports.Console({ format: fmt }),
        new DailyRotateFile({
            filename: 'logs/bot-%DATE%.log',
            datePattern: 'YYYY-MM-DD',
            maxFiles: '14d',
            level: 'info',
        }),
        new DailyRotateFile({
            filename: 'logs/error-%DATE%.log',
            datePattern: 'YYYY-MM-DD',
            maxFiles: '30d',
            level: 'error',
        }),
    ],
});

export function getLogger(label: string) {
    return logger.child({ label });
}

export default logger;
