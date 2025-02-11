import { Injectable } from "@nestjs/common";
import { DataSource, Repository } from "typeorm";
import { RequestInterval } from "../entities/request-interval.entity";


@Injectable()
export class RequestIntervalRepository extends Repository<RequestInterval> {

    constructor(
        private readonly dataSource: DataSource) {
            super(RequestInterval, dataSource.createEntityManager());
        }

        
}