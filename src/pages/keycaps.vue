<!--主页面-->
<template>
  <q-page class="q-pa-md">
    <h1 class="text-h4 q-mb-md">Keycaps Collection</h1>

    <div class="row q-mb-md items-center">
      <!-- 改进搜索栏 -->
      <div class="col-grow">
        <q-input
          v-model="searchQuery"
          filled
          placeholder="搜索键帽名称或制造商"
          clearable
          @clear="onClear"
        >
          <template v-slot:append>
            <q-icon name="search" />
          </template>
          <template v-slot:hint>
            已找到 {{ filteredKeycaps.length }} 个键帽
          </template>
          <!-- 添加搜索建议 -->
          <template v-slot:after>
            <q-btn-dropdown flat dense style="color: var(--secondary-color)" label="快速筛选">
              <q-list>
                <q-item clickable v-close-popup style="color: var(--secondary-color)" @click="filterByManufacturer('GMK')">
                  <q-item-section>
                    <q-item-label>GMK</q-item-label>
                  </q-item-section>
                </q-item>
                <q-item clickable v-close-popup style="color: var(--secondary-color)" @click="filterByManufacturer('JTK')">
                  <q-item-section>
                    <q-item-label>JTK</q-item-label>
                  </q-item-section>
                </q-item>
                <q-separator />
                <q-item clickable v-close-popup style="color: var(--secondary-color)" @click="searchQuery = ''">
                  <q-item-section>
                    <q-item-label>显示全部</q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-btn-dropdown>
          </template>
        </q-input>
      </div>

      <!-- 修改按钮样式 -->
      <!-- 添加 flat 属性使背景透明 -->
      <div class="col-auto q-ml-md">
        <q-btn
          flat
          style="color: var(--secondary-color)"
          class="sort-btn"
          @click="toggleSort"
        >
          <q-icon
            :name="sortOrder === 'asc' ? 'arrow_upward' : 'arrow_downward'"
            class="q-mr-sm"
          />
          ID {{ sortOrder === 'asc' ? '升序' : '降序' }}
        </q-btn>
      </div>
    </div>

    <!-- 添加颜色筛选组件 -->
    <color-filter :keycaps="keycaps" @filter-change="handleColorFilter" />

    <!-- 添加搜索结果提示 -->
    <div v-if="searchQuery && filteredKeycaps.length === 0" class="text-center q-pa-md">
      <q-icon name="search_off" size="48px" style="color: var(--secondary-color)" />
      <p class="text" style="color: var(--secondary-color)">未找到匹配的键帽</p>
    </div>

    <!-- 键帽展示网格 -->
    <div class="row q-col-gutter-md" style="color: var(--secondary-color)">
      <div v-for="keycap in filteredKeycaps" :key="keycap.id" class="col-12 col-sm-6 col-md-4 col-lg-3">
        <q-card class="keycap-card" style="background-color: var(--l9)">
          <q-img
            :src="keycap.image"
            class="keycap-image cursor-pointer"
            :ratio="1"
            @click="showPreview(keycap)"
          />
          <q-card-section>
            <div class="text-h6">{{ keycap.name }}</div>
            <div class="text-subtitle2">{{ keycap.manufacturer }}</div>
            <div class="text-subtitle2">{{ keycap.height }}</div>
            <div class="text-subtitle2">{{ keycap.material }}</div>
            <keycap-color-extractor :image-src="keycap.image" />
          </q-card-section>
          <q-card-actions class="justify-between">
            <div>
              <q-btn
                class="info-btn"
                icon="info"
                size="lg"
                flat
                round
                :to="'/keycap-detail/' + keycap.id"
                style="color: var(--primary-color);"
              />
            </div>
            <div>
              <q-btn
                icon="zoom_in"
                flat
                round
                @click="showPreview(keycap)"
                style="color: var(--secondary-color)"
              />
              <q-btn
                :icon="keycap.isFavorite ? 'favorite' : 'favorite_border'"
                flat
                round
                @click="toggleFavorite(keycap)"
                :color="keycap.isFavorite ? 'red' : 'grey'"
              />
              <q-btn
                :icon="keycap.isShopping ? 'shopping_cart' : 'add_shopping_cart'"
                flat
                round
                @click="toggleShopping(keycap)"
                :color="keycap.isShopping ? 'red' : 'grey'"
              />
            </div>
          </q-card-actions>
        </q-card>
      </div>
    </div>

    <!-- 优化预览对话框 -->
    <q-dialog v-model="previewDialog" transition-show="fade" transition-hide="fade" :maximized="isFullscreen">
      <q-card :class="['preview-card', { 'fullscreen-preview': isFullscreen }]">
        <q-card-section class="row items-center q-pb-none preview-header">
          <div class="title-container">
            <div class="text-h6 preview-title">{{ selectedKeycap?.name }}</div>
          </div>
          <q-space />
          <div class="controls-container">
            <q-btn flat round icon="refresh" @click="resetZoom" class="preview-control-btn" />
            <q-btn class="preview-control-btn" :icon="showInstructions ? 'visibility' : 'visibility_off'" flat round dense @click="toggleInstructions" />
            <q-btn class="preview-control-btn" :icon="isFullscreen ? 'fullscreen_exit' : 'fullscreen'" flat round dense @click="toggleFullscreen" />
            <q-btn class="preview-close-btn" icon="close" flat round dense v-close-popup />
          </div>
        </q-card-section>

        <q-card-section class="preview-image-container">
          <div
            class="draggable-container"
            @mousedown="startDrag"
            @mousemove="onDrag"
            @mouseup="stopDrag"
            @mouseleave="stopDrag"
            @wheel="handleZoom"
          >
            <q-img
              :src="selectedKeycap?.image"
              class="preview-image"
              fit="contain"
              spinner-color="primary"
              spinner-size="82px"
              :style="imageTransformStyle"
            >
            </q-img>
          </div>
          <div class="drag-instructions" v-if="previewDialog && showInstructions">
            <q-icon name="pan_tool" size="20px" class="q-mr-xs" />
            拖拽移动图片 |
            <q-icon name="mouse" size="20px" class="q-mr-xs q-ml-sm" />
            滚轮缩放
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
import { keycapsStore } from 'src/store/keycaps'
import KeycapColorExtractor from 'src/components/KeycapColorExtractor.vue'
import ColorFilter from 'src/components/ColorFilter.vue'

