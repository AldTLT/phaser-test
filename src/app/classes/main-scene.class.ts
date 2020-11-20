import { group } from '@angular/animations';
import { getLocaleDirection } from '@angular/common';
import { ɵConsole } from '@angular/core';
import Phaser from 'phaser';

export class MainScene extends Phaser.Scene {
  cursor: Phaser.Types.Input.Keyboard.CursorKeys;
  text: Phaser.GameObjects.Text;
  count: number = 0;

  // Hexagonal
  hexagonWidth: number = 123;
  hexagonHeight: number = 111;
  gridSizeX: number;
  gridSizeY: number;
  columns: [number, number];
  moveIndex: number;
  sectorWidth: number;
  sectorHeight: number;
  gradient: number;
  marker;
  hexagonGroup: Phaser.GameObjects.Group;
  map: number[][];

  // Curve
  path: any;
  curve: Phaser.Curves.QuadraticBezier;
  curve1: Phaser.Curves.QuadraticBezier;
  curve2: Phaser.Curves.QuadraticBezier;
  curves: Phaser.Curves.QuadraticBezier[] = [];
  graphics: Phaser.GameObjects.Graphics;
  // points: any;
  circle: Phaser.GameObjects.Image;
  pivotPoint1: Phaser.GameObjects.Image;
  pivotPoint2: Phaser.GameObjects.Image;
  pivotPoint3: Phaser.GameObjects.Image;
  goCircle: boolean;
  pointsGroup: Phaser.GameObjects.Group;

  constructor() {
    super({ key: 'main' });

    this.map = [
      [0, 1, 0],
      [0, 1, 1],
      [0, 1, 0],
      [0, 1, 1],
      [0, 1, 0],
    ];

    this.gridSizeX = this.map[0].length;
    this.gridSizeY = this.map.length;

    // this.columns = [
    //   Math.ceil(this.gridSizeY / 2),
    //   Math.floor(this.gridSizeY / 2),
    // ];
    this.sectorWidth = (this.hexagonWidth / 4) * 3;
    this.sectorHeight = this.hexagonHeight;
    this.gradient = this.hexagonWidth / 4 / (this.hexagonHeight / 2);
  }

