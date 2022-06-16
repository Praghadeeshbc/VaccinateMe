const pg = require('pg')
const amqp = require('amqplib/callback_api');



const enQueue1 = function(phone){
    amqp.connect('amqp://localhost', function (error0, connection) {
        if (error0) {
            throw error0;
        }
        connection.createChannel(function (err, channel) {
            if (err) {
                throw err;
            }
            let queue = 'vaccine1';
            
            let msg = `{"phone":${phone}}`;
           
            channel.sendToQueue(queue, Buffer.from(msg));
            console.log(" [x] Sent %s", msg);
            });
        });
    }
    

const enQueue2 = function(phone){
    amqp.connect('amqp://localhost', function (err, connection) {
        if (err) {
            throw err;
        }
        connection.createChannel(function (error1, channel) {
            if (error1) {
                throw error1;
            }
            let queue = 'vaccine2';
             
            let msg2 = `{"phone":${phone}}`;
            console.log("HERE");
            
            channel.sendToQueue(queue, Buffer.from(msg2));
            console.log(" [x] Sent %s", msg2);
            });
        });
    }
module.exports = {
    enQueue1 : enQueue1,
    enQueue2 : enQueue2
}