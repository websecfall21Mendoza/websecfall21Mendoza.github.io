  // Import the functions you need from the SDKs you need
  import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.2/firebase-app.js";
import * as rtdb from "https://www.gstatic.com/firebasejs/9.0.2/firebase-database.js";
  // TODO: Add SDKs for Firebase products that you want to use
  // https://firebase.google.com/docs/web/setup#available-libraries

  // Your web app's Firebase configuration
  const firebaseConfig = {
    apiKey: "AIzaSyBFCS1tp8tpRZneIOWbCwB76BschzjN-Zo",
    authDomain: "mini-cord.firebaseapp.com",
    projectId: "mini-cord",
    storageBucket: "mini-cord.appspot.com",
    messagingSenderId: "62099491016",
    appId: "1:62099491016:web:9645dbcfabade13587bdfd"
  };

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
let db = rtdb.getDatabase(app);
let titleRef = rtdb.ref(db, "/");
let servers = rtdb.child(titleRef,"servers()");
let username = "guest";//window.prompt("Please enter name");
let server = "";
let channel = "";
let chat = "";
let serverRef = "";
let channelRef = "";
let chatRef = "";
let usersRef = "";
let ignore = false;
let serverCount = 0;
let channelCount = 0;
let messageCount = 0;
let userCount = 0;
let changedServers = false;

//let newObj = {"yes": true, "no": false, "people": ["what"]};
//rtdb.update(titleRef,newObj);
//rtdb.push(peopleRef,newObj);

//assembleRefs();
//getMessages();
//console.log(chatRef);
getServers();
// A $( document ).ready() block.
$( document ).ready(function() {
  console.log( "ready!" );
  $("#login").keyup(keyHandler);
});

let keyHandler = function(evt) {
  console.log(evt.keyCode);
  if (evt.keyCode === 13) {
    username = $("#login").val();
    $("#showUsername").text(`Logged in as: ${username}`);
  }
  //let idFromDOM = $(clickedElement).attr("data-id");
  //alert(idFromDOM);
}

/*$("#login").keyup(function(event) {
  if (event.keyCode === 13) {
    username = $("#login").val();
    $("#showUsername").text(`Logged in as: ${username}`);

  }
});*/

$(".adder").click(function(){
  ignore = true;
  let newVal = window.prompt("Please enter name");
  if(newVal != null && newVal.length > 0) {
    let adderId = $(this).attr('id');
    if(adderId == "addServer") {
      let info = {"serverName": newVal,"creator": username};
      let generalChat = {"channelName": "general", "creator": username};
      let newServer = rtdb.child(servers,newVal);
      let textChat = rtdb.child(newServer,"chats");
      let gChat = rtdb.child(textChat,"general");
      let chat = rtdb.child(gChat,"messages");
      let newChannel = {"message": "first message!", "user": username};
      let users = rtdb.child(newServer,"users");
      let firstUser = rtdb.child(users,username);
      let userInfo = {"roll":"admin"};
      rtdb.update(firstUser,userInfo);
      ignore = true;
      rtdb.push(chat, newChannel);
      ignore = true;
      rtdb.update(newServer,info);
      ignore = true;
      rtdb.update(gChat,generalChat);
      getServers();
    }
    else if(adderId == "addChannel") { //FIX
      let info = {"serverName": server,"creator": username};
      let generalChat = {"channelName": newVal, "creator": username};
      let newServer = rtdb.child(servers,server);
      let textChat = rtdb.child(newServer,"chats");
      let gChat = rtdb.child(textChat,newVal);
      let chat = rtdb.child(gChat,"messages");
      let newChannel = {"message": "first message!", "user": username};
      rtdb.push(chat, newChannel);
      rtdb.update(gChat,generalChat);
    }
    console.log(newVal);
  }
});

rtdb.onValue(servers, ss=>{
  if(server.length == 0) {
    ignore = false;
    return;
  }
  console.log(channelCount);
  if(!ignore) {
    assembleRefs();
    console.log("hit");
    getServers();
    getChannels();
    console.log(`user: ${username}`);
    addUserIfNeeded();
    console.log(channelRef);
    getUsers();
    if(channelRef.length == 0) {
      ignore = false;
      return;
    }
    rtdb.get(channelRef).then(ss=>{ //prevents message refresh every time something changes that's not relevant to messages
      if(messageCount < Object.keys(ss.val().messages).length) {
        messageCount = Object.keys(ss.val().messages).length;
        getMessages();
        console.log("msg refresh");
      }
      
    });
    //getMessages();
  }
  ignore = false;
});

$(document).on('click', '.serverChoice', function() {
  $("#messagesList").empty();
  //$("#enterChat").hide();
  //$("#enterChat").html("hello");
  $("usersList").empty();
  changedServers = true;
  highlightServers($(this).attr('id'));
  channel = "";
  server = $(this).attr('id');
  
  assembleRefs();
  getChannels();
  addUserIfNeeded();
  if(channel.length == 0) {
    return;
  }
  getMessages();
  rtdb.get(serverRef).then(ss=>{
    channelCount = Object.keys(ss.val().chats).length;
  });
  rtdb.get(channelRef).then(ss=>{
    messageCount = Object.keys(ss.val().messages).length;
  });
  rtdb.get(serverRef).then(ss=>{
    userCount = Object.keys(ss.val().users).length;
  });
});

