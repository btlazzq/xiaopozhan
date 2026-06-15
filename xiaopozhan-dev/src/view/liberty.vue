<template>
  <div style="overflow: hidden">
    <div class="fc">
      <div class="pageContainer">
        <div class="bg"></div>
        <div class="box">
          <div class="back">
            <div
              class="btn_back"
              @click="toCatalogue"
            ></div>
          </div>
          <div class="momentList">
            <div
              v-if="loading"
              class="moment-empty"
            >加载中...</div>
            <div
              v-else-if="momentList.length === 0"
              class="moment-empty"
            >暂无瞬间内容</div>
            <div class="wrapper">
              <div
                class="wrapper_content  animate "
                v-for="item in momentList "
                :key="item.id || item.createTime"
              >
                <div class="date_time">{{ item.createTime }}</div>
                <div>
                  <div
                    class="wrapper_content_01"
                    v-if="item.fileList.length>0"
                  >
                    <div class="imgList">
                      <template
                        v-for="(childItem ,index) in item.fileList"
                        :key="childItem.id"
                      >
                        <div
                          class="video_c"
                          v-if="childItem.fileType==='video'"
                        >
                          <div class="imgBox">
                            <img
                              v-if="childItem.coverUrl!=null"
                              :src="childItem.coverUrl"
                              @click="PhotoView(index,item.fileList)"
                              alt=""
                            >
                            <div
                              v-else
                              style="width: 2.8rem;height: 2.8rem;background: rgba(0,0,0,0.55)"
                            />
                            <div
                              class="play_cq"
                              @click="PhotoView(index,item.fileList)"
                            ></div>
                          </div>
                        </div>
                        <div
                          class="imgBox"
                          v-if="childItem.fileType==='image'"
                        >
                          <img
                            :src="childItem.fileUrl"
                            @click="PhotoView(index,item.fileList)"
                            alt=""
                          >
                        </div>
                      </template>
                    </div>
                  </div>
                </div>
                <div
                  class="desc"
                  style="text-align: center;"
                >{{ item.content }}</div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
    <div
      class="PhotoView"
      v-show="isShow"
    >
      <div
        class="PhotoView-Slider__BannerWrap"
        :style="{ opacity: isShowTop ? 1 : 0 }"
        @click="showTop"
      >
        <div class="PhotoView-Slider__Counter">{{ showIndex }} / {{ (fileList.length) }}</div>
        <div
          class="PhotoView-Slider__BannerRight"
          @click="closePhotoView"
        >
          <svg
            width="44"
            height="44"
            viewBox="0 0 768 768"
            class="PhotoView-Slider__toolbarIcon"
          >
            <path d="M607.5 205.5l-178.5 178.5 178.5 178.5-45 45-178.5-178.5-178.5 178.5-45-45 178.5-178.5-178.5-178.5 45-45 178.5 178.5 178.5-178.5z"></path>
          </svg>
        </div>
      </div>
      <div
        class="PhotoView__PhotoBox"
        style="width: 100%"
      >
        <el-carousel
          style="text-align: center!important;"
          ref="slideCarousel"
          height="90vh"
          indicator-position="none"
          :loop="false"
          :autoplay="false"
          :initial-index="showIndex-1"
          @change="carouselChange"
        >
          <el-carousel-item
            v-for="(item,index) in fileList"
            :key="index"
          >
            <div
              style="height: 90vh"
              v-if="item.fileType==='image'"
            >
              <el-image
                :src="item.fileUrl"
                style="height: 100%"
                fit="contain"
              >
                <template #error>
                  <div class="image-slot">
                    <el-icon>
                      <icon-picture />
                    </el-icon>
                  </div>
                </template>
              </el-image>
            </div>
            <video
              ref="is_video"
              v-if="item.fileType==='video'&& index===(showIndex-1)"
              :src="item.fileUrl"
              autoplay
              loop
              :controls="showControls"
              @play="onVideoPlay"
              @pause="onVideoPause"
              @click="toggleControls"
              style="width: 100%;height: 100%"
              x5-playsinline="true"
              playsinline=""
              webkit-playsinline="true"
              x-webkit-airplay="true"
              x5-video-orientation="portraint"
              :poster="item.coverUrl"
            >
            </video>
          </el-carousel-item>
        </el-carousel>
      </div>

    </div>
  </div>

</template>
<script>
import router from "@/router";
import { ref, onMounted } from "vue";
import { Picture as IconPicture } from "@element-plus/icons-vue";
import { getMoments, mapMomentFileList } from "@/api";

//瞬间图片、视频、视频封面引入位置（API 不可用时的本地备用）
import moImage1 from "@/assets/liberty/moment_image/202411.png";
import moVideo1 from "@/assets/liberty/moment_video/sp1.mp4";
import moVideo1_cover from "@/assets/liberty/moment_video/sp_cover1.png";

