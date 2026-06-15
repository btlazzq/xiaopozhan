<template>
  <div
    v-if="visible"
    class="dialog-mask"
    @click.self="onCancel"
  >
    <div class="dialog-box">
      <div class="dialog-title">{{ title }}</div>
      <textarea
        v-if="mode === 'input'"
        v-model="inputValue"
        class="dialog-input"
        :placeholder="placeholder"
        :maxlength="maxLength"
        rows="4"
      />
      <div
        v-else
        class="dialog-message"
      >{{ message }}</div>
      <div
        v-if="mode === 'input'"
        class="char-count"
      >{{ inputValue.length }}/{{ maxLength }}</div>
      <div class="dialog-actions">
        <button
          v-if="mode === 'input'"
          class="dialog-btn cancel"
          @click="onCancel"
        >取消</button>
        <button
          class="dialog-btn confirm"
          :disabled="mode === 'input' && !inputValue.trim()"
          @click="onConfirm"
        >{{ confirmText }}</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
  visible: { type: Boolean, default: false },
  message: { type: String, default: '' },
  title: { type: String, default: '留言' },
  mode: { type: String, default: 'input' },
  placeholder: { type: String, default: '说点什么...' },
  maxLength: { type: Number, default: 300 },
  confirmText: { type: String, default: '发送' }
});

const emit = defineEmits(['confirm', 'cancel', 'update:visible']);

const inputValue = ref('');

watch(() => props.visible, (val) => {
  if (val) inputValue.value = '';
});

function onCancel() {
  emit('cancel');
  emit('update:visible', false);
}

function onConfirm() {
  if (props.mode === 'input') {
    emit('confirm', inputValue.value.trim());
  } else {
    emit('confirm');
  }
  emit('update:visible', false);
}
</script>

<style scoped>
.dialog-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.75);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.dialog-box {
  width: 3.5rem;
  background: #1a1a1a;
  border: 1px solid rgba(255, 255, 255, 0.15);
  padding: 0.3rem 0.25rem;
  box-sizing: border-box;
}

.dialog-title {
  font-family: "DottedSongtiCircleRegular", Helvetica, serif;
  font-size: 0.22rem;
  color: #ff8538;
  text-align: center;
  margin-bottom: 0.2rem;
}

.dialog-input {
  width: 100%;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: #fff;
  font-family: "Courier New", Courier, monospace;
  font-size: 0.18rem;
  padding: 0.12rem;
  box-sizing: border-box;
  resize: none;
  line-height: 1.6;
}

.dialog-message {
  font-family: "Courier New", Courier, monospace;
  font-size: 0.18rem;
  color: #fff;
  text-align: center;
  line-height: 1.6;
  padding: 0.1rem 0;
}

.char-count {
  font-size: 0.14rem;
  color: rgba(255, 255, 255, 0.45);
  text-align: right;
  margin-top: 0.08rem;
}

.dialog-actions {
  display: flex;
  justify-content: space-between;
  margin-top: 0.2rem;
  gap: 0.15rem;
}

.dialog-btn {
  flex: 1;
  height: 0.4rem;
  border: none;
  font-family: "Courier New", Courier, monospace;
  font-size: 0.16rem;
  cursor: pointer;
}

.dialog-btn.cancel {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
}

.dialog-btn.confirm {
  background: #6457b6;
  color: #fff;
}

.dialog-btn.confirm:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
</style>
