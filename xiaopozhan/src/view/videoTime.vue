<template>
  <!--  2025/07/12  录音视频播放页-->
  <div class="music_time_box">
    <div class="page_music_time">
      <div class="back">
        <div
          class="btn_back"
          @click="handleBack"
        ></div>
      </div>

      <div class="player_box">
        <div class="box_inner">
          <div class="video_play_box">
            <video
              ref="videoPlayer"
              :src="videoList[currentIndex].videoSrc"
              :poster=" videoList[currentIndex].videoCover"
              preload="auto"
              controls
              @play="handleVideoPlay"
              @pause="handleVideoPause"
            ></video>
          </div>
          <div class="video_name">{{ videoList[currentIndex].videoName }}</div>
          <div class="ctrl_box">
            <div class="ctrl_Info">
              <div class="nothing" />
              <div
                class="pre"
                :class="{ disabled: disableNavigation }"
                @click="!disableNavigation && prevTrack()"
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
                :class="{ disabled: disableNavigation }"
                @click="!disableNavigation && nextTrack()"
              ></div>
              <div class="nothing" />
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
import { getVideoList, resolveMediaUrl } from "@/api";

const videoList = ref([
  { videoSrc: "", videoName: "加载中...", videoCover: "" }
]);

let currentIndex = ref(0); //当前播放下标
// 添加视频播放器引用
const videoPlayer = ref(null);
const isPlaying = ref(false); // 初始状态设为false

const handleBack = () => {
  router.back("/");
};

// 播放/暂停切换
const togglePlay = () => {
  if (!videoPlayer.value) return;

  if (isPlaying.value) {
    videoPlayer.value.pause();
  } else {
    videoPlayer.value.play().catch((error) => {
      console.error("播放失败:", error);
    });
  }
};

// 上一首
const prevTrack = () => {
  if (disableNavigation.value) return;

  currentIndex.value =
    currentIndex.value > 0 ? currentIndex.value - 1 : videoList.value.length - 1;

  resetPlayer();
};

// 下一首
const nextTrack = () => {
  if (disableNavigation.value) return;

  currentIndex.value =
    currentIndex.value < videoList.value.length - 1 ? currentIndex.value + 1 : 0;

  resetPlayer();
};

// 重置播放器状态
const resetPlayer = () => {
  if (videoPlayer.value) {
    videoPlayer.value.currentTime = 0;
    const wasPlaying = isPlaying.value;
    videoPlayer.value.load();
    if (wasPlaying) {
      videoPlayer.value.play().catch(console.error);
    }
  }
};

// 视频事件处理
const handleVideoPlay = () => (isPlaying.value = true);
const handleVideoPause = () => (isPlaying.value = false);

onMounted(async () => {
  try {
    const data = await getVideoList();
    const items = (data.items || []).map((v) => ({
      no: v.no,
      videoSrc: resolveMediaUrl(v.media_url) || "",
      videoCover: resolveMediaUrl(v.cover_url) || "",
      videoName: v.title || `视频/${v.no}`
    }));
    if (items.length) videoList.value = items;
  } catch { /* 保持默认 */ }

  const routeNo = parseInt(router.currentRoute.value.query.no, 10);
  const idx = videoList.value.findIndex((v) => v.no === routeNo);
  currentIndex.value = idx >= 0 ? idx : 0;
});

const disableNavigation = computed(() => {
  return videoList.value.length <= 1;
});
</script>


<style scoped>
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

.video_play_box {
  width: 100%;
  height: 3.8rem;
  display: flex;
  align-items: center;
  justify-content: center;
  aspect-ratio: 1;
}
.video_play_box video {
  width: 100%;
  height: auto;
  max-height: 100%;
  object-fit: contain;
}

.video_name {
  width: 3.4rem;
  margin: auto;
  text-align: center;
  font-weight: bold;
  font-size: 0.14rem;
  line-height: 0.20069rem;
  font-family: "DottedSongtiCircleRegular", Helvetica, serif;

  letter-spacing: 0.01rem;
  color: #adadad;
}

.ctrl_box {
  margin-top: 0.7rem;
  position: relative;
}

.ctrl_Info {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.next:active {
  opacity: 0.7;
}
.pre.disabled,
.next.disabled {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none; /* 禁用点击事件 */
}
</style>
