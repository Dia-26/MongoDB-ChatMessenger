const mongoose = require('mongoose');
const Chat = require('./models/chat');

main()
  .then(() => console.log('Connection Successful!'))
  .catch(err => console.log(err));

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/whatsapp');
}

let allChats = [
    {
    from:"Neha",
    to:"Dia",
    msg:"Hello Dia, How are you?",
    created_at: new Date()
    },

    {
    from:"Ameya",
    to:"Tanay",
    msg:"Hello Tanay, Long time no see!",
    created_at: new Date()
    },

    {
    from:"Sumit",
    to:"Rohan",
    msg:"Hey Rohan, Let's catch up sometime.",
    created_at: new Date()
    },

];

Chat.insertMany(allChats);