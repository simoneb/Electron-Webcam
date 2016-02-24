'use strict';

var remote = require('remote');
var spawn = require('child_process').spawn;
var path = require('path');

let videoDevices = [];

window.addEventListener('load', _ => {
  dots();
  controls();
  webcamPrep();
});

function dots() {
  var dots = [];

  var child = spawn(path.resolve(__dirname, '../bin/eye-coords'));

  child.stdout.setEncoding('utf-8');

  child.stdout.on('data', data => {
    var left_top = data.split(',').map(Number);

    if (!left_top[0] || !left_top[1]) return;

    var dot = document.createElement('div');
    dot.className = 'dot';
    dot.style.left = (left_top[0] * 100) + '%';
    dot.style.top = (left_top[1] * 100) + '%';

    dots.push(dot);
    document.body.appendChild(dot);

    if (dots.length > 5) {
      document.body.removeChild(dots.shift());
    }
  });
}

function controls() {
  const close = document.querySelector('.closeButton');
  const theatre = document.querySelector('.theatreMode');
  const toggle = document.querySelector('.toggleVideoSource');
  const window = remote.getCurrentWindow();

  toggle.addEventListener('click', playVideo);

  close.addEventListener('click', _ => window.close());

  theatre.addEventListener(
      'click',
      function (e) {
        var window = remote.getCurrentWindow();
        if (!window.isFullScreen()) {
          window.setResizable(true);
          window.setFullScreen(true);
        } else {
          window.setFullScreen(false);
          window.setResizable(false);
        }
      }
  );
}

function webcamPrep() {
  navigator.mediaDevices.enumerateDevices().then(function (devices) {
    videoDevices = devices.filter(d => d.kind === 'videoinput');
    playVideo();
  });
}

function errorCallback(err) {
  console.log('Rejected', err);
}

function successCallback(stream) {
  const video = document.querySelector('.liveVideo');
  video.src = window.URL.createObjectURL(stream);
}

function playVideo() {
  // rotate devices
  var video = videoDevices.shift();
  videoDevices.push(video);

  const constraints = {
    audio: false,
    video: {
      mandatory: {
        minWidth: 1280,
        minHeight: 720,
        sourceId: video.deviceId
      }
    }
  };

  navigator.webkitGetUserMedia(constraints, successCallback, errorCallback);
}
