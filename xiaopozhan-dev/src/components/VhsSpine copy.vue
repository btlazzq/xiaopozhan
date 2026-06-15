<template>
  <div
    class="vhs-spine"
    :style="{ transform: `rotate(${tilt}deg)` }"
  >
    <div class="vhs-spine__shell">
      <div
        class="vhs-spine__label-strip"
        :style="stripStyle"
      >
        <span class="vhs-spine__num">{{ numLabel }}</span>
        <span class="vhs-spine__title">{{ label }}</span>
        <span class="vhs-spine__badge">VHS</span>
      </div>
      <div class="vhs-spine__shine" />
    </div>
    <span class="vhs-spine__no">no.{{ index + 1 }}</span>
  </div>
</template>

<script setup>
import { computed } from "vue";
import {
  getVhsMaterial,
  formatSpineLabel,
  spineTilt,
} from "@/constants/spineMaterials";

const props = defineProps({
  item: { type: Object, required: true },
  index: { type: Number, required: true },
});

const material = computed(() => getVhsMaterial(props.item));
const label = computed(() => formatSpineLabel(props.item));
const tilt = computed(() => spineTilt(props.item, props.index) * 0.6);
const numLabel = computed(() => {
  const n = props.item.no ?? props.index + 1;
  return String(n).padStart(2, "0");
});

const stripStyle = computed(() => ({
  background: material.value.strip,
  color: material.value.labelColor,
}));
</script>

<style scoped>
.vhs-spine {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  transform-origin: bottom center;
}

.vhs-spine__shell {
  width: 100%;
  flex: 1 1 auto;
  min-height: 0;
  position: relative;
  background: linear-gradient(
    90deg,
    #1a1a1a 0%,
    #2a2a2a 8%,
    #151515 50%,
    #222 92%,
    #0a0a0a 100%
  );
  box-shadow:
    inset 0.02rem 0 0.05rem rgba(255, 255, 255, 0.1),
    inset -0.02rem 0 0.06rem rgba(0, 0, 0, 0.5),
    0.03rem 0.05rem 0.12rem rgba(0, 0, 0, 0.6);
  border-radius: 0.02rem;
}

.vhs-spine__label-strip {
  position: absolute;
  top: 8%;
  bottom: 12%;
  left: 18%;
  right: 18%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  padding: 0.08rem 0.04rem;
  box-shadow: inset 0 0 0.06rem rgba(0, 0, 0, 0.35);
}

.vhs-spine__num {
  font-family: "Courier New", Courier, monospace;
  font-size: 0.09rem;
  font-weight: 700;
  border: 0.012rem solid currentColor;
  padding: 0.02rem 0.06rem;
  opacity: 0.9;
}

.vhs-spine__title {
  writing-mode: vertical-rl;
  text-orientation: mixed;
  font-family: "Ma Shan Zheng", "Permanent Marker", cursive;
  font-size: 0.1rem;
  line-height: 1.1;
  max-height: 62%;
  overflow: hidden;
  text-align: center;
  flex: 1;
  display: flex;
  align-items: center;
}

.vhs-spine__badge {
  font-family: "Courier New", Courier, monospace;
  font-size: 0.055rem;
  letter-spacing: 0.02rem;
  border: 0.01rem solid currentColor;
  padding: 0.015rem 0.04rem;
  opacity: 0.85;
}

.vhs-spine__shine {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0.08) 0%,
    transparent 20%,
    transparent 80%,
    rgba(255, 255, 255, 0.04) 100%
  );
}

.vhs-spine__no {
  margin-top: 0.015rem;
  width: 100%;
  text-align: center;
  font-size: 0.058rem;
  color: #f0ece8;
  background: rgba(0, 0, 0, 0.88);
  padding: 0.01rem 0;
  font-family: "DottedSongtiCircleRegular", Helvetica, serif;
}
</style>