const fallbackMoments = [
  {
    id: "local-1",
    content: "嘿嘿",
    createTime: "2025-08-09 17:36:05",
    fileList: [
      { fileUrl: moVideo1, fileType: "video", coverUrl: moVideo1_cover },
    ],
  },
  {
    id: "local-2",
    content: "咩",
    createTime: "2025-08-09 17:36:05",
    fileList: [{ fileUrl: moImage1, fileType: "image" }],
  },
];

export default {
  components: {
    IconPicture,
  },
  name: "liberty",
  setup() {
    let momentList = ref([]);
    const loading = ref(true);

    onMounted(async () => {
      loading.value = true;
      try {
        const data = await getMoments();
        momentList.value = (data.items || []).map((item) => ({
          ...item,
          fileList: mapMomentFileList(item.fileList)
        }));
      } catch {
        momentList.value = fallbackMoments;
      }
      loading.value = false;
    });

    const isShow = ref(false); //是否显示浏览弹窗
    const isShowTop = ref(true); //是否显示浏览弹窗top
    let showIndex = ref(1); //浏览第几个内容
    let fileList = ref([]); //瞬间内容图片&视频数据
    const showControls = ref(true); // 默认不显示控件

    // 是否显示浏览弹出层头部
    function showTop() {
      isShowTop.value = !isShowTop.value;
    }

    //当前预览图片&视频的下标变化
    function carouselChange(current) {
      showIndex.value = current + 1;
    }

    function toCatalogue() {
      router.push("/catalogue");
    }

    // 瞬间内容图片&视频点击事件
    function PhotoView(index, files) {
      showIndex.value = index + 1;
      fileList.value = files.slice();
      isShow.value = !isShow.value;
    }

    function closePhotoView() {
      isShow.value = !isShow.value;
      isShowTop.value = !isShowTop.value;
      fileList.value.length = 0;
    }

    function onVideoPlay() {
      showControls.value = false;
    }

    function onVideoPause() {
      showControls.value = true;
    }

    function toggleControls() {
      showControls.value = !showControls.value;
    }

    return {
      loading,
      showControls,
      showIndex,
      isShow,
      isShowTop,
      momentList,
      fileList,
      PhotoView,
      closePhotoView,
      toCatalogue,
      showTop,
      carouselChange,
      onVideoPause,
      toggleControls,
      onVideoPlay,
    };
  },
  mounted() {
    this.slideBanner();
    // this.$nextTick(() => {
    //   const video = this.$refs.is_video; // 获取视频元素
    //   video.play(); // 播放视频
    // })
  },
  created() {},
  methods: {
    // 滑动切换
    slideBanner() {
      //选中的轮播图
      const box = document.querySelector(".el-carousel__container");
      let startPoint = 0;
      let stopPoint = 0;
      //重置坐标
      const resetPoint = function () {
        startPoint = 0;
        stopPoint = 0;
      };
      //手指按下
      box.addEventListener(
        "touchstart",
        function (e) {
          //手指点击位置的X坐标
          startPoint = e.changedTouches[0].pageX;
        },
        { passive: true }
      );
      //手指滑动
      box.addEventListener(
        "touchmove",
        function (e) {
          //手指滑动后终点位置X的坐标
          stopPoint = e.changedTouches[0].pageX;
        },
        { passive: true }
      );
      //当手指抬起的时候，判断图片滚动离左右的距离
      let that = this;
      box.addEventListener("touchend", function () {
        if (stopPoint === 0 || startPoint - stopPoint === 0) {
          resetPoint();
          return;
        }
        if (startPoint - stopPoint > 0) {
          resetPoint();
          that.$refs.slideCarousel.next();
          return;
        }
        if (startPoint - stopPoint < 0) {
          resetPoint();
          that.$refs.slideCarousel.prev();
        }
      });
    },
  },
};
</script>
<style scoped>
.back {
  width: 4.23rem;
  height: 0.72rem;
  position: fixed;
  top: 0;
  left: 50%;
  transform: translate3d(-50%, 0, 0);
  z-index: 99;
  display: flex;
  align-items: center;
  background: linear-gradient(180deg, rgba(0, 0, 0, 0.92) 70%, transparent);
}

.btn_back {
  background-image: url(~@/assets/music/back.png);
  background-repeat: no-repeat;
  background-size: 100% auto;
  width: 0.4rem;
  height: 0.4rem;
  margin-left: 0.2rem;
  background-position: bottom;
  opacity: 0.6;
  cursor: pointer;
}

.bg {
  position: absolute;
  top: 0;
  left: 0;
  z-index: -1;
  width: 100%;
  height: 100%;
  background-size: 16560px;
  background: url("@/assets/liberty/l-sprite.jpg") no-repeat;
  animation: spriteAnimation 3s steps(23) infinite;
  -webkit-animation: spriteAnimation 3s steps(23) infinite;
}

body {
  overflow: hidden;
}

@-webkit-keyframes spriteAnimation {
  0% {
    background-position: 0 0;
  }
  100% {
    background-position: -16560px 0;
  }
}

@keyframes spriteAnimation {
  0% {
    background-position: 0 0;
  }
  100% {
    background-position: -16560px 0;
  }
}

