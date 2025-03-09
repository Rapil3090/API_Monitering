import { Column, Entity, PrimaryGeneratedColumn, ManyToOne } from "typeorm";
import { Url } from "./url.entity";

@Entity()
export class Parameter {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    key: string;

    @Column()
    value: string;

    @Column()
    type: string;

    @ManyToOne(() => Url, url => url.parameters)
    url: Url;
}