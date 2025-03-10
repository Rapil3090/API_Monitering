import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn } from "typeorm";
import { Url } from "src/api-endpoint/entities/url.entity";

@Entity()
export class SuccessStatus {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    succcess: boolean;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @ManyToOne(() => Url, url => url.successStatuses)
    url: Url;
}