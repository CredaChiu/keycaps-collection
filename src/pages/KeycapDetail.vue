<template>
  <q-page class="q-pa-md">
    <div v-if="keycap">
      <div class="row q-col-gutter-md">
        <!-- 左侧：键帽图片 -->
        <div class="col-12 col-md-6">
          <q-card>
            <q-img
              :src="keycap.image"
              :ratio="1"
              class="keycap-detail-image"
            />
          </q-card>
        </div>

        <!-- 右侧：键帽详情 -->
        <div class="col-12 col-md-6">
          <q-card class="q-pa-md">
            <div class="text-h4">{{ keycap.name }}</div>
            <q-separator class="q-my-md" />

            <div class="row q-col-gutter-md">
              <div class="col-12 col-sm-6">
                <div class="text-subtitle1">制造商</div>
                <div class="text-h6">{{ keycap.manufacturer }}</div>
              </div>

              <div class="col-12">
                <div class="text-subtitle1">颜色</div>
                <div class="color-preview">
                  <div class="color-box" :style="{ backgroundColor: keycap.baseColor }">
                    <div class="color-label">底色</div>
                  </div>
                  <div class="color-box" :style="{ backgroundColor: keycap.characterColor }">
                    <div class="color-label">字符颜色</div>
                  </div>
                </div>
              </div>

              <div class="col-12">
                <div class="text-subtitle1">颜色分类</div>
                <div class="color-categories">
                  <q-chip
                    v-for="category in keycap.colorCategory"
                    :key="category"
                    color="primary"
                    text-color="white"
                    dense
                  >
                    {{ category }}
                  </q-chip>
                </div>
              </div>
            </div>

            <q-separator class="q-my-md" />

            <div class="row q-col-gutter-md">
              <div class="col-12">
                <q-btn
                  color="primary"
                  icon="favorite"
                  :label="keycap.isFavorite ? '取消收藏' : '收藏'"
                  @click="toggleFavorite"
                  class="full-width q-mb-md"
                />

                <q-btn
                  color="secondary"
                  icon="shopping_cart"
                  :label="keycap.isShopping ? '取消购物车' : '加入购物车'"
                  @click="toggleShopping"
                  class="full-width q-mb-md"
                />

                <q-btn
                  color="accent"
                  icon="style"
                  label="在定制器中使用"
                  @click="useInCustomizer"
                  class="full-width"
                />
              </div>
            </div>
          </q-card>
        </div>
      </div>

      <!-- 推荐搭配的键盘 -->
      <div class="q-mt-lg">
        <div class="text-h5 q-mb-md">推荐搭配的键盘</div>
        <div class="row q-col-gutter-md">
          <div
            v-for="keyboard in recommendedKeyboards"
            :key="keyboard.id"
            class="col-6 col-sm-4 col-md-3"
          >
            <q-card class="keyboard-card">
              <q-img
                :src="keyboard.image"
                :ratio="1"
              />
              <q-card-section>
                <div class="text-subtitle1">{{ keyboard.name }}</div>
                <div class="text-caption">{{ keyboard.manufacturer }} - {{ keyboard.layout }}</div>
              </q-card-section>
              <q-card-actions align="right">
                <q-btn
                  flat
                  round
                  icon="info"
                  :to="'/keyboard-detail/' + keyboard.id"
                />
                <q-btn
                  flat
                  round
                  icon="style"
                  @click="useWithKeyboard(keyboard)"
                />
              </q-card-actions>
            </q-card>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="text-center q-pa-xl">
      <q-spinner size="3em" color="primary" />
      <div class="text-h6 q-mt-md">加载中...</div>
    </div>
  </q-page>
</template>

<script>
import { keycapsStore } from 'src/store/keycaps'

export default {
  name: 'KeycapDetail',
  data() {
    return {
      keycap: null,
      recommendedKeyboards: []
    }
  },
  created() {
    // 获取键帽ID
    const keycapId = parseInt(this.$route.params.id)

    // 从store中获取键帽数据
    const keycaps = keycapsStore.getAllKeycaps()
    this.keycap = keycaps.find(k => k.id === keycapId)

    if (this.keycap) {
      // 获取收藏状态
      const favorites = keycapsStore.getFavorites()
      this.keycap.isFavorite = favorites.some(f => f.id === this.keycap.id)

      // 获取购物车状态
      const shopping = keycapsStore.getShopping()
      this.keycap.isShopping = shopping.some(s => s.id === this.keycap.id)

      // 获取推荐键盘
      this.getRecommendedKeyboards()
    } else {
      // 如果找不到键帽，返回列表页
      this.$router.push('/keycaps')
    }
  },
  methods: {
    toggleFavorite() {
      if (this.keycap.isFavorite) {
        keycapsStore.removeFromFavorites(this.keycap.id)
      } else {
        keycapsStore.addToFavorites(this.keycap)
      }
      this.keycap.isFavorite = !this.keycap.isFavorite
    },
    toggleShopping() {
      if (this.keycap.isShopping) {
        keycapsStore.removeFromShopping(this.keycap.id)
      } else {
        keycapsStore.addToShopping(this.keycap)
      }
      this.keycap.isShopping = !this.keycap.isShopping
    },
    useInCustomizer() {
      // 跳转到定制器页面，并传递键帽ID
      this.$router.push({
        path: '/keyboard-customizer',
        query: { keycapId: this.keycap.id }
      })
    },
    useWithKeyboard(keyboard) {
      // 跳转到定制器页面，并传递键盘ID和键帽ID
      this.$router.push({
        path: '/keyboard-customizer',
        query: {
          keyboardId: keyboard.id,
          keycapId: this.keycap.id
        }
      })
    },
    getRecommendedKeyboards() {
      // 获取所有键盘
      const allKeyboards = keycapsStore.getAllKeyboard()

      // 简单推荐算法：随机选择4个键盘
      const shuffled = [...allKeyboards].sort(() => 0.5 - Math.random())
      this.recommendedKeyboards = shuffled.slice(0, 4)
    }
  }
}
</script>

<style scoped>
.keycap-detail-image {
  max-height: 500px;
  object-fit: contain;
}

.color-preview {
  display: flex;
  gap: 16px;
  margin-top: 8px;
}

.color-box {
  width: 100px;
  height: 100px;
  border-radius: 8px;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding-bottom: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.color-label {
  background-color: rgba(255, 255, 255, 0.8);
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.color-categories {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
}

.keyboard-card {
  transition: transform 0.2s;
}

.keyboard-card:hover {
  transform: translateY(-5px);
}
</style>
