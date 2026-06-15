<template>
  <div
    class="ancientBook"
    :class="[`style-${index % 9}`]"
    :style="{ transform: tilt }"
  >
    <div class="bookEdge left"></div>
    <div class="bookEdge right"></div>

    <div class="topNo">
      {{ noText }}
    </div>

    <div class="paperSign">
      <span>{{ title }}</span>
    </div>

    <div class="redSeal">
      记
    </div>

    <div class="bottomNo">
      卷 {{ noText }}
    </div>

    <i class="oldSpot spot1"></i>
    <i class="oldSpot spot2"></i>
    <i class="oldSpot spot3"></i>
    <i class="inkScratch s1"></i>
    <i class="inkScratch s2"></i>
  </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  item: {
    type: Object,
    default: () => ({})
  },
  index: {
    type: Number,
    default: 0
  }
});

const noText = computed(() => {
  const no = props.item.no || props.index + 1;
  return String(no).padStart(2, "0");
});

const title = computed(() => {
  const raw = props.item.title || props.item.name || "月记";
  return String(raw).length > 6 ? String(raw).slice(0, 6) : raw;
});

const tilt = computed(() => {
  const arr = [
    "rotate(-1deg)",
    "rotate(0.6deg)",
    "rotate(-0.4deg)",
    "rotate(0.9deg)",
    "rotate(-0.7deg)",
    "rotate(0.2deg)",
    "rotate(1.1deg)",
    "rotate(-1.2deg)",
    "rotate(0.4deg)"
  ];
  return arr[props.index % arr.length];
});
</script>

<style scoped>
.ancientBook {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  box-sizing: border-box;
  border-radius: 0.012rem;
  transform-origin: bottom center;
  border: 1px solid rgba(225, 208, 170, 0.15);
  box-shadow:
    inset 0.012rem 0 rgba(255, 245, 210, 0.16),
    inset -0.014rem 0 rgba(0, 0, 0, 0.68),
    0 0.035rem 0.09rem rgba(0, 0, 0, 0.92);
}

