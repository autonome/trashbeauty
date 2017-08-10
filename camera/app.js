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
  var vid = document.querySelector('#vid');
  cameraSource.start({
    videoElement: vid,
    callback: function() {
      console.log('videoooo')
    }
  });

  // interval timer for party mode
  var timer = null;

  // initialize websocket connection
  var server = '10.0.0.235', //window.location.hostname,
      port = 8001;
  var socket = new WebSocket('ws://' + server + ':' + port);
  socket.onopen = function() {
    // ensures binary sends work correctly
    socket.binaryType = "arraybuffer";
    socket.send(JSON.stringify({register: 'camera'}));

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
  };

  var button = document.createElement('button')
  button.innerText = 'take snapshot'
  button.addEventListener('click', function() {
    // uncomment for trashbeaty v1 testing
    //cameraSource.snapshot();
    
    cameraSource.snapshotToCanvas(function(canvas) {
      // local test
      var img = document.createElement('img')
      img.src = canvas.toDataURL()
      document.body.appendChild(img)

      var context = canvas.getContext('2d'),
          image = context.getImageData(0, 0, canvas.width, canvas.height),
          buffer = new ArrayBuffer(image.data.length),
          bytes = new Uint8Array(buffer);
      for (var i = 0; i < bytes.length; i++) {
          bytes[i] = image.data[i];
      }
      socket.send(buffer);
    });
  });
  document.body.appendChild(button)

}
window.addEventListener('DOMContentLoaded', init);

