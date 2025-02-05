import { Controller, Inject, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { ClientKafka, MessagePattern, Payload } from "@nestjs/microservices";
import { ApiResponseRepository } from "src/api-response/repository/api-response.repository";

@Controller()
export class KafkaController implements OnModuleInit, OnModuleDestroy {
    constructor(
      private readonly apiResponseRepository: ApiResponseRepository,
        @Inject('KAFKA_SERVICE')
        private readonly kafkaClient: ClientKafka,
    ) {}

    async onModuleInit(): Promise<void> {
        const topics = ['response'];
        topics.forEach((topic) => this.kafkaClient.subscribeToResponseOf(topic));
        await this.kafkaClient.connect();
      }
    
      async onModuleDestroy(): Promise<void> {
        await this.kafkaClient.close();
      }

    @MessagePattern('response')
    async handleApiResponse(@Payload() message: any): Promise<void> {


      const parsedMessage = typeof message === 'string' ? JSON.parse(message) : message;

      await this.apiResponseRepository.save({
        responseTime: parsedMessage.responseTime,
        body: parsedMessage.body,
        statusCode: parsedMessage.statusCode,
        success: parsedMessage.success,
      });
    }
  
    
}