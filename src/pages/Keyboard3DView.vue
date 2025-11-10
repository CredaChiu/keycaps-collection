<template>
  <q-page class="q-pa-md">
    <h1 class="text-h4 q-mb-md">3D Keyboard Viewer</h1>

    <div class="row q-col-gutter-md">
      <div class="col-12 col-md-8">
        <q-card class="model-card">
          <q-card-section>
            <div class="text-h6">{{ selectedKeyboard ? selectedKeyboard.name : '选择一个键盘' }}</div>
            <div v-if="selectedKeyboard" class="text-subtitle2">{{ selectedKeyboard.manufacturer }} - {{ selectedKeyboard.layout }}</div>
          </q-card-section>

          <q-card-section class="model-container">
            <div v-if="selectedKeyboard" class="model-wrapper">
              <keyboard-model-3d
                :image-src="selectedKeyboard.image"
                :width="modelWidth"
                :height="modelHeight"
                ref="modelViewer"
              />
            </div>
            <div v-else class="no-selection">
              <q-icon name="keyboard" size="100px" color="grey-5" />
              <div class="text-subtitle1 q-mt-md">请从右侧选择一个键盘查看3D模型</div>
            </div>
          </q-card-section>

          <q-card-section v-if="selectedKeyboard">
            <div class="row items-center">
              <div class="col-12 col-sm-6">
                <div class="text-subtitle1">制造商: {{ selectedKeyboard.manufacturer }}</div>
                <div class="text-subtitle1">布局: {{ selectedKeyboard.layout }}</div>
                <div class="text-subtitle1">设计: {{ selectedKeyboard.design }}</div>
                <div class="text-subtitle1">PCB: {{ selectedKeyboard.pcb }}</div>
                <div class="text-subtitle1">价格: {{ selectedKeyboard.price }}</div>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-md-4">
        <q-card>
          <q-card-section>
            <div class="text-h6">选择键盘</div>
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
                  <q-item-label caption>{{ keyboard.manufacturer }} - {{ keyboard.layout }}</q-item-label>
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
      </div>
    </div>
  </q-page>
</template>

<script>
import { keycapsStore } from 'src/store/keycaps'
import KeyboardModel3D from 'src/components/KeyboardModel3D.vue'

export default {
  name: 'Keyboard3DView',
  components: {
    'keyboard-model-3d': KeyboardModel3D
  },
  data() {
    return {
      keyboards: [],
      selectedKeyboard: null,
      searchQuery: '',
      modelWidth: 800,
      modelHeight: 500
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
      this.selectedKeyboard = keyboard;

      // Force update dimensions and re-render when a keyboard is selected
      this.$nextTick(() => {
        this.updateModelDimensions();

        // If the model viewer is available, force a re-render
        if (this.$refs.modelViewer) {
          console.log('Model viewer found, forcing update');
          // Access the component instance
          const modelViewer = this.$refs.modelViewer;
          if (modelViewer.createSimpleModel) {
            modelViewer.createSimpleModel();
          }
        }
      });
    },
    onClear() {
      this.searchQuery = ''
    },
    updateModelDimensions() {
      // Responsive sizing for the 3D model
      const containerWidth = window.innerWidth < 768
        ? window.innerWidth - 40 // Mobile
        : (window.innerWidth * 0.66) - 40 // Desktop (2/3 of screen)

      // Get the actual container element if available
      const container = document.querySelector('.model-container');
      if (container) {
        // Use the actual container dimensions if available
        this.modelWidth = container.clientWidth;
        this.modelHeight = container.clientHeight;
        console.log('Model dimensions set to:', this.modelWidth, 'x', this.modelHeight);
      } else {
        // Fallback to calculated dimensions
        this.modelWidth = containerWidth;
        this.modelHeight = Math.min(500, containerWidth * 0.6); // Maintain aspect ratio with max height
        console.log('Fallback model dimensions:', this.modelWidth, 'x', this.modelHeight);
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
  height: 500px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f0f0f0;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #ddd;
}

.model-wrapper {
  width: 100%;
  height: 100%;
  position: relative;
}

.no-selection {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #aaa;
}

.keyboard-list-container {
  max-height: 500px;
  overflow-y: auto;
}
</style>
