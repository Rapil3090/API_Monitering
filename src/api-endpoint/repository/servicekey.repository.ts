import { Injectable } from "@nestjs/common";
import { DataSource, Repository } from "typeorm";
import { ApiEndpoint } from "../entities/api-endpoint.entity";
import { ServiceKey } from "../entities/servicekey.entity";


@Injectable()
export class ServiceKeyRepository extends Repository<ServiceKey> {

    constructor(
        private readonly dataSource: DataSource) {
            super(ServiceKey, dataSource.createEntityManager());
        }

        
}