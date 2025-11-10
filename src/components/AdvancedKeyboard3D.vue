<template>
  <div class="advanced-keyboard-3d-container" ref="container">
    <div v-if="loading" class="loading-indicator">
      <q-spinner-dots size="50px" color="primary" />
      <div class="q-mt-md">加载3D键盘中...</div>
    </div>
    <div v-if="error" class="error-message">
      <q-icon name="error" size="50px" color="negative" />
      <div class="q-mt-md">{{ error }}</div>
    </div>
    
    <!-- Controls Panel -->
    <div class="controls-panel" v-if="!loading && !error">
      <q-card flat bordered class="control-card">
        <q-card-section class="q-pa-sm">
          <div class="row q-col-gutter-sm">
            <div class="col-12 col-sm-6">
              <q-select
                v-model="selectedLayout"
                :options="availableLayouts"
                label="键盘布局"
                dense
                outlined
                @update:model-value="updateLayout"
              />
            </div>
            <div class="col-12 col-sm-6">
              <q-select
                v-model="selectedColorway"
                :options="availableColorways"
                label="配色方案"
                dense
                outlined
                @update:model-value="updateColorway"
              />
            </div>
          </div>
          
          <div class="row q-col-gutter-sm q-mt-sm">
            <div class="col-12 col-sm-4">
              <q-btn-toggle
                v-model="viewMode"
                :options="[
                  { label: '正视图', value: 'front' },
                  { label: '侧视图', value: 'side' },
                  { label: '俯视图', value: 'top' }
                ]"
                spread
                no-caps
                dense
                @update:model-value="updateViewMode"
              />
            </div>
            <div class="col-12 col-sm-4">
              <q-btn
                icon="refresh"
                label="重置视角"
                flat
                dense
                @click="resetCamera"
              />
            </div>
            <div class="col-12 col-sm-4">
              <q-btn
                icon="fullscreen"
                label="全屏"
                flat
                dense
                @click="toggleFullscreen"
              />
            </div>
          </div>
        </q-card-section>
      </q-card>
    </div>
  </div>
</template>

<script>
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { markRaw } from 'vue';

