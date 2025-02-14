import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class RequestInterval {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    intervalTime: number;
}

    