import { PartialType } from '@nestjs/mapped-types';
import { CreateCrawlingDto } from './create-crawling.dto';

export class UpdateCrawlingDto extends PartialType(CreateCrawlingDto) {}
