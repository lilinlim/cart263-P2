"use strict";

import Phaser from "./library/phaser.js";
import {SCENE_KEYS} from "./scenes/scene-keys.js";
import {PreloadScene} from "./scenes/preload-scene.js";
import { BattleScene } from "./scenes/battle-scene.js";

const game = new Phaser.Game({
    type: Phaser.CANVAS,
    pixelArt: false,
    scale: {
        parent: 'game-container',
        width: 1024,
        height: 575,
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    backgroundColor: "#000000",
    //scene: [PreloadScene], //another way to start scene
});

game.scene.add(SCENE_KEYS.PRELOAD_SCENE, PreloadScene);
game.scene.add(SCENE_KEYS.BATTLE_SCENE, BattleScene);
game.scene.start(SCENE_KEYS.PRELOAD_SCENE);