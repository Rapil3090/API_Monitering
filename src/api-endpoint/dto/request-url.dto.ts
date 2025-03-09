import { Url } from "../entities/url.entity";


export class RequestUrlDto {
    id: number;
    url: string;
    callTime?: number;
}