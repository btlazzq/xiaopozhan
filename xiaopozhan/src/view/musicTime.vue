<template>
  <div class="music_time_box">
    <div class="page_music_time">
      <div class="back">
        <div
          class="btn_back"
          @click="handleBack "
        ></div>
      </div>
      <audio
        ref="audioPlayer"
        preload="auto"
        :src="musicList[currentIndex].musicSrc"
        autoplay
      >
      </audio>
      <div class="player_box">
        <div class="box_inner">
          <div class="cover_box">
            <img :src="musicList[currentIndex].musicCover">
          </div>
          <div class="music_txt">{{musicList[currentIndex].musicName}}</div>
          <div class="audio_box">
            <div
              class="process_box"
              @mousedown="handleMouseDown"
              @touchstart="handleTouchStart"
            >
              <div class="process_Bar">
                <div
                  class="inner_Bar"
                  :style="{ left: progress + '%' }"
                ></div>
              </div>
            </div>
            <div class="time_Info">
              <div class="process_Info">
                <div>{{formatTime(currentTime)}}</div>
                <div>{{formatTime(duration)}}</div>
              </div>
            </div>
            <div class="audio_Info">
              <div class="ctrl">
                <div
                  :class="ctrlClass"
                  @click="playChoose"
                ></div>
              </div>
              <div
                class="pre"
                @click="prevTrack"
              ></div>
              <div>
                <div
                  class="play"
                  @click="togglePlay"
                >
                  <div
                    class="play_icon"
                    :class="{ pause_icon: isPlaying }"
                  ></div>
                </div>
              </div>
              <div
                class="next"
                @click="nextTrack"
              ></div>
              <div
                class="speed"
                @click="togglePlaybackRate"
              >
                {{ playbackRateText }}
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  </div>

</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import router from "@/router";
import { getMusicList, resolveMediaUrl } from "@/api";

const musicList = ref([
  { musicSrc: "", musicCover: "", musicName: "加载中..." }
]);

const isIos = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream; //是否未ios
const audioPlayer = ref(null); //音乐载体
const currentTime = ref(0); //当前已播放时间
const duration = ref(0); //当前播放音乐总时间
const progress = ref(0); //音乐播放进度
let currentIndex = ref(0); //当前播放音乐下标
const isPlaying = ref(false); //正在播放状态
const playMode = ref("order"); //播放模式：顺序播放、单曲循环、随机播放   默认：顺序播放
const playModeText = ref("顺序播放");
const playbackRates = [1, 1.5, 2]; //播放倍速
const currentPlaybackRateIndex = ref(0); //当前倍速下标

const handleBack = () => {
  router.back("");
};

// 播放倍速切换文字监听
const playbackRateText = computed(
  () => `${playbackRates[currentPlaybackRateIndex.value]}×`
);

//设置当前音乐的播放速度
const setPlaybackRate = (rate) => {
  const index = playbackRates.indexOf(rate);
  if (index !== -1) {
    currentPlaybackRateIndex.value = index;
    if (audioPlayer.value) {
      audioPlayer.value.playbackRate = rate;
    }
  }
};

// 播放倍速
const togglePlaybackRate = () => {
  currentPlaybackRateIndex.value =
    (currentPlaybackRateIndex.value + 1) % playbackRates.length;
  setPlaybackRate(playbackRates[currentPlaybackRateIndex.value]);
};

// 播放模式样式切换
const ctrlClass = computed(() => {
  //顺序播放
  if (playMode.value === "order") {
    return "audio_ctrl1";
  } else if (playMode.value === "loop") {
    //单曲循环
    return "audio_ctrl2";
  } else {
    //随机播放
    return "audio_ctrl3";
  }
});

// 格式化时间
const formatTime = (timeInSeconds) => {
  if (isNaN(timeInSeconds)) {
    return "00:00";
  }
  const minutes = Math.floor(timeInSeconds / 60);
  const seconds = Math.floor(timeInSeconds % 60);
  const pad = (num) => (num < 10 ? `0${num}` : num);
  return `${pad(minutes)}:${pad(seconds)}`;
};

//音乐播放模式
const playChoose = () => {
  if (playMode.value === "order") {
    playMode.value = "loop";
    playModeText.value = "单曲循环";
  } else if (playMode.value === "loop") {
    playMode.value = "random";
    playModeText.value = "随机播放";
  } else {
    playMode.value = "order";
    playModeText.value = "顺序播放";
  }
};

