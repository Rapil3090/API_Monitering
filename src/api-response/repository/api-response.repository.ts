import { Injectable } from "@nestjs/common";
import { DataSource, Repository } from "typeorm";
import { ApiResponse } from "../entities/api-response.entity";

@Injectable()
export class ApiResponseRepository extends Repository<ApiResponse> {
    constructor(
        private readonly dataSource: DataSource) {
            super(ApiResponse, dataSource.createEntityManager());
        }
}