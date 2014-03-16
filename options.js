// Saves options to localStorage.
function save_options() {
  var slackTokenField = document.getElementById("slackTokenField");
  var slackToken = slackTokenField.value;
  localStorage["slack_token"] = slackToken;

  // Update status to let user know options were saved.
  var status = document.getElementById("status");
  status.innerHTML = "Options Saved.";
  setTimeout(function() {
    status.innerHTML = "";
  }, 750);
}

// Restores select box state to saved value from localStorage.
function restore_options() {
  var slackToken = localStorage["slack_token"];
  if (!slackToken) {
    return;
  }
  var slackTokenField = document.getElementById("slackTokenField");
  slackTokenField.value = slackToken;
}

document.addEventListener('DOMContentLoaded', restore_options);
document.querySelector('#save').addEventListener('click', save_options);
