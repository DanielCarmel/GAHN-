if(localStorage.getItem("email") == null ||
   localStorage.getItem("email") == ""){

  var newEmail;
  var emailGood = false;
  newEmail = prompt("Please enter your email:", "");

  while(newEmail == null || newEmail == "" || emailGood != true) {
    if(validateEmail(newEmail)){
      localStorage.setItem("email", newEmail);
      emailGood = true;
    } else {
      newEmail = prompt("Please try again:", "");
    }
  }
}

if(localStorage.getItem("currentTime") == null ||
  localStorage.getItem("currentTime") == ""){
    localStorage.setItem("currentTime", getDate())
  }

function validateEmail(email) {
  var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(email);
}

if(localStorage.getItem("index") == null ||
  localStorage.getItem("index") == ""){
    localStorage.setItem("index", 0);
  }

if(localStorage.getItem("lastSendDate") == null ||
  localStorage.getItem("lastSendDate") == ""){
    localStorage.setItem("lastSendDate", getDate());
}

chrome.tabs.onUpdated.addListener( function (tabId, changeInfo, tab) {
  if(changeInfo.status == "complete"){
      // Add new URL to the list
      localStorage.setItem(localStorage.getItem("index"), tab.url + "," + getDate());
      // Update the index
      localStorage.setItem("index", parseInt(localStorage.getItem("index")) + 1);
    }
  
    if((getDate() - localStorage.getItem("lastSendDate")) > 86400000){
      sendData();
    }
})

// Get the time
function getDate(){
  var timeMilliseconds = new Date(); 
  return(timeMilliseconds.getTime());
}

// Get history report
function getReport(){
  var array = [];
  var item = {};

  for(i = 0; i < parseInt(localStorage.getItem("index")); i++){
    item = {};
    currURL = localStorage.getItem(i);
    currURL = currURL.split(",");
    item["url"] = currURL[0];
    item["time"] = currURL[1];

    array.push(item);
  }

  var a = JSON.stringify(array)
  var array = JSON.parse(a)
  return(array);
}

//send the data to the server
function sendData(){
  var http = new XMLHttpRequest();
  var url = "https://gahn.herokuapp.com/"
  var params = getReport();

  http.open("POST", url);
  http.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
  http.onreadystatechange = function(){
    if(http.readyState == 4 && http.status == 200){
      console.log(http.responseText);
    }
  }

  var data = JSON.stringify({'data': JSON.stringify(getReport()), 'email': localStorage.getItem("email")});
  http.send(data);
  restoreDetails();
  localStorage.setItem("lastSendDate", getDate());
}

// Clear localStorage and index and 
// set in to default
function restoreDetails(){
  var email = localStorage.getItem("email")
  localStorage.clear();
  index = 0;
  localStorage.setItem("index", index);
  localStorage.setItem("email", email);
}