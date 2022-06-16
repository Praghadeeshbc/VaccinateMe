const test = require('ava');
const _ = require('lodash');
const register = require('./function/register');
const {client} = require("./database/databaseCon")


test('register-endpoint: Trying to insert an already registered patient', async t => {
    let phone_number = "3333333333";
	let result = await register("Random_Name",phone_number, "2222", "2222");

    const db_record = await client.query(`SELECT * FROM patient WHERE phone = $1`,
    [phone_number])
    console.log("RESULT FROM ENDPOINT:", result);
    t.is(result, "already registered");
    //console.log("Rows from DB", db_record);
    t.is(db_record.rowCount, 1);
});

test('register-endpoint: Trying to insert new  registered patient', async t => {
    let phone_number = "1234567890";
    let db_record = await client.query(`SELECT * FROM patient WHERE phone = $1`,
    [phone_number]);

    t.is(db_record.rowCount, 0);
    let updStocksV1 = await client.query ('UPDATE stocks set v1_buffer = $1, v1 = $1', ["5"]);
    console.log(updStocksV1)
   t.is(updStocksV1.rowCount, 1);
	let result = await register("Intern",phone_number, "2222", "2222");

    db_record = await client.query(`SELECT * FROM patient WHERE phone = $1`,
    [phone_number])
    console.log("RESULT FROM ENDPOINT:", result);
    t.is(result, "Registered");
    //console.log("Rows from DB", db_record);
    t.is(db_record.rowCount, 1);
});

test('register-endpoint: Trying to insert when vaccines are out of stock', async t => {
   
    let updStocksV1 = await client.query ('UPDATE stocks set v1_buffer = $1, v1 = $1', ["0"]);
    console.log(updStocksV1)
    t.is(updStocksV1.rowCount, 1);

    let phone_number = "888338888";
	let result = await register("person",phone_number, "2222", "2222");

    const db_record = await client.query(`SELECT * FROM patient WHERE phone = $1`,
    [phone_number])

    console.log("RESULT FROM ENDPOINT:", result);
    t.is(result, "Wait for sometime");
    //console.log("Rows from DB", db_record);
    t.is(db_record.rowCount, 1);
});


test('register-endpoint: Trying to give mismatched OTP', async t => {
    let phone_number = "32423423";
	let result = await register("OTP",phone_number, "2222", "2322");
    console.log("RESULT FROM ENDPOINT:", result);
    t.is(result, "Wrong OTP");
    const db_record = await client.query(`SELECT * FROM patient WHERE phone = $1`,
    [phone_number])
    t.is(db_record.rowCount, 0);

    
});
