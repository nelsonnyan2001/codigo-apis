import {Entity, PrimaryGeneratedColumn, Column} from "typeorm";

@Entity()
export class EVoucher {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    title: string;

    @Column()
    description: string;

    @Column()
    expiry: string;

    @Column()
    image: string;

    @Column()
    amount: number;

    @Column()
    paymentMethod: string;

    @Column()
    paymentMethodDiscount: number;

    @Column()
    buyType: string;

    @Column('boolean', {default: true})
    isValid: boolean;
}
