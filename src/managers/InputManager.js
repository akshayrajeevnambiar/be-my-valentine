export default class InputManager {
  constructor(scene) {
    this.scene = scene;
    this.cursors = null;
    this.keys = null;
  }

  create() {
    this.cursors = this.scene.input.keyboard.createCursorKeys();
    this.keys = this.scene.input.keyboard.addKeys("W,A,S,D,SPACE");
  }

  isLeftPressed() {
    return this.cursors.left.isDown || this.keys.A.isDown;
  }

  isRightPressed() {
    return this.cursors.right.isDown || this.keys.D.isDown;
  }

  isJumpJustPressed() {
    return (
      Phaser.Input.Keyboard.JustDown(this.cursors.up) ||
      Phaser.Input.Keyboard.JustDown(this.keys.W)
    );
  }

  isAttackJustPressed() {
    return Phaser.Input.Keyboard.JustDown(this.keys.SPACE);
  }
}
