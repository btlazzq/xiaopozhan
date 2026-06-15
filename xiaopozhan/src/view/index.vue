<template>
  <!--  首页-->

  <body id="v2025">
    <div class="box">
      <div class="videoBox">
        <div class="videoCenterBox">
          <div
            class="icon_q"
            @click="toCatalogue"
          />
          <div class="video_box">
            <video
              id="is_video"
              :src="videoUrl"
              autoplay
              loop=""
              class="video_play"
              muted
              x5-playsinline="true"
              playsinline=""
              webkit-playsinline="true"
              x-webkit-airplay="true"
              x5-video-orientation="portraint"
              @canplaythrough="onVideoLoaded"
            ></video>
          </div>
        </div>
      </div>
      <div class="icp_s">
        <a
          class="icp"
          href="https://beian.miit.gov.cn/#/Integrated/index"
          rel="noreferrer"
          target="_blank"
        >ICP备202506099号</a>
        <a
          class="icp"
          href="https://beian.mps.gov.cn/#/query/webSearch?code="
          rel="noreferrer"
          target="_blank"
        >
          <img
            class="icp_img"
            :src="require('/src/assets/index/icon/j.png')"
            alt=""
          />备xxxxxxxxxxxx号</a>
      </div>
    </div>
  </body>
</template>

<script>
import router from "@/router";

// 首页视频自定义，代码修改位置
// @/assets/index/welcome.mp4。可以理解为从"src/assets/index/"文件夹中找到"welcome.mp4"这个视频文件

// 要自定义想用的视频:
// 1、将新的视频放到"src/assets/index/"这个文件夹下,当然你也可以创建新的文件夹
// 2、将下面代码中"welcome.mp4"这个视频名修改成要替换的视频名

/* 例如：将"1234.mp4"这个视频放到了"src/assets/index/"文件夹下后，
  修改下面的代码就变为"import videoUrl from "@/assets/index/1234.mp4"" */
// welcome.mp4 未随项目分发，暂用已有视频占位，替换时改回 @/assets/index/welcome.mp4
import videoUrl from "@/assets/leave_words/shui.mp4";

export default {
  name: "index",
  setup() {
    function onVideoLoaded() {}
    function toCatalogue() {
      router.push("/catalogue");
    }
    return {
      videoUrl,
      onVideoLoaded,
      toCatalogue,
    };
  },
  mounted() {
    document.addEventListener(
      "WeixinJSBridgeReady",
      function () {
        const video = document.querySelector("video");
        video && video.play();
      },
      false
    );
  },
  created() {},
  methods: {},
};
</script>

<style scoped>
.icon_q {
  /* 首页图标自定义，代码修改位置 */
  /* ~@/assets/index/icon/yi.png。可以理解为从"src/assets/index/icon/"文件夹中找到"yi.png"这个图片文件

  /* 要自定义想用的图标:
  1、将新的图标图片放到"src/assets/index/icon/"这个文件夹下,当然你也可以创建新的文件夹
  2、将下面代码中"yi.png"这个图片名修改成要替换的图标名*/

  /* 例如：将"1234.png"这个张图片放到了"src/assets/index/icon/"文件夹下后，
  修改下面的代码就变为"background: url(~@/assets/index/icon/1234.png) 50% no-repeat;" */
  background: url(~@/assets/index/icon/yi.png) 50% no-repeat;

  position: absolute;
  z-index: 1;
  top: 50%;
  left: 0.49rem;
  width: 0.8rem;
  height: 1.6rem;
  transform: translateY(-50%);
  background-size: contain;
  cursor: pointer;
}

.box {
  height: 100vh;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: #000000;
  overflow-y: scroll;
  -webkit-overflow-scrolling: touch;
}

#v2025 {
  width: 100%;
  color: #fff;
}

.videoBox {
  overflow-x: hidden;
  height: 100vh;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 0;
  margin: 0;
}

.videoCenterBox {
  position: relative;
  width: 4.2rem;
  height: 3.2rem;
  margin: 0 auto;
}

.video_box {
  width: 4.2rem;
  height: 3.2rem;
}

.video_play {
  width: 4.2rem;
  height: 3.2rem;
}

.icp_s {
  text-align: center;
  width: 100%;
  position: relative;
  overflow: hidden;
}

.icp_s a {
  transition: opacity 0.2s ease-in-out;
  cursor: pointer;
}

.icp {
  padding: 0.1rem 0.1rem 0.2rem;
  color: #fff;
  font-size: 0.1rem;
  text-decoration: none;
  vertical-align: middle;
}

.icp img {
  width: 0.2rem;
  margin-right: 0.05rem;
  vertical-align: middle;
}
</style>
