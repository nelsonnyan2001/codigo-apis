import "reflect-metadata";
import { createConnection, getConnection, getConnectionManager, getRepository } from "typeorm";
import { domainToASCII } from "url";
import { EVoucher } from "./entity/EVoucher";

const jwt = require('jsonwebtoken')
const express = require('express');
const bodyParser = require('body-parser');
const app = express();

const port = 3001;
const accessTokenSecret = "codigo"

app.use(express.json());
createConnection();

app.get('/', async (req, res) => {
    res.send("Base Path")
})

// This is the JWT login function. It will return an access token that you have to use in the authentication
// with JWT functions.

app.post('/login', async (req, res) => {
    const params = req.body;
    const payload = {
        username: params.username,
        role: 'user',
    }

    const accessToken = jwt.sign(payload, accessTokenSecret)
    res.send(JSON.stringify({accessToken}))

})

// This is the JWT function. It will handle authentication and ensure all routes are authenticated.

const authentication = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if(authHeader){
        console.log(authHeader)
        const token = authHeader.split(' ')[1];
        console.log("token")
        console.log(token)
        jwt.verify(token, accessTokenSecret, (err, user) => {
            
            if (err) {
                return res.sendStatus(403);
            }

            req.user = user;
            next();
        });
    }else{
        res.sendStatus(401)
    }
    
}

// Gets all the vouchers and returns it.

app.get('/getAll', authentication,  async (req, res) => {
    const allVouchers = await getRepository("e_voucher")
        .createQueryBuilder("getMany")
        .getMany();
    res.send(JSON.stringify(allVouchers));
})

// Gets the details of a single voucher based on the ID. Takes an ID in the format of a JSON in the request body.

app.post('/getDetail', authentication, async (req, res) => {
    const idNo = req.body.id
    const detailedVoucher = await getRepository("e_voucher")
        .createQueryBuilder("getone")
        .where("id = :id", { id: idNo })
        .getOne()
    console.log("done")
    res.send(detailedVoucher)
})

// Create Vouchers. This is the API that allows you to create a new API and add it to the list of vouchers.
// The ID will be serially generated, and it will be unique.

// This is a set of dummy data for how the request body would look. 

// const dummyData = {
//     "title": "Apple Voucher",
//     "description": "Can be redeemed in the Apple Store for in-store credit.",
//     "expiry": "2020-11-11",
//     "image": "https://artinbloom.co.nz/wp-content/uploads/2017/12/giftvoucher.jpg",
//     "amount": 5000,
//     "paymentMethod": "VISA",
//     "paymentMethodDiscount": 10,
//     "buyType": "myself"
// }

app.post('/createVoucher', authentication,  async (req, res) => {
    const newVoucher = req.body
    await getConnection()
        .createQueryBuilder()
        .insert()
        .into("e_voucher")
        .values(newVoucher)
        .execute()
    res.send(`A new voucher has been added with the following values: ${JSON.stringify(req.body)}`)
})

// Create Promocodes. This API takes in the ID of the eVoucher and creates a user-defined number of Promocodes for it.
// In an ideal world, I would make a hash function that generates a true non-repeating random number. Will not 
// work if there isn't enough quantity in the inventory. Deducts the number of promocodes from the quantity in the evoucher
// table.

// This is a set of dummy data for how the request body would look. The dummy data contains the associated phon
// number that is to be used with the promocodes.

// const dummyData = {
//     "eVoucherID" : 1,
//     "amount" : 20,
//     "associatedNumber" : 12345678
// }

app.post('/createPromocodes', authentication, async (req, res) => {
    const params = req.body
    const detailedVoucher: any = await getRepository("e_voucher")
        .createQueryBuilder("getone")
        .where("id = :id", { id: params.eVoucherID })
        .getOne()
    if (params.amount > detailedVoucher.amount) {
        res.send("Not enough quantity of vouchers left.")
    }
    else {
        let count = 0
        await getConnection()
            .createQueryBuilder()
            .update("e_voucher")
            .set({
                amount: () => `amount - ${params.amount}`
            })
            .where("id = :id", { id: params.eVoucherID })
            .execute();
        for (let i = 0; i < params.amount; i++) {
            const alphabet = "abcdefghijklmnopqrstuvwxyz"
            let randomCode = ''
            for (let i = 0; i < 5; i++) {
                let randomNum = (Math.round(Math.random() * 10))
                let randomChar = alphabet[Math.floor(Math.random() * alphabet.length)]
                randomCode += randomNum + randomChar
            }
            randomCode += Math.round(Math.random() * 10)
            let newPromocode = {
                code: randomCode,
                eVoucherID: params.eVoucherID,
                associatedNumber: params.associatedNumber
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

// Deletes an eVoucher. Takes an ID as a request body.

app.post('/deleteVoucher', authentication, async (req, res) => {
    const voucherID = req.body.id
    console.log(req.body.id)
    await getConnection()
        .createQueryBuilder()
        .delete()
        .from("e_voucher")
        .where("id = :id", { id: voucherID })
        .execute()
    res.send(`Deleted voucher with ID number ${voucherID}`)
})

// Tests a promocode. Returns whether it is valid or not depending on expiry date and whether or not it has been used.


// const dummyData = {
//     "code" : "4u6q5z8f1m10"
// }

app.post('/testCode', authentication, async (req, res) => {
    const code = req.body.code
    const detailedVoucher: any = await getRepository("promocode")
        .createQueryBuilder("getone")
        .where("code = :code", { code })
        .getOne()
         await getRepository("promocode")
        .createQueryBuilder("getone")
        .where("code = :code", { code })
        .getOne()
    const getDetails:any = await getRepository("e_voucher")
    .createQueryBuilder("getone")
    .where("id = :id", { id: detailedVoucher.eVoucherID })
    .getOne()
    let todayDate = new Date()

    if(getDetails.expiry > todayDate.toISOString().split('T')[0] && !detailedVoucher.isUsed ){
        res.send("This voucher is valid, and has not been used yet.")
    }else{
        res.send("This voucher is invalid. It has either expired or been used.")
    }
})

// Get purchase history. Retrieves a list of promo codes based on the user's phone number.
// const dummyData = {
// "phNum" : "12345678"
// }

app.post('/history', authentication, async (req, res) => {
    const phNum = req.body.phNum;
    const detailedVoucher: any = await getRepository("promocode")
        .createQueryBuilder("getMany")
        .where("associatedNumber = :phNum", { phNum })
        .getMany()
    res.send(JSON.stringify(detailedVoucher))
})

app.listen(port, () => {
    console.log("Listening on port", port)
})