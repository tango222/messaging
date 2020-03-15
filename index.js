"use strict";

const express = require("express");
const mongoose = require("mongoose");
const { Message, Channel } = require( "./schemas"); // changed

const mongoEndpoint = "mongodb://localhost:27017/test";
const port = process.env.PORT || 5011;

// const Message = model("message", messageSchema);
// const Channel = model("channel", channelSchema);


const app = express();
app.use(express.json());

const connect = () => {
     mongoose.connect(mongoEndpoint);
 }

// mongooose.connect(
//     mongoEndpoint,
//     {
//         useCreateIndex: true,
//         useNewUrlParser: true
//     }
// );

//channelhandler
app.get("/v1/channels", async(req, res) => {

    if (req.header("X-User") == ""){
        res.status(401).send('User is Unauthorized.');
        return;
    }
    try{
        res.set('Content-Type', 'application/json');
        const channels = await Channel.find();
        res.json(channels)
        return;

    }catch(e){
        res.status(500).send("There was an error getting the channels.");
        return;
    }
});

app.post("/v1/channels", (req, res) => {
    if (req.header("X-User") == ""){
        res.status(401).send('User is Unauthorized.');
        return;
    }
    // changed private
    const { name, description, myPrivate } = req.body;
    if (!name){
        res.status(400).send("Name must be Provided.");
        return;
    }
    res.set('Content-Type', 'application/json');
    const createdAt = new Date();
    creator = req.header("X-User");
    const channel = {
        name, 
        description,
        myPrivate, //changed this too
        members, 
        createdAt, 
        creator, 
        editedAt
    };
    const query = new Channel(channel);
    query.save((err, newChannel) => {
        if (err){
            res.status(500).send("Unable to create Channel.");
            return;
        }
        res.status(201).json(newChannel);
    });
});

//specificChannelHandler
app.get("/v1/channels/:channelID", async(req, res) => {
    if (req.header("X-User") == ""){
        res.status(401).send('User is Unauthorized.');
        return;
    }
    Channel.findById(Types.ObjectId(req.params.channelID)).
        select('private members').
        exec(function(err, channel){
            if(err) {
                res.status(500).send(err);
                return;
            }
            if (channel.private == true & channel.members.includes(req.header("X-User"))){
                res.status(403).send("Channel is private.");
                return;
            }
            console.log(channel.id);
        });
    Message.find({'channelID' : channelID }).
            limit(100).
            sort({createdAt: -1}).
            exec(function(err, messages){
                if (err){
                    res.status(500).send(err);
                    return;
                }
                res.set('Content-Type', 'application/json');
                res.status(200).json(messages);
            });   
});

app.post("/v1/channels/:channelID", (req, res) => {
    if (req.header("X-User") == ""){
        res.status(401).send('User is Unauthorized.');
        return;
    }
    Channel.findById(Types.ObjectId(req.params.channelID)).
    select('private members').
    exec(function(err, channel){
        if(err) {
            res.status(500).send(err);
            return;
        }
        if (channel.private == true & channel.members.includes(JSON.parse(req.header("X-User")))){
            res.status(403).send("Channel is private.");
            return;
        }
        console.log(channel.id);
    });
    const {channelID, body, createdAt, creator, editedAt} = req.body;
    channelID = req.params.channelID;
    createdAt = new Date();
    creator = req.header("X-User");
    const message = {
        channelID, 
        body, 
        createdAt, 
        creator, 
        editedAt
    };
    const query = new Message(message);
    query.save((err, newMessage) => {
        if (err){
            res.status(500).send("Unable to post Message.");
            return;
        }
        res.status(201).json(newMessage);

});
});
app.patch("/v1/channels/:channelID", (req, res) => {
    if (req.header("X-User") == ""){
        res.status(401).send('User is Unauthorized.');
        return;
    }
    Channel.findById(Types.ObjectId(req.params.channelID)).
    select('private members').
    exec(function(err, channel){
        if(err) {
            res.status(500).send(err);
            return;
        }
        if (channel.private == true & channel.creator != req.header("X-User") ){
            res.status(403).send("Channel is private.");
            return;
        }
        const {name ,description} = req.body;
        Channel.findById(req.params.channelID).
            exec(function(err, channel){
                if (err){
                    res.status(500).send("Unable to find channel by channelID.");
                    return;
                }
                channel.name = name;
                channel.description = description;
                res.set('Content-Type', 'application/json');
                res.status(201).json(channel);
            });
    });

});

