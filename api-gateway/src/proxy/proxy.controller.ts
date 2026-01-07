import { All, Controller, Req, Res, Logger } from '@nestjs/common';
import { Request, Response } from 'express';
import { ProxyService } from './proxy.service';
import { firstValueFrom } from 'rxjs';

@Controller('api')
export class ProxyController {
  private readonly logger = new Logger(ProxyController.name);
  constructor(private readonly proxyService: ProxyService) {}

  @All('*')
  async handleAllRequests(@Req() req: Request, @Res() res: Response) {
    const originalUrl = req.originalUrl; // e.g., /api/user-service/users/login

    // --- Generic proxy logic with manual parsing ---
    // Remove the '/api/' prefix to get the rest of the path
    const pathWithoutApi = originalUrl.startsWith('/api/') ? originalUrl.substring(5) : originalUrl;
    const urlParts = pathWithoutApi.split('/').filter(p => p);
    
    if (urlParts.length < 1) {
      return res.status(400).json({ message: 'Invalid API Gateway path. Service name is missing.' });
    }

    // --- Service Name Mapping & Path Logic ---
    const serviceNameMap = {
      users: 'user-service',
      products: 'product-service',
      orders: 'order-service',
      payments: 'payment-service',
      bff: 'bff-web', // Map short 'bff' to 'bff-web'
    };

    const serviceInUrl = urlParts[0];
    let finalService: string;
    let pathValue: string;

    if (serviceNameMap[serviceInUrl]) {
      // A friendly name was used (e.g., /api/users/...).
      finalService = serviceNameMap[serviceInUrl];
      // The path to forward is the entire path including the friendly name.
      pathValue = `/${pathWithoutApi}`;
    } else {
      // The full service name was used (e.g., /api/user-service/...).
      finalService = serviceInUrl;
      // The path to forward is everything AFTER the service name.
      pathValue = `/${urlParts.slice(1).join('/')}`;
    }
    // --- End of Logic ---

    this.logger.log(`Manual Parse: Forwarding to service: "${finalService}", path: "${pathValue}"`);
    
    const method = req.method;
    // Filter out problematic headers to prevent downstream errors
    const { host, 'content-length': contentLength, ...safeHeaders } = req.headers;
    const body = req.body;

    try {
      const response = await firstValueFrom(
        this.proxyService.forwardRequest(finalService, pathValue, method, body, safeHeaders),
      );
      
      res.status(response.status).json(response.data);
    } catch (error) {
      this.logger.error(`Error forwarding request to ${finalService}:`, error.response?.data || error.message);
      const status = error.response?.status || 500;
      const message = error.response?.data || 'Internal Server Error';
      
      res.status(status).json({
        statusCode: status,
        message: message,
      });
    }
  }
}