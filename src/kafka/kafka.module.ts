import { Module } from "@nestjs/common";
import { ClientsModule, Transport } from "@nestjs/microservices";
import { KafkaProducerService } from "./kafka-producer.service";
import { ApiResponseRepository } from "src/api-response/repository/api-response.repository";
import { KafkaController } from "./kafka.controller";

@Module({
    imports: [
        ClientsModule.register([
            {
                name: 'KAFKA_SERVICE',
                transport: Transport.KAFKA,
                options: {
                    client: {
                        clientId: 'new-kafka',
                        brokers: ['localhost:9092'],
                    },
                    consumer: {
                        groupId: 'new-consumer',
                    }
                }
            },
        ]),
    ],
    controllers: [
        KafkaController,
    ],
    providers: [
        KafkaProducerService,
        ApiResponseRepository,
    ],
    exports: [
        KafkaProducerService,
    ],
})

export class KafkaModule {}