import { Column, Entity, PrimaryGeneratedColumn, ManyToOne } from "typeorm";
import { Url } from "src/api-endpoint/entities/url.entity";

@Entity()
export class RequestInterval {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    intervalTime: number;

    @ManyToOne(() => Url, url => url.requestIntervals)
    url: Url;
}

    