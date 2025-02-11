import { Injectable } from "@nestjs/common";
import { DataSource, Repository } from "typeorm";
import { ResponseTime } from "../entities/response-time.entity";


@Injectable()
export class ResponseTimeRepository extends Repository<ResponseTime> {

    constructor(
        private readonly dataSource: DataSource) {
            super(ResponseTime, dataSource.createEntityManager());
        }

        
}