import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class ResponseBody {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    body1: string;

    @Column()
    body2: string;

    @Column()
    body3: string;

    @Column()
    body4: string;

    @Column()
    body5: string;

    @Column()
    body6: string;

    @Column()
    body7: string;

    @Column()
    body8: string;
    
    @Column()
    body9: string;

    @Column()
    body10: string;
}