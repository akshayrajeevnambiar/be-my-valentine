export default class CameraManager {
  constructor(scene) {
    this.scene = scene;
  }

  setup() {
    const { width, height } = this.scene.cameras.main;

    this.scene.cameras.main.setBounds(0, 0, this.scene.worldWidth, height);
    this.scene.cameras.main.startFollow(
      this.scene.playerController.player,
      true,
      0.12,
      0.12,
    );
    this.scene.cameras.main.setDeadzone(width * 0.05, height * 0.25);
  }
}
