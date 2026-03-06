import * as THREE from 'three';
import type { ViewportEngine } from './ViewportEngine';
import { LAYER_CONFIG } from '../data/layerConfig';

/**
 * 演示序列 — 皮肤剥离 → 直达肺部 → 肺半透明 → 肿瘤特写。
 * 纯引擎层，零 React 依赖。
 */
export class DemoSequence {
  private engine: ViewportEngine;
  private tumorGroup: THREE.Group | null;
  private aborted = false;
  private savedCamera: { position: THREE.Vector3; target: THREE.Vector3 } | null = null;

  constructor(engine: ViewportEngine, tumorGroup: THREE.Group | null) {
    this.engine = engine;
    this.tumorGroup = tumorGroup;
  }

  async run(onStatus?: (layerId: string, action: string) => void): Promise<void> {
    this.aborted = false;
    this.savedCamera = this.engine.getCameraState();

    const meshesOf = (id: string) =>
      LAYER_CONFIG.find((l) => l.id === id)?.meshNames ?? [];

    // Reset: show everything, hide tumor
    for (const layer of LAYER_CONFIG) {
      for (const name of layer.meshNames) {
        this.engine.setMeshVisible(name, true);
        this.engine.setMeshOpacity(name, 1);
      }
    }
    if (this.tumorGroup) this.tumorGroup.visible = false;

    // Compute lung center for accurate targeting
    const lungCenter = this.engine.getMeshesCenter([
      ...meshesOf('lungs'), ...meshesOf('airways'),
    ]);

    // All non-lung/airway/heart layers
    const outerLayers = [
      'shoulder', 'ribs', 'spine', 'spine_ligaments', 'larynx', 'hyoid',
      'upper_cervical', 'diaphragm', 'esophagus', 'nerves', 'vessels',
      'abdomen_vessels', 'limb_vessels', 'spinal_cord',
    ];

    // ── Step 1: Quick orbit, full body ───────────────────────
    onStatus?.('all', 'Full body overview');
    await this.engine.orbitCamera(40, 1500);
    if (this.aborted) return;

    // ── Step 2: Skin fades out + slight pull back ────────────
    onStatus?.('skin', 'Peeling skin');
    const cam1 = this.engine.getCameraState();
    await Promise.all([
      this.engine.animateOpacity(meshesOf('skin'), 0, 800),
      this.engine.moveCamera(
        { x: cam1.position.x * 1.1, y: cam1.position.y, z: cam1.position.z * 1.1 },
        cam1.target,
        800,
      ),
    ]);
    if (this.aborted) return;
    await this.sleep(200);

    // ── Step 3: Quick orbit exposed anatomy ──────────────────
    onStatus?.('anatomy', 'Exposed anatomy');
    await this.engine.orbitCamera(50, 1200);
    if (this.aborted) return;

    // ── Step 4: Outer layers fade out ────────────────────────
    onStatus?.('focus', 'Isolating thorax');
    const outerMeshes = outerLayers.flatMap(meshesOf);
    await Promise.all([
      this.engine.animateOpacity(outerMeshes, 0, 700),
      this.engine.orbitCamera(25, 700),
    ]);
    if (this.aborted) return;
    await this.sleep(150);

    // ── Step 5: Zoom in to lung center ───────────────────────
    onStatus?.('lungs', 'Focusing on lungs');
    const cam2 = this.engine.getCameraState();
    // Camera aims at lung center, moves closer
    const dirToLung = new THREE.Vector3(
      cam2.position.x - lungCenter.x,
      cam2.position.y - lungCenter.y,
      cam2.position.z - lungCenter.z,
    ).normalize();
    const zoomDist = 0.6;
    await this.engine.moveCamera(
      {
        x: lungCenter.x + dirToLung.x * zoomDist,
        y: lungCenter.y + dirToLung.y * zoomDist,
        z: lungCenter.z + dirToLung.z * zoomDist,
      },
      lungCenter,
      1000,
    );
    if (this.aborted) return;

    // Orbit close-up on lungs
    await this.engine.orbitCamera(50, 1500);
    if (this.aborted) return;

    // ── Step 6: Lungs semi-transparent ───────────────────────
    onStatus?.('lungs', 'Lungs → translucent');
    await this.engine.animateOpacity(meshesOf('lungs'), 0.25, 700);
    if (this.aborted) return;

    await this.engine.orbitCamera(30, 1000);
    if (this.aborted) return;

    // ── Step 7: Reveal tumor + zoom tighter ──────────────────
    if (this.tumorGroup) {
      onStatus?.('tumor', 'Revealing tumor');
      this.tumorGroup.visible = true;

      const cam3 = this.engine.getCameraState();
      await this.engine.moveCamera(
        { x: cam3.position.x * 0.65, y: cam3.position.y, z: cam3.position.z * 0.65 },
        cam3.target,
        800,
      );
      if (this.aborted) return;

      await this.engine.orbitCamera(60, 1500);
      if (this.aborted) return;
    }

    // ── Step 8: Pull back to wide shot ───────────────────────
    onStatus?.('overview', 'Pulling back');
    const cam4 = this.engine.getCameraState();
    await this.engine.moveCamera(
      { x: cam4.position.x * 2.5, y: cam4.position.y + 0.2, z: cam4.position.z * 2.5 },
      lungCenter,
      1200,
    );
    if (this.aborted) return;

    onStatus?.('complete', 'Demo complete');
    await this.engine.orbitCamera(70, 2000);
  }

  stop(): void {
    this.aborted = true;
    this.engine.cancelTweens();

    // Restore all layers
    for (const layer of LAYER_CONFIG) {
      for (const name of layer.meshNames) {
        this.engine.setMeshVisible(name, true);
        this.engine.setMeshOpacity(name, 1);
      }
    }
    if (this.tumorGroup) this.tumorGroup.visible = true;

    // Restore camera
    if (this.savedCamera) {
      this.engine.moveCamera(
        this.savedCamera.position,
        this.savedCamera.target,
        400,
      );
      this.savedCamera = null;
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => {
      const id = setTimeout(resolve, ms);
      const check = () => {
        if (this.aborted) { clearTimeout(id); resolve(); }
        else if (ms > 0) requestAnimationFrame(check);
      };
      check();
    });
  }
}
