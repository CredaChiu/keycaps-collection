<template>
  <q-page class="q-pa-md">
    <div class="row q-col-gutter-md">
      <!-- Header -->
      <div class="col-12">
        <div class="text-h4 q-mb-md">高级3D键盘渲染器</div>
        <div class="text-subtitle1 q-mb-lg">
          基于Three.js的真实3D键盘渲染，参考KeySim项目设计
        </div>
      </div>
      
      <!-- 3D View -->
      <div class="col-12 col-lg-8">
        <q-card class="model-card">
          <q-card-section>
            <div class="text-h6">3D键盘预览</div>
            <div class="text-caption">
              使用鼠标拖拽旋转视角，滚轮缩放，右键平移
            </div>
          </q-card-section>
          
          <q-card-section class="model-container">
            <div class="model-wrapper">
              <keyboard-model-3d
                :image-src="selectedKeyboard ? selectedKeyboard.image : null"
                :width="modelWidth"
                :height="modelHeight"
                ref="modelViewer"
              />
            </div>
          </q-card-section>
          
          <q-card-section>
            <div class="row q-col-gutter-sm">
              <div class="col-12 col-sm-6">
                <q-btn
                  icon="refresh"
                  label="重置视角"
                  color="primary"
                  outline
                  @click="resetView"
                />
              </div>
              <div class="col-12 col-sm-6">
                <q-btn
                  icon="fullscreen"
                  label="全屏查看"
                  color="secondary"
                  outline
                  @click="toggleFullscreen"
                />
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
      
      <!-- Controls Panel -->
      <div class="col-12 col-lg-4">
        <q-card>
          <q-card-section>
            <div class="text-h6">键盘选择</div>
            <q-input
              v-model="searchQuery"
              outlined
              dense
              placeholder="搜索键盘..."
              class="q-mb-md"
              clearable
              @clear="onClear"
            >
              <template v-slot:append>
                <q-icon name="search" />
              </template>
            </q-input>
          </q-card-section>
          
          <q-separator />
          
          <q-card-section class="keyboard-list-container">
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
                  <q-item-label caption>
                    {{ keyboard.manufacturer }} - {{ keyboard.layout }}
                  </q-item-label>
                </q-item-section>
                
                <q-item-section side>
                  <q-btn
                    icon="3d_rotation"
                    flat
                    round
                    dense
                    @click.stop="selectKeyboard(keyboard)"
                  />
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>
        </q-card>
        
        <!-- Keyboard Info -->
        <q-card class="q-mt-md" v-if="selectedKeyboard">
          <q-card-section>
            <div class="text-h6">键盘信息</div>
            <q-list dense>
              <q-item>
                <q-item-section>
                  <q-item-label caption>制造商</q-item-label>
                  <q-item-label>{{ selectedKeyboard.manufacturer }}</q-item-label>
                </q-item-section>
              </q-item>
              <q-item>
                <q-item-section>
                  <q-item-label caption>布局</q-item-label>
                  <q-item-label>{{ selectedKeyboard.layout }}</q-item-label>
                </q-item-section>
              </q-item>
              <q-item>
                <q-item-section>
                  <q-item-label caption>设计</q-item-label>
                  <q-item-label>{{ selectedKeyboard.design }}</q-item-label>
                </q-item-section>
              </q-item>
              <q-item>
                <q-item-section>
                  <q-item-label caption>PCB</q-item-label>
                  <q-item-label>{{ selectedKeyboard.pcb }}</q-item-label>
                </q-item-section>
              </q-item>
              <q-item>
                <q-item-section>
                  <q-item-label caption>价格</q-item-label>
                  <q-item-label>{{ selectedKeyboard.price }}</q-item-label>
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
import KeyboardModel3D from 'src/components/KeyboardModel3D.vue'

export default {
  name: 'AdvancedKeyboard3DView',
  components: {
    'keyboard-model-3d': KeyboardModel3D
  },
  data() {
    return {
      keyboards: [],
      selectedKeyboard: null,
      searchQuery: '',
      modelWidth: 800,
      modelHeight: 600
    }
  },
  created() {
    // Load keyboards from store
    this.keyboards = keycapsStore.getAllKeyboard()
    
    // Set initial model dimensions
    this.updateModelDimensions()
    
    // Add window resize listener
    window.addEventListener('resize', this.updateModelDimensions)
  },
  beforeUnmount() {
    // Remove window resize listener
    window.removeEventListener('resize', this.updateModelDimensions)
  },
  computed: {
    filteredKeyboards() {
      if (!this.searchQuery) {
        return this.keyboards
      }
      
      const query = this.searchQuery.toLowerCase()
      return this.keyboards.filter(keyboard => {
        return keyboard.name.toLowerCase().includes(query) ||
          keyboard.manufacturer.toLowerCase().includes(query) ||
          keyboard.layout.toLowerCase().includes(query)
      })
    }
  },
  methods: {
    selectKeyboard(keyboard) {
      this.selectedKeyboard = keyboard
      
      // Force update dimensions and re-render when a keyboard is selected
      this.$nextTick(() => {
        this.updateModelDimensions()
        
        // If the model viewer is available, force a re-render
        if (this.$refs.modelViewer) {
          console.log('Model viewer found, forcing update')
          const modelViewer = this.$refs.modelViewer
          if (modelViewer.createSimpleModel) {
            modelViewer.createSimpleModel()
          }
        }
      })
    },
    
    onClear() {
      this.searchQuery = ''
    },
    
    resetView() {
      if (this.$refs.modelViewer) {
        const modelViewer = this.$refs.modelViewer
        if (modelViewer.controls) {
          modelViewer.controls.reset()
        }
      }
    },
    
    toggleFullscreen() {
      const container = document.querySelector('.model-container')
      if (document.fullscreenElement) {
        document.exitFullscreen()
      } else if (container) {
        container.requestFullscreen()
      }
    },
    
    updateModelDimensions() {
      // Responsive sizing for the 3D model
      const containerWidth = window.innerWidth < 768
        ? window.innerWidth - 40 // Mobile
        : (window.innerWidth * 0.66) - 40 // Desktop (2/3 of screen)
      
      // Get the actual container element if available
      const container = document.querySelector('.model-container')
      if (container) {
        // Use the actual container dimensions if available
        this.modelWidth = container.clientWidth
        this.modelHeight = container.clientHeight
        console.log('Model dimensions set to:', this.modelWidth, 'x', this.modelHeight)
      } else {
        // Fallback to calculated dimensions
        this.modelWidth = containerWidth
        this.modelHeight = Math.min(600, containerWidth * 0.6) // Maintain aspect ratio with max height
        console.log('Fallback model dimensions:', this.modelWidth, 'x', this.modelHeight)
      }
    }
  }
}
</script>

<style scoped>
.model-card {
  height: 100%;
}

.model-container {
  height: 600px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #ddd;
}

.model-wrapper {
  width: 100%;
  height: 100%;
  position: relative;
}

.keyboard-list-container {
  max-height: 400px;
  overflow-y: auto;
}
</style> 