function highlightServers(id) {
  if(!changedServers) {
    $(`#${id}`).css("background-color","#B6D0E2");
  }
  else {
    changedServers = false;
    if(server.length > 0){
      console.log("changing");
      $("#" + server).css("background-color","#F6D1D9");
    }
    $(`#${id}`).css("background-color","#B6D0E2");
  }
}

$(document).on('click', '.channelChoice', function() {
  if(channel.length > 0) {
    $("#" + channel).css("background-color","#C3B1E1");
  }
  channel = $(this).attr('id');
  assembleRefs();
  getMessages();
  rtdb.get(channelRef).then(ss=>{
    messageCount = Object.keys(ss.val().messages).length;
    console.log(messageCount);
  });
  rtdb.get(serverRef).then(ss=>{
    userCount = Object.keys(ss.val().users).length;
  });
  $(this).css("background-color","#B6D0E2");
});

function addUserIfNeeded() {
  rtdb.get(usersRef).then(ss=>{
    if(ss.val().hasOwnProperty(username)) {
      console.log("getting!");
      console.log("exists!");
    }
    else {
      let firstUser = rtdb.child(usersRef,username);
      let userInfo = {"roll":"user"};
      rtdb.update(firstUser,userInfo);
    }
  });
}

function getUsers() {
  $("#usersList").empty();
  rtdb.get(usersRef).then(ss=>{
    ss.forEach(function(item){
      let usersInput = JSON.stringify(item.key);
      if(typeof(usersInput) != "undefined"){
        var strWithOutQuotes= usersInput.replace(/"/g, '');
        $("#usersList").append('<li class="user" id = "' + strWithOutQuotes + '"><p>' + item.val().roll + ": " + strWithOutQuotes +'</p></li>');
      }
    });
  });
}

function getMessages() {
  $("#messagesList").empty();
  rtdb.get(chatRef).then(ss=>{
    ss.forEach(function(item){
      //console.log(`id: ${item.key}`);
      let idVal = item.key;
      let channelsInput = JSON.stringify(item.val().message);
      let userStamp = item.val().user;
      if(typeof(channelsInput) != "undefined"){
        var strWithOutQuotes= channelsInput.replace(/"/g, '');
        $("#messagesList").append('<li class="messageChoice" id = "' + idVal + '"><h4>' + item.val().user + "</h4><p>" + strWithOutQuotes +'</p></li>');
        //$(`#${idVal}`).click(getMessageInfo);
      }
    });
  });
}

/*let getMessageInfo = function(evt) {
  let clickedElement = evt.currentTarget;
  alert(clickedElement);
}*/

function getChannels() {
  $("#channelsList").empty();
  serverRef = rtdb.child(servers,server);
  let chatsHolder = rtdb.child(serverRef,"chats");
  rtdb.get(chatsHolder).then(ss=>{
    ss.forEach(function(item){
      let channelsInput = JSON.stringify(item.val().channelName);
      if(typeof(channelsInput) != "undefined"){
        var strWithOutQuotes= channelsInput.replace(/"/g, '');
        $("#channelsList").append('<li class="channelChoice" id = "' + strWithOutQuotes + '"><p>' + strWithOutQuotes +'</p></li>');
        if(strWithOutQuotes == channel) {
          var channelId = "#" + channel;
          $(channelId).css("background-color","#B6D0E2");
        }
      }
    });
  });
}

function getServers() {
  $("#servers").empty();
  rtdb.get(servers).then(ss=>{
    ss.forEach(function(item){
      let channelsInput = JSON.stringify(item.val().serverName);
      if(typeof(channelsInput) != "undefined"){
        var strWithOutQuotes= channelsInput.replace(/"/g, '');
        $("#servers").append('<div class="serverChoice" id = "' + strWithOutQuotes + '"><p>' + strWithOutQuotes +'</p></div>');
        if(strWithOutQuotes == server) {
          var serverId = "#" + server;
          $(serverId).css("background-color","#B6D0E2");
        }
      }
    });
  });
}

function assembleRefs() {
  if(server.length > 0) {
    serverRef = rtdb.child(servers,server);
    let chatsHolder = rtdb.child(serverRef,"chats");
    usersRef = rtdb.child(serverRef,"users");
    if(channel.length > 0) {
      channelRef = rtdb.child(chatsHolder,channel);
      chatRef = rtdb.child(channelRef,"messages");
    }
  }
}

$("#enterChat").keyup(function(event) {
    if (event.keyCode === 13) {
        submitMessage($("#enterChat").val());
    }
});

function submitMessage(entered) {
  ignore = true;
  $("#enterChat").val('');
  assembleRefs();
  let msg = {"message": entered, "user": username};
  console.log(entered);
  rtdb.push(chatRef, msg);
  getMessages();
}
