/*

Test proximity detector inputs:

curl -X POST -H 'Content-Type: application/json' -d '{"proximity":"3"}' http://10.249.36.223:3000/proximity

TODO
* investigate local network connection failures

*/

var firstRun = localStorage.firstRun || true;

function init() {

  // force the screen to stay on forever
  if (navigator.requestWakeLock) {
    navigator.requestWakeLock('screen');
  }
  else {
    console.log('No ability to requestWakeLock');
  }

  // initialize camera source
  cameraSource.start();
}
window.addEventListener('DOMContentLoaded', init);

function processNotification(trigger, notification, data) {
  if (!("Notification" in window)) {
    console.error("This browser does not support desktop notification");
  }

  Notification.requestPermission(function (permission) {
    if (permission === "granted") {
      new Notification(notification.title, {
        body: notification.description,
        icon: notification.icon
      });
    }
  });
}

function notifyIFTTT(value1, value2, value3) {
  var url = 'https://maker.ifttt.com/trigger/yourAppName/with/key/yourIFTTTKey';

  var msg = {
    value1: value1,
    value2: value2,
    value3: value3
  };

  sendJSON(url, msg);
}

console.log('init ws...');
var socket = new WebSocket('ws://' + window.location.hostname + ':8001');

console.log('inited ws!');

// interval timer for party mode
var timer = null;

socket.onmessage = function(msg) {
  console.log('ws message!!!')
  var obj = JSON.parse(msg.data);
  console.log('ws message:', obj)

  // private
  if (!obj['photoMode']) {
    console.log('no photoMode property... wtf');
  }
  else if (obj.photoMode == 1) {
    console.log('mode 1, no taking photos');
    // turn off party mode
    if (timer) {
      timer.cancel();
    }
  }
  // shy
  else if (obj.photoMode == 2) {
    console.log('mode 2, taking a photo');
    // turn off party mode
    if (timer) {
      timer.cancel();
    }
    cameraSource.snapshot();
  }
  // party
  else if (obj.photoMode == 3) {
    console.log('mode 3, taking photos every n seconds');
    cameraSource.snapshot();
    timer = setInterval(function() {
      console.log('snapshot!');
      cameraSource.snapshot();
    }, 60000)
  }
  // not supported
  else {
    console.log('unsupported mode, ignoring:', obj.photoMode);
  }
};

var button = document.createElement('button')
button.innerText = 'take snapshot'
button.addEventListener('click', function() {
  cameraSource.snapshot()
});
document.body.appendChild(button)
