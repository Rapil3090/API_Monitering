import { Module } from "@nestjs/common";
import { ClientsModule, Transport } from "@nestjs/microservices";
import { kafkaConfig } from "src/config/kafka.config";
import { KafkaConsumerService } from "./kafka-consumer.service";
import { KafkaProducerService } from "./kafka-producer.service";
import { ApiEndpointModule } from "src/api-endpoint/api-endpoint.module";
import { ApiResponseRepository } from "src/api-response/repository/api-response.repository";

@Module({
    imports: [
        ClientsModule.register([
            {
                name: 'KAFKA_SERVICE',
                transport: Transport.KAFKA,
                options: {
                    client: {
                        clientId: 'nestjs-kafka-client',
                        brokers: ['localhost:9092'],
                    },
                    consumer: {
                        groupId: 'nestjs-consumer-group',
                        allowAutoTopicCreation: true,
                    }
                }
            },
        ]),
    ],
    providers: [
        KafkaConsumerService,
        KafkaProducerService,
        ApiResponseRepository,
    ],
    exports: [
        KafkaConsumerService,
        KafkaProducerService,
    ],
})

export class KafkaModule {}