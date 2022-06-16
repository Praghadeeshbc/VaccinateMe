const cron = require("node-cron");
const amqp = require('amqplib/callback_api');
let {client} = require("../database/databaseCon");
const cli = require("nodemon/lib/cli");
const enQueue = require('../rabbitmq/rabbitmq');

// client.connect()


    var count1 = 0;
    cron.schedule('* * * * * *', () => { 
        let today = new Date();
        today = today.toISOString().substring(0, 10);

        count1 = count1 + 1;
        (async () => {
           
            client.query(`SELECT v1_buffer FROM stocks WHERE id = 1`,
            [],(err,result)=>{
                if(err) throw err;
                let v1_buffer_stocks = result.rows[0].v1_buffer;
                if(v1_buffer_stocks > 0){
                    client.query(`SELECT * from patient where "v1state" = 'PENDING' order by "created_date"`,[],(err1,result1)=>{
                            if(err1) throw err1;
                        const arr = result1.rows;
                        for(let i =0;i<arr.length;i++)
                        {
                            console.log(arr[i].phone);
                            let patient_phone = arr[i].phone;
                            let patient_name = arr[i].name;

                            console.log("Updated to Active. Pushing to V1 queue");

                            client.query(`UPDATE "patient" SET "v1state" = $1 where phone = $2`,
                            ["ACTIVE",patient_phone],(err2,result2)=>{
                                if(err2) throw err2;
                                console.log("Activated")
                            })
                            
                            let details = {"name": patient_name, "phone": patient_phone, state: "stock"  };
                            details = JSON.stringify(details)
                               enQueue.enQueue1(details);
                       client.query(`UPDATE "stocks" set "v1_buffer" = "v1_buffer" - 1`,[],(err3,result3)=>{
                           if(err3)
                            throw err3;

                       });
                       v1_buffer_stocks -= 1
                       if(v1_buffer_stocks <= 0 )
                            break;
                        }
                    })
                }
            })
    })();
});
    
    var count = 0;
    cron.schedule('* * * * * *', () => {
        let today = new Date();
        today = today.toISOString().substring(0, 10);

        count = count + 1;
        (async () => {
        const result = await client.query(`select * from "patient" where (current_date -  v1_timestamp) >= 45 and "v1state" = 'DONE' and "v2state" = 'INELIGIBLE' order by "created_date"`)
     
             const arr = result.rows;
             for (let i = 0; i < arr.length; i++){
                 
                let patient_phone = arr[i].phone;
                console.log(patient_phone)
                client.query(`SELECT "v2_buffer" from "stocks" where id = 1`,[],(err1,result1)=>{
                    if(result1.rows[0].v2_buffer > 0)
                    {
                        console.log("Updated to Active. Pushing to V2 queue");
                        client.query(`UPDATE "patient" set "v2state" = $1 WHERE phone = $2`,
                        ["ACTIVE",patient_phone],(err2,result2)=>{
                                if(err2)    throw err2;
                                console.log("Activated");
                        })
                        let details = {"name": arr[i].name, "phone": patient_phone, state: "stock"  };
                        details = JSON.stringify(details)

                        enQueue.enQueue2(details);
                      client.query(`UPDATE "stocks" set "v2_buffer" = "v2_buffer" - 1 WHERE id = 1`,
                      [],(err3,result3)=>{
                              if(err3)    throw err3;
                              console.log("reduced v2B by 1");
                      })
                    }
                    else{
                        console.log("Hi! V2 stock currently unavailable! We ll notify you");
                       
                       client.query(`UPDATE "patient" SET "v2state" = 'PENDING' where "v2state" = 'INELIGIBLE' and "v1state" = 'DONE'`);
                    }
                })  
                }
     
    })();
    });

var count2 = 0;
cron.schedule('* * * * * *', () => {
    let today = new Date();
    today = today.toISOString().substring(0, 10);

    count2 = count2 + 1;
    (async () => {
    try{
        const stock_avail = await  client.query(`SELECT v2_buffer FROM stocks WHERE id = 1`,[]);
        if(stock_avail.rows[0].v2_buffer > 0)
        {
    client.query(`SELECT * from "patient" where "v2state" = 'PENDING' order by "created_date"`,[],(err,result)=>{
        if(err) throw err;
        const arr = result.rows;
        for (let i = 0; i < arr.length; i++){
            let patient_phone = arr[i].phone;
            let details = {"name": arr[i].name, "phone": patient_phone, state: "stock2"  };
            details = JSON.stringify(details)

            enQueue.enQueue2(details);

                    client.query(`UPDATE "patient" SET "v2state" = $1 WHERE phone = $2`,
                    ["INELIGIBLE",patient_phone])
                    console.log("pending to ineligible");
            if(stock_avail <=0 )
                break;      
        }
    });   
    }
    }
    catch(err){console.log(err);}
    
        })();
        });