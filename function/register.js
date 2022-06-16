const { AuthRegistrationsCredentialListMappingContext } = require("twilio/lib/rest/api/v2010/account/sip/domain/authTypes/authRegistrationsMapping/authRegistrationsCredentialListMapping");
const {client} = require("../database/databaseCon")
const enQueue = require("../rabbitmq/rabbitmq")
var registration = async function(name,phone_number,enteredOTP,OTP){
    let ret;
    if(enteredOTP == OTP){
   
   try{
      const result = await client.query(`SELECT * FROM patient WHERE phone = $1`,
      [phone_number])
      
        if(result.rows.length > 0)  //user already registered
           {
               console.log("hereaaaa");
               ret = "already registered";
            
            }
        else{
            console.log("here2")
            var v1state = "PENDING";
            var v2state = "INELIGIBLE";
              
            var current_date = new Date();
            var day = ("0" + current_date.getDate()).slice(-2);
            var month = ("0" + (current_date.getMonth() + 1)).slice(-2);
            var year = current_date.getFullYear();
            
            var current_date = year + "-" + month + "-" + day;
            try{
           const ins = await client.query(`INSERT INTO patient(name,phone,v1state,v2state,created_date) VALUES ($1,$2,$3,$4,$5) RETURNING id`,
            [name,phone_number,v1state,v2state,current_date]);
            }
            catch(err)
            {
                console.log(err);
            }
    try{
      const ans = await  client.query(`SELECT v1_buffer from stocks where id = 1`,
        [])
        
            if(ans.rows[0].v1_buffer > 0)
            {
                var status = "ACTIVE";
                try{
               const upd = await client.query(`UPDATE patient SET "v1state" = $1 where "phone" = $2`,
                [status,phone_number])
                }
                catch(err) 
                {
                    console.log(err);
                }
                console.log("Active state");
                let details = {"name": name, "phone": phone_number, state: "can vaccinate"  };
                details = JSON.stringify(details)

                enQueue.enQueue1(details);       // rabbitmq
               const upd1 = await client.query(`UPDATE stocks SET "v1_buffer" = "v1_buffer" - 1`);

                ret =  "Registered";
            }
            else{
                ret =  "Wait for sometime"; //window alert
                //enQueue.enQueue1(phone_number)//rabbitmq
            }
        }
        catch(er)
            {
                console.log(er);
            }
        }
      }
      catch(err){
        console.log(err)
      }
    }
    else{
        return "Wrong OTP"
    }
      return ret;
}

module.exports = registration
