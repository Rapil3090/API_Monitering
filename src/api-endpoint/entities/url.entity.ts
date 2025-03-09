import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn, OneToMany } from "typeorm";
import { RequestInterval } from "src/api-response/entities/request-interval.entity";
import { ResponseBody } from "src/api-response/entities/response-body.entity";
import { ResponseTime } from "src/api-response/entities/response-time.entity";
import { StatusCode } from "src/api-response/entities/status-code.entity";
import { SuccessStatus } from "src/api-response/entities/success-status.entity";
import { Parameter } from "./parameter.entity";

@Entity()
export class Url {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    url: string;
    
    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;
  
    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;

    @OneToMany(() => Parameter, parameter => parameter.url)
    parameters: Parameter[];

    @OneToMany(() => RequestInterval, requestInterval => requestInterval.url)
    requestIntervals: RequestInterval[];

    @OneToMany(() => ResponseBody, responseBody => responseBody.url)
    responseBodies: ResponseBody[];

    @OneToMany(() => ResponseTime, responseTime => responseTime.url)
    responseTimes: ResponseTime[];

    @OneToMany(() => StatusCode, statusCode => statusCode.url)
    statusCodes: StatusCode[];

    @OneToMany(() => SuccessStatus, successStatus => successStatus.url)
    successStatuses: SuccessStatus[];

    @Column({nullable: true})
    callTime: number;
}