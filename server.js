var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var portNumber = 3000;
var util = require("./util");
//get constructors for classes
var User = util.User;
var ChatRoom = util.ChatRoom;


//86400000 = 1 day in ms
//every half day, check if an empty room has been idle for more than 1 day
var halfDayInMs =  43200000;
var fullDayInMs = 2 * halfDayInMs;
setTimeout(cleanChatRooms, halfDayInMs);

function cleanChatRooms() {
    
    var now = new Date().getTime();
    var toBeRemoved = [];
    for(var i = 0; i < chatrooms.length; i++) {
        var room = chatrooms[i];
        //if the chatroom is empty, and it is not a default room, check room
        if(room.users.length === 0 && room.owner !== "") {
            var delta = now - room.lastUsed;
            //if it has been more than a day since the room was last used, add the room to the list of toBeRemoved rooms
            if(delta >= fullDayInMs){
                toBeRemoved.push(room);
            }
        }
    }
    for(var j = 0; j < toBeRemoved.length; j++) {
        var index = util.getIndexOfChatRoom(chatrooms, toBeRemoved[j]);
        if(index > -1) {
            chatrooms.splice(index, 1);
        }
    }
    setTimeout(cleanChatRooms, halfDayInMs);
}



var chatrooms = new Array();
//initialize default chatrooms
chatrooms.push(new ChatRoom("Default Room 1", "", ""));
chatrooms.push(new ChatRoom("Default Room 2", "", ""));
chatrooms.push(new ChatRoom("Default Room 3", "", ""));


io.on('connection', function(clientSocket){
    console.log('A user connected.');
    addEventListeners(clientSocket);
    
});


function addEventListeners(clientSocket){
    
    clientSocket.on('disconnect', function(){
        var room = clientSocket.room;
        var user = clientSocket.user;
        if(room){
            room.removeUser(user);
            
        };
        console.log("A user disconnected.");
        
    });
    
    clientSocket.on('username', function(username){
        clientSocket.user = new User(username);
        
    });
    
    clientSocket.on('request chatrooms', function(){
        clientSocket.emit('chatrooms', chatrooms); 
    
    });
    
    clientSocket.on('request chatroom', function(chatroom){
        var room = util.getChatRoomByName(chatroom, chatrooms);
        clientSocket.emit('verify chatroom', room);
    });

    clientSocket.on('enter chatroom', function(chatroom){
        var room = util.getChatRoomByName(chatroom, chatrooms);
        room.addUser(clientSocket.user);
        clientSocket.room = room;
        clientSocket.join(room.name);
        console.log("User", clientSocket.user.name, "entered room" , room);
        io.to(room.name).emit('user update', room.users);
    });


    //when a user leaves a chatroom without disconnecting, in which case he is automatically removed from the chatroom and the socketroom
    clientSocket.on('leave chatroom', function(){
        //if a user leaves a room, it could not have been removed as it would not have been empty, therefore we can assume that it exists
        var room = clientSocket.room;
        var user = clientSocket.user;
        
        room.removeUser(user);
        clientSocket.leave(room.name);
        clientSocket.room = null;
        io.to(room.name).emit('user update', room.users);
        
    });
    
    clientSocket.on('new chatroom', function(chatroom, password){
        var room = util.getChatRoomByName(chatroom, chatrooms);
        //if room does not already exist, create new chatroom
        if(room == null){
            addNewRoom(chatroom, clientSocket.user, password, chatrooms);
        }
        clientSocket.emit('new chatroom', room);
        
        
    });
    
    clientSocket.on('chat message', function(msg){
        //emit message to clients in same room
        var message = clientSocket.user.name + ": " + msg;
        var room = util.addMessageToRoom(message, clientSocket.room);
        io.to(room.name).emit('chat message', room.messages);
        
    });
    
    
}

function addNewRoom(name, username, password, rooms) {
        var room = new ChatRoom(name, username, password);
        util.attemptRoomRemoval(rooms);
        rooms.push(room);
};

app.use(express.static(__dirname + '/public'));

http.listen(portNumber, function(){
    console.log("Listening on port", portNumber);
});

