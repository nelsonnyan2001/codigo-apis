# Codigo full-stack e-vouchers and promo codes APIs by Zwe Nyan Toe



## Installation and setup

Please clone this project, ` cd` and run `npm i` to install all the necessary packages.

Edit `ormconfig.json`according ot your mySQL database path. 

`npm run start-nodemon `to begin the program. By default, it will open at localhost:3001.

## Authentication

`localhost:3001/login`

JWT Token will be generated at this endpoint. You will have to provide a username in the form of a JSON body. The access token is currently "codigo". Please ensure that the returned access token is provided as an Authorization Bearer Token (if trying out in Postman).

## API's

### GET : `localhost:3001/getAll`

Retrives a list of all vouchers.

### POST : `localhost:3001/getDetail`

Gets the details of a single voucher based on the ID. Takes an ID in the format of a JSON in the request body.

```js
const dummyData = {
  "id" : 1
}
```

### POST : `localhost:3001/createVoucher`

Create Vouchers. This is the API that allows you to create a new API and add it to the list of vouchers.

The ID will be serially generated, and it will be unique.

```js
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
```

### POST: `localhost:3001/createPromocodes'`

Create Promocodes. This API takes in the ID of the eVoucher and creates a user-defined number of Promocodes for it. In an ideal world, I would make a hash function that generates a true non-repeating random number. Will not work if there isn't enough quantity in the evoucher inventory. Deducts the number of promocodes from the quantity in the evoucher table.

```js
const dummyData = {
    "eVoucherID" : 1,
    "amount" : 20,
    "associatedNumber" : 12345678
}
```

### POST: `localhost:3001/deleteVoucher`

Deletes an eVoucher. Takes an ID as a request body.

```js
const dummyData = {
  "id" : 1
}
```

### POST: `localhost:3001/testCode`

Tests a promocode. Returns whether it is valid or not depending on expiry date and whether or not it has been used.

```js
const dummyData = {
  "code" : "4u6q5z8f1m10"
}
```

### POST: `localhost:3001/history`

```js
const dummyData = {
	"phNum" : "12345678"
}
```









