/**
 * Created by Trent on 4/13/2018.
 */

'use strict';

const MitoPhysicsBody = class MitoPhysicsBody {
    constructor() {
        this._position = [0, 0];
        this._velocity = [0, 0];
        this._acceleration = [0, 0];

        this._angle = 0;
        this._angleVelocity = 0;
        this._angleAcceleration = 0;

        this._centerOfMass = [0, 0];

        this._mass = 0;

        this._physicsBodyList = [];
        this._circleList = [];
    }

    update(interval) {
        this._position[0] += this._velocity[0] * interval;
        this._position[1] += this._velocity[1] * interval;
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

    getAcceleration() {
        return this._acceleration;
    }

    setAccleration(acceleration) {
        this._acceleration = acceleration;
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

    getAngleAcceleration() {
        return this._angleAcceleration;
    }

    setAngleAcceleration(angleAcceleration) {
        this._angleAcceleration = angleAcceleration;
    }

    getMass() {
        return this._mass;
    }

    updateMass() {
        let mass = 0;

        for (let i = 0; i < this._physicsBodyList.length; i++) {
            this._physicsBodyList[i].updateMass();
            mass += this._physicsBodyList[i].getMass();
        }

        for (let i = 0; i < this._circleList.length; i++) {
            mass += this._circleList[i].getMass();
        }

        this._mass = mass;
    }

    getCenterOfMass() {
        return this._centerOfMass;
    }

    setCenterOfMass(centerOfMass) {
        this._centerOfMass = centerOfMass;
    }

    getPhysicsBodyList() {
        return this._physicsBodyList;
    }

    addPhysicsBody(physicsBody) {
        this._physicsBodyList.push(physicsBody);
    }

    getCircleList() {
        return this._circleList;
    }

    addCircle(circle) {
        this._circleList.push(circle);
    }

};