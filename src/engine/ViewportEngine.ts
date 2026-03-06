import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

/**
 * 3D 视口引擎 — 零 React 依赖，管理 THREE.js 场景生命周期。
 * 未来可直接提取到 packages/engine/ 作为独立模块。
 */
interface Tween {
  update(t: number): boolean; // returns true when done
}

export class ViewportEngine {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private controls: OrbitControls;
  private animFrameId = 0;
  private model: THREE.Group | null = null;
  private meshIndex = new Map<string, THREE.Mesh>();
  private centerOffset = new THREE.Vector3();
  private tweens: Tween[] = [];

  constructor(canvas: HTMLCanvasElement, width: number, height: number) {
    // Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0a0a0a);

    // Camera
    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.01, 100);
    this.camera.position.set(0, 1, 3);

    // Renderer
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.0;

    // Controls
    this.controls = new OrbitControls(this.camera, canvas);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.target.set(0, 1, 0);
    this.controls.update();

    // Lights
    this.scene.add(new THREE.AmbientLight(0xffffff, 0.6));

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(5, 5, 5);
    this.scene.add(dirLight);

    const backLight = new THREE.DirectionalLight(0xffffff, 0.3);
    backLight.position.set(-3, 2, -5);
    this.scene.add(backLight);

    // Start render loop
    this.animate();
  }

  async loadModel(url: string): Promise<void> {
    const loader = new GLTFLoader();

    return new Promise((resolve, reject) => {
      loader.load(
        url,
        (gltf) => {
          this.model = gltf.scene;
          this.scene.add(this.model);

          // AutoCenter: shift model so bounding box center is at origin
          const box = new THREE.Box3().setFromObject(this.model);
          const center = box.getCenter(new THREE.Vector3());
          this.model.position.sub(center);
          this.centerOffset.copy(center);

          this.indexMeshes();
          this.fitCameraToModel();
          resolve();
        },
        undefined,
        (err) => reject(err),
      );
    });
  }

  async loadAdditionalModel(
    url: string,
    position: { x: number; y: number; z: number },
    scale: number,
  ): Promise<THREE.Group> {
    const loader = new GLTFLoader();
    return new Promise((resolve, reject) => {
      loader.load(
        url,
        (gltf) => {
          const group = gltf.scene;
          group.position.set(
            position.x - this.centerOffset.x,
            position.y - this.centerOffset.y,
            position.z - this.centerOffset.z,
          );
          group.scale.setScalar(scale);
          this.scene.add(group);
          resolve(group);
        },
        undefined,
        reject,
      );
    });
  }

  removeModel(group: THREE.Group): void {
    this.scene.remove(group);
    group.traverse((obj) => {
      if ((obj as THREE.Mesh).isMesh) {
        const mesh = obj as THREE.Mesh;
        mesh.geometry.dispose();
        const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
        mats.forEach((m) => m.dispose());
      }
    });
  }

  setMeshVisible(name: string, visible: boolean): void {
    const mesh = this.meshIndex.get(name);
    if (mesh) mesh.visible = visible;
  }

  setMeshOpacity(name: string, opacity: number): void {
    const mesh = this.meshIndex.get(name);
    if (!mesh) return;
    const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    mats.forEach((m) => {
      (m as THREE.MeshStandardMaterial).opacity = Math.max(0, Math.min(1, opacity));
      (m as THREE.MeshStandardMaterial).transparent = opacity < 1;
    });
  }

  getMeshNames(): string[] {
    return Array.from(this.meshIndex.keys());
  }

  /** Compute bounding box center of the given mesh names. */
  getMeshesCenter(names: string[]): THREE.Vector3 {
    const box = new THREE.Box3();
    for (const name of names) {
      const mesh = this.meshIndex.get(name);
      if (mesh) box.expandByObject(mesh);
    }
    return box.getCenter(new THREE.Vector3());
  }

  resize(width: number, height: number): void {
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  dispose(): void {
    cancelAnimationFrame(this.animFrameId);
    this.controls.dispose();
    this.meshIndex.clear();

    this.scene.traverse((obj) => {
      if ((obj as THREE.Mesh).isMesh) {
        const mesh = obj as THREE.Mesh;
        mesh.geometry.dispose();
        const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
        materials.forEach((m) => m.dispose());
      }
    });

    this.renderer.dispose();
  }

  /** Smoothly move camera to a new position/target over `duration` ms. */
  moveCamera(
    pos: { x: number; y: number; z: number },
    target: { x: number; y: number; z: number },
    duration: number,
  ): Promise<void> {
    const startPos = this.camera.position.clone();
    const startTarget = this.controls.target.clone();
    const endPos = new THREE.Vector3(pos.x, pos.y, pos.z);
    const endTarget = new THREE.Vector3(target.x, target.y, target.z);
    const startTime = performance.now();

    return new Promise((resolve) => {
      this.tweens.push({
        update(now) {
          const elapsed = Math.min((now - startTime) / duration, 1);
          const t = elapsed * elapsed * (3 - 2 * elapsed); // smoothstep
          return elapsed >= 1 ? (resolve(), true) : false;
        },
      });
      // Integrate position update into the existing tween
      const tween = this.tweens[this.tweens.length - 1];
      const cam = this.camera;
      const ctrl = this.controls;
      const origUpdate = tween.update;
      tween.update = (now: number) => {
        const elapsed = Math.min((now - startTime) / duration, 1);
        const t = elapsed * elapsed * (3 - 2 * elapsed);
        cam.position.lerpVectors(startPos, endPos, t);
        ctrl.target.lerpVectors(startTarget, endTarget, t);
        if (elapsed >= 1) { resolve(); return true; }
        return false;
      };
    });
  }

  /** Orbit camera around the target by `angleDeg` degrees over `duration` ms. */
  orbitCamera(angleDeg: number, duration: number): Promise<void> {
    const startTime = performance.now();
    const startAngle = Math.atan2(
      this.camera.position.x - this.controls.target.x,
      this.camera.position.z - this.controls.target.z,
    );
    const radius = new THREE.Vector2(
      this.camera.position.x - this.controls.target.x,
      this.camera.position.z - this.controls.target.z,
    ).length();
    const camY = this.camera.position.y;
    const totalRad = (angleDeg * Math.PI) / 180;

    return new Promise((resolve) => {
      this.tweens.push({
        update: (now: number) => {
          const elapsed = Math.min((now - startTime) / duration, 1);
          const t = elapsed * elapsed * (3 - 2 * elapsed);
          const angle = startAngle + totalRad * t;
          this.camera.position.x = this.controls.target.x + Math.sin(angle) * radius;
          this.camera.position.z = this.controls.target.z + Math.cos(angle) * radius;
          this.camera.position.y = camY;
          if (elapsed >= 1) { resolve(); return true; }
          return false;
        },
      });
    });
  }

  /** Animate opacity of named meshes from current to target over `duration` ms. */
  animateOpacity(meshNames: string[], targetOpacity: number, duration: number): Promise<void> {
    const startTime = performance.now();
    const entries: { mesh: THREE.Mesh; startOp: number }[] = [];
    for (const name of meshNames) {
      const mesh = this.meshIndex.get(name);
      if (!mesh) continue;
      const mat = Array.isArray(mesh.material) ? mesh.material[0] : mesh.material;
      entries.push({ mesh, startOp: (mat as THREE.MeshStandardMaterial).opacity });
    }
    if (entries.length === 0) return Promise.resolve();

    return new Promise((resolve) => {
      this.tweens.push({
        update: (now: number) => {
          const elapsed = Math.min((now - startTime) / duration, 1);
          const t = elapsed * elapsed * (3 - 2 * elapsed);
          for (const { mesh, startOp } of entries) {
            const op = startOp + (targetOpacity - startOp) * t;
            const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
            mats.forEach((m) => {
              (m as THREE.MeshStandardMaterial).opacity = op;
              (m as THREE.MeshStandardMaterial).transparent = op < 1;
            });
            if (op <= 0.01) mesh.visible = false;
            else mesh.visible = true;
          }
          if (elapsed >= 1) { resolve(); return true; }
          return false;
        },
      });
    });
  }

  /** Cancel all running tweens. */
  cancelTweens(): void {
    this.tweens.length = 0;
  }

  /** Get current camera position & target (for DemoSequence to save/restore). */
  getCameraState(): { position: THREE.Vector3; target: THREE.Vector3 } {
    return {
      position: this.camera.position.clone(),
      target: this.controls.target.clone(),
    };
  }

  private indexMeshes(): void {
    this.meshIndex.clear();
    this.model?.traverse((obj) => {
      if ((obj as THREE.Mesh).isMesh) {
        const mesh = obj as THREE.Mesh;
        if (mesh.name) {
          this.meshIndex.set(mesh.name, mesh);
          const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
          mats.forEach((m) => {
            (m as THREE.MeshStandardMaterial).transparent = true;
          });
        }
      }
    });
  }

  private fitCameraToModel(): void {
    if (!this.model) return;

    const box = new THREE.Box3().setFromObject(this.model);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);

    this.camera.position.set(center.x, center.y, center.z + maxDim * 1.5);
    this.controls.target.copy(center);
    this.controls.update();
  }

  private animate = (): void => {
    this.animFrameId = requestAnimationFrame(this.animate);
    const now = performance.now();
    this.tweens = this.tweens.filter((tw) => !tw.update(now));
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  };
}
