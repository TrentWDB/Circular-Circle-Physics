/**
 * Created by Trent on 4/13/2018.
 */

'use strict';

const MitoPhysicsWorld = class MitoPhysicsWorld {
    constructor() {
        this._collisionTimesQueue = new MitoPriorityQueue();
        this._collisionTimesToCollisionEventListMap = {};

        this._physicsBodyList = [];
        this._physicsBodyIDToPhysicsBodyMap = {};

        this._unprocessedPhysicsBodyList = [];
        this._physicsBodyIDToCollisionEventListMap = {};
    }

    update(interval) {
        // get initial collisions
        for (let i = 0; i < this._physicsBodyList.length; i++) {
            let bodyA = this._physicsBodyList[i];

            for (let a = i + 1; a < this._physicsBodyList.length; a++) {
                let bodyB = this._physicsBodyList[a];

                this._determinePhysicsBodyCollisions(bodyA, bodyB, interval, 0);
            }
        }

        // TODO do this better with the quad tree
        let processedInterval = 0;
        while (interval > processedInterval) {
            let remainingInterval = interval - processedInterval;

            // process any collisions that occur on this tick
            let collisionEvents = this._collisionTimesToCollisionEventListMap[processedInterval] || [];
            for (let i = 0; i < collisionEvents.length; i++) {
                let collisionEvent = collisionEvents[i];
                let bodyA = collisionEvent.bodyA;
                let bodyB = collisionEvent.bodyB;
                let collisionPoint = collisionEvent.point;
                let normal = collisionEvent.normal;
                let collisionPointVelocityA = collisionEvent.pointVelocityA;
                let collisionPointVelocityB = collisionEvent.pointVelocityB;

                while (bodyA.getParentPhysicsBody()) {
                    bodyA = bodyA.getParentPhysicsBody();
                }
                while (bodyB.getParentPhysicsBody()) {
                    bodyB = bodyB.getParentPhysicsBody();
                }

                // process the collision
                this._fakeTimMethod(bodyA, bodyB, collisionPoint, normal, collisionPointVelocityA, collisionPointVelocityB);

                this._unprocessedPhysicsBodyList.push(bodyA);
                this._unprocessedPhysicsBodyList.push(bodyB);
            }

            // remove all collision events that include the unprocessed physics bodies
            for (let i = 0; i < this._unprocessedPhysicsBodyList.length; i++) {
                let physicsBody = this._unprocessedPhysicsBodyList[i];
                let collisionEventList = this._physicsBodyIDToCollisionEventListMap[physicsBody.getID()];

                // if there are no collision events its because the collided physics body already handled it
                if (!collisionEventList) {
                    continue;
                }

                for (let a = 0; a < collisionEventList.length; a++) {
                    let event = collisionEventList[a];
                    let time = event.time;

                    // remove the current event from the event list
                    if (this._collisionTimesToCollisionEventListMap[time]) {
                        this._collisionTimesToCollisionEventListMap[time] = this._collisionTimesToCollisionEventListMap[time].filter(currentEvent => {
                            return currentEvent !== event;
                        });

                        // if the new event list is empty then delete it and remove its queue entry
                        if (this._collisionTimesToCollisionEventListMap[time].length === 0) {
                            this._collisionTimesQueue.remove(time);
                            delete this._collisionTimesToCollisionEventListMap[time];
                        }
                    }
                }

                // delete the processed physics body id to event list entry
                delete this._physicsBodyIDToCollisionEventListMap[physicsBody.getID()];
            }

            // process the unprocessed/updated physics bodies
            for (let i = 0; i < this._unprocessedPhysicsBodyList.length; i++) {
                let bodyA = this._unprocessedPhysicsBodyList[i];

                for (let a = 0; a < this._physicsBodyList.length; a++) {
                    let bodyB = this._physicsBodyList[a];
                    if (bodyA === bodyB) {
                        continue;
                    }

                    this._determinePhysicsBodyCollisions(bodyA, bodyB, [0, 0], [0, 0], [0, 0], [0, 0], remainingInterval, processedInterval);
                }
            }

            this._unprocessedPhysicsBodyList = [];

            // move forward in time to the next collision or the end of the tick
            let nextCollisionTime = this._collisionTimesQueue.pop();
            if (nextCollisionTime === null) {
                nextCollisionTime = interval;
            }

            for (let i = 0; i < this._physicsBodyList.length; i++) {
                this._physicsBodyList[i].update(nextCollisionTime - processedInterval);
            }

            processedInterval = nextCollisionTime;
        }
    }

    addPhysicsBody(physicsBody) {
        // TODO add this in only after next tick
        this._physicsBodyList.push(physicsBody);
        this._physicsBodyIDToPhysicsBodyMap[physicsBody.getID()] = physicsBody;
    }

    _determinePhysicsBodyCollisions(bodyA, bodyB, interval, timeOffset) {
        let boundingCircleA = bodyA.getBoundingCircle();
        let boundingCircleB = bodyB.getBoundingCircle();
        let positionA = bodyA.getWorldPosition();
        let positionB = bodyB.getWorldPosition();
        let velocityA = bodyA.getWorldVelocity();
        let velocityB = bodyB.getWorldVelocity();

        let potentialCollision = MitoMathHelper.detectMitoBoundingCirclePotentialCollision(boundingCircleA, boundingCircleB, positionA, positionB, velocityA, velocityB, interval);
        if (!potentialCollision) {
            return;
        }

        // continue down the tree of physics objects
        let physicsBodyListA = bodyA.getPhysicsBodyList();
        let physicsBodyListB = bodyB.getPhysicsBodyList();

        // body a and body b children
        for (let i = 0; i < physicsBodyListB.length; i++) {
            this._determinePhysicsBodyCollisions(bodyA, physicsBodyListB[i], interval, timeOffset);
        }

        // body b and body a children
        for (let i = 0; i < physicsBodyListA.length; i++) {
            this._determinePhysicsBodyCollisions(physicsBodyListA[i], bodyB, interval, timeOffset);
        }

        // all children
        for (let i = 0; i < physicsBodyListA.length; i++) {
            for (let a = 0; a < physicsBodyListB.length; a++) {
                this._determinePhysicsBodyCollisions(physicsBodyListA[i], physicsBodyListB[a], interval, timeOffset);
            }
        }

        // test circles within these physics objects if applicable
        let circleListA = bodyA.getCircleList();
        let circleListB = bodyB.getCircleList();
        for (let i = 0; i < circleListA.length; i++) {
            let circleA = circleListA[i];

            for (let a = 0; a < circleListB.length; a++) {
                let circleB = circleListB[a];

                let relativeTime = MitoMathHelper.detectMitoCircleCollisionTime(circleA, circleB, interval);
                if (relativeTime === null) {
                    continue;
                }

                let circlePositionA = circleA.getWorldPosition();
                let circlePositionB = circleB.getWorldPosition();
                let circleVelocityA = circleA.getWorldVelocity();
                let circleVelocityB = circleB.getWorldVelocity();

                let futurePositionA = [circlePositionA[0] + circleVelocityA[0] * relativeTime, circlePositionA[1] + circleVelocityA[1] * relativeTime];
                let futurePositionB = [circlePositionB[0] + circleVelocityB[0] * relativeTime, circlePositionB[1] + circleVelocityB[1] * relativeTime];
                let collisionPoint = MitoMathHelper.detectCollidingCirclesCollisionPoint(circleA, circleB, futurePositionA, futurePositionB);

                let collisionNormalB = [collisionPoint[0] - circlePositionB[0], collisionPoint[1] - circlePositionB[1]];
                collisionNormalB[0] /= circleB.getRadius();
                collisionNormalB[1] /= circleB.getRadius();

                // push the collision event info
                let time = timeOffset + relativeTime;
                let collisionEvent = this._createCollisionEvent(time, bodyA, bodyB, collisionPoint, collisionNormalB, circleVelocityA, circleVelocityB);

                this._collisionTimesQueue.insert(time);

                this._collisionTimesToCollisionEventListMap[time] = this._collisionTimesToCollisionEventListMap[time] || [];
                this._collisionTimesToCollisionEventListMap[time].push(collisionEvent);

                this._physicsBodyIDToCollisionEventListMap[bodyA.getID()] = this._physicsBodyIDToCollisionEventListMap[bodyA.getID()] || [];
                this._physicsBodyIDToCollisionEventListMap[bodyA.getID()].push(collisionEvent);

                this._physicsBodyIDToCollisionEventListMap[bodyB.getID()] = this._physicsBodyIDToCollisionEventListMap[bodyB.getID()] || [];
                this._physicsBodyIDToCollisionEventListMap[bodyB.getID()].push(collisionEvent);
            }
        }
    }

    _fakeTimMethod(bodyA, bodyB, collisionPoint, normalB, collisionPointVelocityA, collisionPointVelocityB) {
        let velocityA = bodyA.getVelocity();
        let velocityB = bodyB.getVelocity();
        let angularVelocityA = bodyA.getAngularVelocity();
        let angularVelocityB = bodyB.getAngularVelocity();
        let centerOfMassA = bodyA.getWorldCenterOfMass();
        let centerOfMassB = bodyB.getWorldCenterOfMass();
        let massA = bodyA.getMass();
        let massB = bodyB.getMass();

        let impulseParameter = MitoMathHelper.calculateImpulseParameter(bodyA, bodyB, collisionPoint, normalB, collisionPointVelocityA, collisionPointVelocityB);
        if (impulseParameter === null) {
            return;
        }

        let appliedNormal = [impulseParameter * normalB[0], impulseParameter * normalB[1]];
        let collisionRadiusA = [collisionPoint[0] - centerOfMassA[0], collisionPoint[1] - centerOfMassA[1]];
        let collisionRadiusB = [collisionPoint[0] - centerOfMassB[0], collisionPoint[1] - centerOfMassB[1]];

        let resultingVelocityA = [velocityA[0] + appliedNormal[0] / massA, velocityA[1] + appliedNormal[1] / massA];
        let resultingVelocityB = [velocityB[0] - appliedNormal[0] / massB, velocityB[1] - appliedNormal[1] / massB];

        let resultingAngularVelocityA = angularVelocityA + MitoMathHelper.crossProduct(collisionRadiusA, appliedNormal) / bodyA.getMomentOfInertia();
        let resultingAngularVelocityB = angularVelocityB - MitoMathHelper.crossProduct(collisionRadiusB, appliedNormal) / bodyB.getMomentOfInertia();

        bodyA.setVelocity(resultingVelocityA[0], resultingVelocityA[1]);
        bodyA.setAngularVelocity(resultingAngularVelocityA);
        bodyB.setVelocity(resultingVelocityB[0], resultingVelocityB[1]);
        bodyB.setAngularVelocity(resultingAngularVelocityB);
    }

    _createCollisionEvent(time, bodyA, bodyB, collisionPoint, normalB, collisionPointVelocityA, collisionPointVelocityB) {
        return {
            time: time,
            bodyA: bodyA,
            bodyB: bodyB,
            point: collisionPoint,
            normal: normalB,
            pointVelocityA: collisionPointVelocityA,
            pointVelocityB: collisionPointVelocityB,
        }
    }
};