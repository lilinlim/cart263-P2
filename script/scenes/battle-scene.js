import Phaser from "../library/phaser.js";
import { 
    BATTLE_ASSET_KEYS,
    //BATTLE_BACKGROUND_ASSET_KEYS,
    //HEALTH_BAR_ASSET_KEYS,
    MONSTER_ASSET_KEYS,
} from "../assets/asset-keys.js";
import { Background } from "../battle/background.js";
import { HealthBar } from "../battle/ui/health-bar.js";
import { BattleMenu } from '../battle/ui/menu/battle-menu.js';
import { DIRECTION } from "../common/direction.js";
import {SCENE_KEYS} from "./scene-keys.js";
//import { BattleMonster } from "../battle/monsters/battle-monster.js";
import { EnemyBattleMonster } from "../battle/monsters/enemy-battle-monster.js";
import { PlayerBattleMonster } from "../battle/monsters/player-battle-monster.js";

export class BattleScene extends Phaser.Scene {
    /** @type {BattleMenu} */ //these are types of comments that help knowing what kind of content is what
    #battleMenu;
    /** @type {Phaser.Types.Input.Keyboard.CursorKeys} */
    #cursorKeys;
    /** @type {EnemyBattleMonster} */
    #activeEnemyMonster;
    /** @type {PlayerBattleMonster} */
    #activePlayerMonster;

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
        this.#activeEnemyMonster = new EnemyBattleMonster({
            scene: this,
            monsterDetails: {
                name: MONSTER_ASSET_KEYS.CARNODUSK,
                assetKey: MONSTER_ASSET_KEYS.CARNODUSK,
                assetFrame: 0,
                currentHp: 25,
                maxHp: 25,
                attackIds: [],
                baseAttack: 5,
                currentLevel: 5,
            },
        });

        this.#activePlayerMonster = new PlayerBattleMonster({
            scene: this,
            monsterDetails: {
                name: MONSTER_ASSET_KEYS.IGUANIGNITE,
                assetKey: MONSTER_ASSET_KEYS.IGUANIGNITE,
                assetFrame: 0,
                currentHp: 25,
                maxHp: 25,
                attackIds: [],
                baseAttack: 5,
                currentLevel: 5,
            },
        });

        //render out the main + sub info panes
        this.#battleMenu = new BattleMenu(this);
        this.#battleMenu.showMainBattleMenu();

        //for keyboard
        this.#cursorKeys = this.input.keyboard.createCursorKeys();

        //testing enemy hp bar
        this.#activeEnemyMonster.takeDamage(20, () => {
            this.#activePlayerMonster.takeDamage(15);
        });
        //console.log(this.#activeEnemyMonster.isFainted);
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