const mongoose = require("mongoose");

const Schema = require('mongoose').Schema;

const messageSchema = new Schema({
    id: mongoose.ObjectId, 
    channelID: {type:String},
    body: {type: String, required:false}, 
    createdAt: {type: Date, required: true},
    creator: {type: String} ,
    editedAt: {type: Date, required:true}
});

channelSchema = new Schema({
    id:mongoose.ObjectId, 
    name:{type:String, required:true, unique: true}, 
    description:{type:String}, 
    private: {type:Boolean, required:true}, 
    members: [String], 
    createdAt: {type: Date, required: true},
    creator: {type:String, required:true},
    editedAt: {type:Date}
});