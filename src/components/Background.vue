<template>
  <div :class="store.backgroundShow ? 'cover show' : 'cover'">
    <img
      v-show="store.imgLoadStatus"
      :src="bgUrl"
      class="bg"
      alt="cover"
      @load="imgLoadComplete"
      @error="imgLoadError"
      @animationend="imgAnimationEnd"
    />
    <div :class="store.backgroundShow ? 'gray hidden' : 'gray'" />
    <Transition name="fade" mode="out-in">
      <a
        v-if="store.backgroundShow && store.coverType != '3'"
        class="down"
        :href="bgUrl"
        target="_blank"
      >
        下载壁纸
      </a>
    </Transition>
  </div>
</template>

<script setup>
import { mainStore } from "@/store";
import { Error } from "@icon-park/vue-next";

const store = mainStore();
const bgUrl = ref(null);
const imgTimeout = ref(null);
const loadSafetyTimeout = ref(null);
const emit = defineEmits(["loadComplete"]);

// 各壁纸类型对应的图源（均已验证可达）
// 0 默认壁纸：风景大图；1 每日一图：必应每日一图；2 随机风景：随机摄影；3 随机动漫：萌系动漫
const WALLPAPERS = {
  0: "https://t.alcy.cc/fj",
  1: "https://bing.biturl.top/?resolution=1920&format=image",
  2: "https://picsum.photos/1920/1080",
  3: "https://t.alcy.cc/moe",
};
const FALLBACK_BG = WALLPAPERS[0];

// 更换壁纸链接
const changeBg = (type) => {
  bgUrl.value = WALLPAPERS[type] ?? FALLBACK_BG;
};

// 图片加载完成
const imgLoadComplete = () => {
  clearTimeout(loadSafetyTimeout.value);
  imgTimeout.value = setTimeout(
    () => {
      store.setImgLoadStatus(true);
    },
    Math.floor(Math.random() * (600 - 300 + 1)) + 300,
  );
};

// 图片动画完成
const imgAnimationEnd = () => {
  console.log("壁纸加载且动画完成");
  // 加载完成事件
  emit("loadComplete");
};

// 图片显示失败
const imgLoadError = () => {
  console.error("壁纸加载失败：", bgUrl.value);
  // 首次失败：切回默认图源再试一次；默认图源也失败则直接放行，不卡加载屏
  if (bgUrl.value !== FALLBACK_BG) {
    ElMessage({
      message: "壁纸加载失败，已临时切换回默认",
      icon: h(Error, {
        theme: "filled",
        fill: "#efefef",
      }),
    });
    bgUrl.value = FALLBACK_BG;
  } else {
    store.setImgLoadStatus(true);
  }
};

// 监听壁纸切换
watch(
  () => store.coverType,
  (value) => {
    changeBg(value);
  },
);

onMounted(() => {
  // 加载壁纸
  changeBg(store.coverType);
  // 兜底：壁纸 8 秒未加载出也不卡住加载屏
  loadSafetyTimeout.value = setTimeout(() => {
    store.setImgLoadStatus(true);
  }, 8000);
});

onBeforeUnmount(() => {
  clearTimeout(imgTimeout.value);
  clearTimeout(loadSafetyTimeout.value);
});
</script>

<style lang="scss" scoped>
.cover {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  transition: 0.25s;
  z-index: -1;

  &.show {
    z-index: 1;
  }

  .bg {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    backface-visibility: hidden;
    filter: blur(20px) brightness(0.3);
    transition:
      filter 0.3s,
      transform 0.3s;
    animation: fade-blur-in 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
    animation-delay: 0.45s;
  }
  .gray {
    opacity: 1;
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    background-image: radial-gradient(rgba(0, 0, 0, 0) 0, rgba(0, 0, 0, 0.5) 100%),
      radial-gradient(rgba(0, 0, 0, 0) 33%, rgba(0, 0, 0, 0.3) 166%);

    transition: 1.5s;
    &.hidden {
      opacity: 0;
      transition: 1.5s;
    }
  }
  .down {
    font-size: 16px;
    color: white;
    position: absolute;
    bottom: 30px;
    left: 0;
    right: 0;
    margin: 0 auto;
    display: block;
    padding: 20px 26px;
    border-radius: 8px;
    background-color: #00000030;
    width: 120px;
    height: 30px;
    display: flex;
    justify-content: center;
    align-items: center;
    &:hover {
      transform: scale(1.05);
      background-color: #00000060;
    }
    &:active {
      transform: scale(1);
    }
  }
}
</style>
