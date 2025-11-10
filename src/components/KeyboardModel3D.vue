<template>
  <div class="keyboard-3d-container" ref="container">
    <div v-if="loading" class="loading-indicator">
      <div>加载中...</div>
    </div>
    <div v-if="error" class="error-message">
      {{ error }}
    </div>
  </div>
</template>

<script>
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { markRaw } from 'vue';

export default {
  name: 'KeyboardModel3D',
  props: {
    imageSrc: {
      type: String,
      required: true
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
      keyboard: null,
      isInitialized: false,
      loading: true,
      error: null
    }
  },
  watch: {
    imageSrc: {
      handler(newSrc) {
        if (newSrc && this.isInitialized) {
          console.log('Image source changed, loading new texture:', newSrc);
          this.loadKeyboardTexture(newSrc);
        }
      }
    }
  },
  mounted() {
    // Use nextTick to ensure the DOM is fully rendered
    this.$nextTick(() => {
      try {
        console.log('Initializing Three.js scene');
        // 使用markRaw防止Vue对Three.js对象进行响应式处理
        this.initThree();

        // Create a simple model first, then try to load texture
        this.createSimpleModel();

        // If we have an image source, try to load it as texture
        if (this.imageSrc) {
          this.loadKeyboardTexture(this.imageSrc);
        }

        this.animate();

        // Handle window resize
        window.addEventListener('resize', this.onWindowResize);

        this.loading = false;
      } catch (err) {
        console.error('Error initializing Three.js:', err);
        this.error = '初始化3D渲染器时出错: ' + err.message;
        this.loading = false;
      }
    });
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.onWindowResize);

    // Clean up Three.js resources
    if (this.renderer) {
      this.renderer.dispose();
    }

    if (this.controls) {
      this.controls.dispose();
    }

    // Cancel animation frame
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

      console.log('Container dimensions:', container.clientWidth, 'x', container.clientHeight);

      // Create scene - use markRaw to prevent Vue from making it reactive
      this.scene = markRaw(new THREE.Scene());
      this.scene.background = new THREE.Color(0xf8f8f8); // Lighter background

      // Create camera - use markRaw to prevent Vue from making it reactive
      this.camera = markRaw(new THREE.PerspectiveCamera(
        40, // Narrower field of view for less distortion
        this.width / this.height,
        0.1,
        1000
      ));
      this.camera.position.set(0, 0, 4); // Position directly in front

      // Create renderer - use markRaw to prevent Vue from making it reactive
      this.renderer = markRaw(new THREE.WebGLRenderer({
        antialias: true,
        preserveDrawingBuffer: true, // Allows for screenshot capture
        alpha: true
      }));
      this.renderer.setSize(this.width, this.height);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      this.renderer.shadowMap.enabled = true;
      this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      container.appendChild(this.renderer.domElement);

      // Add orbit controls - use markRaw to prevent Vue from making it reactive
      this.controls = markRaw(new OrbitControls(this.camera, this.renderer.domElement));
      this.controls.enableDamping = true;
      this.controls.dampingFactor = 0.1;
      this.controls.rotateSpeed = 0.5;
      this.controls.enableZoom = true;
      this.controls.zoomSpeed = 0.5;
      this.controls.enablePan = true;
      this.controls.panSpeed = 0.5;

      // Limit rotation to keep the model mostly facing the camera
      this.controls.minPolarAngle = Math.PI / 4; // 45 degrees
      this.controls.maxPolarAngle = Math.PI / 4 * 3; // 135 degrees

      // Add realistic lighting for 3D keyboard
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

      this.isInitialized = true;
    },

    createSimpleModel() {
      // Create a 3D keyboard model with realistic geometry
      
      // Create keyboard case
      const caseGeometry = markRaw(new THREE.BoxGeometry(12, 4, 0.3));
      const caseMaterial = markRaw(new THREE.MeshLambertMaterial({
        color: 0x2c2c2c,
        transparent: true,
        opacity: 0.9
      }));
      
      const caseMesh = markRaw(new THREE.Mesh(caseGeometry, caseMaterial));
      caseMesh.castShadow = true;
      caseMesh.receiveShadow = true;
      caseMesh.position.y = -0.15;
      
      // Create keyboard group
      this.keyboard = markRaw(new THREE.Group());
      this.keyboard.name = 'keyboard';
      this.keyboard.add(caseMesh);
      
      // Create keys in a 60% layout pattern
      const keySize = 1.8;
      const keySpacing = 0.2;
      const startX = -5.5;
      const startY = 1.5;
      
      // Create key rows
      const rows = [
        { count: 14, offset: 0 },
        { count: 14, offset: 0.5 },
        { count: 13, offset: 0.25 },
        { count: 12, offset: 0.75 }
      ];
      
      rows.forEach((row, rowIndex) => {
        for (let i = 0; i < row.count; i++) {
          const keyMesh = this.createKey(keySize);
          keyMesh.position.set(
            startX + i * (keySize + keySpacing) + (keySize + keySpacing) * row.offset,
            startY - rowIndex * (keySize + keySpacing),
            0.2
          );
          this.keyboard.add(keyMesh);
        }
      });
      
      // Add to scene
      this.scene.add(this.keyboard);
      
      // Position camera for better view
      this.camera.position.set(0, 2, 8);
      this.camera.lookAt(0, 0, 0);
      this.controls.update();
    },
    
    createKey(size) {
      // Create keycap geometry
      const keyGeometry = markRaw(new THREE.BoxGeometry(size, size, 0.15));
      const keyMaterial = markRaw(new THREE.MeshLambertMaterial({
        color: 0x4a4a4a,
        transparent: true,
        opacity: 0.95
      }));
      
      const keyMesh = markRaw(new THREE.Mesh(keyGeometry, keyMaterial));
      keyMesh.castShadow = true;
      keyMesh.receiveShadow = true;
      
      return keyMesh;
    },

    // Helper method to create a text sprite
    createTextSprite(text, parameters) {
      if (parameters === undefined) parameters = {};

      const fontface = parameters.fontface || 'Arial';
      const fontsize = parameters.fontsize || 18;
      const borderThickness = parameters.borderThickness || 4;
      const borderColor = parameters.borderColor || { r:0, g:0, b:0, a:1.0 };
      const backgroundColor = parameters.backgroundColor || { r:255, g:255, b:255, a:1.0 };
      const textColor = parameters.textColor || { r:0, g:0, b:0, a:1.0 };

      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      context.font = 'Bold ' + fontsize + 'px ' + fontface;

      // Get text metrics
      const metrics = context.measureText(text);
      const textWidth = metrics.width;

      // Set canvas dimensions
      canvas.width = textWidth + borderThickness * 2;
      canvas.height = fontsize * 1.4 + borderThickness * 2;

      // Reset font after resize
      context.font = 'Bold ' + fontsize + 'px ' + fontface;

      // Background
      context.fillStyle = 'rgba(' + backgroundColor.r + ',' + backgroundColor.g + ',' + backgroundColor.b + ',' + backgroundColor.a + ')';
      context.strokeStyle = 'rgba(' + borderColor.r + ',' + borderColor.g + ',' + borderColor.b + ',' + borderColor.a + ')';
      context.lineWidth = borderThickness;
      this.roundRect(context, borderThickness/2, borderThickness/2, canvas.width - borderThickness, canvas.height - borderThickness, 6);

      // Text
      context.fillStyle = 'rgba(' + textColor.r + ',' + textColor.g + ',' + textColor.b + ',' + textColor.a + ')';
      context.fillText(text, borderThickness, fontsize + borderThickness);

      // Create texture
      const texture = markRaw(new THREE.CanvasTexture(canvas));
      texture.needsUpdate = true;

      // Create sprite material
      const spriteMaterial = markRaw(new THREE.SpriteMaterial({ map: texture }));
      const sprite = markRaw(new THREE.Sprite(spriteMaterial));

      // Scale sprite
      sprite.scale.set(canvas.width / 100, canvas.height / 100, 1);

      return sprite;
    },

    // Helper method to draw rounded rectangles
    roundRect(ctx, x, y, width, height, radius) {
      ctx.beginPath();
      ctx.moveTo(x + radius, y);
      ctx.lineTo(x + width - radius, y);
      ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
      ctx.lineTo(x + width, y + height - radius);
      ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
      ctx.lineTo(x + radius, y + height);
      ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
      ctx.lineTo(x, y + radius);
      ctx.quadraticCurveTo(x, y, x + radius, y);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    },

    loadKeyboardTexture(src) {
      // Process the image path
      let imagePath = src;

      // Try different path formats to ensure we find the correct one
      let pathsToTry = [];

      // Original path
      pathsToTry.push(imagePath);

      // If path starts with 'public/', try removing it
      if (imagePath.startsWith('public/')) {
        pathsToTry.push('/' + imagePath.substring(7));
      } else {
        // If it doesn't start with public/, try adding it
        pathsToTry.push('/images/' + imagePath.split('/').pop());
      }

      // Also try with and without leading slash
      if (imagePath.startsWith('/')) {
        pathsToTry.push(imagePath.substring(1));
      } else {
        pathsToTry.push('/' + imagePath);
      }

      console.log('Will try loading texture from these paths:', pathsToTry);

      // Function to try loading from the next path
      const tryNextPath = (index) => {
        if (index >= pathsToTry.length) {
          console.error('Failed to load texture from all paths');
          return;
        }

        const currentPath = pathsToTry[index];
        console.log(`Trying to load texture from path ${index + 1}/${pathsToTry.length}: ${currentPath}`);

        // Create a texture loader
        const textureLoader = markRaw(new THREE.TextureLoader());

        // Load the keyboard image as a texture
        textureLoader.load(
          currentPath,
          (texture) => {
            // Successfully loaded texture
            console.log('Texture loaded successfully from:', currentPath);
            console.log('Texture image dimensions:', texture.image.width, 'x', texture.image.height);

            // Mark the texture as non-reactive
            texture = markRaw(texture);

            // Make sure texture is properly set up
            texture.needsUpdate = true;
            // Use the correct encoding for the texture
            texture.colorSpace = THREE.SRGBColorSpace;

            // Remove existing keyboard model if it exists
            if (this.keyboard) {
              this.scene.remove(this.keyboard);
            }

            // Calculate dimensions based on the texture's aspect ratio
            const aspectRatio = texture.image.width / texture.image.height;

            // Set a fixed height and calculate width based on aspect ratio
            const planeHeight = 2.5;
            const planeWidth = planeHeight * aspectRatio;

            console.log('Creating keyboard plane with dimensions:', planeWidth, 'x', planeHeight);

            // Create a simple plane with the texture
            const planeGeometry = markRaw(new THREE.PlaneGeometry(planeWidth, planeHeight));
            const planeMaterial = markRaw(new THREE.MeshBasicMaterial({
              map: texture,
              side: THREE.DoubleSide
            }));

            // Create the keyboard mesh
            this.keyboard = markRaw(new THREE.Mesh(planeGeometry, planeMaterial));

            // Position the plane in the center of the view
            // No rotation needed - it will face the camera directly

            // Remove any existing keyboard model
            if (this.scene.getObjectByName('keyboard')) {
              this.scene.remove(this.scene.getObjectByName('keyboard'));
            }

            // Name the object for easier reference
            this.keyboard.name = 'keyboard';

            // Add to scene
            this.scene.add(this.keyboard);

            // Reset camera position to look directly at the plane
            this.camera.position.set(0, 0, 4);
            this.camera.lookAt(0, 0, 0);
            this.controls.update();
          },
          // Progress callback
          (xhr) => {
            const percent = (xhr.loaded / xhr.total * 100).toFixed(0);
            console.log(`Texture loading: ${percent}% loaded`);
          },
          // Error callback
          (error) => {
            console.error(`Error loading texture from ${currentPath}:`, error);
            // Try the next path
            tryNextPath(index + 1);
          }
        );
      };

      // Start trying paths
      tryNextPath(0);
    },

    animate() {
      // Store the animation frame ID so we can cancel it later
      this.animationFrameId = requestAnimationFrame(this.animate);

      // No rotation animation as requested

      if (this.controls) {
        this.controls.update();
      }

      if (this.renderer && this.scene && this.camera) {
        this.renderer.render(this.scene, this.camera);
      }
    },

    onWindowResize() {
      if (this.camera && this.renderer) {
        // Update camera aspect ratio
        this.camera.aspect = this.width / this.height;
        this.camera.updateProjectionMatrix();

        // Update renderer size
        this.renderer.setSize(this.width, this.height);
      }
    }
  }
}
</script>

<style scoped>
.keyboard-3d-container {
  width: 100%;
  height: 100%;
  overflow: hidden;
  border-radius: 8px;
  background-color: #f0f0f0;
  position: relative;
}

.loading-indicator {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(240, 240, 240, 0.7);
  z-index: 10;
}

.error-message {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(255, 0, 0, 0.1);
  color: #ff0000;
  padding: 20px;
  text-align: center;
  z-index: 10;
}
</style>
