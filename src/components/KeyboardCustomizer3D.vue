<template>
  <div class="keyboard-customizer-3d-container" ref="container">
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
  name: 'KeyboardCustomizer3D',
  props: {
    keyboardSrc: {
      type: String,
      required: true
    },
    keycapBaseColor: {
      type: String,
      default: '#cccccc'
    },
    keycapCharacterColor: {
      type: String,
      default: '#ffffff'
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
      keycaps: [],
      isInitialized: false,
      loading: true,
      error: null,
      keyboardTexture: null,
      keyboardMesh: null,
      keyboardGeometry: null,
      keyboardMaterial: null,
      animationFrameId: null
    }
  },
  watch: {
    keyboardSrc: {
      handler(newSrc) {
        if (newSrc && this.isInitialized) {
          console.log('Keyboard source changed, updating model');
          this.loadKeyboardTexture(newSrc);
        }
      }
    },
    keycapBaseColor: {
      handler() {
        if (this.isInitialized) {
          console.log('Keycap base color changed, updating model');
          this.updateKeycapColors();
        }
      }
    },
    keycapCharacterColor: {
      handler() {
        if (this.isInitialized) {
          console.log('Keycap character color changed, updating model');
          this.updateKeycapColors();
        }
      }
    }
  },
  mounted() {
    // Use nextTick to ensure the DOM is fully rendered
    this.$nextTick(() => {
      try {
        console.log('Initializing Three.js scene');
        console.log('Props received:', {
          keyboardSrc: this.keyboardSrc,
          keycapBaseColor: this.keycapBaseColor,
          keycapCharacterColor: this.keycapCharacterColor,
          width: this.width,
          height: this.height
        });

        this.initThree();

        // Create a simple model first
        this.createSimpleModel();

        // If we have a keyboard source, load it
        if (this.keyboardSrc) {
          console.log('Loading keyboard texture from:', this.keyboardSrc);
          this.loadKeyboardTexture(this.keyboardSrc);
        } else {
          console.warn('No keyboard source provided');
        }

        // Start animation loop
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
        preserveDrawingBuffer: true // Allows for screenshot capture
      }));
      this.renderer.setSize(this.width, this.height);
      this.renderer.setPixelRatio(window.devicePixelRatio);
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

      // Add lights - use markRaw to prevent Vue from making them reactive
      // For flat display, we don't need complex lighting
      const ambientLight = markRaw(new THREE.AmbientLight(0xffffff, 1.0));
      this.scene.add(ambientLight);

      this.isInitialized = true;
    },

    createSimpleModel() {
      // Create a simple placeholder model that faces the camera directly

      // Use a 16:9 aspect ratio as a placeholder
      const aspectRatio = 16/9;
      const planeHeight = 2.5;
      const planeWidth = planeHeight * aspectRatio;

      // Create a plane with a placeholder color/pattern
      const planeGeometry = markRaw(new THREE.PlaneGeometry(planeWidth, planeHeight));
      const planeMaterial = markRaw(new THREE.MeshBasicMaterial({
        color: 0xeeeeee,  // Very light gray
        wireframe: false
      }));

      // Create the keyboard mesh
      this.keyboard = markRaw(new THREE.Mesh(planeGeometry, planeMaterial));
      this.keyboard.name = 'keyboard';

      // Add a placeholder keyboard image using a grid pattern
      const gridGeometry = markRaw(new THREE.EdgesGeometry(planeGeometry));
      const gridMaterial = markRaw(new THREE.LineBasicMaterial({ color: 0x999999 }));
      const grid = markRaw(new THREE.LineSegments(gridGeometry, gridMaterial));

      // Add the grid to the keyboard
      this.keyboard.add(grid);

      // Add text to indicate it's a placeholder
      const textSprite = this.createTextSprite('键盘图片加载中...', { fontsize: 24 });
      textSprite.position.z = 0.01; // Slightly in front of the plane
      this.keyboard.add(textSprite);

      // Add to scene
      this.scene.add(this.keyboard);

      // Position camera to look directly at the plane
      this.camera.position.set(0, 0, 4);
      this.camera.lookAt(0, 0, 0);
      this.controls.update();

      // Create some sample keycaps
      this.createSampleKeycaps();
    },

    createSampleKeycaps() {
      // Clear existing keycaps
      this.keycaps.forEach(keycap => {
        this.scene.remove(keycap);
      });
      this.keycaps = [];

      // Create a grid of keycaps
      const rows = 6;
      const cols = 15;
      const keycapSize = 0.15;
      const spacing = 0.02;
      const totalWidth = cols * (keycapSize + spacing) - spacing;
      const totalHeight = rows * (keycapSize + spacing) - spacing;
      const startX = -totalWidth / 2;
      const startY = -totalHeight / 2;

      // Create keycap material with the specified colors
      const baseColor = new THREE.Color(this.keycapBaseColor);
      const characterColor = new THREE.Color(this.keycapCharacterColor);

      const keycapMaterial = markRaw(new THREE.MeshStandardMaterial({
        color: baseColor,
        roughness: 0.5,
        metalness: 0.2
      }));

      // Create keycaps
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          // Skip some positions to create a more realistic keyboard layout
          if ((row === 0 && col > 12) ||
              (row === 5 && (col < 3 || col > 11))) {
            continue;
          }

          // Create keycap geometry
          const keycapGeometry = markRaw(new THREE.BoxGeometry(keycapSize, keycapSize * 0.4, keycapSize));
          const keycap = markRaw(new THREE.Mesh(keycapGeometry, keycapMaterial.clone()));

          // Position keycap
          keycap.position.x = startX + col * (keycapSize + spacing);
          keycap.position.y = startY + row * (keycapSize + spacing);
          keycap.position.z = 0.1; // Slightly above the keyboard

          // Add character to keycap
          this.addCharacterToKeycap(keycap, row, col, characterColor);

          // Add to scene and store reference
          this.scene.add(keycap);
          this.keycaps.push(keycap);
        }
      }
    },

    addCharacterToKeycap(keycap, row, col, characterColor) {
      // Create a canvas to draw the character
      const canvas = document.createElement('canvas');
      canvas.width = 64;
      canvas.height = 64;
      const context = canvas.getContext('2d');

      // Fill with transparent background
      context.fillStyle = 'rgba(0,0,0,0)';
      context.fillRect(0, 0, canvas.width, canvas.height);

      // Draw character
      context.fillStyle = `rgb(${characterColor.r * 255},${characterColor.g * 255},${characterColor.b * 255})`;
      context.font = 'bold 32px Arial';
      context.textAlign = 'center';
      context.textBaseline = 'middle';

      // Get character based on position
      let char = this.getCharacterForPosition(row, col);
      context.fillText(char, canvas.width / 2, canvas.height / 2);

      // Create texture from canvas
      const texture = markRaw(new THREE.CanvasTexture(canvas));
      texture.needsUpdate = true;

      // Create a plane with the texture
      const charPlaneGeometry = markRaw(new THREE.PlaneGeometry(0.12, 0.12));
      const charPlaneMaterial = markRaw(new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        side: THREE.DoubleSide
      }));

      const charPlane = markRaw(new THREE.Mesh(charPlaneGeometry, charPlaneMaterial));
      charPlane.position.z = 0.051; // Slightly above the keycap
      charPlane.rotation.x = -Math.PI / 2; // Face up

      // Add to keycap
      keycap.add(charPlane);
    },

    getCharacterForPosition(row, col) {
      // Define a simple QWERTY layout
      const layout = [
        ['ESC', 'F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10', 'F11', 'F12'],
        ['`', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '=', 'BS'],
        ['TAB', 'Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', '[', ']', '\\'],
        ['CAPS', 'A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', ';', '\'', 'ENT'],
        ['SHIFT', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', ',', '.', '/', 'SHIFT'],
        ['CTRL', 'WIN', 'ALT', 'SPACE', 'ALT', 'FN', 'CTRL']
      ];

      // Return character if available, otherwise a placeholder
      return row < layout.length && col < layout[row].length ? layout[row][col] : '';
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

            // Store the texture for later use
            this.keyboardTexture = texture;

            // Calculate dimensions based on the texture's aspect ratio
            const aspectRatio = texture.image.width / texture.image.height;

            // Set a fixed height and calculate width based on aspect ratio
            const planeHeight = 2.5;
            const planeWidth = planeHeight * aspectRatio;

            console.log('Creating keyboard plane with dimensions:', planeWidth, 'x', planeHeight);

            // Remove any existing keyboard model
            if (this.scene.getObjectByName('keyboard')) {
              this.scene.remove(this.scene.getObjectByName('keyboard'));
            }

            // Create a simple plane with the texture
            const planeGeometry = markRaw(new THREE.PlaneGeometry(planeWidth, planeHeight));
            const planeMaterial = markRaw(new THREE.MeshBasicMaterial({
              map: texture,
              side: THREE.DoubleSide
            }));

            // Create the keyboard mesh
            this.keyboard = markRaw(new THREE.Mesh(planeGeometry, planeMaterial));
            this.keyboard.name = 'keyboard';

            // Add to scene
            this.scene.add(this.keyboard);

            // Reset camera position to look directly at the plane
            this.camera.position.set(0, 0, 4);
            this.camera.lookAt(0, 0, 0);
            this.controls.update();

            // Create keycaps with the current colors
            this.createSampleKeycaps();
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

    updateKeycapColors() {
      // Update all keycaps with the new colors
      const baseColor = new THREE.Color(this.keycapBaseColor);

      // Update each keycap's material
      this.keycaps.forEach(keycap => {
        if (keycap.material) {
          keycap.material.color.set(baseColor);
          keycap.material.needsUpdate = true;

          // Update character color
          if (keycap.children.length > 0) {
            const charPlane = keycap.children[0];
            if (charPlane && charPlane.material && charPlane.material.map) {
              // We need to recreate the texture with the new character color
              this.updateKeycapCharacter(keycap);
            }
          }
        }
      });
    },

    updateKeycapCharacter(keycap) {
      // Find the character plane
      const charPlane = keycap.children.find(child => child.type === 'Mesh');
      if (!charPlane || !charPlane.material || !charPlane.material.map) return;

      // Get the position of this keycap to determine its character
      const row = Math.round((keycap.position.y + 0.75) / 0.17);
      const col = Math.round((keycap.position.x + 1.125) / 0.17);

      // Create a new canvas to draw the character
      const canvas = document.createElement('canvas');
      canvas.width = 64;
      canvas.height = 64;
      const context = canvas.getContext('2d');

      // Fill with transparent background
      context.fillStyle = 'rgba(0,0,0,0)';
      context.fillRect(0, 0, canvas.width, canvas.height);

      // Draw character with new color
      const characterColor = new THREE.Color(this.keycapCharacterColor);
      context.fillStyle = `rgb(${characterColor.r * 255},${characterColor.g * 255},${characterColor.b * 255})`;
      context.font = 'bold 32px Arial';
      context.textAlign = 'center';
      context.textBaseline = 'middle';

      // Get character based on position
      let char = this.getCharacterForPosition(row, col);
      context.fillText(char, canvas.width / 2, canvas.height / 2);

      // Update texture
      const texture = markRaw(new THREE.CanvasTexture(canvas));
      texture.needsUpdate = true;

      // Replace the material's map
      charPlane.material.map = texture;
      charPlane.material.needsUpdate = true;
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
    },

    updateModel() {
      console.log('updateModel called with props:', {
        keyboardSrc: this.keyboardSrc,
        keycapBaseColor: this.keycapBaseColor,
        keycapCharacterColor: this.keycapCharacterColor
      });

      // Force update the model with current props
      if (this.keyboardSrc) {
        console.log('Loading keyboard texture in updateModel');
        this.loadKeyboardTexture(this.keyboardSrc);
      } else {
        console.warn('No keyboard source in updateModel');
      }

      console.log('Updating keycap colors');
      this.updateKeycapColors();
    },

    takeScreenshot() {
      if (!this.renderer) return;

      // Render the scene
      this.renderer.render(this.scene, this.camera);

      // Get the canvas data
      const dataURL = this.renderer.domElement.toDataURL('image/png');

      // Create a link element to download the image
      const link = document.createElement('a');
      link.href = dataURL;
      link.download = 'keyboard-customization.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
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
    }
  }
}
</script>

<style scoped>
.keyboard-customizer-3d-container {
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
