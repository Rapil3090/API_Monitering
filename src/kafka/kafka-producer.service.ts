import { Inject, Injectable } from "@nestjs/common";
import { ClientKafka } from "@nestjs/microservices";
import { lastValueFrom } from "rxjs";

@Injectable()
export class KafkaProducerService {
    constructor(
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

        async sendMessage(topic: string, message: any): Promise<void> {

            const serializedMessage = JSON.stringify(message);
            await lastValueFrom(this.kafkaClient.send<any>(topic, serializedMessage));
        }

}