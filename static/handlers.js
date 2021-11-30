


const clientSocket = io.connect("http://localhost:3000");

let homeRoom = "Community";


function addUser()
{
    let userBox  = document.getElementById("userName");
    let userName = document.getElementById("user").value
    let chat = document.getElementById("chat");

    console.log(userName)


    if(userName!=undefined&&userName)
    {
        userBox.hidden=true;
        chat.style.visibility =  "visible";
        clientSocket.emit("addUser", userName)

    }
    else
    {
        alert("Please enter a name. ")
    }
  

}

clientSocket.on("updateList", function(data){
    console.log("hello")
   
    

    let userList = document.getElementById("userList");

    userList.innerHTML = "";

    for(var user in data )
    {
        userList.innerHTML+=`<li>${user}</li>`

    }
});


function addChat()
{
    clientSocket.emit("newChat", document.getElementById("roomName").value)
    document.getElementById("roomName").value = "";

}

function switchRoom(newRoom)
{
    if(newRoom!=homeRoom)
    {
        clientSocket.emit("switchRoom", newRoom)
        homeRoom = newRoom
    }

}


function transferMessage()
{
    let text = document.getElementById("userMessage").value;
    clientSocket.emit("transferMessage", text);
    text.value = "";

}

clientSocket.on("notifyChat", (userType, notifier)=>{

    let chatMessage = document.getElementById("chatMessages")

    if(userType=="ADMIN")
    {
        chatMessage.innerHTML+= "<p>" + notifier + "</p>";

    }
    else
    {
        chatMessage.innerHTML+=`<p style="font-weight: bold"><span>${userType}</span></p>`
    }

    let messageContainer = document.getElementById("messageContainer");
    messageContainer.scrollTop = messageContainer.scrollHeight;


});

clientSocket.on("switchRoom", (newRooms)=>{

    let listOfRooms = document.getElementById("rooms");

    for(var room in newRooms)
    {
        listOfRooms.innerHTML+=`<li id=${newRooms[room]} onclick = "switchRoom(${newRooms[room]})">`
        listOfRooms.innerHTML+=`${newRooms[room]}</li>`
    }

});

