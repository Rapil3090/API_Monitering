import { Column, Entity, PrimaryGeneratedColumn, ManyToOne } from "typeorm";
import { Url } from "src/api-endpoint/entities/url.entity";

@Entity()
export class StatusCode {
    
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'integer'})
    code: number;
    
    @ManyToOne(() => Url, url => url.statusCodes)
    url: Url;
}