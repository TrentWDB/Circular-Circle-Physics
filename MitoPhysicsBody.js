/**
 * Created by Trent on 4/13/2018.
 */

'use strict';

const MitoPhysicsBody = class MitoPhysicsBody {
    constructor() {
        this._id = MitoPhysicsBody._nextID++;

        this._parentPhysicsBody = null;

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

    getID() {
        return this._id;
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
        let averagePosition = [0, 0];
        let maxDistance = 0;

        // update and get the average position of all physics body bounding circles
        for (let i = 0; i < this._physicsBodyList.length; i++) {
            let physicsBody = this._circleList[i];
            let physicsBodyPosition = physicsBody.getPosition();
            physicsBody.updateBoundingCircle();

            let boundingCircle = this._physicsBodyList[i].getBoundingCircle();
            let boundingCirclePosition = boundingCircle.getPosition();

            let position = [physicsBodyPosition[0] + boundingCirclePosition[0], physicsBodyPosition[1] + boundingCirclePosition[1]];

            averagePosition[0] += position[0];
            averagePosition[1] += position[1];
        }

        // update and get the average position of all circle bounding circles
        for (let i = 0; i < this._circleList.length; i++) {
            let circle = this._circleList[i];
            let circlePosition = circle.getPosition();
            circle.updateBoundingCircle();

            let boundingCircle = this._circleList[i].getBoundingCircle();
            let boundingCirclePosition = boundingCircle.getPosition();

            let position = [circlePosition[0] + boundingCirclePosition[0], circlePosition[1] + boundingCirclePosition[1]];

            averagePosition[0] += position[0];
            averagePosition[1] += position[1];
        }

        averagePosition[0] /= this._physicsBodyList.length + this._circleList.length;
        averagePosition[1] /= this._physicsBodyList.length + this._circleList.length;

        // get maximum distance to a physics body bounding circle edge
        for (let i = 0; i < this._physicsBodyList.length; i++) {
            let physicsBody = this._circleList[i];
            let physicsBodyPosition = physicsBody.getPosition();

            let boundingCircle = this._physicsBodyList[i].getBoundingCircle();
            let boundingCirclePosition = boundingCircle.getPosition();

            let position = [physicsBodyPosition[0] + boundingCirclePosition[0], physicsBodyPosition[1] + boundingCirclePosition[1]];
            let radius = boundingCircle.getRadius();

            let dx = position[0] - averagePosition[0];
            let dy = position[1] - averagePosition[1];

            maxDistance = Math.max(Math.sqrt(dx * dx + dy * dy) + radius, maxDistance);
        }

        // get maximum distance to a circle bounding circle edge
        for (let i = 0; i < this._circleList.length; i++) {
            let circle = this._circleList[i];
            let circlePosition = circle.getPosition();

            let boundingCircle = this._circleList[i].getBoundingCircle();
            let boundingCirclePosition = boundingCircle.getPosition();

            let position = [circlePosition[0] + boundingCirclePosition[0], circlePosition[1] + boundingCirclePosition[1]];
            let radius = boundingCircle.getRadius();

            let dx = position[0] - averagePosition[0];
            let dy = position[1] - averagePosition[1];

            maxDistance = Math.max(Math.sqrt(dx * dx + dy * dy) + radius, maxDistance);
        }

        console.log(maxDistance);

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

    setParentPhysicsBody(physicsBody) {
        this._parentPhysicsBody = physicsBody;
    }
};

MitoPhysicsBody._nextID = 1;