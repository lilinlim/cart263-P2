import Phaser from "../library/phaser.js";
import { 
    BATTLE_ASSET_KEYS,
    //BATTLE_BACKGROUND_ASSET_KEYS,
    //HEALTH_BAR_ASSET_KEYS,
    MONSTER_ASSET_KEYS,
} from "../assets/asset-keys.js";
import { Background } from "../battle/background.js";
import { BattleMonster } from "../battle/monsters/battle-monster.js";
import { HealthBar } from "../battle/ui/health-bar.js";
import { BattleMenu } from '../battle/ui/menu/battle-menu.js';
import { DIRECTION } from "../common/direction.js";
import {SCENE_KEYS} from "./scene-keys.js";

export class BattleScene extends Phaser.Scene {
    /** @type {BattleMenu} */ //these are types of comments that help knowing what kind of content is what
    #battleMenu;
    /** @type {Phaser.Types.Input.Keyboard.CursorKeys} */
    #cursorKeys;
    /** @type {BattleMonster} */
    #activeEnemyMonster;

    constructor() {
        super({
            key: SCENE_KEYS.BATTLE_SCENE,
        });
    }

    create() {
        console.log(`[${BattleScene.name}:create] invoked`);

        //create main background
        const background = new Background(this);
        background.showForest();

        //render player + enemy
        this.#activeEnemyMonster = new BattleMonster({
            scene: this,
            monsterDetails: {
                name: MONSTER_ASSET_KEYS.CARNODUSK,
                assetKey: MONSTER_ASSET_KEYS.CARNODUSK,
                assetFrame: 0,
                currentHp: 25,
                maxHp: 25,
                attackIds: [],
                baseAttack: 5,
            },
        }, {x: 768, y: 144,})
        //this.add.image(768, 144, MONSTER_ASSET_KEYS.CARNODUSK, 0);
        this.add.image(256, 316, MONSTER_ASSET_KEYS.IGUANIGNITE, 0).setFlipX(true);

        //render player health bar
        const playerHealthBar = new HealthBar(this, 34, 37);
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
            playerHealthBar.container,
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
        //const enemyHealthBar = new HealthBar(this, 34, 37);
        const enemyHealthBar = this.#activeEnemyMonster._healthBar;
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
            enemyHealthBar.container,
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
        playerHealthBar.setMeterPercentageAnimated(0.5,{
            duration: 3000,
            callback: () => {
                console.log('animation completed');
            },
        });
    }

    //calls every frame
    update(){
        //JustDown a method that helps to know if something was pressed
        const wasSpaceKeyPressed = Phaser.Input.Keyboard.JustDown(this.#cursorKeys.space);
        if(wasSpaceKeyPressed){
            this.#battleMenu.handlePlayerInput('OK');

            //check if player selected attack, update text
            if(this.#battleMenu.selectedAttack === undefined){
                return;
            }
            console.log(`Player selected this following move: ${this.#battleMenu.selectedAttack}`);
            this.#battleMenu.hideMonsterAttackSubMenu();
            this.#battleMenu.updateInfoPaneMessagesAndWaitForInput(['Your monster attacked the enemy'], () => {
                this.#battleMenu.showMainBattleMenu();
            });
            
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

}