import { MainScene } from './../../../classes/main-scene.class';
import { Component, OnInit } from '@angular/core';
import Phaser from 'phaser';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss'],
})
export class GameComponent implements OnInit {

  scene: MainScene = new MainScene();
  game: Phaser.Game;
  config: Phaser.Types.Core.GameConfig;

  constructor() {
    this.config = {
      type: Phaser.AUTO,
      height: 700,
      width: 1200,
      scene: [MainScene],
      parent: 'gameContainer',
      physics: {
        default: 'arcade',
        arcade: {
          debug: false
        },
      },
      backgroundColor: "#aaaaaa"
    };
  }

  ngOnInit(): void {
    this.game = new Phaser.Game(this.config);
  }
}
