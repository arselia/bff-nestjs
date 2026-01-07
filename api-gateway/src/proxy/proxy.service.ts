import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { Observable, catchError, throwError } from 'rxjs';
import { AxiosRequestConfig, AxiosResponse } from 'axios';

@Injectable()
export class ProxyService {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  forwardRequest(
    serviceName: string,
    path: string,
    method: string,
    body?: any,
    headers?: any,
  ): Observable<AxiosResponse> {
    const envVarName = `${serviceName.toUpperCase().replace(/-/g, '_')}_URL`;
    const serviceUrl = this.configService.get(envVarName);
    const internalSecret = this.configService.get('INTERNAL_SECRET_KEY')!;

    if (!serviceUrl) {
      throw new Error(`Service URL for ${serviceName} (${envVarName}) not found`);
    }

    const url = `${serviceUrl}${path}`;
    const config: AxiosRequestConfig = {
      headers: {
        ...headers,
        'Content-Type': 'application/json',
        'X-Internal-Secret': internalSecret,
      },
    };

    switch (method.toLowerCase()) {
      case 'get':
        return this.httpService.get(url, config).pipe(
          catchError(error => throwError(() => error))
        );
      case 'post':
        return this.httpService.post(url, body, config).pipe(
          catchError(error => throwError(() => error))
        );
      case 'put':
        return this.httpService.put(url, body, config).pipe(
          catchError(error => throwError(() => error))
        );
      case 'delete':
        return this.httpService.delete(url, config).pipe(
          catchError(error => throwError(() => error))
        );
      case 'patch':
        return this.httpService.patch(url, body, config).pipe(
          catchError(error => throwError(() => error))
        );
      default:
        throw new Error(`Unsupported HTTP method: ${method}`);
    }
  }
}