/**
 * Created by Trent on 4/13/2018.
 */

'use strict';

const MitoPhysicsBody = class MitoPhysicsBody {
    constructor() {
        this._position = [0, 0];
        this._velocity = [0, 0];
        this._angle = 0;
        this._angleVelocity = 0;

        this._physicsBodyList = [];
        this._circleList = [];
    }

    getPosition() {
        return this._position;
    }

    setPosition(x, y) {
        this._position[0] = x;
        this._position[1] = y;
    }

    getVelocity() {
        return this._velocity;
    }

    setVelocity(x, y) {
        this._velocity[0] = x;
        this._velocity[1] = y;
    }

    getAngle() {
        return this._angle;
    }

    setAngle(angle) {
        this._angle = angle;
    }

    getAngleVelocity() {
        return this._angleVelocity;
    }

    setAngleVelocity(angleVelocity) {
        this._angleVelocity = angleVelocity;
    }

    getPhysicsBodyList() {
        return this._physicsBodyList;
    }

    getCircleList() {
        return this._circleList;
    }
};