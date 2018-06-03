/**
 * Created by Trent on 4/13/2018.
 */

const MitoBoundingCircle = require('./MitoBoundingCircle');
const MitoMathHelper = require('./MitoMathHelper');

'use strict';

const MitoCircle = class MitoCircle {
    constructor() {
        this._parentPhysicsBody = null;

        this._position = [0, 0];
        this._radius = 0;
        this._scale = 1;

        this._density = 0.001;

        this._boundingCircle = new MitoBoundingCircle();
    }

    getPosition() {
        let scale = this._parentPhysicsBody ? this.getWorldScale() : 1;

        return [this._position[0] * scale, this._position[1] * scale];
    }

    setPosition(x, y) {
        this._position[0] = x;
        this._position[1] = y;
    }

    getWorldPosition() {
        let parentPosition = this._parentPhysicsBody ? this._parentPhysicsBody.getWorldPosition() : [0, 0];
        let parentAngle = this._parentPhysicsBody ? this._parentPhysicsBody.getWorldAngle() : 0;

        let position = MitoMathHelper.rotatePoint(this.getPosition(), parentAngle);

        return [parentPosition[0] + position[0], parentPosition[1] + position[1]];
    }

    getWorldVelocity() {
        let parentVelocity = this._parentPhysicsBody ? this._parentPhysicsBody.getWorldVelocity() : [0, 0];
        let parentAngularVelocity = this._parentPhysicsBody ? this._parentPhysicsBody.getWorldAngularVelocity() : 0;

        let parentPosition = this._parentPhysicsBody ? this._parentPhysicsBody.getWorldPosition() : [0, 0];
        let worldPosition = this.getWorldPosition();
        let rotatedPosition = [worldPosition[0] - parentPosition[0], worldPosition[1] - parentPosition[1]];

        let appliedAngularVelocity = parentAngularVelocity ? MitoMathHelper.convertAngularVelocity(parentAngularVelocity, rotatedPosition) : [0, 0];

        return [parentVelocity[0] + appliedAngularVelocity[0], parentVelocity[1] + appliedAngularVelocity[1]];
    }

    getRadius() {
        let scale = this.getWorldScale();

        return this._radius * scale;
    }

    getRelativeRadius() {
        return this._radius;
    }

    setRadius(radius) {
        this._radius = radius;
    }

    getScale() {
        return this._scale;
    }

    setScale(scale) {
        this._scale = scale;
    }

    getWorldScale() {
        let parentScale = this._parentPhysicsBody ? this._parentPhysicsBody.getWorldScale() : 1;

        return parentScale * this._scale;
    }

    getDensity() {
        return this._density;
    }

    getBoundingCircle() {
        return this._boundingCircle;
    }

    updateBoundingCircle() {
        this._boundingCircle.setRadius(this.getRadius());
    }

    getMass() {
        let radius = this.getRadius();

        return Math.PI * radius * radius * this._density;
    }

    getParentPhysicsBody() {
        return this._parentPhysicsBody;
    }

    setParentPhysicsBody(physicsBody) {
        this._parentPhysicsBody = physicsBody;
    }
};

module.exports = MitoCircle;