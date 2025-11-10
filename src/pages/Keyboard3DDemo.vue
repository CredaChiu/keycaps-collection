<template>
  <q-page class="q-pa-md">
    <div class="row q-col-gutter-md">
      <!-- Header -->
      <div class="col-12">
        <div class="text-h4 q-mb-md">3D键盘渲染器演示</div>
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
                :width="modelWidth"
                :height="modelHeight"
                ref="modelViewer"
              />
            </div>
          </q-card-section>
          
          <q-card-section>
            <div class="row q-col-gutter-sm">
              <div class="col-12 col-sm-4">
                <q-btn
                  icon="refresh"
                  label="重置视角"
                  color="primary"
                  outline
                  @click="resetView"
                />
              </div>
              <div class="col-12 col-sm-4">
                <q-btn
                  icon="fullscreen"
                  label="全屏查看"
                  color="secondary"
                  outline
                  @click="toggleFullscreen"
                />
              </div>
              <div class="col-12 col-sm-4">
                <q-btn
                  icon="3d_rotation"
                  label="重新渲染"
                  color="accent"
                  outline
                  @click="recreateModel"
                />
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
      
      <!-- Info Panel -->
      <div class="col-12 col-lg-4">
        <q-card>
          <q-card-section>
            <div class="text-h6">功能说明</div>
            <q-list dense>
              <q-item>
                <q-item-section avatar>
                  <q-icon name="3d_rotation" color="primary" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>3D渲染</q-item-label>
                  <q-item-label caption>使用Three.js实现真实3D键盘模型</q-item-label>
                </q-item-section>
              </q-item>
              
              <q-item>
                <q-item-section avatar>
                  <q-icon name="lightbulb" color="amber" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>真实光照</q-item-label>
                  <q-item-label caption>多光源系统，包含环境光、方向光、填充光</q-item-label>
                </q-item-section>
              </q-item>
              
              <q-item>
                <q-item-section avatar>
                  <q-icon name="shadow" color="grey" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>阴影渲染</q-item-label>
                  <q-item-label caption>PCF软阴影，提供更真实的深度感</q-item-label>
                </q-item-section>
              </q-item>
              
              <q-item>
                <q-item-section avatar>
                  <q-icon name="mouse" color="blue" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>交互控制</q-item-label>
                  <q-item-label caption>鼠标拖拽旋转、滚轮缩放、右键平移</q-item-label>
                </q-item-section>
              </q-item>
              
              <q-item>
                <q-item-section avatar>
                  <q-icon name="keyboard" color="green" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>60%布局</q-item-label>
                  <q-item-label caption>标准60%键盘布局，包含所有主要按键</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>
        </q-card>
        
        <q-card class="q-mt-md">
          <q-card-section>
            <div class="text-h6">技术特性</div>
            <div class="text-body2 q-mt-sm">
              <p><strong>Three.js v0.175.0</strong></p>
              <p>• 真实3D几何体</p>
              <p>• Lambert材质</p>
              <p>• 多光源照明</p>
              <p>• 软阴影渲染</p>
              <p>• 抗锯齿处理</p>
              <p>• 响应式设计</p>
            </div>
          </q-card-section>
        </q-card>
        
        <q-card class="q-mt-md">
          <q-card-section>
            <div class="text-h6">参考项目</div>
            <div class="text-body2 q-mt-sm">
              <p>本项目参考了以下优秀的开源项目：</p>
              <p>• <a href="https://github.com/crsnbrt/keysim" target="_blank">KeySim</a> - 3D键盘设计工具</p>
              <p>• <a href="https://threejs.org/" target="_blank">Three.js</a> - 3D图形库</p>
              <p>• <a href="https://quasar.dev/" target="_blank">Quasar</a> - Vue.js UI框架</p>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script>
import KeyboardModel3D from 'src/components/KeyboardModel3D.vue'

export default {
  name: 'Keyboard3DDemo',
  components: {
    'keyboard-model-3d': KeyboardModel3D
  },
  data() {
    return {
      modelWidth: 800,
      modelHeight: 600
    }
  },
  mounted() {
    this.updateModelDimensions()
    window.addEventListener('resize', this.updateModelDimensions)
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.updateModelDimensions)
  },
  methods: {
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
    
    recreateModel() {
      if (this.$refs.modelViewer) {
        const modelViewer = this.$refs.modelViewer
        if (modelViewer.createSimpleModel) {
          modelViewer.createSimpleModel()
        }
      }
    },
    
    updateModelDimensions() {
      const container = document.querySelector('.model-container')
      if (container) {
        this.modelWidth = container.clientWidth
        this.modelHeight = container.clientHeight
      } else {
        const containerWidth = window.innerWidth < 768
          ? window.innerWidth - 40
          : (window.innerWidth * 0.66) - 40
        this.modelWidth = containerWidth
        this.modelHeight = Math.min(600, containerWidth * 0.6)
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

a {
  color: #1976d2;
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}
</style> 