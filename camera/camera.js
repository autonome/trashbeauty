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

      setInterval(function() {

        console.log('intval')

        videoSnapshot(function(canvas) {
          //track.stop();

          
          var img = document.createElement('img')
          img.src = canvas.toDataURL()
          document.body.appendChild(img)

        });
      }, 2000);

    });
  }

  function videoSnapshot(cb) {
    var vid = document.querySelector('#vid'),
        width = 120,
        height = vid.videoHeight / (vid.videoWidth/width),
        canvas = document.createElement('canvas'),
        context = canvas.getContext('2d');

    canvas.width = width;
    canvas.height = height;

    context.drawImage(vid, 0, 0, width, height);

    canvas.toBlob(function(blob) {
      uploadPhoto(blob, function() {
        console.log('uploaded!')
      });
      //var newImg = document.createElement("img")
      //var url = URL.createObjectURL(blob);
    });

    cb(canvas);
  }

  function addSnapshot(canvas) {
    var card = document.createElement('div')
    card.classList.add('imagePreview')
    card.appendChild(canvas)

    var container = document.querySelector('#container'),
        preview = document.querySelector('#preview');
    if (preview.nextSibling) {
      container.insertBefore(card, preview.nextSibling);
    }
    else {
      container.appendChild(card);
    }
  }

  // public
  return {
    id: id,
    title: title,
    start: start
  };

})(this);