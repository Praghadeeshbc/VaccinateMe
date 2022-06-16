const {Pool,Client} = require('pg');

const client = new Client({
    host: "localhost",
    user: "postgres",
    port: "5432",
    password:"samsung@135", 
    database: "vaccination_portal"

})


client.connect();

client.query(`Select * from patient`, (err,res) =>{
    if(err)
    {
        console.log(err.message);
    }
    else{
       console.log(res.rows.length);
        
    }
    client.end;

})


module.exports = { client}
//     // query: (text, params, callback) => {
//     //     return client.query(text, params, callback)
// //}
 