//上一首
const prevTrack = () => {
  if (playMode.value === "random") {
    currentIndex.value = Math.floor(Math.random() * musicList.value.length);
  } else {
    if (currentIndex.value > 0) {
      currentIndex.value--;
    } else {
      currentIndex.value = musicList.value.length - 1;
    }
  }
  playAudio();
};

//下一首
const nextTrack = () => {
  if (playMode.value === "random") {
    currentIndex.value = Math.floor(Math.random() * musicList.value.length);
  } else {
    if (currentIndex.value < musicList.value.length - 1) {
      currentIndex.value++;
    } else {
      currentIndex.value = 0;
    }
  }

  playAudio();
};
//播放音乐
const playAudio = () => {
  //初始化播放进度
  progress.value = 0;
  // 初始化进度条颜色
  const processBar = document.querySelector(".process_Bar");
  processBar.style.background = `linear-gradient(to right, #DEDEDEFF 0%, #DEDEDEFF 0%, #FFFFFF70 0%, #FFFFFF70 100%)`;
  //初始化已播放时间
  currentTime.value = 0;

  if (audioPlayer.value) {
    audioPlayer.value.load();
    audioPlayer.value
      .play()
      .then(() => {})
      .catch((error) => {
        isPlaying.value = false;
      });
    isPlaying.value = true;

    initAudio();
  }
};
//播放暂停事件
const togglePlay = () => {
  if (audioPlayer.value) {
    if (isPlaying.value) {
      audioPlayer.value.pause();
      isPlaying.value = false;
    } else {
      audioPlayer.value.play();
      isPlaying.value = true;
    }
  }
};
// 初始化音频信息
const initAudio = () => {
  if (audioPlayer.value) {
    // 音频加载完成监听
    audioPlayer.value.addEventListener("loadedmetadata", () => {
      duration.value = audioPlayer.value.duration;

      setPlaybackRate(playbackRates[currentPlaybackRateIndex.value]);
      // 初始化进度条颜色
      const processBar = document.querySelector(".process_Bar");
      processBar.style.background = `linear-gradient(to right, #DEDEDEFF 0%, #DEDEDEFF 0%, #FFFFFF70 0%, #FFFFFF70 100%)`;
    });
    // 播放时间变化监听
    audioPlayer.value.addEventListener("timeupdate", () => {
      currentTime.value = audioPlayer.value ? audioPlayer.value.currentTime : 0;
      duration.value = audioPlayer.value ? audioPlayer.value.duration : 0;
      progress.value = audioPlayer.value
        ? (audioPlayer.value.currentTime / audioPlayer.value.duration) * 100
        : 0;
      // 更新进度条颜色
      const processBar = document.querySelector(".process_Bar");
      if (processBar) {
        processBar.style.background = `linear-gradient(to right, #DEDEDEFF 0%, #DEDEDEFF ${progress.value}%, #FFFFFF70 ${progress.value}%, #FFFFFF70 100%)`;
      }
    });

    audioPlayer.value.addEventListener("ended", handleSongEnd);
  }
};

// 播放结束事件
const handleSongEnd = () => {
  isPlaying.value = false;
  if (playMode.value === "loop") {
    audioPlayer.value.play();
    setPlaybackRate(playbackRates[currentPlaybackRateIndex.value]);
    isPlaying.value = true;
  } else if (playMode.value === "random") {
    currentIndex.value = Math.floor(Math.random() * musicList.value.length);
    playAudio();
  } else {
    if (currentIndex.value < musicList.value.length - 1) {
      currentIndex.value++;
    } else {
      currentIndex.value = 0;
    }
    playAudio();
  }
};

const isDragging = ref(false);

//鼠标按下事件
const handleMouseDown = (e) => {
  isDragging.value = true;
};

//鼠标移动事件
const handleMouseMove = (e) => {
  if (isDragging.value) {
    updateProgress(e);
  }
};

//鼠标抬起事件
const handleMouseUp = () => {
  isDragging.value = false;
};
//移动音乐进度条
const handleTouchStart = (e) => {
  const process_box = document.querySelector(".process_box");
  const rect = process_box.getBoundingClientRect();
  const touch = e.touches[0];
  if (
    touch.clientX >= rect.left &&
    touch.clientX <= rect.right &&
    touch.clientY >= rect.top &&
    touch.clientY <= rect.bottom
  ) {
    isDragging.value = true;
  }
};
//移动事件
const handleTouchMove = (e) => {
  if (isDragging.value) {
    updateProgress(e.touches[0]);
  }
};
//触摸移动结束
const handleTouchEnd = () => {
  isDragging.value = false;
};

