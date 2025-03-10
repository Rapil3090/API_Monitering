import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn } from "typeorm";
import { Url } from "src/api-endpoint/entities/url.entity";

@Entity()
export class ResponseTime {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    time: Date;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @ManyToOne(() => Url, url => url.responseTimes)
    url: Url;
}