.style-0 {
  background:
    linear-gradient(90deg, rgba(255,255,255,.14), transparent 16%, transparent 78%, rgba(0,0,0,.62)),
    linear-gradient(180deg, #3a1510 0%, #7f2d22 42%, #130604 100%);
}

.style-1 {
  background:
    linear-gradient(90deg, rgba(255,255,255,.13), transparent 16%, transparent 78%, rgba(0,0,0,.64)),
    linear-gradient(180deg, #182d34 0%, #3e5b66 42%, #061013 100%);
}

.style-2 {
  background:
    linear-gradient(90deg, rgba(255,255,255,.14), transparent 16%, transparent 78%, rgba(0,0,0,.65)),
    linear-gradient(180deg, #4a3925 0%, #8a6842 42%, #170d06 100%);
}

.style-3 {
  background:
    linear-gradient(90deg, rgba(255,255,255,.13), transparent 16%, transparent 78%, rgba(0,0,0,.68)),
    linear-gradient(180deg, #25211b 0%, #4b4234 42%, #070605 100%);
}

.style-4 {
  background:
    linear-gradient(90deg, rgba(255,255,255,.18), transparent 16%, transparent 78%, rgba(0,0,0,.48)),
    linear-gradient(180deg, #d8c6a0 0%, #b69b70 48%, #5b4730 100%);
}

.style-5 {
  background:
    linear-gradient(90deg, rgba(255,255,255,.13), transparent 16%, transparent 78%, rgba(0,0,0,.64)),
    linear-gradient(180deg, #213124 0%, #4c6647 42%, #070f08 100%);
}

.style-6 {
  background:
    linear-gradient(90deg, rgba(255,255,255,.13), transparent 16%, transparent 78%, rgba(0,0,0,.68)),
    linear-gradient(180deg, #161616 0%, #30302d 42%, #030303 100%);
}

.style-7 {
  background:
    linear-gradient(90deg, rgba(255,255,255,.14), transparent 16%, transparent 78%, rgba(0,0,0,.65)),
    linear-gradient(180deg, #4c241b 0%, #9a4a34 42%, #120604 100%);
}

.style-8 {
  background:
    linear-gradient(90deg, rgba(255,255,255,.13), transparent 16%, transparent 78%, rgba(0,0,0,.66)),
    linear-gradient(180deg, #211b2f 0%, #4c3d67 42%, #090710 100%);
}

.ancientBook::before {
  content: "";
  position: absolute;
  inset: 0;
  z-index: 2;
  pointer-events: none;
  opacity: 0.52;
  mix-blend-mode: screen;
  background:
    radial-gradient(circle at 34% 20%, rgba(242, 222, 176, 0.22), transparent 8%),
    radial-gradient(circle at 62% 60%, rgba(0, 0, 0, 0.34), transparent 16%),
    radial-gradient(circle at 72% 76%, rgba(255, 236, 188, 0.14), transparent 10%),
    repeating-linear-gradient(
      90deg,
      rgba(255,255,255,.045) 0,
      rgba(255,255,255,.045) 0.006rem,
      transparent 0.012rem,
      transparent 0.07rem
    );
}

.ancientBook::after {
  content: "";
  position: absolute;
  inset: 0;
  z-index: 3;
  pointer-events: none;
  opacity: 0.24;
  background:
    linear-gradient(115deg, transparent 0%, rgba(255,255,255,.16) 43%, transparent 52%),
    repeating-linear-gradient(
      8deg,
      transparent 0,
      transparent 0.08rem,
      rgba(0,0,0,.2) 0.085rem,
      transparent 0.09rem
    );
}

.bookEdge {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 0.032rem;
  z-index: 4;
  background: linear-gradient(180deg, rgba(255,245,210,.24), rgba(0,0,0,.62));
}

.bookEdge.left {
  left: 0;
}

.bookEdge.right {
  right: 0;
}

.topNo {
  position: absolute;
  top: 0.055rem;
  left: 50%;
  transform: translateX(-50%);
  width: 0.3rem;
  height: 0.3rem;
  z-index: 5;
  background:
    linear-gradient(180deg, rgba(255,255,255,.2), transparent 50%),
    #d8c49a;
  color: #20150c;
  font-family: "Songti SC", "SimSun", serif;
  font-size: 0.18rem;
  font-weight: bold;
  line-height: 0.3rem;
  text-align: center;
  border: 1px solid rgba(70, 42, 18, 0.55);
  box-shadow:
    inset 0 0 0.018rem rgba(0,0,0,.45),
    0 0.01rem 0.02rem rgba(0,0,0,.65);
}

.paperSign {
  position: absolute;
  top: 0.46rem;
  left: 50%;
  transform: translateX(-50%);
  width: 68%;
  height: 1.5rem;
  z-index: 5;
  background:
    radial-gradient(circle at 40% 28%, rgba(100, 70, 36, 0.14), transparent 20%),
    radial-gradient(circle at 66% 72%, rgba(72, 46, 20, 0.12), transparent 18%),
    linear-gradient(180deg, #eadcb9 0%, #d3bc8d 100%);
  border: 1px solid rgba(87, 56, 26, 0.45);
  box-shadow:
    inset 0 0 0.03rem rgba(255,255,255,.42),
    0 0.015rem 0.035rem rgba(0,0,0,.6);
}

.paperSign::before {
  content: "";
  position: absolute;
  inset: 0;
  opacity: 0.34;
  background:
    repeating-linear-gradient(
      180deg,
      transparent 0,
      transparent 0.08rem,
      rgba(90, 60, 30, 0.18) 0.085rem
    );
}

.paperSign span {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  writing-mode: vertical-rl;
  text-orientation: upright;
  color: #21170f;
  font-family: "STKaiti", "KaiTi", "Songti SC", serif;
  font-size: 0.17rem;
  letter-spacing: 0.05em;
  white-space: nowrap;
  text-shadow: 0 0.006rem 0.008rem rgba(255,255,255,.25);
}

.redSeal {
  position: absolute;
  bottom: 0.48rem;
  left: 50%;
  transform: translateX(-50%) rotate(-6deg);
  z-index: 5;
  width: 0.23rem;
  height: 0.23rem;
  border: 1px solid rgba(145, 22, 14, 0.75);
  color: rgba(150, 20, 12, 0.92);
  font-family: "STKaiti", "KaiTi", serif;
  font-size: 0.14rem;
  line-height: 0.23rem;
  text-align: center;
  background: rgba(130, 20, 12, 0.08);
}

.bottomNo {
  position: absolute;
  bottom: 0.085rem;
  left: 50%;
  transform: translateX(-50%);
  z-index: 5;
  color: rgba(231, 213, 176, 0.78);
  font-family: "Songti SC", "SimSun", serif;
  font-size: 0.075rem;
  white-space: nowrap;
}

.oldSpot {
  position: absolute;
  z-index: 4;
  border-radius: 50%;
  background: rgba(236, 218, 176, 0.22);
  filter: blur(0.014rem);
}

.spot1 {
  width: 0.2rem;
  height: 0.14rem;
  left: 0.04rem;
  top: 0.9rem;
}

.spot2 {
  width: 0.22rem;
  height: 0.16rem;
  right: 0.02rem;
  top: 1.55rem;
}

.spot3 {
  width: 0.18rem;
  height: 0.13rem;
  left: 0.08rem;
  top: 2.15rem;
}

.inkScratch {
  position: absolute;
  z-index: 6;
  height: 1px;
  background: rgba(30, 20, 12, 0.55);
  opacity: 0.42;
}

.s1 {
  width: 0.46rem;
  left: 0.02rem;
  top: 1.1rem;
  transform: rotate(-28deg);
}

.s2 {
  width: 0.42rem;
  right: 0.01rem;
  top: 1.78rem;
  transform: rotate(17deg);
}
</style>