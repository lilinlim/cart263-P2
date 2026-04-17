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
import { StateMachine } from "../utils/state-machine.js";

//defining the states for our battle
const BATTLE_STATES = Object.freeze ({
    INTRO: 'INTRO', //setting the scene, creating objects, etc
    PRE_BATTLE_INFO: 'PRE_BATTLE_INFO', //animations
    BRING_OUT_MONSTER: 'BRING_OUT_MONSTER', //bringing out monsters "go monster"
    PLAYER_INPUT: 'PLAYER_INPUT', //showing interactive menu
    ENEMY_INPUT: 'ENEMY_INPUT', //enemy move
    BATTLE: 'BATTLE', //what happens during battle
    POST_ATTACK_CHECK: 'POST_ATTACK', //what happens after attack (flee, faint, etc)
    FINISHED: 'FINISHED', //succesful defeat for either party
    FLEE_ATTEMPT: 'FLEE_ATTEMPT', //checking if player can run away
})

export class BattleScene extends Phaser.Scene {
    /** @type {BattleMenu} */ //these are types of comments that help knowing what kind of content is what
    #battleMenu;
    /** @type {Phaser.Types.Input.Keyboard.CursorKeys} */
    #cursorKeys;
    /** @type {EnemyBattleMonster} */
    #activeEnemyMonster;
    /** @type {PlayerBattleMonster} */
    #activePlayerMonster;
    /** @type {number} */
    #activePlayerAttackIndex;
    /** @type {StateMachine} */
    #battleStateMachine;

    constructor() {
        super({
            key: SCENE_KEYS.BATTLE_SCENE,
        });
    }

    init(){
        this.#activePlayerAttackIndex = -1;
    }