.image-slot {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  background: var(--el-fill-color-light);
  color: var(--el-text-color-secondary);
  font-size: 30px;
}

.image-slot .el-icon {
  font-size: 30px;
}

.PhotoView__PhotoBox {
  transform: matrix(1, 0, 0, 1, 0, 0);
  height: 90vh;
  transition: transform 400ms cubic-bezier(0.25, 0.8, 0.25, 1);
  transform-origin: left top;
}

::-webkit-scrollbar {
  display: none !important;
}

.fc {
  position: fixed;
  height: 100%;
  width: 100%;
  top: 0px;
  background: #000000;
  overflow: hidden;
}

.pageContainer {
  width: 4.23rem;
  min-height: 100vh;
  margin: 0 auto;
  position: relative;
}

.box {
  position: relative;
  margin: 0 auto;
  box-sizing: border-box;
  color: #ffffff;
  height: 100vh;
  display: flex;
  flex-direction: column;
  padding-top: 0.72rem;
}

.moment-empty {
  text-align: center;
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.18rem;
  padding: 0.6rem 0.2rem;
  font-family: "Courier New", Courier, monospace;
}

.box .momentList {
  flex: auto;
  height: 100vh;
  overflow: auto;
}

.momentList .wrapper {
  width: 100%;
  margin: 0 auto;
  box-sizing: border-box;
}

.wrapper .wrapper_content {
  margin: 0.4rem 0 1.28rem 0;
  animation: myAnimation1 2.2s;
}

.wrapper_content .date_time {
  flex: 0 0 auto;
  font-size: 14px;
  line-height: 1.3;
  color: #ffffff;
  text-align: center;
  font-family: "DottedSongtiCircleRegular", Helvetica, serif;
}

.wrapper_content .desc {
  margin-top: 0.2rem;
  font-weight: 500;
  font-size: 12px;
  line-height: 17px;
  padding: 0 0.53rem;
  color: #ffffff;
  text-align: justify;
  white-space: pre-wrap;
  word-break: break-all;
  font-family: "SourceHanSansCN-Regular", Helvetica;
}

.wrapper_content .wrapper_content_01 {
  display: block;
  width: 100%;
  margin: 0.35rem auto 0.3rem;
  overflow-y: scroll;
}

.wrapper_content_01 .play_cq {
  position: absolute;
  width: 0.8rem;
  height: 0.8rem;
  left: 50%;
  top: 50%;
  transform: translate3d(-50%, -50%, 0);
  background-color: rgba(0, 0, 0, 0.77);
  border-radius: 2rem;
  z-index: 4;
}

.wrapper_content_01 .play_cq:after {
  content: "";
  display: block;
  width: 0;
  height: 0;
  border-top: 0.18rem solid transparent;
  border-left: 0.24rem solid #7e0c1a;
  border-bottom: 0.18rem solid transparent;
  position: absolute;
  left: calc(50% + 0.05rem);
  top: 50%;
  transform: translate3d(-50%, -50%, 0);
}

.wrapper_content_01 .imgList {
  margin: 0 auto;
  overflow-y: scroll;
  font-size: 0;
  display: flex;
  align-items: stretch;
  justify-content: center;
  position: relative;
  width: fit-content;
}

.imgList .video_c {
  display: block;
  width: 100%;
  height: 100%;
  white-space: normal;
}

.imgList .imgBox {
  flex: 0 0 auto;
  display: inline-block;
  position: relative;
}

.imgBox img {
  display: block;
  height: 2.8rem;
  width: auto;
  object-fit: contain;
  object-position: center;
}

.PhotoView {
  animation: fadeIn 0.4s ease-in-out;
  height: 100%;
  left: 0;
  overflow: hidden;
  position: absolute;
  top: 0;
  touch-action: none;
  width: 100%;
  z-index: 2000;
  background: rgb(0, 0, 0);
}

.PhotoView-Slider__BannerRight {
  align-items: center;
  display: flex;
  height: 100%;
}

.PhotoView-Slider__toolbarIcon {
  fill: #fff;
  box-sizing: border-box;
  cursor: pointer;
  opacity: 0.75;
  padding: 10px;
  transition: opacity 0.2s linear;
}

.PhotoView-Slider__Counter {
  font-size: 14px;
  opacity: 0.75;
  padding: 0 10px;
}

.PhotoView-Slider__BannerWrap {
  align-items: center;
  background-color: rgba(0, 0, 0, 0.5);
  color: #fff;
  display: flex;
  height: 5vh;
  justify-content: space-between;
  left: 0;
  top: 0;
  transition: opacity 0.2s ease-out;
  width: 100%;
  z-index: 20;
}

@keyframes myAnimation1 {
  0% {
    opacity: 0;
    -webkit-transform: translate3d(0, 100%, 0);
    transform: translate3d(0, 100%, 0);
  }

  100% {
    opacity: 1;
    -webkit-transform: translateZ(0);
    transform: translateZ(0);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
</style>
