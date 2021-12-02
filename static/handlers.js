
const clientSocket = io.connect("http://localhost:3000"); // creating a socket connection on port 3000.

// const clientSocket = io("http://localhost:3000", {
//   withCredentials: true,
 
// });



let homeRoom = "Community"; // default room the client is connected to.


// adding a user to the program upon entering their name.
function addUser()
{
    // gets the user UI tag and the userName value
    let userBox  = document.getElementById("userName");
    let userName = document.getElementById("user").value
    let chat = document.getElementById("chat");

    


    // checks if the userName is not undefined and that the string is a true string,
    if(userName!=undefined&&userName)
    {
        userBox.hidden=true; // hides the  userName UI 
        chat.style.visibility =  "visible"; // hides username UI
        clientSocket.emit("addUser", userName) // invokes the  servers add user functionality.

        

    }
    else
    {
        alert("Please enter a name. ") 
    }
  

}

// updates the list of users in the program.
clientSocket.on("updateList", function(data){
   
   
    

    let userList = document.getElementById("userList"); // obtains the list html element.

    userList.innerHTML = "";

    // for every user within the list enter as  a list element.
    for(var user in data )
    {
        userList.innerHTML+=`<li style="color: blue">${user}</li>`

    }
});


// add chat functionality when a user creates a new chat room.
function addChat()
{
    
    let room =  document.getElementById("roomName") // retreiving element
    
    clientSocket.emit("newChat", room.value) // invoking listener event on server side to create a new chat room.
    room.value = "";

}

// allows the user to switch into a  new room upon clicking that room name.
function switchRoom(newRoom)
{
    // if the newRoom is not the same room the user already resides, switch their room on the  server side and set the home room to the  new  room.
    if(newRoom!=homeRoom)
    {
        clientSocket.emit("switchRoom", newRoom)
        homeRoom = newRoom
    }

}


// sending message function.
function transferMessage()
{
    let text = document.getElementById("userMessage").value; // obtains the message value.
    clientSocket.emit("transferMessage", text); // sends the  message to the server  to broadcast to all users within the same room.
    text.value = "";

}


// updates the  chat window of the user.
clientSocket.on("notifyChat", (userType, notifier)=>{

    let chatMessage = document.getElementById("chatMessages") // obtains  element

    // checks if the message is an ADMIN message or not
    if(userType=="ADMIN")
    {
       
        chatMessage.innerHTML+= "<p>" + notifier + "</p>";

    }
    else
    {
        chatMessage.innerHTML+=`<p style="font-weight: bold"><span style="color:blue">${userType}:</span> ${notifier} </p>`
    }

    // ensures the user  can  see all messages within the window.
    let messageContainer = document.getElementById("messageContainer");
    messageContainer.scrollTop = messageContainer.scrollHeight;


});

// switch room listener on client side that updates the rooms list on the front-end.
clientSocket.on("switchRoom", (newRooms)=>{

   

    let listOfRooms = document.getElementById("rooms"); // obtaining  element.
    listOfRooms.innerHTML=``;

    // loop through all rooms and add it to the list.
    for(var num in newRooms)
    {
        listOfRooms.innerHTML +=  `<li  id="${newRooms[num]}" onclick="switchRoom('${newRooms[num]}')" style="text-decoration: underline; color: green"> ${newRooms[num]} </li>`;
    
       
    }

});

