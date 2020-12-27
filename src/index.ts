import "reflect-metadata";
import {createConnection, getConnection, getConnectionManager, getRepository} from "typeorm";
import { domainToASCII } from "url";
import {EVoucher} from "./entity/EVoucher";

const express = require('express');
const bodyParser = require('body-parser');
const app = express();

const port = 3001;

app.use(express.json());

createConnection();

const dummyData = {
    "title": "Apple Voucher",
    "description": "Can be redeemed in the Apple Store for in-store credit.",
    "expiry": "2020-11-11",
    "image": "https://artinbloom.co.nz/wp-content/uploads/2017/12/giftvoucher.jpg",
    "amount": 5000,
    "paymentMethod": "VISA",
    "paymentMethodDiscount": 10,
    "buyType": "myself"
}

app.get('/', async (req, res) => {
    res.send("Base Path")
})

app.get('/getAll', async (req, res) => {
    const allVouchers = await getRepository("e_voucher")
    .createQueryBuilder("getMany")
    .getMany();
    res.send(JSON.stringify(allVouchers));
})
    
app.post('/getDetail', async (req, res)=> {   
    const idNo = req.body.id
    const detailedVoucher = await getRepository("e_voucher")
    .createQueryBuilder("getone")
    .where("id = :id", {id: idNo})
    .getOne()
    console.log("done")
    res.send(detailedVoucher)
})

// Create Vouchers. This is the API that allows you to create a new API and add it to the list of vouchers.
// The ID will be serially generated, and it will be unique.

app.post('/createVoucher', async (req, res)=> {
    const newVoucher = req.body
    await getConnection()
    .createQueryBuilder()
    .insert()
    .into("e_voucher")
    .values(newVoucher)
    .execute()
    res.send(`A new voucher has been added with the following values: ${JSON.stringify(req.body)}`)
})




app.post('/createPromocodes', async (req, res)=> {
    const generateRandomString = (length = 12) => Math.random().toString(20).substr(2, length)
    const params = req.body    
    const detailedVoucher:any = await getRepository("e_voucher")
    .createQueryBuilder("getone")
    .where("id = :id", {id: params.eVoucherID})
    .getOne().then(
        
    )
    console.log("done")

    if(params.quantity > detailedVoucher.amount){
        res.send("Not enough quantity of vouchers left.")
    }
    else{

        let count = 0
        await getConnection()
        .createQueryBuilder()
        .update("e_voucher")
        .set({ 
            amount : () => `amount - ${params.quantity}`
        })
        .where("id = :id", { id: params.eVoucherID })
        .execute();
        for(let i = 0; i < params.quantity; i++){
            let newPromocode = {
                code: generateRandomString(),
                eVoucherID : params.eVoucherID
            }      
            await getConnection()
            .createQueryBuilder()
            .insert()
            .into("promocode")
            .values(newPromocode)
            .execute()  
            count += 1
        }
        res.send(`${count} new promocodes have been created.`)
    }
})

app.post('/deleteVoucher', async(req,res)=> {
    const voucherID = req.body.id
    console.log(req.body.id)
    await getConnection()
    .createQueryBuilder()
    .delete()
    .from("e_voucher")
    .where("id = :id", {id: voucherID})
    .execute()
    res.send(`Deleted voucher with ID number ${voucherID}`)
})

app.listen(port, () => {
    console.log("Listening on port", port)
})