export default {
  name: 'PageIndex',
  components: {
    KeycapColorExtractor,
    ColorFilter
  },
  data () {
    return {
      searchQuery: '',
      keycaps: [],
      previewDialog: false,
      selectedKeycap: null,
      sortOrder: 'asc',
      selectedColors: [],
      imageScale: 1, // 图片缩放比例
      isDragging: false, // 是否正在拖拽
      dragStartX: 0, // 拖拽开始X坐标
      dragStartY: 0, // 拖拽开始Y坐标
      imageX: 0, // 图片X位置
      imageY: 0, // 图片Y位置
      lastImageX: 0, // 上次图片X位置
      lastImageY: 0, // 上次图片Y位置
      isFullscreen: true, // 是否全屏显示
      showInstructions: true // 是否显示操作指引
    }
  },
  created() {
    // 修改这里的初始化逻辑
    // 总是使用 keycapsStore 中的最新数据
    this.keycaps = keycapsStore.getAllKeycaps()

    // 获取保存的排序顺序
    const savedOrder = localStorage.getItem('keycapsOrder')
    if (savedOrder) {
      // 获取保存的顺序
      const orderIds = JSON.parse(savedOrder).map(k => k.id)
      // 按保存的顺序重新排列新数据
      this.keycaps.sort((a, b) => {
        return orderIds.indexOf(a.id) - orderIds.indexOf(b.id)
      })
    }

    // 同步收藏状态
    const favorites = keycapsStore.getFavorites()
    this.keycaps = this.keycaps.map(keycap => ({
      ...keycap,
      isFavorite: favorites.some(f => f.id === keycap.id)
    }))

    const shopping = keycapsStore.getShopping()
    this.keycaps = this.keycaps.map(keycap => ({
      ...keycap,
      isShopping: shopping.some(f => f.id === keycap.id)
    }))
  },

  computed: {
    // 计算图片变换样式
    imageTransformStyle() {
      return {
        transform: `translate(${this.imageX}px, ${this.imageY}px) scale(${this.imageScale})`,
      }
    },
    filteredKeycaps() {
      return this.keycaps.filter(keycap => {
          // 文本搜索筛选
          const searchLower = this.searchQuery.toLowerCase()
          const textMatch = keycap.name.toLowerCase().includes(searchLower) ||
                 keycap.manufacturer.toLowerCase().includes(searchLower)

          // 颜色筛选
          let colorMatch = true
          if (this.selectedColors.length > 0) {
            colorMatch = this.selectedColors.some(color =>
              keycap.colorCategory && keycap.colorCategory.includes(color)
            )
          }

          return textMatch && colorMatch
        }).sort((a, b) => {
          if (this.sortOrder === 'asc') {
            return a.id - b.id
          } else {
            return b.id - a.id
          }
        })
    }
  },
  methods: {
    toggleFavorite (keycap) {
      keycap.isFavorite = !keycap.isFavorite
      if (keycap.isFavorite) {
        keycapsStore.addToFavorites(keycap)
      } else {
        keycapsStore.removeFromFavorites(keycap.id)
      }
    },
    toggleShopping (keycap) {
      keycap.isShopping = !keycap.isShopping
      if (keycap.isShopping) {
        keycapsStore.addToShopping(keycap)
      } else {
        keycapsStore.removeFromShopping(keycap.id)
      }
    },
    // 添加预览方法
    showPreview(keycap) {
      this.selectedKeycap = keycap
      this.previewDialog = true
      this.isFullscreen = true // 确保预览是全屏的
      this.resetImageView()
    },
    // 重置图片视图
    resetImageView() {
      this.imageScale = 1
      this.imageX = 0
      this.imageY = 0
      this.lastImageX = 0
      this.lastImageY = 0
      this.isDragging = false
    },
    // 添加图片缩放控制方法
    zoomIn() {
      this.imageScale = Math.min(this.imageScale + 0.2, 5)
    },
    zoomOut() {
      this.imageScale = Math.max(this.imageScale - 0.2, 0.5)
    },
    resetZoom() {
      this.resetImageView()
    },
    // 切换全屏模式
    toggleFullscreen() {
      this.isFullscreen = !this.isFullscreen
    },
    // 开始拖拽
    startDrag(event) {
      if (event.button !== 0) return // 只响应左键
      this.isDragging = true
      this.dragStartX = event.clientX
      this.dragStartY = event.clientY
      event.preventDefault()
    },
    // 拖拽中
    onDrag(event) {
      if (!this.isDragging) return

      const deltaX = event.clientX - this.dragStartX
      const deltaY = event.clientY - this.dragStartY

      this.imageX = this.lastImageX + deltaX
      this.imageY = this.lastImageY + deltaY

      event.preventDefault()
    },
    // 停止拖拽
    stopDrag() {
      if (this.isDragging) {
        this.lastImageX = this.imageX
        this.lastImageY = this.imageY
        this.isDragging = false
      }
    },
    // 鼠标滚轮缩放
    handleZoom(event) {
      event.preventDefault()
      const delta = -Math.sign(event.deltaY) * 0.1
      const newScale = Math.max(0.5, Math.min(5, this.imageScale + delta))

      // 计算鼠标位置相对于图片容器的偏移
      const container = event.currentTarget.getBoundingClientRect()
      const mouseX = event.clientX - container.left
      const mouseY = event.clientY - container.top

      // 计算鼠标位置相对于图片中心的偏移
      const centerX = container.width / 2
      const centerY = container.height / 2

      // 调整位置，使缩放以鼠标位置为中心
      if (this.imageScale !== newScale) {
        const scaleFactor = newScale / this.imageScale
        const dx = (mouseX - centerX - this.imageX) * (scaleFactor - 1)
        const dy = (mouseY - centerY - this.imageY) * (scaleFactor - 1)

        this.imageX = this.imageX - dx
        this.imageY = this.imageY - dy
        this.lastImageX = this.imageX
        this.lastImageY = this.imageY
      }

      this.imageScale = newScale
    },
    // 切换操作指引的显示和隐藏
    toggleInstructions() {
      this.showInstructions = !this.showInstructions
    },
    // 切换排序方式
    toggleSort() {
      this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc'
    },
    // 添加新方法
    onClear() {
      this.searchQuery = ''
    },
    filterByManufacturer(manufacturer) {
      this.searchQuery = manufacturer
    },
    // 处理颜色筛选变化
    handleColorFilter(selectedColors) {
      this.selectedColors = selectedColors
    }
  }
}
</script>

