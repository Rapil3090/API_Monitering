import { Column, Entity, PrimaryGeneratedColumn, ManyToOne } from "typeorm";
import { Url } from "src/api-endpoint/entities/url.entity";

@Entity()
export class ResponseBody {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({type:'text',nullable: true})
    responseData: string;

    @ManyToOne(() => Url, url => url.responseBodies)
    url: Url;
}