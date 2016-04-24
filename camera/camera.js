// Camera
// * Use person and face detection to know when people are around, or cats
//

var cameraSource = (function(global) {

  var id = 'source-camera',
      title = 'Camera';

  function start() {
    showCameraPreview(function() {
    });
  }

  function showCameraPreview(cb) {
    navigator.mediaDevices.getUserMedia({ video: true }).then(function(stream) {

      //var track = stream.getVideoTracks()[0];

      var vidURL = window.URL.createObjectURL(stream);

      var vid = document.querySelector('#vid');

      vid.src = vidURL;
      vid.play();

      /*
      setInterval(function() {

        console.log('intval')

        videoSnapshot(function(canvas) {
          //track.stop();

          //addSnapshotToPage(canvas);
          
          // upload photo
          canvas.toBlob(function(blob) {
            uploadPhoto(blob, function() {
              console.log('uploaded!')
            });
          });

        });
      }, 2000);
      */

    });
  }

  function snapshot() {
    videoSnapshot(function(canvas) {
      // upload photo
      canvas.toBlob(function(blob) {
        uploadPhoto(blob, function() {
          //console.log('uploaded!')
        });
      });
    });
  }

  function videoSnapshot(cb) {
    var vid = document.querySelector('#vid'),
        width = 320,
        height = vid.videoHeight / (vid.videoWidth/width),
        canvas = document.createElement('canvas'),
        context = canvas.getContext('2d');

    canvas.width = width;
    canvas.height = height;

    context.drawImage(vid, 0, 0, width, height);


    cb(canvas);
  }

  function addSnapshotToPage(canvas) {
    var img = document.createElement('img')
    img.src = canvas.toDataURL()
    document.body.appendChild(img)
  }

  function uploadPhoto(fileBlob, callback) {
    // Create object for form data
    var fd = new FormData();
    // 'upl' is the arbitrary string that multer expects to match
    // its config on the server end.
    fd.append('upl', fileBlob, 'file-' + Date.now() + '.jpg');

    var xhr = new XMLHttpRequest();
    xhr.open('POST', 'http://localhost:3000/upload');
    xhr.onload = function() {
      var data = JSON.parse(xhr.responseText).data;
      var imgurURL = data.link;
      callback(imgurURL)
    }

    xhr.send(fd);
    console.log('up: sent');
  }

  // public
  return {
    id: id,
    title: title,
    start: start,
    snapshot: snapshot
  };

})(this);
