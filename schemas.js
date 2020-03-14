const mongoose = require("mongoose");
//since you declared mongoose i just tidy'd up
const Schema = mongoose.Schema;

const messageSchema = new Schema({
    id: mongoose.ObjectId, 
    channelID: {type:String},
    body: {type: String, required:false}, 
    createdAt: {type: Date, required: true},
    creator: {type: String} ,
    editedAt: {type: Date, required:true}
});
//added const
const channelSchema = new Schema({
    id:mongoose.ObjectId, 
    name:{type:String, required:true, unique: true}, 
    description:{type:String}, 
    private: {type:Boolean, required:true}, 
    members: [String], 
    createdAt: {type: Date, required: true},
    creator: {type:String, required:true},
    editedAt: {type:Date}
});

//added this
const Message = mongoose.model("message", messageSchema);
const Channel = mongoose.model("channel", channelSchema);

module.exports = Message, Channel;