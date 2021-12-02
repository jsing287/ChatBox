const express = require("express")
const app = express();
const port = 80;
//const { Server } = require("socket.io"); //acquiring the  socket.io library to create and use socket connections.

const commandInput = require("readline"); // allows reading from the terminal.


  


app.use(express.static("static")) //  telling express  to use the static folder index.html as default load.


// creating a server that listens on port 3000.
let socketServer = app.listen(port, '0.0.0.0', ()=>
{
    console.log("Server Listening on  Port: " + port)
})


 //const io = new Server(socketServer);  // creating an instance of a socket server.

 const io = require("socket.io")(socketServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
      allowedHeaders: ["Access-Control-Allow-Origin"],
      credentials: true
    }
  });

// creating an instance of a command line interface.
const serverLine  = commandInput.createInterface({input: process.stdin, output: process.stdout})



let chatUsers = {}; // a JSON to  hold  all current chat  users.
let rooms = ["Community"]  // an array to hold all rooms that have been created within the chatroom


// the initial .on connect method starts when the socket  connection has been successfully made.
io.on("connection", (socket) => {

    // broadcasts a message to all clients that the socket server has been terminated.
    function killClient()
    {
        socket.broadcast.emit("notifyChat", "ADMIN", "The Server has been Terminated!") // emitter to notify the chat window  of all clients.
    }


    // Outputs a question into the commandline asking users to enter the word "kill"  if they would like to terminate the server
    serverLine.question("Input kill to close the server ", (input)=>{
        if(input=="kill")
        {
            killClient();
            process.kill(process.pid)
        }
    })


    // error handling if there is a connection error to the server.
    socket.on("connect_error", (err) => {
        console.log(`connect_error due to ${err.message}`);
      });



      // listener event for the addUser function of the program.
    socket.on("addUser", function (name){
   
        // sets a socket attribute userName to the name passed for easy access in other listeners and adds it to the chatUser object.
        socket.userName = name;
        chatUsers[name] = name;

        // updates all client clients user lists on the front end html to the new json object list.
        io.sockets.emit("updateList", chatUsers);
        socket.homeRoom = "Community"; // putss the user in the default community room

        socket.join("Community"); // joins the room

        socket.emit("notifyChat", "ADMIN", name + " Has Entered the Chat Room." ) // notifies the chat that user has entered

        // broadcats to all users within the chat the user has joined the chat.
        socket.broadcast.to("Community").emit("notifyChat", name + " Has joined the chat", "")
        io.sockets.emit("switchRoom",  rooms) 

        
    });

    // listener event for when a user wants to switch to a different chat room.
    socket.on("switchRoom", (newRoom)=>{
 
        // notifies all users within the chat that a specific user has left. 
        socket.broadcast.to(socket.homeRoom).emit("notifyChat", "ADMIN",
        socket.userName + " Has Left This Chat Room. ");
        socket.leave(socket.homeRoom) // leaves the socket  room
        socket.homeRoom = newRoom // sets the homeRoom attribute to the newRoom 
        socket.join(newRoom) // joins the new Room.
       
        //  notifies all users within the new chat  room that the user has entered.
        socket.emit("notifyChat", "ADMIN", socket.userName + " Has Joined " +  newRoom)
        socket.broadcast.to(newRoom).emit("notifyChat", "ADMIN",
        socket.userName + " Has Entered the Chat Room.")
    });

    // listener event for when an individual client socket has disconnected from the server.
    socket.on("disconnect", ()=>{

        // graceful termination of the  client socket with its removal from the users json
        delete chatUsers[socket.userName];
        io.sockets.emit("updateList", chatUsers); //  updates the user list
        socket.broadcast.emit("notifyChat", "ADMIN", socket.userName + " Has Left The Chat!"); //  notifies users that the client has left the chat.
        socket.leave(socket.homeRoom) // removes them from the socket room.
    });


    // listener event  from when a new chat room is created
    socket.on("newChat", (newRoom)=>{

        
        // if the room name is not null push it into the array and run all client sockets switchRoom listener event
        if(rooms!=null)
        {
            rooms.push(newRoom);
            io.sockets.emit("switchRoom", rooms)
        }
        else
        {
            alert("Something went wrong!  Room name null") // alert is the room name  is null
        }

    });

    // notifies the  chat that a message has been sent and sends it to all client sockets that are listening on that room.
    socket.on("transferMessage", (message)=>{

       io.sockets.to(socket.homeRoom).emit("notifyChat", socket.userName, message)

    });



    



  });

