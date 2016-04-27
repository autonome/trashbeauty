/*

  Overview: Turning sensors into signals. For human consumption.

  * Use existing hardware like old smartphones.
  * Use built-in sensors to derive as much meaning from ambient information as possible.
  * Privacy: not recording voice, just presence/absence of sound.

  Use-Cases

  * No sound for 2hrs, something is wrong. Mom had a heart attack. 
  * Am traveling, get notification of power outage.
  * Am traveling, get notification of "Joe's iPhone" in the house. WTF.
  * Getting dark and no people are around, so turn the lights off.
  * How am i sleeping? Analyse relative noise/motion.
  * You haven't left the house in 5 days (Genevieve Bell)

  TODO implement broad classification detectors

  * home vs away vs asleep
  * people present - active or not
  * relative noisiness
  * a person is in my house (bluetooth, sound, speech)
  * a person has arrived
  * a person has departed
  * how many people are around
  * detect a cat, dog, bird

  Signals

  * Hardware capabilities are 'sources', eg Wifi.
  * Sources can emit multiple signals, eg 'wifi connection lost', 'new wifi network found'
  * Properties:
  ** sourceId (string), eg 'bluetooth'
  ** sourceLabel (string), eg 'Bluetooth'
  ** sourceIcon (string URL)
  ** signalId: (string), eg 'newdevice'
  ** signalLabel (string): Readable description
  ** signalIcon (string URL)
  ** type (string), 'scalar' or 'stream'
  ** value (anything)

  Triggers

  * Triggers match signal events and configures notifications in response.
  * Can assign notifications per trigger for each criticality level
  * Properties:
  ** events (array), Array of event matcher objects
  ** actions (array), Array of actions
  ** notifications (array), Array of notifications

  Event Matching Triggers

  * An object that configures how a trigger matches against a signal
  * Properties:
  ** sourceId (string, reqd), id of source
  ** signalId (string, reqd), id of signal
  ** value: (mixed, opt), Unsure yet. Regex? Matching function? How to handle streams? Percent change?
  ** criticality (int, 1-3, reqd), the criticality resulting from a match

  Notifications

  * TODO: check against notification spec
  * Properties:
  ** title
  ** description
  ** icon
  ** criticality (int, 1-3)
  ** data

  Actions
  * actions to take based on a trigger match
  * TODO results are included in notifications somehow
  ** actionId (string), eg 'takePicture'
  ** actionLabel (string), eg 'Take picture'
  ** actionIcon (string URL), URL of icon
  ** actionOutput
  * action request
  ** actionId
  ** timeout


  Example code
  
  // Notify me when the power goes out.

  var trigger = {
    source: 'source-power',
    signal: 'batteryCharging',
    value: false,
    criticality: 3
  };

  var action = {
    id: 'takePicture',
    timeout: 1000
  };

  var notification = {
    title: '',
    description: '',
    icon: ''
  };

  registerTrigger([matcher], [action], [notification]);

  V1 TODO

  * set up default triggers: power, new bluetooth device
  * trigger support for cache in matches (eg: new bluetooth, compared to ever found)
  * fix tests (use default triggers?)
  * datastorage should be in signal
  * action system (takePicture, recordSound, saySomething, webRequest, beep, 
  * notification system: expand to use plugins
  * rewrite ui render using triggers?
  * test/fix device motion
  * test/fix device orientation
  * fix sound variable cache length
  * fix stream data scaling
  * persist data (have viz pull from persistent cache?)
  * settings UI for ifttt maker channel
  * settings UI integration for trigger/notification

  V2 TODO

  * storage infra (pouchdb)
  * store module logs
  * web socket & pusher support
  * move everything to a worker?
  * Connect listener devices via NFC, which installs app and registers for push notifications

  generated music
  * wifi networks add/remove
  * light
  * motion

*/

console.log('wtf')

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
