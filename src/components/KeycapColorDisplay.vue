<template>
  <div class="keycap-colors-container">
    <div class="keycap-color-sample">
      <div class="color-sample-title">键帽颜色</div>
      <div class="color-samples">
        <div
          class="color-sample"
          :style="{ backgroundColor: keycap.baseColor }"
          :title="keycap.baseColor"
        >
          <span class="color-sample-label">底色</span>
        </div>
        <div
          class="color-sample"
          :style="{ backgroundColor: keycap.characterColor }"
          :title="keycap.characterColor"
        >
          <span class="color-sample-label">字符</span>
        </div>
        <!-- 添加键帽预览 -->
        <div class="keycap-preview">
          <div 
            class="preview-key" 
            :style="{ 
              backgroundColor: keycap.baseColor,
              color: keycap.characterColor,
              borderColor: adjustBorderColor(keycap.baseColor)
            }"
          >
            Q
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'KeycapColorDisplay',
  props: {
    keycap: {
      type: Object,
      required: true
    }
  },
  methods: {
    // 根据背景色调整边框颜色
    adjustBorderColor(color) {
      // 简单的边框颜色调整逻辑
      if (this.isLightColor(color)) {
        return this.darken(color, 0.2);
      } else {
        return this.lighten(color, 0.2);
      }
    },
    
    // 判断颜色是否为浅色
    isLightColor(color) {
      // 将颜色转换为RGB
      const r = parseInt(color.slice(1, 3), 16);
      const g = parseInt(color.slice(3, 5), 16);
      const b = parseInt(color.slice(5, 7), 16);
      
      // 计算亮度 (简化版)
      const brightness = (r * 299 + g * 587 + b * 114) / 1000;
      return brightness > 128;
    },
    
    // 使颜色变暗
    darken(color, amount) {
      return this.adjustColor(color, -amount);
    },
    
    // 使颜色变亮
    lighten(color, amount) {
      return this.adjustColor(color, amount);
    },
    
    // 调整颜色
    adjustColor(color, amount) {
      // 将颜色转换为RGB
      let r = parseInt(color.slice(1, 3), 16);
      let g = parseInt(color.slice(3, 5), 16);
      let b = parseInt(color.slice(5, 7), 16);
      
      // 调整RGB值
      r = Math.max(0, Math.min(255, r + Math.round(r * amount)));
      g = Math.max(0, Math.min(255, g + Math.round(g * amount)));
      b = Math.max(0, Math.min(255, b + Math.round(b * amount)));
      
      // 转回十六进制
      return `#${this.componentToHex(r)}${this.componentToHex(g)}${this.componentToHex(b)}`;
    },
    
    // 将颜色分量转换为十六进制
    componentToHex(c) {
      const hex = c.toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }
  }
}
</script>

<style scoped>
.keycap-colors-container {
  margin-top: 8px;
}

.keycap-color-sample {
  display: flex;
  flex-direction: column;
}

.color-sample-title {
  font-size: 0.9rem;
  margin-bottom: 4px;
  color: inherit;
}

.color-samples {
  display: flex;
  gap: 6px;
  align-items: center;
}

.color-sample {
  width: 36px;
  height: 36px;
  border-radius: 4px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: transform 0.2s;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.color-sample:hover {
  transform: scale(1.1);
}

.color-sample-label {
  font-size: 0.6rem;
  color: rgba(255, 255, 255, 0.9);
  text-shadow: 0 0 2px rgba(0, 0, 0, 0.8), 0 0 2px rgba(0, 0, 0, 0.8);
  pointer-events: none;
  font-weight: bold;
}

.keycap-preview {
  margin-left: 10px;
}

.preview-key {
  width: 40px;
  height: 40px;
  border-radius: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 1.2rem;
  border: 1.5px solid;
  box-shadow: 0 3px 5px rgba(0, 0, 0, 0.15);
}
</style>
