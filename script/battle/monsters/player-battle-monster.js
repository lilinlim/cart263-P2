import {BattleMonster} from "./battle-monster.js";

/** @type {import("../../types/typedef.js").Coordinate} */
const PlAYER_POSITION = Object.freeze({
    x: 256,
    y: 316,
});

export class PlayerBattleMonster extends BattleMonster{
    /** @type {Phaser.GameObjects.Text} */
    #healthBarTextGameObject;
    /**
     * 
     * @param {import("../../types/typedef.js").BattleMonsterConfig} config 
     */
    constructor(config){
        super(config, PlAYER_POSITION);
        this._phaserGameObject.setFlipX(true);
        this._phaserHealthBarGameContainer.setPosition(556, 318);

        this.#addHealthBarComponents();
    }

    #setHealthBarText(){
        this.#healthBarTextGameObject.setText(`${this._currentHealth}/${this._maxHealth}`);
    }

    #addHealthBarComponents(){
        this.#healthBarTextGameObject = this._scene.add
        .text(443, 80, "", {
            color: "#F7e3d3f",
            fontSize: "16px",
        })
        .setOrigin(1, 0);
        this.#setHealthBarText();

        this._phaserHealthBarGameContainer.add(this.#healthBarTextGameObject);
    }

    /**
     * 
     * @param {number} damage 
     * @param {() => void} [callback]
     */
    takeDamage(damage, callback){
        super.takeDamage(damage, callback);
        this.#setHealthBarText();
    }
}