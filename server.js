const express = require("express");
const app = express();
const { client } = require("./database/databaseCon");
const  session = require("express-session");
const flash = require("express-flash");
const { rmSync } = require("fs");
const cli = require("nodemon/lib/cli");
const enQueue = require('./rabbitmq/rabbitmq');
const registration_func = require('./function/register')

const twilioclient = require('twilio')("AC2a2e74efedae27424dea9d60ca9b35e4", "ac0462e653004a29bbb3d7024e06380e"); 
const redisClient = require("./init-redis");

const initRedisClient = async () => {
  await redisClient.connect();
};

initRedisClient();

const routes = require("./routes/route");
const { AuthRegistrationsCredentialListMappingContext } = require("twilio/lib/rest/api/v2010/account/sip/domain/authTypes/authRegistrationsMapping/authRegistrationsCredentialListMapping");
const { redirect } = require("express/lib/response");
const { enQueue2 } = require("./rabbitmq/rabbitmq");
const registration = require("./function/register");


const PORT = process.env.PORT || 4003;
// const REDIS_PORT = process.env.PORT || 6379;

// const redis_client = redis.createClient(REDIS_PORT);

app.set("view engine","ejs");
app.use(express.urlencoded({extended:false}));
app.use(express.json());


app.get('/',(req,res)=>{
    res.render("index");
})

app.get("/api/users/register",(req,res) => {
    res.render("register");
})


app.get("/api/users/dashboard",(req,res) => {
    res.render("dashboard");
} )

app.post("/api/users/register",async(req,res)=>{
    let det = req.body;
    var result = await registration(det.name,det.phone_number,det.enteredOTP,det.OTP);
    console.log("tesult "+ result)
    res.send(result);        
});



app.post("/api/users/login",async(req,res)=>{ 
    
    let phone_number = req.body.phone_number;
    
    if(req.body.enteredOTP == req.body.OTP)
 {   const loginData = await redisClient.exists("login");
    if(loginData == 0)
    {
        try{
            console.log("cache miss")
            const resp = await client.query(`SELECT * FROM patient`);
            let dataLogin = [];

            if(resp.rows.length > 0)
            {
                resp.rows.forEach((val)=>{
                    dataLogin.push(val);
                });
            }
            
            const dataObj = JSON.stringify(dataLogin);
            await redisClient.set("login",dataObj);
            redisClient.expire("login",30);
            let present = false;
            for(let i = 0;i<resp.rows.length;i++)
            {
                if(resp.rows[i].phone == phone_number)
                {
                present = true;
                let arr = {"name" : resp.rows[i].name, "state" : "cache miss"};
                res.json(arr);
                //res.send(resp.rows[i].name);
                }
            }
            
            if(present == false)
               {
                res.send("User not registered");
                }

        }
        catch(err){
            console.log(err);
        }
    }
    else{
        console.log("cache hit")
        const details = await redisClient.get("login");
        const ob = JSON.parse(details);
        let present = false;
        for(let i = 0;i<ob.length;i++)
        {
            if(ob[i].phone == phone_number)
            {
                present = true;
                let arr = {"name" : ob[i].name, "state" : "cache hit"};
                res.json(arr);
                //res.send(ob[i].name);
            }
        }

        if(present == false)
            {
             
                 res.send("User not registered");
            }
       
    }}
else{
    res.send("Wrong OTP")
}
});

app.get("/api/users/admin",(req,res)=>{
    res.render("admin");
})

app.post("/api/users/admin",(req,res)=>{
   let{v,w} = req.body;
   if(w == undefined)
     w = 0;
    if(v == undefined)
     v = 0;
    console.log(v);
   console.log(w);
   client.query(`UPDATE stocks SET "v1_buffer" = "v1_buffer" + $1, "v1" = "v1" + $2, "v2_buffer" = "v2_buffer" + $3, "v2" = "v2" + $4 where "id" = 1`,
   [v,v,w,w],
   (err,result)=>{
       if(err)
        throw err;
     res.send("Done");
   })

})

app.get("/api/users/vaccine1",(req,res)=>{
    var phone_number = req.params.phone_number;
    console.log(phone_number)
    res.render("vaccineone");
}) 

app.post("/api/users/vaccine1",async(req,res)=>{
    let {phone_number} = req.body;
    const ans = await client.query(`SELECT v1_buffer from stocks where id = 1`);
   
    if(ans.rows[0].v1_buffer > -1){ 
   const details = await client.query(`SELECT * FROM patient WHERE phone = $1`,
    [phone_number])
    try{
    
        if(details.rows[0].v1state == "ACTIVE"){
        var v1_date = new Date();
        var day = ("0" + v1_date.getDate()).slice(-2);
        var month = ("0" + (v1_date.getMonth() + 1)).slice(-2);
        var year = v1_date.getFullYear();
        var status = "DONE";
        var status2 = "INELIGIBLE"
        const upd = await client.query(`UPDATE patient SET "v1state" = $1,"v1_timestamp" = $2,"v2state" = $3 WHERE "phone" = $4`,
        [status,v1_date,status2,phone_number]);
        client.query(`UPDATE stocks SET "v1" = "v1" - 1 where id = 1`)
        var sendSms = '+91' + phone_number;
        console.log(sendSms)        
        twilioclient.messages 
        .create({ 
        body: `Hi ${details.rows[0].name}... You have been vaccinated successfully with the 1st dose`,
        from: '+17853845825',       
        to: sendSms

        }) 
        .then(message => console.log(message.sid))
        .done();
        console.log(v1_date)
        const patient_details = { name : details.rows[0].name, phone: phone_number, v1_state: "Vaccinated", v1_date: v1_date}
        res.json(patient_details);
       // res.send("Vaccinated");
    }
    else if(details.rows[0].v1state == "DONE"){
        const patient_details = { name : details.rows[0].name, phone: phone_number, v1_state: "Already vaccinated", v1_date: details.rows[0].v1_timestamp }
        res.json(patient_details);
        //res.send("Already vaccinated")
    }
    else{
        const patient_details = {v1_state: "Wait for vaccination" }
        res.json(patient_details);
       // res.send("Wait for vaccination")
    }
    }
    catch(err)
        {
            console.log(err);
        }
}
    else{
        const patient_details = { v1_state: "Wait for vaccination" }
        res.json(patient_details);
        //res.send("Wait for vaccination");
       
    }
}) 


