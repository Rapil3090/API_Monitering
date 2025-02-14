import { Injectable } from "@nestjs/common";
import { DataSource, Repository } from "typeorm";
import { ApiEndpoint } from "../entities/api-endpoint.entity";
import { ServiceKey } from "../entities/servicekey.entity";
import { Url } from "../entities/url.entity";


@Injectable()
export class UrlRepository extends Repository<Url> {

    constructor(
        private readonly dataSource: DataSource) {
            super(Url, dataSource.createEntityManager());
        }

        
}