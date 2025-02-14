import { Injectable } from "@nestjs/common";
import { DataSource, Repository } from "typeorm";
import { ApiEndpoint } from "../entities/api-endpoint.entity";
import { RequestCount } from "../entities/request-count.entity";


@Injectable()
export class RequestCountRepository extends Repository<RequestCount> {

    constructor(
        private readonly dataSource: DataSource) {
            super(RequestCount, dataSource.createEntityManager());
        }

        
}