<template>
  <div class="simple-keyboard-3d-container" ref="container">
    <div v-if="loading" class="loading-indicator">
      <q-spinner-dots size="50px" color="primary" />
      <div class="q-mt-md">加载3D键盘中...</div>
    </div>
    <div v-if="error" class="error-message">
      <q-icon name="error" size="50px" color="negative" />
      <div class="q-mt-md">{{ error }}</div>
    </div>
  </div>
</template>

<script>
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { markRaw } from 'vue';

export default {
  name: 'SimpleKeyboard3D',
  props: {
    layout: {
      type: String,
      default: '60%'
    },
    colorway: {
      type: String,
      default: 'default'
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
      loading: true,
      error: null,
      animationFrameId: null,
      
      // Color schemes
      colorways: {
        default: {
          case: 0x2c2c2c,
          keys: 0x4a4a4a,
          legends: 0xffffff
        },
        black: {
          case: 0x000000,
          keys: 0x1a1a1a,
          legends: 0xffffff
        },
        white: {
          case: 0xf5f5f5,
          keys: 0xffffff,
          legends: 0x000000
        }
      }
    }
  },
  mounted() {
    this.$nextTick(() => {
      try {
        this.initThree();
        this.createKeyboard();
        this.animate();
        
        window.addEventListener('resize', this.onWindowResize);
        this.loading = false;
      } catch (err) {
        console.error('Error initializing Three.js:', err);
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
      this.scene.add(directionalLight);
      
      // Fill light
      const fillLight = markRaw(new THREE.DirectionalLight(0xffffff, 0.3));
      fillLight.position.set(-5, 5, -5);
      this.scene.add(fillLight);
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
      const colorway = this.colorways[this.colorway] || this.colorways.default;
      
      // Create case geometry (60% keyboard size)
      const caseGeometry = markRaw(new THREE.BoxGeometry(20, 8, 0.5));
      
      const caseMaterial = markRaw(new THREE.MeshLambertMaterial({
        color: colorway.case,
        transparent: true,
        opacity: 0.9
      }));
      
      const caseMesh = markRaw(new THREE.Mesh(caseGeometry, caseMaterial));
      caseMesh.castShadow = true;
      caseMesh.receiveShadow = true;
      caseMesh.position.y = -0.25;
      
      this.keyboardGroup.add(caseMesh);
    },
    
    createKeys() {
      const colorway = this.colorways[this.colorway] || this.colorways.default;
      
      // Simple 60% layout keys
      const keySize = 1.8;
      const keySpacing = 0.2;
      const startX = -8;
      const startY = 3;
      
      // First row
      for (let i = 0; i < 14; i++) {
        const keyMesh = this.createKey('Key', colorway, keySize);
        keyMesh.position.set(
          startX + i * (keySize + keySpacing),
          startY,
          0.1
        );
        this.keyboardGroup.add(keyMesh);
      }
      
      // Second row
      for (let i = 0; i < 14; i++) {
        const keyMesh = this.createKey('Key', colorway, keySize);
        keyMesh.position.set(
          startX + i * (keySize + keySpacing) + (keySize + keySpacing) * 0.5,
          startY - (keySize + keySpacing),
          0.1
        );
        this.keyboardGroup.add(keyMesh);
      }
      
      // Third row
      for (let i = 0; i < 13; i++) {
        const keyMesh = this.createKey('Key', colorway, keySize);
        keyMesh.position.set(
          startX + i * (keySize + keySpacing) + (keySize + keySpacing) * 0.25,
          startY - (keySize + keySpacing) * 2,
          0.1
        );
        this.keyboardGroup.add(keyMesh);
      }
      
      // Fourth row
      for (let i = 0; i < 12; i++) {
        const keyMesh = this.createKey('Key', colorway, keySize);
        keyMesh.position.set(
          startX + i * (keySize + keySpacing) + (keySize + keySpacing) * 0.75,
          startY - (keySize + keySpacing) * 3,
          0.1
        );
        this.keyboardGroup.add(keyMesh);
      }
    },
    
    createKey(keyLabel, colorway, size) {
      // Create keycap geometry
      const keyGeometry = markRaw(new THREE.BoxGeometry(size, size, 0.2));
      
      // Create keycap material
      const keyMaterial = markRaw(new THREE.MeshLambertMaterial({
        color: colorway.keys,
        transparent: true,
        opacity: 0.95
      }));
      
      const keyMesh = markRaw(new THREE.Mesh(keyGeometry, keyMaterial));
      keyMesh.castShadow = true;
      keyMesh.receiveShadow = true;
      
      return keyMesh;
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
.simple-keyboard-3d-container {
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
</style> 