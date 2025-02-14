import { Injectable } from "@nestjs/common";
import { DataSource, Repository } from "typeorm";
import { SuccessStatus } from "../entities/success-status.entity";


@Injectable()
export class SuccessStatusRepository extends Repository<SuccessStatus> {

    constructor(
        private readonly dataSource: DataSource) {
            super(SuccessStatus, dataSource.createEntityManager());
        }

        
}