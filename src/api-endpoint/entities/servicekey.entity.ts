import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class ServiceKey {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    servicekey: string;
}