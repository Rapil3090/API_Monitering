import { Injectable } from "@nestjs/common";
import { DataSource, Repository } from "typeorm";
import { ResponseBody } from "../entities/response-body.entity";


@Injectable()
export class ResponseBodyRepository extends Repository<ResponseBody> {

    constructor(
        private readonly dataSource: DataSource) {
            super(ResponseBody, dataSource.createEntityManager());
        }

        
}