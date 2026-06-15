<template>
  <!--  目录-->

  <body id="vv2025">
    <div class="box">
      <div class="topNva">
        <div
          class="mm"
          @click="toIndex"
        />
      </div>

      <div class="content0">
        <div class="videoWrapper_m1">
          <div
            class="ff"
            @click="toMoment"
          ></div>
          <div
            class="xm"
            @click="toMoment"
          ></div>
          <div class="video_box1">
            <video
              :src="videoUrl_1"
              muted
              loop=""
              class="video_fm"
              autoplay
              x5-playsinline="true"
              playsinline=""
              webkit-playsinline="true"
              x-webkit-airplay="true"
              x5-video-orientation="portraint"
            />
          </div>

        </div>
      </div>
      <div class="content1">
        <div class="videoWrapper_m2">
          <div
            class="mm_20"
            @click="toLeaveMessage"
          ></div>
          <div
            class="ff_20"
            @click="toLeaveMessage"
          ></div>

          <div class="video_box2">
            <video
              :src="videoUrl_2"
              autoplay
              class="video_fm2"
              loop=""
              muted
              playsinline=""
              webkit-playsinline="true"
              x-webkit-airplay="true"
              x5-playsinline="true"
              x5-video-orientation="portraint"
            />
          </div>
        </div>
      </div>

      <div>
        <div class="content2">
          <div class="videoWrapper_m3">
            <div class="qiWrapper_m4">
              <div
                class="mm_30"
                @click="toMusic"
              ></div>
              <div
                class="ff_30"
                @click="toMusic"
              ></div>
            </div>
            <div class="video_box3">
              <video
                :src="videoUrl_3"
                muted
                autoplay
                loop=""
                class="video_fm3"
                x5-playsinline="true"
                playsinline=""
                webkit-playsinline="true"
                x-webkit-airplay="true"
                x5-video-orientation="portraint"
              />
            </div>
          </div>
        </div>
      </div>

    </div>
  </body>

</template>
<script>
import router from "@/router";

import videoUrl_1 from "@/assets/catalogue/rise4.mp4";

import videoUrl_2 from "@/assets/catalogue/rise2.mp4";

import videoUrl_3 from "@/assets/catalogue/rise3.mp4";

export default {
  name: "catalogue",
  setup() {
    function toMoment() {
      router.push("/liberty");
    }

    function toLeaveMessage() {
      router.push("/leaveWords");
    }

    function toMusic() {
      router.push("/music");
    }

    return {
      videoUrl_1,
      videoUrl_2,
      videoUrl_3,

      toMusic,
      toMoment,
      toLeaveMessage,
    };
  },
  created() {},
  mounted() {
    // 解决 ios 微信 video 自动播放
    document.addEventListener(
      "WeixinJSBridgeReady",
      function () {
        const videos = document.querySelectorAll("video");
        videos.forEach(function (video) {
          video.play(); // 对每个video元素调用play方法播放视频
        });
      },
      false
    );
  },
  methods: {
    //返回首页
    toIndex() {
      router.replace("/");
    },
  },
};
</script>

<style scoped>
.topNva .mm {
  /*
返回首页图标自定义，代码修改位置
要自定义想用的图标:
  1、将新的图标图片放到"src/assets/catalogue/icon/"这个文件夹下,当然你也可以创建新的文件夹
  2、将下面代码中"xq.png"这个图片名修改成要替换的图标名*/

  /* 例如：将"1234.png"这个张图片放到了"src/assets/catalogue/icon/"文件夹下后，
  修改下面的代码就变为"background: url(~@/assets/catalogue/icon/1234.png) no-repeat center center;" */
  background: url(~@/assets/catalogue/icon/bz1.png) no-repeat center center;

  width: 1.1rem;
  height: 2.32rem;
  background-size: contain;
  cursor: pointer;
}

.videoWrapper_m1 .xm {
  /*
栏目1 左边图标自定义，代码修改位置
 */
  background: url(~@/assets/catalogue/icon/ll.png) no-repeat center center;

  width: 1.56rem;
  height: 3.08rem;
  position: absolute;
  bottom: -0.77rem;
  left: -0.44rem;
  z-index: 2;
  background-size: cover;
  /* background-size: 100% 100%; */
  transform-origin: top;
}

