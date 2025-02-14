import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class ResponseTime {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    time: number;
}