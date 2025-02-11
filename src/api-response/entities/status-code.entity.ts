import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class StatusCode {
    
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    code: number;
    
}