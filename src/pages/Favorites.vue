<template>
  <q-page class="q-pa-md">
    <h1 class="text-h4 q-mb-md">我的收藏</h1>

    <!-- 分类标签 -->
    <div class="q-mb-md">
      <q-tabs
        v-model="activeTab"
        class="text-primary"
        active-color="primary"
        indicator-color="primary"
        align="justify"
      >
        <q-tab name="keycaps" label="键帽" icon="keyboard" />
        <q-tab name="keyboards" label="键盘" icon="computer" />
      </q-tabs>
    </div>

    <!-- 键帽收藏 -->
    <div v-if="activeTab === 'keycaps'">
      <div class="row q-mb-md items-center">
        <!-- 搜索栏 -->
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
              已找到 {{ favoriteKeycaps.filter(keycap => isKeycapVisible(keycap)).length }} 个键帽
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

        <!-- 排序按钮 -->
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
      <color-filter :keycaps="favoriteKeycaps" @filter-change="handleColorFilter" />

      <!-- 添加搜索结果提示 -->
      <div v-if="searchQuery && !favoriteKeycaps.some(keycap => isKeycapVisible(keycap))" class="text-center q-pa-md">
        <q-icon name="search_off" size="48px" style="color: var(--secondary-color)" />
        <p class="text" style="color: var(--secondary-color)">未找到匹配的键帽</p>
      </div>

      <draggable
        v-model="favoriteKeycaps"
        class="row q-col-gutter-md"
        style="color: var(--secondary-color)"
        item-key="id"
        @start="drag=true"
        @end="onDragEnd"
        animation="300"
      >
        <template #item="{ element: keycap }">
          <div v-if="isKeycapVisible(keycap)" class="col-12 col-sm-6 col-md-4 col-lg-3">
            <q-card class="keycap-card" style="background-color: var(--l9)">
              <div class="drag-handle">
                <q-icon name="drag_indicator" size="sm" class="cursor-move" />
              </div>
              <q-img
                :src="keycap.image"
                class="keycap-image cursor-pointer"
                :ratio="1"
                @click="showPreview(keycap)"
              />
              <q-card-section>
                <div class="text-h6">{{ keycap.name }}</div>
                <div class="text-subtitle2">{{ keycap.manufacturer }}</div>
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
                    icon="favorite"
                    flat
                    round
                    color="red"
                    @click="removeFavorite(keycap)"
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
        </template>
      </draggable>
      <div v-if="favoriteKeycaps.length === 0" class="text-center q-pa-lg">
        <q-icon name="sentiment_dissatisfied" size="50px" color="grey-5" />
        <p class="text-grey-7 q-mt-sm">暂无收藏的键帽</p>
      </div>
    </div>

    <!-- 键盘收藏 -->
    <div v-if="activeTab === 'keyboards'">
      <div class="row q-mb-md items-center">
        <!-- 搜索栏 -->
        <div class="col-grow">
          <q-input
            v-model="searchQuery"
            filled
            placeholder="搜索键盘名称、制造商或配列"
            clearable
            @clear="onClear"
          >
            <template v-slot:append>
              <q-icon name="search" />
            </template>
            <template v-slot:hint>
              已找到 {{ favoriteKeyboards.filter(keyboard => isKeyboardVisible(keyboard)).length }} 个键盘
            </template>
            <!-- 添加搜索建议 -->
            <template v-slot:after>
              <q-btn-dropdown flat dense style="color: var(--secondary-color)" label="快速筛选">
                <q-list>
                  <q-item clickable v-close-popup style="color: var(--secondary-color)" @click="filterByManufacturer('60%')">
                    <q-item-section>
                      <q-item-label>60%</q-item-label>
                    </q-item-section>
                  </q-item>
                  <q-item clickable v-close-popup style="color: var(--secondary-color)" @click="filterByManufacturer('65%')">
                    <q-item-section>
                      <q-item-label>65%</q-item-label>
                    </q-item-section>
                  </q-item>
                  <q-item clickable v-close-popup style="color: var(--secondary-color)" @click="filterByManufacturer('75%')">
                    <q-item-section>
                      <q-item-label>75%</q-item-label>
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

        <!-- 排序按钮 -->
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

      <!-- 添加搜索结果提示 -->
      <div v-if="searchQuery && !favoriteKeyboards.some(keyboard => isKeyboardVisible(keyboard))" class="text-center q-pa-md">
        <q-icon name="search_off" size="48px" style="color: var(--secondary-color)" />
        <p class="text" style="color: var(--secondary-color)">未找到匹配的键盘</p>
      </div>

      <draggable
        v-model="favoriteKeyboards"
        class="row q-col-gutter-md"
        style="color: var(--secondary-color)"
        item-key="id"
        @start="drag=true"
        @end="onKeyboardDragEnd"
        animation="300"
      >
        <template #item="{ element: keyboard }">
          <div v-if="isKeyboardVisible(keyboard)" class="col-12 col-sm-6 col-md-4 col-lg-3">
            <q-card class="keycap-card" style="background-color: var(--l9)">
              <div class="drag-handle">
                <q-icon name="drag_indicator" size="sm" class="cursor-move" />
              </div>
              <q-img
                :src="keyboard.image"
                class="keycap-image cursor-pointer"
                :ratio="1"
                @click="showPreview(keyboard)"
              />
              <q-card-section>
                <div class="text-h6">{{ keyboard.name }}</div>
                <div class="text-subtitle2">{{ keyboard.manufacturer }}</div>
                <div class="text-caption" v-if="keyboard.layout">{{ keyboard.layout }}</div>
              </q-card-section>
              <q-card-actions class="justify-between">
                <div>
                  <q-btn
                    class="info-btn"
                    icon="info"
                    size="lg"
                    flat
                    round
                    :to="'/keyboard-detail/' + keyboard.id"
                    style="color: var(--primary-color);"
                  />
                </div>
                <div>
                  <q-btn
                    icon="zoom_in"
                    flat
                    round
                    @click="showPreview(keyboard)"
                    style="color: var(--secondary-color)"
                  />
                  <q-btn
                    icon="favorite"
                    flat
                    round
                    color="red"
                    @click="removeFavorite(keyboard)"
                  />
                  <q-btn
                    :icon="keyboard.isShopping ? 'shopping_cart' : 'add_shopping_cart'"
                    flat
                    round
                    @click="toggleShopping(keyboard)"
                    :color="keyboard.isShopping ? 'red' : 'grey'"
                  />
                </div>
              </q-card-actions>
            </q-card>
          </div>
        </template>
      </draggable>
      <div v-if="favoriteKeyboards.length === 0" class="text-center q-pa-lg">
        <q-icon name="sentiment_dissatisfied" size="50px" color="grey-5" />
        <p class="text-grey-7 q-mt-sm">暂无收藏的键盘</p>
      </div>
    </div>

    <!-- 预览对话框 -->
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
import draggable from 'vuedraggable'
import ColorFilter from 'src/components/ColorFilter.vue'

