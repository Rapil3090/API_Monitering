import { Injectable } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { ApiEndpointService } from "src/api-endpoint/api-endpoint.service";
import * as os from 'os';
import { HealthCheckService } from "src/health-check/health-check.service";

@Injectable()
export class CronjobService {
  constructor(
    private readonly apiEndpointService: ApiEndpointService, 
    private readonly healthCheckService: HealthCheckService) {}

  // @Cron(CronExpression.EVERY_HOUR, { timeZone: "Asia/Seoul" })
  // async scheduledApiCallJob() {
  //   await this.apiEndpointService.scheduledApiCall();
  // }

  // @Cron(CronExpression.EVERY_MINUTE, { timeZone: "Asia/Seoul" })
  // async healthCheck() {
  //   await this.healthCheckService.checkSystemHealth();
  // }

}
