import { HEALTH_BAR_ASSET_KEYS } from '../../assets/asset-keys.js';
import Phaser from '../../library/phaser.js';

export class HealthBar {
    /** @type {Phaser.Scene} */
    #scene;
    /** @type {Phaser.GameObjects.Container} */
    #healthBarContainer
    /** @type {number} */
    #fullWidth;
    /** @type {number} */
    #scaleY;
    /** @type {Phaser.GameObjects.Image} */
    #leftCap;
    /** @type {Phaser.GameObjects.Image} */
    #middle;
    /** @type {Phaser.GameObjects.Image} */
    #rightCap;

    /**
     * 
     * @param {Phaser.Scene} scene the Phaser 3 Scene the battle menu will be added
     * @param {number} x
     * @param {number} y
     */
    constructor(scene, x, y){
        this.#scene = scene;
        this.#fullWidth = 360;
        this.#scaleY =0.7;

        this.#healthBarContainer = this.#scene.add.container(x, y, []);
        this.#createHealthBarImages(x, y);
        this.#setMeterPercentage(1);
    }

    get container(){
        return this.#healthBarContainer;
    }

    /**
     * 
     * @param {number} x the x pos to place health bar
     * @param {number} y the y pos to place health bar
     * @returns {void}
     */
    //health bar
    #createHealthBarImages(x, y){
        this.#leftCap = this.#scene.add.image(
            x, y, HEALTH_BAR_ASSET_KEYS.LEFT_CAP)
            .setOrigin(0, 0.5).setScale(1, this.#scaleY);

        this.#middle = this.#scene.add.image(
            this.#leftCap.x + this.#leftCap.width, 
            y, 
            HEALTH_BAR_ASSET_KEYS.MIDDLE)
            .setOrigin(0, 0.5).setScale(1, this.#scaleY);

        this.#rightCap = this.#scene.add.image(
            this.#middle.x + this.#middle.displayWidth, y, HEALTH_BAR_ASSET_KEYS.RIGHT_CAP)
            .setOrigin(0, 0.5).setScale(1, this.#scaleY);

        this.#healthBarContainer.add([this.#leftCap, this.#middle, this.#rightCap]);
    }

    #setMeterPercentage(percent = 1){
        const width = this.#fullWidth * percent;

        this.#middle.displayWidth = width; //stretching middle
        this.#rightCap.x = this.#middle.x + this.#middle.displayWidth;
    }
}