  create() {
    this.hexagonGroup = this.add.group();
    let hex = this.add.sprite(100, 100, 'hex');
    hex.setInteractive({ dropZone: true });
    hex.on('drag', () => {
      // console.log(1);
    });

    this.input.setDraggable(hex);
    this.input.on('gameobjectup', (pointer, object) => {
      // console.log(object);
      // console.log(pointer);
    });

    // hex.on('gameobjectup', (pointer, object) => {
    //   console.log(object);
    //   console.log(pointer);
    // });

    // this.map.forEach((row, i) => {
    //   row.forEach((col, j) => {
    //     const shift = i % 2 ? 0 : (this.hexagonWidth * 3) / 4;
    //     const posX = 100 + shift + j * this.hexagonWidth * 1.5;
    //     const posY = 100 + i * 0.5 * this.hexagonHeight;

    //     if (this.map[i][j] !== 0) {
    //       let hex = this.add.sprite(posX, posY, 'hex');
    //       hex.on('dragenter', (pointer, object) => {
    //         console.log(pointer);
    //         console.log(object);
    //       })
    //       this.hexagonGroup.add(hex);
    //     }
    //   });
    // });

    const point1 = new Phaser.Math.Vector2(50, 50);
    const point2 = new Phaser.Math.Vector2(200, 200);
    const point3 = new Phaser.Math.Vector2(70, 300);

    this.circle = this.add
      .sprite(100, 600, 'circle')
      .setInteractive()
      .setScale(0.5)
      .setPosition(point2.x, point2.y);

    // this.input.setDraggable(this.circle);

    this.input.on('dragstart', (pointer, object: Phaser.GameObjects.Sprite) => {
      object.setTint(0xff0000);
    });

    this.input.on('dragend', (pointer, object) => {
      object.clearTint();
    });

    this.text = this.add.text(20, 20, '');

    // Create curve
    this.graphics = this.add.graphics();

    this.pivotPoint1 = this.add
      .image(point1.x, point1.y, 'dragcircle', 0)
      .setDataEnabled()
      .setInteractive()
      .setData('name', 'point1')
      .setData('type', 'point');

    this.pivotPoint2 = this.add
      .image(point2.x, point2.y, 'dragcircle', 0)
      .setInteractive()
      .setDataEnabled()
      .setData('name', 'point2')
      .setData('type', 'point');

    this.pivotPoint3 = this.add
      .image(point3.x, point3.y, 'dragcircle', 0)
      .setInteractive()
      .setDataEnabled()
      .setData('name', 'point3')
      .setData('type', 'point');

    this.path = { t: 0, vec: new Phaser.Math.Vector2() };

    this.curve1 = new Phaser.Curves.QuadraticBezier(
      point2,
      new Phaser.Math.Vector2(150, 25),
      point1
    );

    this.curve2 = new Phaser.Curves.QuadraticBezier(
      point2,
      new Phaser.Math.Vector2(100, 200),
      point3
    );

    this.curves.push(this.curve1);
    this.curves.push(this.curve2);

    this.input.on(
      'gameobjectdown',
      (pointer, object: Phaser.GameObjects.GameObject) => {
        if (object.getData('type') === 'point') {
          this.goCircle = true;
          const direction = this.getDirection(this.circle, this.curve);

          if (direction !== null) {
            this.setTeen(this.path, direction);
          }
        }
      }
    );

    // this.points = this.curve1.getSpacedPoints(10);

    this.graphics.lineStyle(1, 0xff00ff, 1);

    this.curve1.draw(this.graphics);
    this.curve2.draw(this.graphics);
  }

  preload() {
    this.load.image('hex', 'assets/image/hex.png');
    this.load.image('circle', 'assets/image/circle.png');
  }

  update() {
    this.text.setText(`Test: ${this.count}`);

    if (this.goCircle) {
      this.moveCircle();
    }
    // console.log(this.path);

    this.graphics.fillStyle(0xffff00, 1);
  }

  private moveCircle() {
    this.curve.getPoint(this.path.t, this.path.vec);
    this.circle.setPosition(this.path.vec.x, this.path.vec.y);
  }

  private setTeen(
    path: { t: number; vec: Phaser.Math.Vector2 },
    direction: number
  ) {
    console.log('move');
    let tween = this.tweens.add({
      targets: path,
      t: direction,
      ease: 'Sine.easeInOut',
      duration: 2000,
      yoyo: false,
      // repeat: -1,
      onComplete: () => {
        tween.stop();
        this.goCircle = false;
        console.log('stop');
      },
    });
  }

  private getDirection(
    object: Phaser.GameObjects.Image,
    curve: Phaser.Curves.QuadraticBezier
  ): number {
    return object.x === curve.p0.x && object.y === curve.p0.y
      ? 1
      : object.x === curve.p2.x && object.y === curve.p2.y
      ? 0
      : null;
  }

  private getCurve(
    point: Phaser.GameObjects.Image,
    object: Phaser.GameObjects.Image
  ): { direction: number; curve: Phaser.Curves.QuadraticBezier } {
    let d = null;

    const c = this.curves
      .filter((curve: Phaser.Curves.QuadraticBezier) => {
        return (
          (object.x === curve.p0.x && object.y === curve.p0.y) ||
          (object.x === curve.p2.x && object.y === curve.p2.y)
        );
      })
      .find((curve: Phaser.Curves.QuadraticBezier) => {
        d =
          object.x === curve.p0.x && object.y === curve.p0.y
            ? 1
            : object.x === curve.p2.x && object.y === curve.p2.y
            ? 0
            : null;

        return d === null ? false : true;
      });

    return c === null ? null : { direction: d, curve: c };
  }
}
