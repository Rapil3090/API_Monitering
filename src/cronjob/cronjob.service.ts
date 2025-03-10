import { Injectable } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { ApiEndpointService } from "src/api-endpoint/api-endpoint.service";

@Injectable()
export class CronjobService {
  constructor(private readonly apiEndpointService: ApiEndpointService) {}

  @Cron(CronExpression.EVERY_HOUR, { timeZone: "Asia/Seoul" })
  async scheduledApiCallJob() {
    await this.apiEndpointService.scheduledApiCall();
  }
}
