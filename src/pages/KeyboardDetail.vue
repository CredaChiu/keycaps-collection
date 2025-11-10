<template>
  <q-page class="q-pa-md">
    <div v-if="keyboard">
      <div class="row q-col-gutter-md">
        <!-- 左侧：键盘图片 -->
        <div class="col-12 col-md-6">
          <q-card>
            <q-img
              :src="keyboard.image"
              :ratio="1"
              class="keyboard-detail-image"
            />
          </q-card>
        </div>
        
        <!-- 右侧：键盘详情 -->
        <div class="col-12 col-md-6">
          <q-card class="q-pa-md">
            <div class="text-h4">{{ keyboard.name }}</div>
            <q-separator class="q-my-md" />
            
            <div class="row q-col-gutter-md">
              <div class="col-12 col-sm-6">
                <div class="text-subtitle1">制造商</div>
                <div class="text-h6">{{ keyboard.manufacturer }}</div>
              </div>
              
              <div class="col-12 col-sm-6">
                <div class="text-subtitle1">布局</div>
                <div class="text-h6">{{ keyboard.layout }}</div>
              </div>
              
              <div class="col-12 col-sm-6">
                <div class="text-subtitle1">设计</div>
                <div class="text-h6">{{ keyboard.design }}</div>
              </div>
              
              <div class="col-12 col-sm-6">
                <div class="text-subtitle1">PCB</div>
                <div class="text-h6">{{ keyboard.pcb }}</div>
              </div>
              
              <div class="col-12">
                <div class="text-subtitle1">价格</div>
                <div class="text-h6">{{ keyboard.price }}</div>
              </div>
            </div>
            
            <q-separator class="q-my-md" />
            
            <div class="row q-col-gutter-md">
              <div class="col-12">
                <q-btn 
                  color="primary" 
                  icon="favorite" 
                  :label="keyboard.isFavorite ? '取消收藏' : '收藏'" 
                  @click="toggleFavorite"
                  class="full-width q-mb-md"
                />
                
                <q-btn 
                  color="secondary" 
                  icon="shopping_cart" 
                  :label="keyboard.isShopping ? '取消购物车' : '加入购物车'" 
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
      
      <!-- 推荐搭配的键帽 -->
      <div class="q-mt-lg">
        <div class="text-h5 q-mb-md">推荐搭配的键帽</div>
        <div class="row q-col-gutter-md">
          <div 
            v-for="keycap in recommendedKeycaps" 
            :key="keycap.id"
            class="col-6 col-sm-4 col-md-3"
          >
            <q-card class="keycap-card">
              <q-img
                :src="keycap.image"
                :ratio="1"
              />
              <q-card-section>
                <div class="text-subtitle1">{{ keycap.name }}</div>
                <div class="text-caption">{{ keycap.manufacturer }}</div>
              </q-card-section>
              <q-card-actions align="right">
                <q-btn 
                  flat 
                  round 
                  icon="info" 
                  :to="'/keycap-detail/' + keycap.id"
                />
                <q-btn 
                  flat 
                  round 
                  icon="style" 
                  @click="useWithKeycap(keycap)"
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
  name: 'KeyboardDetail',
  data() {
    return {
      keyboard: null,
      recommendedKeycaps: []
    }
  },
  created() {
    // 获取键盘ID
    const keyboardId = parseInt(this.$route.params.id)
    
    // 从store中获取键盘数据
    const keyboards = keycapsStore.getAllKeyboard()
    this.keyboard = keyboards.find(k => k.id === keyboardId)
    
    if (this.keyboard) {
      // 获取收藏状态
      const favorites = keycapsStore.getFavorites()
      this.keyboard.isFavorite = favorites.some(f => f.id === this.keyboard.id)
      
      // 获取购物车状态
      const shopping = keycapsStore.getShopping()
      this.keyboard.isShopping = shopping.some(s => s.id === this.keyboard.id)
      
      // 获取推荐键帽
      this.getRecommendedKeycaps()
    } else {
      // 如果找不到键盘，返回列表页
      this.$router.push('/keyboard')
    }
  },
  methods: {
    toggleFavorite() {
      if (this.keyboard.isFavorite) {
        keycapsStore.removeFromFavorites(this.keyboard.id)
      } else {
        keycapsStore.addToFavorites(this.keyboard)
      }
      this.keyboard.isFavorite = !this.keyboard.isFavorite
    },
    toggleShopping() {
      if (this.keyboard.isShopping) {
        keycapsStore.removeFromShopping(this.keyboard.id)
      } else {
        keycapsStore.addToShopping(this.keyboard)
      }
      this.keyboard.isShopping = !this.keyboard.isShopping
    },
    useInCustomizer() {
      // 跳转到定制器页面，并传递键盘ID
      this.$router.push({
        path: '/keyboard-customizer',
        query: { keyboardId: this.keyboard.id }
      })
    },
    useWithKeycap(keycap) {
      // 跳转到定制器页面，并传递键盘ID和键帽ID
      this.$router.push({
        path: '/keyboard-customizer',
        query: { 
          keyboardId: this.keyboard.id,
          keycapId: keycap.id
        }
      })
    },
    getRecommendedKeycaps() {
      // 获取所有键帽
      const allKeycaps = keycapsStore.getAllKeycaps()
      
      // 简单推荐算法：随机选择4个键帽
      const shuffled = [...allKeycaps].sort(() => 0.5 - Math.random())
      this.recommendedKeycaps = shuffled.slice(0, 4)
    }
  }
}
</script>

<style scoped>
.keyboard-detail-image {
  max-height: 500px;
  object-fit: contain;
}

.keycap-card {
  transition: transform 0.2s;
}

.keycap-card:hover {
  transform: translateY(-5px);
}
</style>