    create() {
        console.log(`[${BattleScene.name}:create] invoked`);

        //create main background
        const background = new Background(this);
        background.showForest();

        //render player + enemy
        //stats for enemy
        this.#activeEnemyMonster = new EnemyBattleMonster({
            scene: this,
            monsterDetails: {
                name: MONSTER_ASSET_KEYS.CARNODUSK,
                assetKey: MONSTER_ASSET_KEYS.CARNODUSK,
                assetFrame: 22,
                currentHp: 25,
                maxHp: 25,
                attackIds: [1],
                baseAttack: 5,
                currentLevel: 5,
            },
        });
        this.anims.create({
            key: `attackerPetAnim`,
             frames: this.anims.generateFrameNumbers(MONSTER_ASSET_KEYS.CARNODUSK, {
                start: 22,
                end: 24,
            }),
            frameRate:5,
            repeat:-1,
        });

        //stats for player
        this.#activePlayerMonster = new PlayerBattleMonster({
            scene: this,
            monsterDetails: {
                name: MONSTER_ASSET_KEYS.IGUANIGNITE,
                assetKey: MONSTER_ASSET_KEYS.IGUANIGNITE,
                // assetFrame: 0,
                // frames: this.anims.generateFrameNumbers(`MONSTER_ASSET_KEYS.IGUANIGNITE`, {
                // start:20,
                // end: 24,
                // }),
                // frameRate:10,
                // repeat:-1
                currentHp: 25,
                maxHp: 25,
                attackIds: [2],
                baseAttack: 15,
                currentLevel: 5,
            },
        });
        //animation 
        this.anims.create({
            key: `playerPetAnim`,
             frames: this.anims.generateFrameNumbers(MONSTER_ASSET_KEYS.IGUANIGNITE, {
                start: 21,
                end: 22,
            }),
            frameRate:5,
            repeat:-1,
        });
        
        

        //render out the main + sub info panes
        this.#battleMenu = new BattleMenu(this, this.#activePlayerMonster);
        this.#createBattleStateMachine();

        //for keyboard
        this.#cursorKeys = this.input.keyboard.createCursorKeys();

        this.#activePlayerMonster.playAnimation();
        //console.log(this.#activeEnemyMonster.isFainted);
    }

    //calls every frame
    update(){
        //lets it be constantly updated to clear queue - helps with timing
        this.#battleStateMachine.update();

        //JustDown a method that helps to know if something was pressed
        const wasSpaceKeyPressed = Phaser.Input.Keyboard.JustDown(this.#cursorKeys.space);
        if(wasSpaceKeyPressed){
            this.#battleMenu.handlePlayerInput('OK');

            //check if player selected attack, update text
            if(this.#battleMenu.selectedAttack === undefined){
                return;
            }
            
            this.#activePlayerAttackIndex = this.#battleMenu.selectedAttack;

            if(!this.#activePlayerMonster.attacks[this.#activePlayerAttackIndex]){
                return;
            }

            console.log(`Player selected this following move: ${this.#battleMenu.selectedAttack}`);

            this.#battleMenu.hideMonsterAttackSubMenu();
            this.#battleStateMachine.setState(BATTLE_STATES.ENEMY_INPUT);
            
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

    #playerAttack(){
        this.#battleMenu.updateInfoPaneMessagesAndWaitForInput([`${this.#activePlayerMonster.name} used ${this.#activePlayerMonster.attacks[this.#activePlayerAttackIndex].name}`], () => {
            this.time.delayedCall(500, () => {
                this.#activeEnemyMonster.takeDamage(this.#activePlayerMonster.baseAttack, () => {
                    this.#enemyAttack();
                });
            })
        })
    }

    #enemyAttack(){
        //to see if enemy is defeated before attacking
        if(this.#activeEnemyMonster.isFainted){
            this.#battleStateMachine.setState(BATTLE_STATES.POST_ATTACK_CHECK);
            return;
        }
        this.#battleMenu.updateInfoPaneMessagesAndWaitForInput(
            [`${this.#activeEnemyMonster.name} used ${this.#activeEnemyMonster.attacks[0].name}`], 
            () => {
            this.time.delayedCall(500, () => {
                this.#activePlayerMonster.takeDamage(this.#activeEnemyMonster.baseAttack, () => {
                    this.#battleStateMachine.setState(BATTLE_STATES.POST_ATTACK_CHECK);
                });
            })
            }
        );
    }

    #postBattleSequenceCheck(){
        if(this.#activeEnemyMonster.isFainted){
            this.#battleMenu.updateInfoPaneMessagesAndWaitForInput(
                [`Wild ${this.#activeEnemyMonster.name} fainted`, 'You have gained some exp!'], 
                () => {
                    this.#battleStateMachine.setState(BATTLE_STATES.FINISHED);
                }
            );
            return;
        }

        if(this.#activePlayerMonster.isFainted){
            this.#battleMenu.updateInfoPaneMessagesAndWaitForInput(
                [`${this.#activePlayerMonster.name} fainted`, 'You have no more monsters, escaping to safety...'], 
                () => {
                    this.#battleStateMachine.setState(BATTLE_STATES.FINISHED);
                }
            );
            return;
        }

        this.#battleStateMachine.setState(BATTLE_STATES.PLAYER_INPUT);
    }

    //transition to next scene
    #transitionToNextScene(){
        this.cameras.main.fadeOut(600, 0, 0, 0);
        this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
            this.scene.start(SCENE_KEYS.BATTLE_SCENE);
        });
    }

    #createBattleStateMachine(){
        this.#battleStateMachine = new StateMachine('battle', this);

        this.#battleStateMachine.addState({
            name: BATTLE_STATES.INTRO,
            onEnter: () => {
                //waiting for scene set up and completing transitions
                this.time.delayedCall(500, () =>{
                    this.#battleStateMachine.setState(BATTLE_STATES.PRE_BATTLE_INFO);
                })
            }
        });

        this.#battleStateMachine.addState({
            name: BATTLE_STATES.PRE_BATTLE_INFO,
            onEnter: () => {
                //waiting for enemy monster's appearing + notifying user
                this.#battleMenu.updateInfoPaneMessagesAndWaitForInput([`wild ${this.#activeEnemyMonster.name} appeard!`],
                    () => {
                        //waiting for text animations to finish
                        //no animations for now, so just this
                        this.time.delayedCall(500, () => {
                            this.#battleStateMachine.setState(BATTLE_STATES.BRING_OUT_MONSTER);
                        });
                    }
                )
            }
        });

        this.#battleStateMachine.addState({
            name: BATTLE_STATES.BRING_OUT_MONSTER,
            onEnter: () => {
                //waiting for player's monster to appear + notifying user
                this.#battleMenu.updateInfoPaneMessagesAndWaitForInput([`go ${this.#activePlayerMonster.name}!`],
                    () => {
                        //waiting for text animations to finish
                        //no animations for now, so just this
                        this.time.delayedCall(500, () => {
                            this.#battleStateMachine.setState(BATTLE_STATES.PLAYER_INPUT);
                        });
                    }
                )
                
            }
        });

        this.#battleStateMachine.addState({
            name: BATTLE_STATES.PLAYER_INPUT,
            onEnter: () => {
                this.#battleMenu.showMainBattleMenu();
            }
        });

        this.#battleStateMachine.addState({
            name: BATTLE_STATES.ENEMY_INPUT,
            onEnter: () => {
                //todo: add features in future
                //enemy picks a random move
                this.#battleStateMachine.setState(BATTLE_STATES.BATTLE);
            }
        });

        this.#battleStateMachine.addState({
            name: BATTLE_STATES.BATTLE,
            onEnter: () => {
                //general battle flow
                //show attack used -> brief pause
                //play attack anim -> brief pause
                //play damage anim -> brief pause
                //play hp anim -> brief pause
                //repeat steps for other monster

                this.#playerAttack();
            },
        });

        this.#battleStateMachine.addState({
            name: BATTLE_STATES.POST_ATTACK_CHECK,
            onEnter: () => {
                this.#postBattleSequenceCheck();
            }
        });

        this.#battleStateMachine.addState({
            name: BATTLE_STATES.FINISHED,
            onEnter: () => {
                this.#transitionToNextScene();
            }
        });

        this.#battleStateMachine.addState({
            name: BATTLE_STATES.FLEE_ATTEMPT,
            onEnter: () => {
                this.#battleMenu.updateInfoPaneMessagesAndWaitForInput([`You got away safely!`], () => {
                    this.#battleStateMachine.setState(BATTLE_STATES.FINISHED);
                });
            }
        });

        //start state machine
        this.#battleStateMachine.setState('INTRO');
    }
}