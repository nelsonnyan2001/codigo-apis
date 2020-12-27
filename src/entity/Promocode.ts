import {Entity, PrimaryGeneratedColumn, Column} from "typeorm";

@Entity()
export class Promocode {

    @PrimaryGeneratedColumn('uuid')
    id: number;
    
    @Column()
    code: string;

    @Column()
    eVoucherID: number;

    @Column()
    associatedNumber: string;
    
    @Column('boolean', {default: false})
    isUsed: boolean;
}
