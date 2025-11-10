<template>
  <q-page class="q-pa-md">
    <h1 class="text-h4 q-mb-md">键盘定制器</h1>
    <p class="text-subtitle1 q-mb-lg">选择键盘和键帽进行搭配预览</p>

    <div class="row q-col-gutter-md">
      <!-- 左侧：3D预览区域 -->
      <div class="col-12 col-md-8">
        <q-card class="preview-card">
          <q-card-section>
            <div class="text-h6">预览</div>
            <div class="text-subtitle2" v-if="selectedKeyboard && selectedKeycap">
              {{ selectedKeyboard.name }} + {{ selectedKeycap.name }}
            </div>
            <div class="text-subtitle2" v-else>
              请选择键盘和键帽进行预览
            </div>
          </q-card-section>

          <q-card-section class="preview-container">
            <!-- Always render the component, but with default values if no selection -->
            <div class="preview-wrapper">
              <keyboard-customizer-3d
                :keyboard-src="selectedKeyboard ? selectedKeyboard.image : 'public/images/keyboard-placeholder.png'"
                :keycap-base-color="selectedKeycap ? selectedKeycap.baseColor : '#cccccc'"
                :keycap-character-color="selectedKeycap ? selectedKeycap.characterColor : '#ffffff'"
                :width="modelWidth"
                :height="modelHeight"
                ref="modelViewer"
              />
            </div>
            <!-- Overlay message if no selection -->
            <div v-if="!selectedKeyboard || !selectedKeycap" class="no-selection-overlay">
              <q-icon name="keyboard" size="100px" color="grey-5" />
              <div class="text-subtitle1 q-mt-md">请从右侧选择键盘和键帽</div>
            </div>
          </q-card-section>

          <q-card-actions align="right">
            <q-btn
              v-if="selectedKeyboard && selectedKeycap"
              color="primary"
              icon="photo_camera"
              label="保存预览图"
              @click="savePreview"
            />
          </q-card-actions>
        </q-card>
      </div>

      <!-- 右侧：选择区域 -->
      <div class="col-12 col-md-4">
        <!-- 键盘选择 -->
        <q-card class="q-mb-md">
          <q-card-section>
            <div class="text-h6">选择键盘</div>
            <q-input
              v-model="keyboardSearchQuery"
              outlined
              dense
              placeholder="搜索键盘..."
              class="q-mb-md"
              clearable
            >
              <template v-slot:append>
                <q-icon name="search" />
              </template>
            </q-input>
          </q-card-section>

          <q-separator />

          <q-card-section class="selection-list-container">
            <q-list separator>
              <q-item
                v-for="keyboard in filteredKeyboards"
                :key="keyboard.id"
                clickable
                @click="selectKeyboard(keyboard)"
                :active="selectedKeyboard && selectedKeyboard.id === keyboard.id"
              >
                <q-item-section avatar>
                  <q-avatar>
                    <q-img :src="keyboard.image" />
                  </q-avatar>
                </q-item-section>

                <q-item-section>
                  <q-item-label>{{ keyboard.name }}</q-item-label>
                  <q-item-label caption>{{ keyboard.manufacturer }} - {{ keyboard.layout }}</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>
        </q-card>

        <!-- 键帽选择 -->
        <q-card>
          <q-card-section>
            <div class="text-h6">选择键帽</div>
            <q-input
              v-model="keycapSearchQuery"
              outlined
              dense
              placeholder="搜索键帽..."
              class="q-mb-md"
              clearable
            >
              <template v-slot:append>
                <q-icon name="search" />
              </template>
            </q-input>
          </q-card-section>

          <q-separator />

          <q-card-section class="selection-list-container">
            <q-list separator>
              <q-item
                v-for="keycap in filteredKeycaps"
                :key="keycap.id"
                clickable
                @click="selectKeycap(keycap)"
                :active="selectedKeycap && selectedKeycap.id === keycap.id"
              >
                <q-item-section avatar>
                  <q-avatar>
                    <q-img :src="keycap.image" />
                  </q-avatar>
                </q-item-section>

                <q-item-section>
                  <q-item-label>{{ keycap.name }}</q-item-label>
                  <q-item-label caption>{{ keycap.manufacturer }}</q-item-label>
                </q-item-section>

                <q-item-section side>
                  <div class="color-preview">
                    <div class="color-dot" :style="{ backgroundColor: keycap.baseColor }"></div>
                    <div class="color-dot" :style="{ backgroundColor: keycap.characterColor }"></div>
                  </div>
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script>
import { keycapsStore } from 'src/store/keycaps'
import KeyboardCustomizer3D from 'src/components/KeyboardCustomizer3D.vue'

