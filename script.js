// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.2/firebase-app.js";
import * as rtdb from "https://www.gstatic.com/firebasejs/9.0.2/firebase-database.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.0.2/firebase-analytics.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
  const firebaseConfig = {
    apiKey: "AIzaSyAlt4zxkyjdAu-LL0w9YLEk-TPdbU0aKDM",
    authDomain: "chat-1db7a.firebaseapp.com",
    projectId: "chat-1db7a",
    storageBucket: "chat-1db7a.appspot.com",
    messagingSenderId: "664090226129",
    appId: "1:664090226129:web:18536504dc9d311fe904f0"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
let db = rtdb.getDatabase(app);
let titleRef = rtdb.ref(db, "/");
let peopleRef = rtdb.child(titleRef,"people");
let chatRef = rtdb.child(titleRef,"chat()");
let username = "";

//let newObj = {"yes": true, "no": false, "people": ["what"]};
//rtdb.update(titleRef,newObj);
//rtdb.push(peopleRef,newObj);

$( "#sender" ).click(function() {
  if(username != "") {
    $("#needLogin").html('');
    let message = $( "#message").val();
    if(message.length > 0) {
      console.log(message.length);
      $("#message").val('');
      let newMessage = {"message": message, "sender": username};
      rtdb.push(chatRef,newMessage);
   }
  }
  else {
    console.log("bad");
    $("#needLogin").html('please enter login');
  }
});

$("#message").keyup(function(event) {
    if (event.keyCode === 13) {
        $("#sender").click();
    }
});

$( "#clear" ).click(function() {
  rtdb.set(chatRef,"");
});

$( "#login" ).click(function() {
  username = $( "#username" ).val();
  console.log(username);
  if(username.length > 0) {
    $("#whoami").html('logged in as: ' + username);
  }
  else {
    $("#whoami").html('');
  }
});

$("#username").keyup(function(event) {
    if (event.keyCode === 13) {
        $("#login").click();
    }
});

rtdb.onValue(chatRef, ss=>{
  $(".chatBox").empty();
  //let counter = 0;
  ss.forEach(function(item){
    //counter++;
    let chatInput = JSON.stringify(item.val().message);
    if(chatInput.length > 2) {
      var strWithOutQuotes= chatInput.replace(/"/g, '');
      if(username == item.val().sender) {
        $(".chatBox").append('<li class="me">' + strWithOutQuotes +'</li>');
      }
      else {
         $(".chatBox").append('<li class="you">' + strWithOutQuotes +'</li>');
      }
    }
  });
});