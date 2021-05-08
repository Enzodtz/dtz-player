function onVideoClick() {
  changeVideoStatus(video.paused);
}

function changeVideoStatus(isPaused) {
  if (isPaused) {
    video.play();
    controlPlayPause.innerHTML = `<i class="fas fa-pause"></i>`;
  } else {
    video.pause();
    controlPlayPause.innerHTML = `<i class="fas fa-play"></i>`;
  }
}

function OnSliderChanged() {
  lastStatus = video.paused;
  video.currentTime = (this.value / 10000) * video.duration;
  changeVideoStatus(lastStatus);
  sliderTailUpdate();
}

function closeControls() {
  controlsWrapper.classList.remove("open");
}

function openControls() {
  controlsWrapper.classList.add("open");
}

function sliderTailUpdate() {
  var value =
    ((controlTimeSlider.value - controlTimeSlider.min) /
      (controlTimeSlider.max - controlTimeSlider.min)) *
    100;
  controlTimeSlider.style.background =
    "linear-gradient(to right, white 0%, white " +
    value +
    "%, grey " +
    value +
    "%, grey 100%)";
}

function displayableSeconds(seconds) {
  seconds = seconds.toString();
  var sec_num = parseInt(seconds, 10);
  var hours = Math.floor(sec_num / 3600);
  var minutes = Math.floor((sec_num - hours * 3600) / 60);
  var seconds = sec_num - hours * 3600 - minutes * 60;

  if (hours < 10) {
    hours = "0" + hours;
  }
  if (minutes < 10) {
    minutes = "0" + minutes;
  }
  if (seconds < 10) {
    seconds = "0" + seconds;
  }
  return hours + ":" + minutes + ":" + seconds;
}

function changeEndTime() {
  if (Number.isNaN(video.duration)) {
    setTimeout(changeEndTime, 250);
  } else {
    controlShowTimeEnd.innerHTML = displayableSeconds(video.duration);
  }
}

function followVideo(loop = false) {
  timeTextFollowVideo();
  sliderFollowVideo();
  if (loop) {
    setTimeout(() => followVideo((loop = true)), 1000);
  }
}

function timeTextFollowVideo() {
  controlShowTimeActual.innerHTML = displayableSeconds(video.currentTime);
}

function sliderFollowVideo() {
  controlTimeSlider.value = (video.currentTime / video.duration) * 10000;
  sliderTailUpdate();
}

function onVideoChanged(first = false) {
  changeEndTime();
  followVideo(first);
}

function onNextPrevClick(next) {
  if (next) {
    videoIndex += 1;
    if (videoIndex >= directoryFileNames.length) {
      videoIndex = 0;
    }
  } else {
    videoIndex -= 1;
    if (videoIndex <= 0) {
      videoIndex = directoryFileNames.length - 1;
    }
  }

  changeVideo();
}

function changeVideo(first = false) {
  video.src = directoryPath + "/" + directoryFileNames[videoIndex];
  onVideoChanged(first);
}

video = document.querySelector("video");

let directoryFileNames;
let directoryPath;
let videoIndex = 0;

window.api.receive("fromMain", (data) => {
  JSONdata = JSON.parse(data);

  videoIndex = JSONdata.firstFileIndex;
  directoryFileNames = JSONdata.fileNames;
  directoryPath = JSONdata.directoryPath;

  changeVideo((first = true));
});
window.api.send("toMain", "requestFileData");

controlsWrapper = document.querySelector(".controls-wrapper");
controlTimeSlider = document.querySelector(".control-time-slider");
controlPlayPause = document.querySelector(".control-play-pause");
controlNextPrevRight = document.getElementById("controlNextPrevRight");
controlNextPrevLeft = document.getElementById("controlNextPrevLeft");
controlShowTimeActual = document.querySelector(".control-show-time-actual");
controlShowTimeEnd = document.querySelector(".control-show-time-end");

controlNextPrevRight.onclick = () => onNextPrevClick(true);
controlNextPrevLeft.onclick = () => onNextPrevClick(false);

var timeout;
document.onmousemove = function () {
  openControls();
  clearTimeout(timeout);
  timeout = setTimeout(function () {
    closeControls();
  }, 1500);
};

controlsWrapper.onclick = onVideoClick;

controlTimeSlider.oninput = OnSliderChanged;
