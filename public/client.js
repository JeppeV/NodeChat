var socket = io.connect("http://127.0.0.1:3000");
var username, currentChatroom = null;

//initial setup
$(window).ready(function() {
    initUsernameSelection();
})

function initUsernameSelection() {
    //manipulate HTML
    $("h1").text("Welcome to NodeChat! Enter your username below.");
    $('#m').attr("placeholder", "Enter username");
    $('#m').attr("maxlength", "8");
    $('#button').attr("value", "Go");
    $('#up').off();
    $('#up').css("visibility", "hidden");
    $('#sync').css("visibility", "hidden");
    $('#messages').empty();
    //setup event listeners
    $('form').off();
    $('form').on('submit', function(){
    var name = $('#m').val().trim();
        if(name != ""){
            username = name;
            socket.emit('username', $('#m').val());
            initChatRoomSelection();
        } else {
            window.alert("Username cannot be left blank!");
        }
        //empty message field
        $('#m').val('');
        //do not reload page
        return false;
    });
};

function initChatRoomSelection() {
    //manipulate HTML
    $("h1").text("Select a chatroom to enter or create a new one!");
    $('#m').attr("placeholder", "Enter name of new chatroom");
    $('#m').attr("maxlength", "16");
    $('#button').attr("value", "Create");
    $('#up').css("visibility", "visible");
    $('#sync').css("visibility", "visible");
    $('#users_container').css("visibility", "hidden");
    //setup event listeners
    $('form').off();
    $('form').on('submit', function(){ 
        var msg = $('#m').val().trim();
        if(msg != ""){
            var password = window.prompt("Do you wish to add a password? Leave blank if you dont.");
            password = password.trim();        
            socket.emit('new chatroom', $('#m').val(), password);
            // 'new chatroom' -> 'new chatroom'
        }
        $('#m').val('');
        return false;
    });
    
    $('#up').on('click', function(){
        initUsernameSelection();
    });
    
    $('#sync').on('click', function(){
        socket.emit('request chatrooms');
    });
    
    //request chatrooms from server
    socket.emit('request chatrooms');
    // 'request chatrooms' -> 'chatrooms'
};

socket.on('chatrooms', function(chatrooms) {
   
    $('#messages').empty();
    
    chatrooms.forEach(function(chatroom){
        var name = chatroom.name;
        var li = document.createElement('li');
        $(li).text(name);
        $(li).on("click", function(){
            attemptEnterChatRoom(name);
        });
        $('#messages').append($(li));
        $(li).addClass('chatroom');
    });
});

function attemptEnterChatRoom(chatroom) {
    socket.emit("request chatroom", chatroom);
    // 'request chatroom' -> 'verify chatroom'
}


socket.on('new chatroom', function(chatroom) {
    if(chatroom == null){
        socket.emit('request chatrooms'); 
    }else{
        window.alert("That chatroom name was already taken. Try another.");
    }
    
});


socket.on("verify chatroom", function(chatroom) {
    // receives chatroom name if it exists, else null
    if(chatroom) {
        if(chatroom.password !== ""){
            inputPass = window.prompt(chatroom.name + " is password protected. Enter password:");
            if(inputPass){
                if(inputPass === chatroom.password){
                    initChatRoom(chatroom);
                    socket.emit('enter chatroom', chatroom.name);
                } else{
                    window.alert("Sorry, the password you entered was incorrect");
                    socket.emit('request chatrooms');
                }
            }
            
        } else {
           initChatRoom(chatroom);
           socket.emit('enter chatroom', chatroom.name);
        }
        
        
    } else {
        window.alert("Sorry, that chatroom does not exist");
        socket.emit('request chatrooms');
    }
});



//######### chat #########

function initChatRoom(chatroom) {
    //manipulate HTML
    $('form').off();
    $('#m').attr("placeholder", "Enter a chat message");
    $('#m').attr("maxlength", "200");
    $('#button').attr("value", "Send");
    $('#sync').css("visibility", "hidden");
    $("h1").text(chatroom.name);
    $('#up').on('click', function(){
        socket.emit('leave chatroom');
        initChatRoomSelection();
    });
    $('#users_container').css("visibility", "visible");

    initMessages(chatroom.messages);
};



function updateUsers(users) {
    $('#users').empty();
    for(var i = 0; i < users.length; i++){
        var li = document.createElement('li');
        $(li).text(users[i].name);
        $('#users').append($(li));
    }
};

socket.on('user update', function(users){
    updateUsers(users);
});



function initMessages(messages) {
     updateMessages(messages);
     $('form').submit(function(){
        var msg = $('#m').val().trim();
        if(msg != ""){
            socket.emit('chat message',$('#m').val());
            // 'chat message' -> 'chat message'
        }

        $('#m').val('');
        return false;
    });
};

function updateMessages(messages) {
    $('#messages').empty();
    for(var i = 0; i < messages.length; i++){
        var li = document.createElement('li');
        $(li).text(messages[i]);
        $('#messages').append($(li));
    }
}

socket.on('chat message', function(messages) {
    updateMessages(messages);
    var messageDiv = document.getElementById("container");
    messageDiv.scrollTop = messageDiv.scrollHeight;
});
