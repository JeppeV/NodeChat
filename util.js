

module.exports = {
    
    //functions
    
    //types
    
    User : function User(name) { 
        
        this.name = name;
        var date = new Date();
        this.time = date.getTime();
            
    },

    ChatRoom : function(name, owner, password) {
            
        this.name = name;
        this.owner = owner;
        this.password = password;
        var date = new Date();
        this.lastUsed = date.getTime();
        this.users = [];
        this.messages = [];
        
        this.updateTime = function () {
            var date = new Date();
            this.lastUsed = date.getTime();
        };
        
        this.addUser = function (user) {
            this.users.push(user);
            this.updateTime();
        };
        
        this.removeUser = function (user) {
            var index = this.getIndexOfUser(user);
            if(index > -1) {
                this.users.splice(index, 1);
            }
        };
        
        this.getIndexOfUser = function(user) {
            for(var i = 0; i < this.users.length; i++) {
                var u = this.users[i];
                if(u.name == user.name && u.time == user.time){
                    return i;
                }
            }
            return -1;
        };
            
    },
    
    
    attemptRoomRemoval : function(rooms) {
        if(rooms.length >= 50) {
            var r = getFirstEmptyRoom();
            if(r !== null){
                var index = getIndexOfChatRoom(rooms, r);
                if(index > -1){
                    rooms.splice(index, 1);
                }  
            }
        }
    },
    
    getFirstEmptyRoom : function(rooms) {
        for(var i = 3; i < rooms.length; i++) {
            if(rooms[i].users.length == 0){
                return rooms[i];
            }
        }
        return null;
    },
    
    addMessageToRoom : function(message, room) {
        if(room.messages.length === 50){
            room.messages.shift();
        }
        room.messages.push(message);
        return room;
    },
    
    getChatRoomByName : function(name, rooms) {
        for(var i = 0; i < rooms.length; i++) {
            if(rooms[i].name === name){
                return rooms[i];
            }
        }
        return null;
    },
    
    
    getIndexOfChatRoom : function(rooms, chatroom) {
        for(var i = 0; i < rooms.length; i++) {
            if(rooms[i].name == chatroom.name){
                return i;
            }
        }
        return -1;   
    }
    
    
    
    
    
}

/*
ChatRoom.prototype.updateTime = function () {
    var date = new Date();
    this.lastUsed = date.getTime();
};

ChatRoom.prototype.addUser = function (user) {
    this.users.push(user);
    this.updateTime();
};

ChatRoom.prototype.removeUser = function (user) {
    var index = getIndexOfUser(this.users, user);
    if(index > -1) {
        this.users.splice(index, 1);
    }
};
*/