export default {
  name: 'PageFavorites',
  components: {
    draggable,
    ColorFilter
  },
  data () {
    return {
      activeTab: 'keycaps',  // 默认显示键帽标签
      favoriteKeycaps: [],
      favoriteKeyboards: [],
      drag: false,
      previewDialog: false,
      selectedKeycap: null,
      isFullscreen: true,
      showInstructions: true,
      // 搜索相关
      searchQuery: '', // 搜索关键词
      selectedColors: [], // 选中的颜色筛选
      sortOrder: 'asc', // 排序方式
      // 图片预览相关状态
      imageScale: 1, // 图片缩放比例
      isDragging: false, // 是否正在拖拽
      dragStartX: 0, // 拖拽开始X坐标
      dragStartY: 0, // 拖拽开始Y坐标
      imageX: 0, // 图片X位置
      imageY: 0, // 图片Y位置
      lastImageX: 0, // 上次图片X位置
      lastImageY: 0 // 上次图片Y位置
    }
  },
  created () {
    this.loadFavorites()
  },
  computed: {
    // 计算图片变换样式
    imageTransformStyle() {
      return {
        transform: `translate(${this.imageX}px, ${this.imageY}px) scale(${this.imageScale})`,
      }
    }
  },
  methods: {
    // 加载收藏的键帽和键盘
    loadFavorites () {
      const favorites = keycapsStore.getFavorites()
      const shopping = keycapsStore.getShopping()

      // 分类处理收藏的项目
      this.favoriteKeycaps = favorites.filter(item => {
        // 判断是键帽的特征：有 characterColor 或 baseColor 属性
        return item.characterColor !== undefined || item.baseColor !== undefined ||
               (item.id < 10000 && !item.layout) // 根据ID范围和属性判断
      }).map(keycap => ({
        ...keycap,
        isFavorite: true, // 已经在收藏中
        isShopping: shopping.some(s => s.id === keycap.id) // 设置购物车状态
      }))

      // 判断是键盘的特征：有 layout 或 design 属性
      this.favoriteKeyboards = favorites.filter(item => {
        return item.layout !== undefined || item.design !== undefined ||
               (item.id >= 10000) // 根据ID范围判断
      }).map(keyboard => ({
        ...keyboard,
        isFavorite: true, // 已经在收藏中
        isShopping: shopping.some(s => s.id === keyboard.id) // 设置购物车状态
      }))
    },

    // 移除收藏
    removeFavorite (item) {
      keycapsStore.removeFromFavorites(item.id)
      this.loadFavorites()
    },

    // 切换购物车
    toggleShopping (keycap) {
      keycap.isShopping = !keycap.isShopping
      if (keycap.isShopping) {
        keycapsStore.addToShopping(keycap)
      } else {
        keycapsStore.removeFromShopping(keycap.id)
      }
    },

    // 键帽拖拽结束后的处理
    onDragEnd() {
      this.drag = false
      localStorage.setItem('favoritesKeycapsOrder', JSON.stringify(this.favoriteKeycaps))
    },

    // 键盘拖拽结束后的处理
    onKeyboardDragEnd() {
      this.drag = false
      localStorage.setItem('favoritesKeyboardsOrder', JSON.stringify(this.favoriteKeyboards))
    },

    // 显示预览
    showPreview(item) {
      this.selectedKeycap = item
      this.previewDialog = true
      this.isFullscreen = true // 确保预览是全屏的
      // 重置缩放和位置
      this.resetZoom()
    },

    // 重置缩放
    resetZoom() {
      this.imageScale = 1
      this.imageX = 0
      this.imageY = 0
      this.lastImageX = 0
      this.lastImageY = 0
      this.isDragging = false
    },

    // 切换全屏
    toggleFullscreen() {
      this.isFullscreen = !this.isFullscreen
    },

    // 切换显示说明
    toggleInstructions() {
      this.showInstructions = !this.showInstructions
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

    // 搜索框清除
    onClear() {
      this.searchQuery = ''
    },

    // 检查键帽是否应该显示
    isKeycapVisible(keycap) {
      if (this.drag) return true

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
    },

    // 检查键盘是否应该显示
    isKeyboardVisible(keyboard) {
      if (this.drag) return true

      // 文本搜索筛选
      const searchLower = this.searchQuery.toLowerCase()
      const textMatch = keyboard.name.toLowerCase().includes(searchLower) ||
             keyboard.manufacturer.toLowerCase().includes(searchLower) ||
             (keyboard.layout && keyboard.layout.toLowerCase().includes(searchLower))

      return textMatch
    },

    // 按制造商筛选
    filterByManufacturer(manufacturer) {
      this.searchQuery = manufacturer
    },

    // 处理颜色筛选变化
    handleColorFilter(selectedColors) {
      this.selectedColors = selectedColors
    },

    // 切换排序方式
    toggleSort() {
      this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc'
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
.drag-handle {
  position: absolute;
  top: 8px;
  left: 8px;
  z-index: 1;
  padding: 4px;
  border-radius: 4px;
  background-color: rgba(190, 176, 152, 0.2);
  cursor: move;
}
.drag-handle:hover {
  background-color: rgba(190, 176, 152, 0.5);
  transform: scale(1.1);
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
