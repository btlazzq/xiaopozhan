<template>
  <div
    class="spine-tape"
    :style="{ transform: `rotate(${tilt}deg)` }"
  >
    <div class="spine-tape__case">
      <div
        class="spine-tape__paper"
        :class="paperClass"
        :style="paperStyle"
      >
        <template v-if="material.split">
          <span
            class="spine-tape__half spine-tape__half--l"
            :style="{ background: colorLeft }"
          />
          <span
            class="spine-tape__half spine-tape__half--r"
            :style="{ background: colorRight }"
          />
        </template>
        <div
          v-if="material.decor === 'oval'"
          class="spine-tape__oval"
        />
        <span
          class="spine-tape__label"
          :class="labelClass"
          :style="{ color: material.labelColor }"
        >{{ label }}</span>
      </div>
      <div class="spine-tape__shine" />
    </div>
    <span class="spine-tape__no">no.{{ index + 1 }}</span>
  </div>
</template>

<script setup>
import { computed } from "vue";
import {
  getMaterial,
  formatSpineLabel,
  spineTilt,
} from "@/constants/spineMaterials";

const props = defineProps({
  item: { type: Object, required: true },
  index: { type: Number, required: true },
});

const material = computed(() => getMaterial(props.item));
const label = computed(() => formatSpineLabel(props.item));
const tilt = computed(() => spineTilt(props.item, props.index));

const colorLeft = computed(
  () => props.item.spine_color_left || material.value.defaultLeft || "#8ab4d4"
);
const colorRight = computed(
  () => props.item.spine_color_right || material.value.defaultRight || "#e8dfd0"
);

const paperClass = computed(() => ({
  "spine-tape__paper--grain": material.value.texture === "grain",
  "spine-tape__paper--paper": material.value.texture === "paper",
}));

const paperStyle = computed(() => {
  if (material.value.split) return { background: "transparent" };
  return { background: material.value.paper };
});

const labelClass = computed(() => ({
  "spine-tape__label--marker": material.value.labelFont === "marker",
  "spine-tape__label--hand": material.value.labelFont === "hand",
}));
</script>

<style scoped>
.spine-tape {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  transform-origin: bottom center;
}

.spine-tape__case {
  width: 100%;
  flex: 1 1 auto;
  min-height: 0;
  position: relative;
  border-radius: 0.02rem;
  box-shadow:
    inset 0.02rem 0 0.05rem rgba(255, 255, 255, 0.18),
    inset -0.02rem 0 0.06rem rgba(0, 0, 0, 0.3),
    0.02rem 0.04rem 0.1rem rgba(0, 0, 0, 0.5);
  background: linear-gradient(
    90deg,
    rgba(200, 198, 192, 0.25) 0%,
    rgba(255, 255, 255, 0.04) 12%,
    transparent 50%,
    rgba(200, 198, 192, 0.12) 88%,
    rgba(160, 155, 148, 0.3) 100%
  );
}

.spine-tape__paper {
  position: absolute;
  top: 0.04rem;
  left: 0.032rem;
  right: 0.032rem;
  bottom: 0.055rem;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.spine-tape__paper--paper::after {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  opacity: 0.35;
  background: linear-gradient(
    180deg,
    rgba(200, 170, 120, 0.12) 0%,
    transparent 40%,
    rgba(0, 0, 0, 0.06) 100%
  );
}

.spine-tape__paper--grain::after {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  opacity: 0.28;
  mix-blend-mode: multiply;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E");
  background-size: 0.8rem 0.8rem;
}

.spine-tape__half {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 50%;
}

.spine-tape__half--l {
  left: 0;
}

.spine-tape__half--r {
  right: 0;
}

.spine-tape__oval {
  position: absolute;
  width: 70%;
  height: 21%;
  top: 25%;
  left: 50%;
  transform: translateX(-50%);
  background: #101010;
  border-radius: 50%;
  z-index: 1;
}

.spine-tape__label {
  writing-mode: vertical-rl;
  text-orientation: mixed;
  max-height: 70%;
  overflow: hidden;
  z-index: 2;
  line-height: 1.12;
  letter-spacing: 0.018rem;
  text-shadow: 0.01rem 0.01rem 0.025rem rgba(0, 0, 0, 0.35);
}

.spine-tape__label--marker {
  font-family: "Permanent Marker", cursive;
  font-size: 0.088rem;
  color: #f8f4ec;
}

.spine-tape__label--hand {
  font-family: "Ma Shan Zheng", "Permanent Marker", cursive;
  font-size: 0.095rem;
  color: inherit;
}

.spine-tape__shine {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 3;
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0.12) 0%,
    transparent 15%,
    transparent 85%,
    rgba(255, 255, 255, 0.06) 100%
  );
}

.spine-tape__no {
  margin-top: 0.015rem;
  width: 100%;
  text-align: center;
  font-size: 0.058rem;
  line-height: 1.35;
  color: #f0ece8;
  background: rgba(0, 0, 0, 0.88);
  padding: 0.01rem 0;
  font-family: "DottedSongtiCircleRegular", Helvetica, serif;
  letter-spacing: 0.01rem;
}
</style>
