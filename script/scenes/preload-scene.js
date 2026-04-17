import { 
    BATTLE_ASSET_KEYS,
    BATTLE_BACKGROUND_ASSET_KEYS ,
    DATA_ASSET_KEYS,
    HEALTH_BAR_ASSET_KEYS,
    MONSTER_ASSET_KEYS,
    UI_ASSET_KEYS,
} from "../assets/asset-keys.js";
import Phaser from "../library/phaser.js";
import {SCENE_KEYS} from "./scene-keys.js";

export class PreloadScene extends Phaser.Scene {
    constructor() {
        super({
            key: SCENE_KEYS.PRELOAD_SCENE,
            //active: true, //another way to start scene
        });
        console.log(SCENE_KEYS.PRELOAD_SCENE);
    }

    //lifecycle events
    //init() {console.log("init");}

    //preloading images
    preload() {
        //console.log("preload");
        console.log(`[${PreloadScene.name}:preload] invoked`);

        const monsterTamerAssetPath = "assets/images/monster-tamer";
        const kenneysAssetPath = "assets/images/kenneys-assets";

        //battle backgrounds
        this.load.image(
            BATTLE_BACKGROUND_ASSET_KEYS.FOREST, 
            `${monsterTamerAssetPath}/battle-backgrounds/forest-background2.png`
        );

        //battle assets
        this.load.image(
            BATTLE_ASSET_KEYS.HEALTH_BAR_BACKGROUND, 
            `${kenneysAssetPath}/ui-space-expansion/custom-ui.png`
        );

        //health bar assets
        this.load.image(
            HEALTH_BAR_ASSET_KEYS.RIGHT_CAP, 
            `${kenneysAssetPath}/ui-space-expansion/barHorizontal_green_right.png`
        );
        this.load.image(
            HEALTH_BAR_ASSET_KEYS.MIDDLE, 
            `${kenneysAssetPath}/ui-space-expansion/barHorizontal_green_mid.png`
        );
        this.load.image(
            HEALTH_BAR_ASSET_KEYS.LEFT_CAP, 
            `${kenneysAssetPath}/ui-space-expansion/barHorizontal_green_left.png`
        );

        //health bar SHADOW assets
        this.load.image(
            HEALTH_BAR_ASSET_KEYS.RIGHT_CAP_SHADOW, 
            `${kenneysAssetPath}/ui-space-expansion/barHorizontal_shadow_right.png`
        );
        this.load.image(
            HEALTH_BAR_ASSET_KEYS.MIDDLE_SHADOW, 
            `${kenneysAssetPath}/ui-space-expansion/barHorizontal_shadow_mid.png`
        );
        this.load.image(
            HEALTH_BAR_ASSET_KEYS.LEFT_CAP_SHADOW, 
            `${kenneysAssetPath}/ui-space-expansion/barHorizontal_shadow_left.png`
        );

        //monster assets
        this.load.spritesheet(
            MONSTER_ASSET_KEYS.CARNODUSK, 
            `${monsterTamerAssetPath}/monsters/babyegg_water_emo.png`,{
                frameWidth: 320,
                frameHeight:320,
                endFrame: 56,
            }
        );
        this.load.spritesheet(
            MONSTER_ASSET_KEYS.IGUANIGNITE, 
            `${monsterTamerAssetPath}/monsters/babyKittyegg_emoG.png`,{
                frameWidth: 320,
                frameHeight:320,
                endFrame: 57,
            }
        );
        // this.load.image(
        //     MONSTER_ASSET_KEYS.IGUANIGNITE, 
        //     `${monsterTamerAssetPath}/monsters/iguanignite.png`
        // );

        //ui assets
        this.load.image(
            UI_ASSET_KEYS.CURSOR, 
            `${monsterTamerAssetPath}/ui/cursor.png`
        );

        //load json data
        this.load.json(DATA_ASSET_KEYS.ATTACKS, "assets/data/attacks.json");
    }

    create() {
        console.log(`[${PreloadScene.name}:create] invoked`);
        //console.log(this.textures.get("background"));

        this.scene.start(SCENE_KEYS.BATTLE_SCENE);
        //drawing test
        //corner left = 0,0 -> thats where it starts off
        //this.add.image(0, 0, BATTLE_BACKGROUND_ASSET_KEYS.FOREST).setOrigin(0);
        //this.add.image(this.scale.width / 2, this.scale.height / 2,  BATTLE_BACKGROUND_ASSET_KEYS.FOREST);
    }

    //update() {console.log("update");}
}