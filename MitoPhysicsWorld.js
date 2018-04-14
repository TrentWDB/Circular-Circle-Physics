/**
 * Created by Trent on 4/13/2018.
 */

'use strict';

const MitoPhysicsWorld = class MitoPhysicsWorld {
    constructor() {
        this._physicsBodyList = [];
    }

    update(interval) {
        for (let i = 0; i < this._physicsBodyList.length; i++) {
            this._physicsBodyList[i].update(interval);
        }
    }

    addPhysicsBody(physicsBody) {
        this._physicsBodyList.push(physicsBody);
    }
};