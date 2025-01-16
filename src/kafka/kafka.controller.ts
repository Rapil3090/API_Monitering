import { Body, Controller, Post } from "@nestjs/common";
import { KafkaProducerService } from "./kafka-producer.service";

@Controller('kafka')
export class KafkaController {
    constructor(
        private readonly kafkaProducerService: KafkaProducerService
    ) {}

    @Post('send')
    async sendMessage(@Body() body: { topic : string; message: any }) {
        const { topic, message } = body;
        await this.kafkaProducerService.sendMessage(topic, message);
        return 'ok';
    }
}