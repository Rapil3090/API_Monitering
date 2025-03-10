import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn } from "typeorm";
import { Url } from "src/api-endpoint/entities/url.entity";

@Entity()
export class RequestInterval {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    intervalTime: number;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @ManyToOne(() => Url, url => url.requestIntervals)
    url: Url;
}

    