import { Column, Entity, PrimaryGeneratedColumn, ManyToOne } from "typeorm";
import { Url } from "src/api-endpoint/entities/url.entity";

@Entity()
export class ResponseTime {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    time: Date;

    @ManyToOne(() => Url, url => url.responseTimes)
    url: Url;
}