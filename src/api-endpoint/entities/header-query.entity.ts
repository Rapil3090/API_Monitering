import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class HeaderQuery {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    header: string;

    @Column()
    query: string;
}