export default {
  name: 'AdvancedKeyboard3D',
  props: {
    keyboardData: {
      type: Object,
      default: () => ({
        layout: '60%',
        colorway: 'default',
        switches: 'cherry-mx-red',
        keycaps: 'default'
      })
    },
    width: {
      type: Number,
      default: 800
    },
    height: {
      type: Number,
      default: 600
    }
  },
  data() {
    return {
      scene: null,
      camera: null,
      renderer: null,
      controls: null,
      keyboardGroup: null,
      keys: [],
      isInitialized: false,
      loading: true,
      error: null,
      animationFrameId: null,
      
      // Layout and colorway options
      selectedLayout: '60%',
      selectedColorway: 'default',
      viewMode: 'front',
      
      // Available options
      availableLayouts: [
        { label: '40%', value: '40%' },
        { label: '60%', value: '60%' },
        { label: '65%', value: '65%' },
        { label: '75%', value: '75%' },
        { label: 'TKL', value: 'tkl' },
        { label: '全尺寸', value: 'full' }
      ],
      
      availableColorways: [
        { label: '默认', value: 'default' },
        { label: '黑色', value: 'black' },
        { label: '白色', value: 'white' },
        { label: '灰色', value: 'gray' },
        { label: '蓝色', value: 'blue' },
        { label: '红色', value: 'red' },
        { label: '绿色', value: 'green' }
      ],
      
      // Keyboard layout definitions
      layouts: {
        '40%': {
          rows: 4,
          keys: [
            ['`', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '='],
            ['Tab', 'Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', '[', ']', '\\'],
            ['Caps', 'A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', ';', "'"],
            ['Shift', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', ',', '.', '/', 'Shift']
          ]
        },
        '60%': {
          rows: 4,
          keys: [
            ['`', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '=', 'Backspace'],
            ['Tab', 'Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', '[', ']', '\\'],
            ['Caps', 'A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', ';', "'", 'Enter'],
            ['Shift', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', ',', '.', '/', 'Shift']
          ]
        },
        '65%': {
          rows: 5,
          keys: [
            ['`', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '=', 'Backspace'],
            ['Tab', 'Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', '[', ']', '\\'],
            ['Caps', 'A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', ';', "'", 'Enter'],
            ['Shift', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', ',', '.', '/', 'Shift'],
            ['Ctrl', 'Win', 'Alt', '', '', '', '', 'Alt', 'Win', 'Menu', 'Ctrl']
          ]
        }
      },
      
      // Color schemes
      colorways: {
        default: {
          case: 0x2c2c2c,
          keys: 0x4a4a4a,
          legends: 0xffffff,
          accent: 0x007acc
        },
        black: {
          case: 0x000000,
          keys: 0x1a1a1a,
          legends: 0xffffff,
          accent: 0x333333
        },
        white: {
          case: 0xf5f5f5,
          keys: 0xffffff,
          legends: 0x000000,
          accent: 0xe0e0e0
        },
        gray: {
          case: 0x808080,
          keys: 0xa0a0a0,
          legends: 0xffffff,
          accent: 0x606060
        },
        blue: {
          case: 0x1e3a8a,
          keys: 0x3b82f6,
          legends: 0xffffff,
          accent: 0x1d4ed8
        },
        red: {
          case: 0x991b1b,
          keys: 0xdc2626,
          legends: 0xffffff,
          accent: 0xb91c1c
        },
        green: {
          case: 0x166534,
          keys: 0x16a34a,
          legends: 0xffffff,
          accent: 0x15803d
        }
      }
    }
  },
  mounted() {
    this.$nextTick(() => {
      try {
        console.log('Initializing Advanced Three.js keyboard scene');
        this.initThree();
        this.createKeyboard();
        this.animate();
        
        window.addEventListener('resize', this.onWindowResize);
        this.loading = false;
      } catch (err) {
        console.error('Error initializing Advanced Three.js:', err);
        this.error = '初始化3D键盘渲染器时出错: ' + err.message;
        this.loading = false;
      }
    });
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.onWindowResize);
    
    if (this.renderer) {
      this.renderer.dispose();
    }
    
    if (this.controls) {
      this.controls.dispose();
    }
    
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
  },
  methods: {
    initThree() {
      const container = this.$refs.container;
      
      if (!container) {
        throw new Error('Container element not found');
      }
      
      // Create scene
      this.scene = markRaw(new THREE.Scene());
      this.scene.background = new THREE.Color(0xf8f9fa);
      
      // Create camera
      this.camera = markRaw(new THREE.PerspectiveCamera(
        45,
        this.width / this.height,
        0.1,
        1000
      ));
      this.camera.position.set(0, 2, 8);
      
      // Create renderer
      this.renderer = markRaw(new THREE.WebGLRenderer({
        antialias: true,
        alpha: true
      }));
      this.renderer.setSize(this.width, this.height);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      this.renderer.shadowMap.enabled = true;
      this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      container.appendChild(this.renderer.domElement);
      
      // Add controls
      this.controls = markRaw(new OrbitControls(this.camera, this.renderer.domElement));
      this.controls.enableDamping = true;
      this.controls.dampingFactor = 0.05;
      this.controls.rotateSpeed = 0.5;
      this.controls.zoomSpeed = 0.8;
      this.controls.panSpeed = 0.5;
      this.controls.enablePan = true;
      
      // Add lighting
      this.setupLighting();
      
      this.isInitialized = true;
    },
    
    setupLighting() {
      // Ambient light
      const ambientLight = markRaw(new THREE.AmbientLight(0xffffff, 0.4));
      this.scene.add(ambientLight);
      
      // Main directional light
      const directionalLight = markRaw(new THREE.DirectionalLight(0xffffff, 0.8));
      directionalLight.position.set(5, 10, 5);
      directionalLight.castShadow = true;
      directionalLight.shadow.mapSize.width = 2048;
      directionalLight.shadow.mapSize.height = 2048;
      directionalLight.shadow.camera.near = 0.5;
      directionalLight.shadow.camera.far = 50;
      directionalLight.shadow.camera.left = -10;
      directionalLight.shadow.camera.right = 10;
      directionalLight.shadow.camera.top = 10;
      directionalLight.shadow.camera.bottom = -10;
      this.scene.add(directionalLight);
      
      // Fill light
      const fillLight = markRaw(new THREE.DirectionalLight(0xffffff, 0.3));
      fillLight.position.set(-5, 5, -5);
      this.scene.add(fillLight);
      
      // Rim light
      const rimLight = markRaw(new THREE.DirectionalLight(0xffffff, 0.2));
      rimLight.position.set(0, -5, 5);
      this.scene.add(rimLight);
    },
    
    createKeyboard() {
      // Create keyboard group
      this.keyboardGroup = markRaw(new THREE.Group());
      this.keyboardGroup.name = 'keyboard';
      
      // Create case
      this.createCase();
      
      // Create keys
      this.createKeys();
      
      this.scene.add(this.keyboardGroup);
    },
    
    createCase() {
      const layout = this.layouts[this.selectedLayout];
      if (!layout) return;
      
      const colorway = this.colorways[this.selectedColorway];
      
      // Calculate case dimensions based on layout
      const keySize = 1.9; // Standard key size
      const keySpacing = 0.1; // Space between keys
      const totalWidth = layout.keys[0].length * (keySize + keySpacing) - keySpacing;
      const totalHeight = layout.rows * (keySize + keySpacing) - keySpacing;
      
      // Create case geometry
      const caseGeometry = markRaw(new THREE.BoxGeometry(
        totalWidth + 0.5, // Add padding
        totalHeight + 0.5,
        0.3 // Case thickness
      ));
      
      const caseMaterial = markRaw(new THREE.MeshLambertMaterial({
        color: colorway.case,
        transparent: true,
        opacity: 0.9
      }));
      
      const caseMesh = markRaw(new THREE.Mesh(caseGeometry, caseMaterial));
      caseMesh.castShadow = true;
      caseMesh.receiveShadow = true;
      caseMesh.position.y = -0.15; // Position below keys
      
      this.keyboardGroup.add(caseMesh);
    },
    
    createKeys() {
      const layout = this.layouts[this.selectedLayout];
      if (!layout) return;
      
      const colorway = this.colorways[this.selectedColorway];
      this.keys = [];
      
      const keySize = 1.9;
      const keySpacing = 0.1;
      const startX = -(layout.keys[0].length * (keySize + keySpacing) - keySpacing) / 2;
      const startY = (layout.rows * (keySize + keySpacing) - keySpacing) / 2;
      
      layout.keys.forEach((row, rowIndex) => {
        row.forEach((key, keyIndex) => {
          if (key) { // Skip empty keys
            const keyMesh = this.createKey(key, colorway, keySize);
            keyMesh.position.set(
              startX + keyIndex * (keySize + keySpacing) + keySize / 2,
              startY - rowIndex * (keySize + keySpacing) - keySize / 2,
              0.2
            );
            
            this.keyboardGroup.add(keyMesh);
            this.keys.push(keyMesh);
          }
        });
      });
    },
    
    createKey(keyLabel, colorway, size) {
      // Create keycap geometry
      const keyGeometry = markRaw(new THREE.BoxGeometry(size, size, 0.15));
      
      // Create keycap material
      const keyMaterial = markRaw(new THREE.MeshLambertMaterial({
        color: colorway.keys,
        transparent: true,
        opacity: 0.95
      }));
      
      const keyMesh = markRaw(new THREE.Mesh(keyGeometry, keyMaterial));
      keyMesh.castShadow = true;
      keyMesh.receiveShadow = true;
      
      // Add key label
      if (keyLabel && keyLabel !== '') {
        const labelSprite = this.createKeyLabel(keyLabel, colorway.legends);
        labelSprite.position.z = 0.08;
        keyMesh.add(labelSprite);
      }
      
      // Add key interaction
      keyMesh.userData = { label: keyLabel, originalY: keyMesh.position.y };
      
      return keyMesh;
    },
    
    createKeyLabel(text, color) {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      
      // Set canvas size
      canvas.width = 64;
      canvas.height = 64;
      
      // Set font
      context.font = 'bold 16px Arial';
      context.fillStyle = `#${color.toString(16).padStart(6, '0')}`;
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      
      // Draw text
      context.fillText(text, 32, 32);
      
      // Create texture
      const texture = markRaw(new THREE.CanvasTexture(canvas));
      texture.needsUpdate = true;
      
      // Create sprite material
      const spriteMaterial = markRaw(new THREE.SpriteMaterial({ map: texture }));
      const sprite = markRaw(new THREE.Sprite(spriteMaterial));
      
      // Scale sprite
      sprite.scale.set(0.8, 0.8, 1);
      
      return sprite;
    },
    
    updateLayout() {
      this.recreateKeyboard();
    },
    
    updateColorway() {
      this.recreateKeyboard();
    },
    
    updateViewMode() {
      switch (this.viewMode) {
        case 'front':
          this.camera.position.set(0, 0, 8);
          break;
        case 'side':
          this.camera.position.set(8, 0, 0);
          break;
        case 'top':
          this.camera.position.set(0, 8, 0);
          break;
      }
      this.camera.lookAt(0, 0, 0);
      this.controls.update();
    },
    
    resetCamera() {
      this.camera.position.set(0, 2, 8);
      this.camera.lookAt(0, 0, 0);
      this.controls.reset();
    },
    
    toggleFullscreen() {
      const container = this.$refs.container;
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        container.requestFullscreen();
      }
    },
    
    recreateKeyboard() {
      if (this.keyboardGroup) {
        this.scene.remove(this.keyboardGroup);
      }
      
      this.createKeyboard();
    },
    
    animate() {
      this.animationFrameId = requestAnimationFrame(this.animate);
      
      if (this.controls) {
        this.controls.update();
      }
      
      if (this.renderer && this.scene && this.camera) {
        this.renderer.render(this.scene, this.camera);
      }
    },
    
    onWindowResize() {
      if (this.camera && this.renderer) {
        this.camera.aspect = this.width / this.height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(this.width, this.height);
      }
    }
  }
}
</script>

<style scoped>
.advanced-keyboard-3d-container {
  width: 100%;
  height: 100%;
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
}

.loading-indicator {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: rgba(248, 249, 250, 0.9);
  z-index: 10;
}

.error-message {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: rgba(255, 255, 255, 0.9);
  z-index: 10;
}

.controls-panel {
  position: absolute;
  top: 10px;
  left: 10px;
  z-index: 5;
  max-width: 300px;
}

.control-card {
  background-color: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(0, 0, 0, 0.1);
}
</style> 