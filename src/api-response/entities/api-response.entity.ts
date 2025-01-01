import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class ApiResponse {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    statusCode: number;

    @Column()
    success: boolean;
    
    @Column()
    body: string;

    @Column()
    responseTime: number;
}