//跟新音乐进度时间条
const updateProgress = (e) => {
  const processBar = document.querySelector(".process_Bar");
  const rect = processBar.getBoundingClientRect();
  let offsetX;
  if (e.clientX) {
    offsetX = e.clientX - rect.left;
  } else if (e.touches && e.touches[0]) {
    offsetX = e.touches[0].clientX - rect.left;
  }
  const width = rect.width;
  const newProgress = (offsetX / width) * 100;

  if (newProgress >= 0 && newProgress <= 100) {
    progress.value = newProgress;
    if (audioPlayer.value) {
      audioPlayer.value.currentTime = (newProgress / 100) * duration.value;
    }

    // 更新进度条颜色
    processBar.style.background = `linear-gradient(to right, #DEDEDEFF 0%, #DEDEDEFF ${newProgress}%, #FFFFFF70 ${newProgress}%, #FFFFFF70 100%)`;
  }
};

onMounted(async () => {
  try {
    const data = await getMusicList();
    const items = (data.items || []).map((m) => ({
      no: m.no,
      musicSrc: resolveMediaUrl(m.media_url) || "",
      musicCover: resolveMediaUrl(m.cover_url) || "",
      musicName: m.title || `月记/${m.no}`
    }));
    if (items.length) musicList.value = items;
  } catch { /* 保持默认 */ }

  const routeNo = parseInt(router.currentRoute.value.query.no, 10);
  const idx = musicList.value.findIndex((m) => m.no === routeNo);
  currentIndex.value = idx >= 0 ? idx : 0;
  initAudio();

  //播放状态设置
  if (audioPlayer.value) {
    audioPlayer.value.addEventListener("play", () => {
      isPlaying.value = true;
    });
    audioPlayer.value.addEventListener("error", (e) => {
      isPlaying.value = false;
    });
  }
  if (isIos) {
    isPlaying.value = false;
  }

  document.addEventListener("mousemove", handleMouseMove);
  document.addEventListener("mouseup", handleMouseUp);
  document.addEventListener("touchstart", handleTouchStart);
  document.addEventListener("touchmove", handleTouchMove);
  document.addEventListener("touchend", handleTouchEnd);
});
</script>


<style scoped>
.inner_Bar {
  /* 音乐录音播放进度点图标，自定义修改位置 */

  background: url(@/assets/music/icon/inser.png);

  position: absolute;
  width: 0.08rem;
  height: 0.09rem;

  background-size: 100% 100%;
  background-position: 50%;
  background-repeat: no-repeat;
  margin-left: -0.03rem;
  margin-top: -0.03rem;
}

.pre {
  /* 上一首图标，自定义修改位置 */
  background: url(@/assets/music/icon/pre.png);

  background-size: contain;
  background-position: 50%;
  background-repeat: no-repeat;
  width: 0.3rem;
  height: 0.3rem;

  opacity: 0.9;
}
.pre:active {
  opacity: 0.7;
}

.play_icon {
  /* 播放图标，自定义修改位置 */
  background: url(@/assets/music/icon/play.png);

  display: block;
  font-size: 0.2867rem;
  background-size: contain;
  background-position: 50%;
  background-repeat: no-repeat;
  width: 0.4rem;
  height: 0.4rem;
  opacity: 0.9;
}

.pause_icon {
  /* 暂停图标，自定义修改位置 */
  background: url(@/assets/music/icon/stop.png);

  display: block;
  font-size: 0.2867rem;
  background-size: contain;
  background-position: 50%;
  background-repeat: no-repeat;
  width: 0.4rem;
  height: 0.4rem;
  opacity: 0.9;
}

.next {
  /* 下一首图标，自定义修改位置 */
  background: url(@/assets/music/icon/speed.png);

  background-size: contain;
  background-position: 50%;
  background-repeat: no-repeat;
  width: 0.3rem;
  height: 0.3rem;
  opacity: 0.9;
}

.next:active {
  opacity: 0.7;
}

* {
  padding: 0;
  margin: 0;
}

.music_time_box {
  height: 100vh;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: #000000;
  overflow-y: scroll;
  overflow-x: hidden;
  -webkit-overflow-scrolling: touch;
}

