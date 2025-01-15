import { Injectable } from "@nestjs/common";
import { DataSource, Repository } from "typeorm";
import { ApiEndpoint } from "../entities/api-endpoint.entity";


@Injectable()
export class ApiEndpointRepository extends Repository<ApiEndpoint> {

    constructor(
        private readonly dataSource: DataSource) {
            super(ApiEndpoint, dataSource.createEntityManager());
        }

        
}