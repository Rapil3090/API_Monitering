import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";


@Entity()
export class ApiEndpoint {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    url: string;

    @Column('json', { nullable:true })
    parameters: Record<any, any>;

    @Column()
    callTime: number;

}
