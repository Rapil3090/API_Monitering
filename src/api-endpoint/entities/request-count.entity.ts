import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class RequestCount {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    count: number;
    
}