<style scoped>
.keycap-card {
  transition: all 0.3s;
  height: 100%;
}
.keycap-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0,0,0,0.3);
}

.keycap-image {
  height: 200px;
  object-fit: cover;
}

.info-btn {
  border-radius: 50%;
  box-shadow: 0 2px 3px rgba(0, 0, 0, 0);
  transition: all 0.2s ease;
  margin-left: -5px;
}

.info-btn:hover {
  transform: scale(1.0);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
}

/* 颜色显示样式 */
.color-display {
  display: flex;
  align-items: center;
}

.color-info {
  font-size: 0.8rem;
  margin-left: 10px;
}

.color-code {
  font-family: monospace;
}

/* 键帽预览样式 */
.keycap-preview {
  display: flex;
  gap: 5px;
}

.q-key {
  width: 30px;
  height: 30px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  border: 1px solid;
  box-shadow: 0 2px 3px rgba(0,0,0,0.1);
}

.shift-key {
  width: 40px;
  height: 30px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  border: 1px solid;
  box-shadow: 0 2px 3px rgba(0,0,0,0.1);
}

/* 预览对话框中的颜色显示 */
.preview-color-display {
  display: flex;
  align-items: center;
  margin-top: 10px;
}

.preview-keycap-display {
  display: flex;
  gap: 8px;
  margin-right: 15px;
}