app.delete("/v1/channels/:channelID", (req, res) => {
    if (req.header("X-User") == ""){
        res.status(401).send('User is Unauthorized.');
        return;
    }
    Channel.findById(req.params.channelID).exec(function(err, channel){
        if (err) {
            res.status(500).send("Error retrieving channel by channelID.");
            return;
        }

        if (channel.private == true & channel.creator != req.header("X-User") ){
            res.status(403).send("Channel is private.");
            return;
        };
        Message.deleteMany({channelID : req.params.ChannelID}, function(err){
            if(err) res.status(500).send("Error deleting Messages with channelID");
            return;
        });
        Channel.deleteMany({id : req.params.ChannelID}, function(err){
            if(err) res.status(500).send("Error deleting Channel with channelID");
            return;
        });
        res.status(201).send("Delete was successful.");
    });
});

//specificChannelMemberHandler
app.post("/v1/channels/:channelID/members", (req, res) => {
    if (req.header("X-User") == ""){
        res.status(401).send('User is Unauthorized.');
        return;
    }
    Channel.findById(req.params.channelID).exec(function(err, channel){
        if(err) {
            res.status(500).send("Error retrieving channel by channelID");
            return;
        }
        if (channel.private == true & channel.creator != req.header("X-User") ){
            res.status(403).send("Current User is not Creator");
            return;
        };
        const user = req.body;
        channel.members.push(user);
        res.status(201).send("User was successfully added to channel members.");
    });



});
app.delete("/v1/channels/:channelID/members", (req, res) => {
    if (req.header("X-User") == ""){
        res.status(401).send('User is Unauthorized.');
        return;
    }
    Channel.findById(req.params.channelID).exec(function(err, channel){
        if(err) {
            res.status(500).send("Error retrieving channel by channelID");
            return;
        }
        if (channel.private == true & channel.creator != req.header("X-User") ){
            res.status(403).send("Current User is not Creator");
            return;
        };
        const user = req.body;
        const index = channel.members.indexOf(user);
        channel.members.splice(index, 1);
        res.status(200).send("User was successfully removed from channel members.");
    });

});

//messageHandler
app.patch("/v1/messages/:messageID", (req, res) => {
    if (req.header("X-User") == ""){
        res.status(401).send('User is Unauthorized.');
        return;
    }
    Message.findById(req.params.messageID).exec(function(err, message){
        if (err){
            res.status(500).send("Error retrieving message");
            return;
        }
        if(message.creator != req.header("X-User")){
            res.status(403).send("Current user is not the creator of this message");
            return;
        }
        const body = req.body;
        message.body = body;
        res.set("Content-Type", "application/json");
        res.status(201).JSON(message);
    });

});
app.delete("/v1/messages/:messageID", (req, res) => {
    if (req.header("X-User") == ""){
        res.status(401).send('User is Unauthorized.');
        return;
    }
    Message.findById(req.params.messageID).exec(function(err, message){
        if (err){
            res.status(500).send("Error retrieving message");
            return;
        }
        if(message.creator != req.header("X-User")){
            res.status(403).send("Current user is not the creator of this message");
        }
        Message.deleteOne({id:req.params.messageID});
        res.status(201).send("Message deletion was successful.");
    });
});


connect();
mongoose.connection.on('error', console.error)
     .on('disconnected', connect)
     .once('open', main);

async function main() {
    app.listen(port, "", () => {
        console.log(`server listening ${port}`);
    });
}