.videoWrapper_m1 .ff {
  /*
栏目1 右边图标自定义，代码修改位置
 */
  background: url(~@/assets/catalogue/icon/ss.png) no-repeat center center;

  background-size: cover;
  /* background-size: 100% 100%; */
  width: 1.56rem;
  height: 3.08rem;
  position: absolute;
  top: -1.96rem;
  right: -0.33rem;
  z-index: 2;

  transform-origin: top;
}

.videoWrapper_m2 .mm_20 {
  /*
栏目2 左边图标自定义，代码修改位置
 */
  background: url(~@/assets/catalogue/icon/lailai.png) no-repeat center center;

  background-size: contain;
  /* background-size: 100% 100%;  */
  width: 1.6rem;
  height: 2.6rem;
  top: -1.2rem;
  left: -0.3rem;
  position: absolute;
  transform-origin: top;
  z-index: 2;
}

.videoWrapper_m2 .ff_20 {
  /*
栏目2 右边图标自定义，代码修改位置
 */
  background: url(~@/assets/catalogue/icon/qiqi.png) no-repeat center center;

  width: 1.9rem;
  height: 2.3rem;

  background-size: contain;
  position: absolute;
  bottom: -0.96rem;
  right: -0.26rem;
  transform-origin: top;
  z-index: 2;
}

.qiWrapper_m4 .mm_30 {
  /*
栏目3 左边图标自定义，代码修改位置
 */
  background: url(~@/assets/catalogue/icon/min2.png) no-repeat center center;

  background-size: 100% 100%;
  position: relative;
  width: 2.17rem;
  height: 1.66rem;
  /* bottom: -0.1rem; */
  /* left: -0.2rem; */
  transform-origin: top;
  z-index: 2;
}

.qiWrapper_m4 .ff_30 {
  /*
栏目3 右边图标自定义，代码修改位置
 */
  background: url(~@/assets/catalogue/icon/min.png) no-repeat center center;

  background-size: 100% 100%;
  /* right: -0.15rem; */
  /* bottom: -0.1rem; */
  position: relative;
  width: 1.75rem;
  height: 1.66rem;

  transform-origin: top;
  z-index: 2;
}

#vv2025 {
  width: 100%;
  color: #fff;
  height: 100%;
  position: fixed;
  overflow: hidden;
  -webkit-overflow-scrolling: touch;
  --animate-duration: 500ms;
  --animate-delay: 0;
}

.box {
  width: 100%;
  position: relative;
  height: 100vh;
  overflow-x: hidden;
  overflow-y: scroll;
  background: #000000;
  font-size: 0;
}

.topNva {
  position: sticky;
  top: 0;
  z-index: 10;
  padding: 0.2rem 0 0.1rem;
  display: flex;
  justify-content: center;
}

.content0 {
  height: calc(100vh - 1.29rem);
  position: relative;
}

.content0 .videoWrapper_m1 {
  position: absolute;
  bottom: 1.5rem;
  transform: translateX(-50%);
  width: 3.4rem;
  height: 2.71rem;
  left: 50%;
}

.video_box1 {
  position: relative;
  width: 3.4rem;
  height: 2.71rem;
  display: flex;
  justify-items: center;
  align-items: center;
}

.videoWrapper_m1 .video_fm {
  position: relative;
  z-index: -1;
  width: 100%;
}

.content1 {
  height: 100vh;
  position: relative;
}

.content1 .videoWrapper_m2 {
  position: absolute;
  bottom: 1.7rem;
  transform: translateX(-50%);
  left: 50%;
  width: 3.78rem;
  height: 2.78rem;
}

.video_box2 {
  position: relative;
  width: 3.78rem;
  height: 2.78rem;
  display: flex;
  justify-items: center;
  align-items: center;
}

.videoWrapper_m2 .video_fm2 {
  position: relative;
  z-index: -1;
  width: 3.78rem;
  height: 2.78rem;
}

.content2 {
  height: 100vh;
  position: relative;
}

.content2 .videoWrapper_m3 {
  position: absolute;
  bottom: 0.82rem;
  transform: translateX(-50%);
  left: 50%;
  width: 4.3rem;
  height: 3.11rem;
  overflow: hidden;
}

.video_box3 {
  position: relative;
  width: 4.3rem;
  height: 3.11rem;
  display: flex;
  justify-items: center;
  align-items: center;
}

.videoWrapper_m3 .qiWrapper_m4 {
  position: absolute;
  bottom: 0rem;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-between;
  font-size: 0;
}

.videoWrapper_m3 .video_fm3 {
  position: relative;
  z-index: -1;
  width: 4.3rem;
  height: 3.11rem;
}
</style>
