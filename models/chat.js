const moongoose = require('mongoose');

const chatSchema = new moongoose.Schema({
    from: {
        type:String,
        required:true
    },
    to:{
        type: String,
        required:true
    },
    msg: {
        type: String,
        maxLength:50
    },
    created_at:{
        type: Date,
        required:true
    },
});

const Chat = moongoose.model('Chat', chatSchema);

module.exports = Chat;