export default {
  name: 'KeyboardCustomizer',
  components: {
    'keyboard-customizer-3d': KeyboardCustomizer3D
  },
  data() {
    return {
      keyboards: [],
      keycaps: [],
      selectedKeyboard: null,
      selectedKeycap: null,
      keyboardSearchQuery: '',
      keycapSearchQuery: '',
      modelWidth: 800,
      modelHeight: 500
    }
  },
  created() {
    // Load keyboards and keycaps from store
    this.keyboards = keycapsStore.getAllKeyboard()
    this.keycaps = keycapsStore.getAllKeycaps()

    // Set initial model dimensions
    this.updateModelDimensions()

    // Add window resize listener
    window.addEventListener('resize', this.updateModelDimensions)

    // Check for URL parameters
    this.loadFromUrlParams()
  },
  beforeUnmount() {
    // Remove window resize listener
    window.removeEventListener('resize', this.updateModelDimensions)
  },
  computed: {
    filteredKeyboards() {
      if (!this.keyboardSearchQuery) {
        return this.keyboards
      }

      const query = this.keyboardSearchQuery.toLowerCase()
      return this.keyboards.filter(keyboard => {
        return keyboard.name.toLowerCase().includes(query) ||
          keyboard.manufacturer.toLowerCase().includes(query) ||
          keyboard.layout.toLowerCase().includes(query)
      })
    },
    filteredKeycaps() {
      if (!this.keycapSearchQuery) {
        return this.keycaps
      }

      const query = this.keycapSearchQuery.toLowerCase()
      return this.keycaps.filter(keycap => {
        return keycap.name.toLowerCase().includes(query) ||
          keycap.manufacturer.toLowerCase().includes(query) ||
          (keycap.colorCategory && keycap.colorCategory.some(color => color.toLowerCase().includes(query)))
      })
    }
  },
  methods: {
    selectKeyboard(keyboard) {
      console.log('Selected keyboard:', keyboard);
      this.selectedKeyboard = keyboard;

      // Force update dimensions and re-render when a keyboard is selected
      this.$nextTick(() => {
        this.updateModelDimensions();
        this.updatePreview();
      });
    },
    selectKeycap(keycap) {
      console.log('Selected keycap:', keycap);
      this.selectedKeycap = keycap;

      // Force update dimensions and re-render when a keycap is selected
      this.$nextTick(() => {
        this.updatePreview();
      });
    },
    updateModelDimensions() {
      // Responsive sizing for the 3D model
      const container = document.querySelector('.preview-container')
      if (container) {
        // Use the actual container dimensions if available
        this.modelWidth = container.clientWidth
        this.modelHeight = container.clientHeight
        console.log('Model dimensions set to:', this.modelWidth, 'x', this.modelHeight)
      } else {
        // Fallback to calculated dimensions
        const containerWidth = window.innerWidth < 768
          ? window.innerWidth - 40 // Mobile
          : (window.innerWidth * 0.66) - 40 // Desktop (2/3 of screen)

        this.modelWidth = containerWidth
        this.modelHeight = Math.min(500, containerWidth * 0.6) // Maintain aspect ratio with max height
      }
    },
    updatePreview() {
      // If the model viewer is available, force a re-render
      console.log('Updating preview, refs:', this.$refs);
      if (this.$refs.modelViewer) {
        console.log('Model viewer found, updating preview');
        // Access the component instance
        const modelViewer = this.$refs.modelViewer;
        console.log('Model viewer instance:', modelViewer);
        if (modelViewer.updateModel) {
          console.log('Calling updateModel method');
          modelViewer.updateModel();
        } else {
          console.warn('updateModel method not found on model viewer');
        }
      } else {
        console.warn('Model viewer ref not found');
      }
    },
    savePreview() {
      // Implement screenshot functionality
      if (this.$refs.modelViewer && this.$refs.modelViewer.takeScreenshot) {
        this.$refs.modelViewer.takeScreenshot()
      }
    },
    loadFromUrlParams() {
      // Check if we have keyboard or keycap IDs in the URL
      const keyboardId = this.$route.query.keyboardId ? parseInt(this.$route.query.keyboardId) : null
      const keycapId = this.$route.query.keycapId ? parseInt(this.$route.query.keycapId) : null

      console.log('URL params:', { keyboardId, keycapId })

      // Load keyboard if ID is provided
      if (keyboardId) {
        const keyboard = this.keyboards.find(k => k.id === keyboardId)
        if (keyboard) {
          console.log('Loading keyboard from URL param:', keyboard.name)
          this.selectKeyboard(keyboard)
        }
      }

      // Load keycap if ID is provided
      if (keycapId) {
        const keycap = this.keycaps.find(k => k.id === keycapId)
        if (keycap) {
          console.log('Loading keycap from URL param:', keycap.name)
          this.selectKeycap(keycap)
        }
      }
    }
  }
}
</script>

<style scoped>
.preview-card {
  height: 100%;
}

.preview-container {
  height: 500px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f0f0f0;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #ddd;
}

.preview-wrapper {
  width: 100%;
  height: 100%;
  position: relative;
}

.no-selection-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: rgba(240, 240, 240, 0.8);
  color: #aaa;
  z-index: 10;
  border-radius: 8px;
}

.selection-list-container {
  max-height: 300px;
  overflow-y: auto;
}

.color-preview {
  display: flex;
  gap: 4px;
}

.color-dot {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 1px solid #ddd;
}
</style>
