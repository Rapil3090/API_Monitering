import { Inject, Injectable, OnModuleInit } from "@nestjs/common";
import { ClientKafka } from "@nestjs/microservices";
import { firstValueFrom } from "rxjs";

@Injectable()
export class KafkaProducerService implements OnModuleInit {
    constructor(
        @Inject('KAFKA_SERVICE')
        private readonly kafkaClient: ClientKafka,
        ) {}

        async onModuleInit() {
            await this.kafkaClient.connect();
        }

        async sendMessage(topic: string, message: any) {
            await firstValueFrom(this.kafkaClient.emit(topic, JSON.stringify(message)));

            console.log('프로듀서 전송 완료');
        }

}