import { Column, Entity, PrimaryGeneratedColumn, ManyToOne } from "typeorm";
import { Url } from "src/api-endpoint/entities/url.entity";

@Entity()
export class SuccessStatus {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    succcess: boolean;

    @ManyToOne(() => Url, url => url.successStatuses)
    url: Url;
}