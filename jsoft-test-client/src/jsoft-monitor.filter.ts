import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import * as Sentry from '@sentry/node';

@Catch()
export class JSoftMonitorFilter implements ExceptionFilter {
  constructor(
    private readonly projectKey: string,
    private readonly logger: Logger,
  ) {}

  
  private maskSensitiveData(data: any): any {
    if (!data || typeof data !== 'object') return data;

    const sensitiveKeys = [
      'password',
      'token',
      'secret',
      'credit_card',
      'cvv',
      'auth',
    ];

    const maskedData = Array.isArray(data) ? [...data] : { ...data };

    for (const key in maskedData) {
      if (Object.prototype.hasOwnProperty.call(maskedData, key)) {
        const lowerKey = key.toLowerCase();
        const isSensitive = sensitiveKeys.some((k) => lowerKey.includes(k));

        if (isSensitive) {
          maskedData[key] = '*[СКРЫТО]*';
        } else if (typeof maskedData[key] === 'object') {
          maskedData[key] = this.maskSensitiveData(maskedData[key]);
        }
      }
    }
    return maskedData;
  }

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const stackLines = exception.stack?.split('\n') || [];
    const callerLine = stackLines[1] || '';

    const match =
      callerLine.match(/at\s+(.*)\s+\((.*):(\d+):(\d+)\)/) ||
      callerLine.match(/at\s+(.*):(\d+):(\d+)/);

    const fileLocation = match
      ? `${match[2].split('/').pop()}:${match[3]}`
      : 'unknown';
    const functionName = match ? match[1] : 'anonymous';

    const rawIp =
      request.ip || request.headers['x-forwarded-for'] || '127.0.0.1';
    const cleanIp = rawIp.includes(':') ? rawIp.split(':').pop() : rawIp;

    const logData = {
      projectKey: this.projectKey,
      endpoint: request.url,
      method: request.method,
      ip: cleanIp,
      userAgent: request.headers['user-agent'] || 'Unknown',
      statusCode: status,
      errorMessage: exception.message || 'Unknown error',
      stackTrace: exception.stack,
      payload: this.maskSensitiveData(request.body),
      fileLocation: fileLocation,
      functionName: functionName,
    };

    this.logger.error({
      message: `[JSoftMonitor] Error captured on ${request.url}`,
      logData: logData,
    });

    Sentry.withScope((scope) => {
      scope.setExtra('payload', logData.payload);
      scope.setExtra('endpoint', logData.endpoint);
      scope.setUser({ ip_address: logData.ip });
      scope.setTag('project_key', logData.projectKey);

      Sentry.captureException(exception);
    });

    response.status(status).json({
      message: 'Ой! Что-то сломалось. Разработчики уже в курсе!',
      timestamp: new Date().toISOString(),
    });
  }
}
