const express = require("express")
const app = express();
const port = 3000;
const { Server } = require("socket.io");

const commandInput = require("readline");

app.use(express.static("static"))

let socketServer = app.listen(port, ()=>
{
    console.log("Server Listening on  Port: " + port)
})

let chatUsers = {};
let rooms = ["Community"]

const io = new Server(socketServer);

const serverLine  = commandInput.createInterface({input: process.stdin, output: process.stdout})



io.on("connection", (socket) => {

    function killClient()
    {
        socket.broadcast.emit("notifyChat", "ADMIN", "The Server has been Terminated!")
    }


    serverLine.question("Input kill to close the server ", (input)=>{
        if(input=="kill")
        {
            killClient();
            process.kill(process.pid)
        }
    })


    socket._error((err)=>{
        alert(err);
    })


    
    socket.on("addUser", function (name){
   
        socket.userName = name;
        chatUsers[name] = name;
        io.sockets.emit("updateList", chatUsers);
        socket.homeRoom = "Community";

        socket.join("Community");

        socket.emit("notifyChat", "ADMIN", " Has Entered the Chat Room." )

        socket.broadcast.to("Community").emit("notifyChat", name + " Has joined the chat.")

        
    });

    socket.on("switchRoom", (newRoom)=>{
        socket.broadcast.to(socket.homeRoom).emit("notifyChat", "ADMIN",
        socket.userName + " Has Left This Chat Room. ");
        socket.leave(socket.homeRoom)
        socket.homeRoom = newRoom
        socket.join(newRoom)
        socket.emit("notifyChat", "ADMIN", socket.userName + " Has Joined " +  newRoom)
        socket.broadcast.to(newRoom).emit("notifyChat", "ADMIN",
        socket.userName + " Has Entered the Chat Room.")
    });

    socket.on("disconnect", ()=>{
        delete chatUsers[socket.userName];
        io.sockets.emit("updateList", chatUsers);
        socket.broadcast.emit("notifyChat", "ADMIN", socket.userName + " Has Left The Chat!");
        socket.leave(socket.homeRoom)
    });


    socket.on("newChat", (newRoom)=>{

        if(rooms!=null)
        {
            rooms.push(newRoom);
            io.sockets.emit("switchRoom", newRoom)
        }
        else
        {
            alert("Something went wrong!")
        }

    });

    socket.on("transferMessage", (message)=>{

       io.sockets.to(socket.homeRoom).emit("notifyChat", socket.userName, message)

    });



    



  });

