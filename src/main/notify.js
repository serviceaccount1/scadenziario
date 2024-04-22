import nodemailer from "nodemailer";
import twilio from "twilio";
import { parse } from "path";




export function createTransporter(email, text, file) {
  let configOptions = {
    service: "gmail",
    host: "smtp.google.com",
    port: 587,
    secure: false,
    auth: {
      user: FROM_MAIL,
      pass: TOKEN,
    },
  };

  const transporter = nodemailer.createTransport(configOptions);

  const messageOptions = {
    from: FROM_MAIL, // sender address
    to: email, // list of receivers
    subject: "Avviso Scadenza", // Subject line
    text: text, // plain text body
    attachments: [],
  };

  if (file) {
    let obj = { path: file, filename: parse(file).base };
    messageOptions.attachments.push(obj);
  }
  return { transporter, messageOptions };
}

export async function sendSms(toNumber,messaggio) {
  const client = twilio(ACCOUNT_SID, AUTH_TOKEN);


  const clean = toNumber.replace("+39","");

  return await client.messages
    .create({
      body: messaggio,
      from: OWNER_NUMBER,
      to: `+39${clean}`,
    })
}

// export async function sendWhatsappMessage(number,message){
//   return new Promise((resolve,reject)=>{
//     axios.post("http://locslhost:3000",{
//       headers:{
//           "Content-Type":"ciao"
//       }
//     })
//   })
// }

/*
curl -i -X POST `
  https://graph.facebook.com/v18.0/191375407400893/messages `
  -H 'Authorization: Bearer EAAEewpPCKWMBO18QOntZBpRCBv5dH6pAueiBpleX2vIElVakHdc8Ep0IgQd43M2D3V3oZB4cwFUNaTRXEuEv05xLZBjZAJHYx0putbcPD5goFlCWbZB3sKJZBkEYVbiiYBGw0fWBdq5UebrDUfB6jmuwQFNIWOKgrMVyoAjrCho6mfp3IBXMhMvnwIfzyE6jvEW3vJQqZAnUvucUrki' `
  -H 'Content-Type: application/json' `
  
  -d '{ \"messaging_product\": \"whatsapp\", \"to\": \"\", \"type\": \"template\", \"template\": { \"name\": \"hello_world\", \"language\": { \"code\": \"en_US\" } } }'*/
