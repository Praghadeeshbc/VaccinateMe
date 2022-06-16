const cron = require("node-cron");
const client = require("../database/databaseCon")
const amqp = require('amqplib/callback_api');

const twilioclient = require('twilio')("AC2a2e74efedae27424dea9d60ca9b35e4", "ac0462e653004a29bbb3d7024e06380e"); 
const { AuthRegistrationsCredentialListMappingContext } = require("twilio/lib/rest/api/v2010/account/sip/domain/authTypes/authRegistrationsMapping/authRegistrationsCredentialListMapping");

    amqp.connect('amqp://localhost', function (error0, connection) {
        if (error0) {
            throw error0;
        }
    connection.createChannel(function (error1, channel) {
        if (error1) {
            throw error1;
        }
        let queue = 'vaccine1';
        let queue1 = 'vaccine2';
        channel.assertQueue(queue, {
            durable: false
        });

        channel.assertQueue(queue1, {
            durable: false
        });
        channel.consume(queue,(msg)=> {
            let patient_details = msg.content.toString();
            patient_details = JSON.parse(patient_details);
            console.log(":",patient_details);  
               patient_details = patient_details.phone
                var sendSms = '+91' + patient_details.phone; 
                var name = patient_details.name;
                var state = patient_details.state;      //twilio service
                var content;
                if(state === "stock")
                {
                    content = `hii ${name}...Thank you for waiting. You can take your 1st dose of vaccine now.`
                }
                if(state === "can vaccinate")
                {
                    content = `hii ${name}. You can take your vaccination now`
                }
                console.log(sendSms)        
                twilioclient.messages 
                .create({ 
                body: content,
                from: '+17853845825',       
                to: sendSms

                }) 
                .then(message => console.log(message.sid))
                .done();
            channel.ack(msg)
        });
        
        channel.consume(queue1, function (msg2) {
            let patient_details = msg2.content.toString();
            patient_details = JSON.parse(patient_details);
            console.log(":",patient_details);
           
            let name = patient_details.phone.name
            var sendSms = '+91' + patient_details.phone.phone;          //twilio service
            console.log(sendSms)        
            twilioclient.messages 
            .create({ 
            body: ` hii ${name}.... You can take your 2nd dose of vaccine now.`,
            from: '+17853845825',       
            to: sendSms

            }) 
            .then(message => console.log(message.sid))
            .done();
           channel.ack(msg2)
            });

        });
    });
