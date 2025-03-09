import { Column } from "typeorm";
import { Parameter } from "../entities/parameter.entity";
import { Url } from "../entities/url.entity";


export class RequestParameterDto {
    key: string;
    value: string;
    type: string;
}