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

                this._determinePhysicsBodyCollisions(bodyA, bodyB, [0, 0], [0, 0], [0, 0], [0, 0], interval, 0);
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
                let bodyList = collisionEvent.bodies;
                let collisionPoint = collisionEvent.point;

                // process the collision
                this._fakeTimMethod(bodyList[0], bodyList[1], collisionPoint);

                this._unprocessedPhysicsBodyList.push(bodyList[0]);
                this._unprocessedPhysicsBodyList.push(bodyList[1]);
            }

            // remove all collision events that include the unprocessed physics bodies
            for (let i = 0; i < this._unprocessedPhysicsBodyList.length; i++) {
                let physicsBody = this._unprocessedPhysicsBodyList[i];
                let collisionEventList = this._physicsBodyIDToCollisionEventListMap[physicsBody.getID()];

                for (let a = 0; a < collisionEventList.length; a++) {
                    let event = collisionEventList[a];
                    let time = event.time;

                    // remove the current event from the event list
                    this._collisionTimesToCollisionEventListMap[time] = this._collisionTimesToCollisionEventListMap[time].filter(currentEvent => {
                        return currentEvent !== event;
                    });
                    // if the new event list is empty then delete it and remove its queue entry
                    if (this._collisionTimesToCollisionEventListMap[time].length === 0) {
                        this._collisionTimesQueue.remove(time);
                        delete this._collisionTimesToCollisionEventListMap[time];
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

    _determinePhysicsBodyCollisions(bodyA, bodyB, positionOffsetA, positionOffsetB, velocityOffsetA, velocityOffsetB, interval, timeOffset) {
        let boundingCircleA = bodyA.getBoundingCircle();
        let boundingCircleB = bodyB.getBoundingCircle();

        let relativePositionA = bodyA.getPosition();
        let relativePositionB = bodyB.getPosition();
        let positionA = [positionOffsetA[0] + relativePositionA[0], positionOffsetA[1] + relativePositionA[1]];
        let positionB = [positionOffsetB[0] + relativePositionB[0], positionOffsetB[1] + relativePositionB[1]];

        let relativeVelocityA = bodyA.getVelocity();
        let relativeVelocityB = bodyB.getVelocity();
        let velocityA = [velocityOffsetA[0] + relativeVelocityA[0], velocityOffsetA[1] + relativeVelocityA[1]];
        let velocityB = [velocityOffsetB[0] + relativeVelocityB[0], velocityOffsetB[1] + relativeVelocityB[1]];

        let potentialCollision = MitoMathHelper.detectMitoBoundingCirclePotentialCollision(boundingCircleA, boundingCircleB, positionA, positionB, velocityA, velocityB, interval);
        if (!potentialCollision) {
            return;
        }

        // continue down the tree of physics objects
        let physicsBodyListA = bodyA.getPhysicsBodyList();
        let physicsBodyListB = bodyB.getPhysicsBodyList();

        // body a and body b children
        for (let i = 0; i < physicsBodyListB.length; i++) {
            this._determinePhysicsBodyCollisions(bodyA, physicsBodyListB[i], positionOffsetA, positionB, velocityOffsetA, velocityB, interval);
        }

        // body b and body a children
        for (let i = 0; i < physicsBodyListA.length; i++) {
            this._determinePhysicsBodyCollisions(physicsBodyListA[i], bodyB, positionA, positionOffsetB, velocityA, velocityOffsetB, interval);
        }

        // all children
        for (let i = 0; i < physicsBodyListA.length; i++) {
            for (let a = 0; a < physicsBodyListB.length; a++) {
                this._determinePhysicsBodyCollisions(physicsBodyListA[i], physicsBodyListB[a], positionA, positionB, velocityA, velocityB, interval);
            }
        }

        // test circles within these physics objects if applicable
        let circleListA = bodyA.getCircleList();
        let circleListB = bodyB.getCircleList();
        for (let i = 0; i < circleListA.length; i++) {
            let circleA = circleListA[i];

            for (let a = 0; a < circleListB.length; a++) {
                let circleB = circleListB[a];

                let relativeTime = MitoMathHelper.detectMitoCircleCollisionTime(circleA, circleB, positionA, positionB, velocityA, velocityB, interval);
                if (relativeTime === null) {
                    continue;
                }

                let collisionPoint = MitoMathHelper.detectCollidingCirclesCollisionPoint(circleA, circleB, positionA, positionB);

                // push the collision event info
                let time = timeOffset + relativeTime;
                let collisionEvent = this._createCollisionEvent(time, bodyA, bodyB, collisionPoint);

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

    _fakeTimMethod(bodyA, bodyB, collisionPoint) {
        // use the collision point, and each bodies velocity, angular velocity, mass, and center of mass to determine
        // and set each bodies resulting velocity and angular velocity
    }

    _createCollisionEvent(time, bodyA, bodyB, collisionPoint) {
        return {
            time: time,
            bodies: [bodyA, bodyB],
            point: collisionPoint,
        }
    }
};