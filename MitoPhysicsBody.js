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

        this._mass = 0;
        this._centerOfMass = [0, 0];

        this._physicsBodyList = [];
        this._circleList = [];

        this._boundingCircle = new MitoBoundingCircle();
    }

    update(interval) {
        this._position[0] += this._velocity[0] * interval;
        this._position[1] += this._velocity[1] * interval;
        this._angle += this._angleVelocity * interval;
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

    updateCenterOfMass() {
        let mass = 0;
        let centerOfMass = [0, 0];

        for (let i = 0; i < this._physicsBodyList.length; i++) {
            this._physicsBodyList[i].updateCenterOfMass();

            let childMass = this._physicsBodyList[i].getMass();
            let childCenterOfMass = this._physicsBodyList[i].getCenterOfMass();

            mass += childMass;
            centerOfMass[0] += childCenterOfMass[0] * childMass;
            centerOfMass[1] += childCenterOfMass[1] * childMass;
        }

        for (let i = 0; i < this._circleList.length; i++) {
            let childMass = this._circleList[i].getMass();
            let childCenterOfMass = this._circleList[i].getPosition();

            mass += childMass;
            centerOfMass[0] += childCenterOfMass[0] * childMass;
            centerOfMass[1] += childCenterOfMass[1] * childMass;
        }

        centerOfMass[0] /= mass;
        centerOfMass[1] /= mass;

        this._centerOfMass[0] = centerOfMass[0];
        this._centerOfMass[1] = centerOfMass[1];
    }

    getBoundingCircle() {
        return this._boundingCircle;
    }

    updateBoundingCircle() {
        let boundingCircleList = [];
        let averagePosition = [0, 0];
        let maxDistance = 0;

        for (let i = 0; i < this._physicsBodyList.length; i++) {
            this._physicsBodyList[i].updateBoundingCircle();
            let boundingCircle = this._physicsBodyList[i].getBoundingCircle();
            let position = boundingCircle.getPosition();

            averagePosition[0] += position[0];
            averagePosition[1] += position[1];

            boundingCircleList.push(boundingCircle);
        }

        for (let i = 0; i < this._circleList.length; i++) {
            this._circleList[i].updateBoundingCircle();
            let boundingCircle = this._circleList[i].getBoundingCircle();
            let position = boundingCircle.getPosition();

            averagePosition[0] += position[0];
            averagePosition[1] += position[1];

            boundingCircleList.push(boundingCircle);
        }

        averagePosition[0] /= boundingCircleList.length;
        averagePosition[1] /= boundingCircleList.length;

        for (let i = 0; i < boundingCircleList.length; i++) {
            let position = boundingCircleList[i].getPosition();
            let radius = boundingCircleList[i].getRadius();

            let dx = position[0] - averagePosition[0];
            let dy = position[1] - averagePosition[1];

            maxDistance = Math.max(Math.sqrt(dx * dx + dy * dy) + radius, maxDistance);
        }

        this._boundingCircle.setPosition(averagePosition[0], averagePosition[1]);
        this._boundingCircle.setRadius(maxDistance);
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