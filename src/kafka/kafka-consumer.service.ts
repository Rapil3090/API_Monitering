import { Injectable } from "@nestjs/common";
import { EventPattern, Payload } from "@nestjs/microservices";
import { ApiResponseRepository } from "src/api-response/repository/api-response.repository";

@Injectable()
export class KafkaConsumerService {

    constructor(
        private readonly apiResponseRepository: ApiResponseRepository
    ) {}

    @EventPattern('health-check-results')
    async handleHealthCheckResults(@Payload() message: any) {


    }

    @EventPattern('response')
    async handleApiResponse(@Payload() message: any) : Promise<void> {

        console.log('컨슈머 도착 완료');
        await this.apiResponseRepository.save({
            responseTime: message.value.responseTime,
            body: message.value.body,
            statusCode: message.value.statusCode,
            success: message.value.success,
        });

        console.log('DB 저장 완료');

    }

}