.page_music_time {
  position: relative;
  height: 100vh;
  width: 4.23rem;
  margin: 0 auto;
  box-sizing: border-box;
  padding-top: 1rem;
  user-select: none; /* 禁止文本选择 */
  -webkit-user-select: none; /* 兼容 WebKit 浏览器 */
  -moz-user-select: none; /* 兼容 Firefox */
  -ms-user-select: none; /* 兼容 IE */
}

.player_box {
  display: flex;
  justify-content: center;
  width: 100%;
  /* //height: 100%; */
  z-index: 1;
  margin: 0 auto;
  position: absolute;
  /* //max-height: 8rem; */
}
.back {
  width: 4.23rem;
  height: 0.72rem;
  margin: 0 auto 0.4rem;
  background-size: contain;
  position: fixed;
  top: 0;
  left: 50%;
  transform: translate3d(-50%, 0, 0);
  z-index: 99;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.btn_back {
  background-image: url(@/assets/music/back.png);
  background-repeat: no-repeat;
  background-size: 100% auto;
  width: 0.4rem;
  background-position: bottom;
  opacity: 0.7;
  height: 0.4rem;
  margin-left: 0.2rem;
}
.box_inner {
  padding: 0.3rem 0.17202rem;
  position: relative;
  z-index: 10;
}

.cover_box {
  width: 3.4rem;
  height: 3.4rem;
  margin: 0 auto 0.2rem;
  border-radius: 0.1rem;
  overflow: hidden;
  background-color: rgba(255, 255, 255, 0.06);
}

.cover_box img {
  width: 3.4rem;
  height: 3.4rem;
  object-fit: cover;
}

.music_txt {
  width: 3.4rem;
  margin: 0.3rem auto;
  text-align: center;
  font-weight: bold;
  font-size: 0.14rem;
  line-height: 0.20069rem;
  font-family: "DottedSongtiCircleRegular", Helvetica, serif;

  letter-spacing: 0.01rem;
  color: #adadad;
}

.audio_box {
  /* //padding: .11468rem; */
  margin-top: 0.4rem;
  position: relative;
  width: 3.4rem;
}

.audio_ctrl1 {
  background: url(@/assets/music/icon/ctrl1.png);
  background-size: contain;
  background-position: 50%;
  background-repeat: no-repeat;
  width: 0.25rem;
  height: 0.25rem;
  /* //position: absolute;
  //right: .3rem;
  //top: -.28rem; */
}
.audio_ctrl2 {
  background: url(@/assets/music/icon/ctrl2.png);
  background-size: contain;
  background-position: 50%;
  background-repeat: no-repeat;
  width: 0.25rem;
  height: 0.25rem;
  /* //position: absolute;
  //right: .3rem;
  //top: -.28rem; */
}
.audio_ctrl3 {
  background: url(@/assets/music/icon/ctrl3.png);
  background-size: contain;
  background-position: 50%;
  background-repeat: no-repeat;
  width: 0.25rem;
  height: 0.25rem;
  /* //position: absolute;
  //right: .3rem;
  //top: -.28rem; */
}
.process_box {
  width: 100%;
  aspect-ratio: 11.488;
  position: relative;
  height: 0.15rem;
  display: flex;
  align-items: center;
  justify-content: center;
}
.process_Bar {
  width: 100%;
  aspect-ratio: 11.488;
  position: relative;
  height: 0.03rem !important;
  border-radius: 0.02rem;
  background: linear-gradient(
    to right,
    #ffffff70 0%,
    #ffffff70 100%
  ); /* 浅色背景 */
  background-size: contain;
  background-position: 50%;
  background-repeat: no-repeat;
}

.time_Info {
  align-self: stretch;
  display: flex;
  align-items: flex-start;
  justify-content: flex-end;
  flex-direction: column;
  /* //margin-top: -0.18rem; */
  z-index: 2;
  position: relative;
}

.process_Info {
  font-weight: 400;
  font-size: 0.09174rem;
  line-height: 0.13188rem;
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  margin-top: 0.04rem;
}

.audio_Info {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  margin-top: 0.15rem;
}

.ctrl {
  width: 0.3rem;
  height: 0.3rem;
  opacity: 0.9;
  margin-top: 0.065rem;
}

.speed {
  width: 0.3rem;
  height: 0.3rem;
  opacity: 0.8;
  color: white;
  font-size: 0.17rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: "DottedSongtiCircleRegular", Helvetica, serif;
}
</style>
