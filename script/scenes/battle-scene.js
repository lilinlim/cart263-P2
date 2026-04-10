import { 
    BATTLE_ASSET_KEYS,
    BATTLE_BACKGROUND_ASSET_KEYS,
    HEALTH_BAR_ASSET_KEYS,
    MONSTER_ASSET_KEYS,
} from "../assets/asset-keys.js";
import { BattleMenu } from '../battle/ui/menu/battle-menu.js';
import { DIRECTION } from "../common/direction.js";
import Phaser from "../library/phaser.js";
import {SCENE_KEYS} from "./scene-keys.js";

export class BattleScene extends Phaser.Scene {
    /** @type {BattleMenu} */ //these are types of comments that help knowing what kind of content is what
    #battleMenu;
    /** @type {Phaser.Types.Input.Keyboard.CursorKeys} */
    #cursorKeys;

    constructor() {
        super({
            key: SCENE_KEYS.BATTLE_SCENE,
        });
    }

    create() {
        console.log(`[${BattleScene.name}:create] invoked`);

        //create main background
        this.add.image(0, 0, BATTLE_BACKGROUND_ASSET_KEYS.FOREST).setOrigin(0);

        //render player + enemy
        this.add.image(768, 144, MONSTER_ASSET_KEYS.CARNODUSK, 0);
        this.add.image(256, 316, MONSTER_ASSET_KEYS.IGUANIGNITE, 0).setFlipX(true);

        //render player health bar
        const playerMonsterName = this.add.text(30, 20, 
            MONSTER_ASSET_KEYS.IGUANIGNITE, {
                color: "#7E3D3F",
                fontSize: "32px",
            }
        );
        //container for player health
        this.add.container(556, 318, [
            this.add.image(0, 0, BATTLE_ASSET_KEYS.HEALTH_BAR_BACKGROUND)
            .setOrigin(0),
            playerMonsterName,
            this.#createHealth(34, 37),
            this.add.text(playerMonsterName.width + 35, 22, "L5", {
                color: "#ED474B",
                fontSize: "28px",
            }),
            this.add.text(30, 55, "HP", {
                color: "#FF6505",
                fontSize: "24px",
                fontStyle: "italic",
            }),
            this.add.text(443, 80, "25/25", {
                color: "#F7e3d3f",
                fontSize: "16px",
            })
            .setOrigin(1, 0),
        ]);

        //render enemy health bar
        const enemyMonsterName = this.add.text(30, 20, 
            MONSTER_ASSET_KEYS.CARNODUSK, {
                color: "#7E3D3F",
                fontSize: "32px",
            }
        );
        //container for enemy health
        this.add.container(0, 0, [
            this.add.image(0, 0, BATTLE_ASSET_KEYS.HEALTH_BAR_BACKGROUND)
            .setOrigin(0).setScale(1, 0.8),
            enemyMonsterName,
            this.#createHealth(34, 37),
            this.add.text(enemyMonsterName.width + 35, 22, "L5", {
                color: "#ED474B",
                fontSize: "28px",
            }),
            this.add.text(30, 55, "HP", {
                color: "#FF6505",
                fontSize: "24px",
                fontStyle: "italic",
            }),
        ]);

        //render out the main + sub info panes
        this.#battleMenu = new BattleMenu(this);
        this.#battleMenu.showMainBattleMenu();

        //for keyboard
        this.#cursorKeys = this.input.keyboard.createCursorKeys();
    }

    //calls every frame
    update(){
        //JustDown a method that helps to know if something was pressed
        const wasSpaceKeyPressed = Phaser.Input.Keyboard.JustDown(this.#cursorKeys.space);
        if(wasSpaceKeyPressed){
            this.#battleMenu.handlePlayerInput('OK');
            return;
        }

        if(Phaser.Input.Keyboard.JustDown(this.#cursorKeys.shift)){
            this.#battleMenu.handlePlayerInput('CANCEL');
            return;
        }
        //console.log(this.#cursorKeys.space.isDown);
        //console.log(wasSpaceKeyPressed);

        /** @type {import('../common/direction.js').Direction} */
        let selectedDirection = DIRECTION.NONE;
        if(this.#cursorKeys.left.isDown){
            selectedDirection = DIRECTION.LEFT;
        } else if(this.#cursorKeys.right.isDown){
            selectedDirection = DIRECTION.RIGHT;
        } else if(this.#cursorKeys.up.isDown){
            selectedDirection = DIRECTION.UP;
        } else if(this.#cursorKeys.down.isDown){
            selectedDirection = DIRECTION.DOWN;
        }

        if(selectedDirection !== DIRECTION.NONE) {
            this.#battleMenu.handlePlayerInput(selectedDirection);
        }
    }

    /**
     * 
     * @param {number} x the x pos to place health bar
     * @param {number} y the y pos to place health bar
     * @returns {Phaser.GameObjects.Container}
     */
    //health bar
    #createHealth(x, y){
        const scaleY = 0.7;
        const leftCap = this.add
        .image(x, y, HEALTH_BAR_ASSET_KEYS.LEFT_CAP)
        .setOrigin(0, 0.5).setScale(1, scaleY);
        const middle = this.add.image(
            leftCap.x + leftCap.width, 
            y, 
            HEALTH_BAR_ASSET_KEYS.MIDDLE)
            .setOrigin(0, 0.5).setScale(1, scaleY);
            middle.displayWidth = 360; //stretching middle
        const rightCap = this.add.image(
            middle.x + middle.displayWidth, y, HEALTH_BAR_ASSET_KEYS.RIGHT_CAP)
            .setOrigin(0, 0.5).setScale(1, scaleY);
        return this.add.container(x, y, [leftCap, middle, rightCap]);
    }

}