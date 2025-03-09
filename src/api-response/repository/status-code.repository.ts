import { Injectable } from "@nestjs/common";
import { DataSource, Repository } from "typeorm";
import { ApiEndpoint } from "../../api-endpoint/entities/api-endpoint.entity";
import { StatusCode } from "../entities/status-code.entity";


@Injectable()
export class StatusCodeRepository extends Repository<StatusCode> {

    constructor(
        private readonly dataSource: DataSource) {
            super(StatusCode, dataSource.createEntityManager());
        }

        
}