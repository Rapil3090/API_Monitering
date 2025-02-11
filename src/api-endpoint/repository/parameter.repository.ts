import { Injectable } from "@nestjs/common";
import { DataSource, Repository } from "typeorm";
import { ApiEndpoint } from "../entities/api-endpoint.entity";
import { Parameter } from "../entities/parameter.entity";


@Injectable()
export class ParameterRepository extends Repository<Parameter> {

    constructor(
        private readonly dataSource: DataSource) {
            super(Parameter, dataSource.createEntityManager());
        }

        
}