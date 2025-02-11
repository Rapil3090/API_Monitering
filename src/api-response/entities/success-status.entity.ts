import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class SuccessStatus {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    succcess: boolean;
}