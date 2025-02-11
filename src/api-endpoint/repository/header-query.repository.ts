import { Injectable } from "@nestjs/common";
import { DataSource, Repository } from "typeorm";
import { ApiEndpoint } from "../entities/api-endpoint.entity";
import { HeaderQuery } from "../entities/header-query.entity";


@Injectable()
export class HeaderQueryRepository extends Repository<HeaderQuery> {

    constructor(
        private readonly dataSource: DataSource) {
            super(HeaderQuery, dataSource.createEntityManager());
        }

        
}