app.get("/api/users/vaccine2",(req,res)=>{
    res.render("vaccinetwo");
}) 


app.post("/api/users/vaccine2",(req,res)=>{
    let {phone_number} = req.body;
    var curr = new Date();
    var day = ("0" + curr.getDate()).slice(-2);
    var month = ("0" + (curr.getMonth() + 1)).slice(-2);
    var year = curr.getFullYear();
   
    client.query(`SELECT * FROM patient WHERE phone = $1`,
    [phone_number],
    (err,result_user)=>
    {
        if(result_user.rows[0].v1state === "DONE" ){ 
                var timeDiff = curr.getTime() - result_user.rows[0].v1_timestamp.getTime();  //CALCULATE THE NUMBER OF DAYS
                var DaysDiff = timeDiff / (1000 * 3600 * 24);

                if(DaysDiff < 45)
                {
                    res.send("45 Not completed")
                }
                else{
                    client.query(`SELECT v2_buffer FROM stocks where id = 1`,
                    [],
                    (err,result)=>{
                        if(err) throw err;

                        if(result.rows[0].v2_buffer > 0)
                        {
                            client.query(`SELECT * FROM patient WHERE phone = $1`,
                            [phone_number],
                            (err,resultd)=>{
                                    if(err)
                                        throw err;
                                
                        if(resultd.rows[0].v2state == "INELIGIBLE"){
                        client.query(`UPDATE stocks SET "v2_buffer" = "v2_buffer" - 1 where id = 1`)

                        var v2_date = new Date();
                        var day = ("0" + v2_date.getDate()).slice(-2);
                        var month = ("0" + (v2_date.getMonth() + 1)).slice(-2);
                        var year = v2_date.getFullYear();
                        var status = "DONE";
                        
                        client.query(`UPDATE patient SET "v2state" = $1,"v2_timestamp" = $2 WHERE "phone" = $3`,
                        [status,v2_date,phone_number],
                        (err,result)=>
                        {
                            if(err)
                                throw err;
                            
                        })
                        client.query(`UPDATE stocks SET "v2" = "v2" - 1 where id = 1`)
                       
                        var sendSms = '+91' + phone_number;
                        console.log(sendSms)        
                        twilioclient.messages 
                        .create({ 
                        body: `Hi ${resultd.rows[0].name}... You have been vaccinated successfully with the 2nd dose`,
                        from: '+17853845825',       
                        to: sendSms
                
                        }) 
                        .then(message => console.log(message.sid))
                        .done();
                            const patient_details = { name : resultd.rows[0].name, phone: phone_number, v2_state: "Vaccinated", v1_date: resultd.rows[0].v1_timestamp, v2_date: v2_date }
                            res.json(patient_details);
                             
                        }
                        else if(resultd.rows[0].v2state == "DONE"){
                            const patient_details = { name : resultd.rows[0].name, phone: phone_number, v2_state: "Already vaccinated", v1_date: resultd.rows[0].v1_timestamp, v2_date: resultd.rows[0].v2_timestamp }
                            res.json(patient_details);
                             
                        }
                        else{
                            
                            res.send("Not eligible for second vaccination")

                        }
                        })
                    }
                    else{
                        
                        let details = {"name": result_user.rows[0].name, "phone": result_user.rows[0].phone, state: "stock"  };
                        details = JSON.stringify(details);
                       // console.log(details);

                       // enQueue.enQueue2(details);
                        res.send("No stocks");
                    }
                    })

                }
        }
        else{
            res.send("Take v1");
        }
})
}) 

app.get('/api/users/getPdf', function(req, res) {
   
    res.download('./tickets/tickets.pdf');
  });
 
app.post('/api/users/generateOTP', (req,res)=>{
    let phone_number = req.body;
     
    let random_number = Math.floor((Math.random() * 1000000) + 1);
    var sendSms = '+91' + phone_number.phone_number;
    console.log(sendSms)        
    twilioclient.messages 
    .create({ 
    body: `Your OTP is ${random_number}`,
    from: '+17853845825',       
    to: sendSms

    }) 
    .then(message => console.log(message.sid))
    .done();
    console.log(random_number)
    let num = {random_number : random_number}
    res.json(num);
})

app.listen(PORT,()=>{
    console.log(`Listening to the port ${PORT}`);
})