.preview-q-key {
  width: 40px;
  height: 40px;
  border-radius: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 1.2rem;
  border: 1.5px solid;
  box-shadow: 0 3px 5px rgba(0,0,0,0.15);
}

.preview-shift-key {
  width: 55px;
  height: 40px;
  border-radius: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 1.2rem;
  border: 1.5px solid;
  box-shadow: 0 3px 5px rgba(0,0,0,0.15);
}

.preview-color-info {
  font-size: 0.9rem;
}

.preview-card {
  width: 90vw;
  max-width: 1400px;
  height: 90vh;
  border-radius: 12px;
  background-color: rgba(var(--l9-rgb), 0.95);
  backdrop-filter: blur(10px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.3);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;
}

/* 全屏预览样式 */
.fullscreen-preview {
  width: 100vw !important;
  height: 100vh !important;
  max-width: 100vw !important;
  border-radius: 0 !important;
  transition: all 0.3s ease;
}

.preview-header {
  background-color: rgba(var(--l9-rgb), 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(var(--secondary-color-rgb), 0.1);
  padding: 16px 24px;
}

.title-container {
  background-color: rgba(190, 176, 152, 0.1);
  border-radius: 20px;
  padding: 8px 16px;
  display: inline-flex;
  align-items: center;
  backdrop-filter: blur(5px);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
}

.preview-title {
  color: #BEB098;
  font-weight: 600;
  margin: 0;
}

.preview-close-btn {
  color: #BEB098;
  transition: transform 0.2s ease;
}

.preview-close-btn:hover {
  transform: rotate(90deg);
  background-color: rgba(255, 255, 255, 0.2);
}

.preview-image-container {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  overflow: hidden;
  background-color: rgba(var(--l9-rgb), 0.95);
  backdrop-filter: blur(10px);
}

.draggable-container {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  cursor: grab;
  position: relative;
}

.draggable-container:active {
  cursor: grabbing;
}

.preview-image {
  max-height: calc(100vh - 140px);
  transition: transform 0.1s linear;
  will-change: transform;
  object-fit: contain;
}

.drag-instructions {
  position: absolute;
  bottom: 10px;
  left: 50%;
  transform: translateX(-50%);
  background-color: rgba(190, 176, 152, 0.1);
  color: #BEB098;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  opacity: 0.9;
  z-index: 10;
  backdrop-filter: blur(5px);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  font-weight: 500;
}

.preview-info-section {
  background-color: rgba(var(--l9-rgb), 0.95);
  backdrop-filter: blur(10px);
  border-top: 1px solid rgba(var(--secondary-color-rgb), 0.1);
  padding: 16px 24px;
}

.controls-container {
  background-color: rgba(190, 176, 152, 0.1);
  border-radius: 20px;
  padding: 4px 8px;
  display: inline-flex;
  align-items: center;
  backdrop-filter: blur(5px);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
}

.preview-control-btn {
  color: #BEB098;
  margin: 0 4px;
  transition: all 0.2s ease;
}

.preview-control-btn:hover {
  background-color: rgba(255, 255, 255, 0.2);
  transform: scale(1.1);
}

.sort-btn {
  height: 56px; /* 与搜索框高度对齐 */
}
</style>
