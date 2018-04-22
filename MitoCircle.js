/**
 * Created by Trent on 4/13/2018.
 */

'use strict';

const MitoCircle = class MitoCircle {
    constructor() {
        this._parentPhysicsBody = null;

        this._position = [0, 0];
        this._radius = 0;

        this._density = 1;

        this._boundingCircle = new MitoBoundingCircle();
    }

    getPosition() {
        return this._position;
    }

    setPosition(x, y) {
        this._position[0] = x;
        this._position[1] = y;
    }

    getWorldPosition() {
        let parentPosition = this._parentPhysicsBody ? this._parentPhysicsBody.getWorldPosition() : [0, 0];
        let parentAngle = this._parentPhysicsBody ? this._parentPhysicsBody.getWorldAngle() : 0;

        let position = MitoMathHelper.rotatePoint(this._position, parentAngle);

        return [parentPosition[0] + position[0], parentPosition[1] + position[1]];
    }

    getWorldVelocity() {
        let parentVelocity = this._parentPhysicsBody ? this._parentPhysicsBody.getWorldVelocity() : [0, 0];
        let parentAngularVelocity = this._parentPhysicsBody ? this._parentPhysicsBody.getWorldAngularVelocity() : 0;

        let appliedAngularVelocity = MitoMathHelper.applyAngularVelocity(parentAngularVelocity, MitoMathHelper.rotatePoint(this._position, parentAngularVelocity));

        return [parentVelocity[0] + appliedAngularVelocity[0], parentVelocity[1] + appliedAngularVelocity[1]];
    }

    getRadius() {
        return this._radius;
    }

    setRadius(radius) {
        this._radius = radius;
    }

    getDensity() {
        return this._density;
    }

    getBoundingCircle() {
        return this._boundingCircle;
    }

    updateBoundingCircle() {
        this._boundingCircle.setRadius(this._radius);
    }

    getMass() {
        return Math.PI * this._radius * this._radius * this._density;
    }

    getParentPhysicsBody() {
        return this._parentPhysicsBody;
    }

    setParentPhysicsBody(physicsBody) {
        this._parentPhysicsBody = physicsBody;
    }
};