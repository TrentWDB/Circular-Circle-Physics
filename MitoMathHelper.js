/**
 * Created by Trent on 4/13/2018.
 */

const MitoMathHelper = class MitoMathHelper {
    /**
     * Calculates the time at which two circles will collide between 0 - 1.
     * @param circleA
     * @param velocityA
     * @param circleB
     * @param velocityB
     * @param interval - tick interval
     * @returns {*}
     * @private
     */
    static _detectCollisionTime(circleA, velocityA, circleB, velocityB, interval) {
        let velocityIntA = MitoMathHelper._multiplyPoint(velocityA, interval);
        let invertedVelocityB = MitoMathHelper._invertPoint(MitoMathHelper._multiplyPoint(velocityB, interval));
        let combineVelocity = MitoMathHelper._addPoints(velocityIntA, invertedVelocityB);
        let combineMagnitude = Math.hypot(combineVelocity[0], combineVelocity[1]);
        let detectEarlyEscape = MitoMathHelper._detectCollision(
            circleA.getPosition(),
            circleA.getRadius() + combineMagnitude,
            circleB.getPosition(),
            circleB.getRadius(),
        );
        //Early escape: Calculate bounds based on combine velocities
        if (!detectEarlyEscape) {
            return null;
        }

        //Calculate closest point on combined velocities to circleB
        let appliedVelocitiesToPositionA = MitoMathHelper._addPoints(circleA.getPosition(), combineVelocity);
        let closestPoint = MitoMathHelper._getClosestPoint(
            circleA.getPosition(),
            appliedVelocitiesToPositionA,
            circleB.getPosition(),
        );

        //If closest circle is in range calculate back off distance
        //Tick percentage should be between 0 - 1
        let distance = MitoMathHelper._distanceBetweenTwoPointsSquared(closestPoint, circleB.getPosition());
        let radiusTotal = circleA.getRadius() + circleB.getRadius();
        radiusTotal *= radiusTotal;
        if (radiusTotal >= distance) {
            let backOff = Math.sqrt(radiusTotal - distance);
            let backPoint = [backOff * (combineVelocity[0] / combineMagnitude), backOff * (combineVelocity[1] / combineMagnitude)];
            let closestPointWithinVelocity = MitoMathHelper._addPoints(closestPoint, MitoMathHelper._invertPoint(backPoint));
            let distanceBetween = MitoMathHelper._distanceBetweenTwoPoints(circleA.getPosition(), closestPointWithinVelocity);
            let tickPercentage = distanceBetween / combineMagnitude;
            if (tickPercentage < 0 || tickPercentage > 1) {
                return null;
            }

            return tickPercentage;
        }

        return null;
    }

    /**
     * returns distance ^ 2
     * @param pointA
     * @param pointB
     * @returns {number}
     * @private
     */
    static _distanceBetweenTwoPointsSquared(pointA, pointB) {
        let xDifference = pointB[0] - pointA[0];
        let yDifference = pointB[1] - pointA[1];

        return xDifference * xDifference + yDifference * yDifference;
    }

    /**
     * returns distance between two points
     * @param pointA
     * @param pointB
     * @returns {number}
     * @private
     */
    static _distanceBetweenTwoPoints(pointA, pointB) {
        return Math.hypot(pointB[0] - pointA[0], pointB[1] - pointA[1]);
    }

    /**
     * detects if two circles overlap
     * @param pointA
     * @param radiusA
     * @param pointB
     * @param radiusB
     * @returns {boolean}
     * @private
     */
    static _detectCollision(pointA, radiusA, pointB, radiusB) {
        let distance = Math.hypot(
            pointA[0] - pointB[0],
            pointA[1] - pointB[1],
        );
        let radiusTotal = radiusA + radiusB;

        return radiusTotal >= distance;
    }

    /**
     * return the closest point on a line to a single point
     * @param linePointA
     * @param linePointB
     * @param singlePoint
     * @returns {*}
     * @private
     */
    static _getClosestPoint(linePointA, linePointB, singlePoint) {
        let aToP = [singlePoint[0] - linePointA[0], singlePoint[1] - linePointA[1]];
        let aToB = [linePointB[0] - linePointA[0], linePointB[1] - linePointA[1]];
        let aToBSquared = (aToB[0] * aToB[0]) + (aToB[1] * aToB[1]);
        if (aToBSquared === 0) {
            return linePointA;
        }

        let aToPDoToAToB = (aToP[0] * aToB[0]) + (aToP[1] * aToB[1]);
        let normalizedDistance = aToPDoToAToB / aToBSquared;
        return [linePointA[0] + (aToB[0] * normalizedDistance), linePointA[1] + (aToB[1] * normalizedDistance)]
    }

    /**
     * add two points
     * @param pointA
     * @param pointB
     * @returns {*[]}
     * @private
     */
    static _addPoints(pointA, pointB) {
        return [pointA[0] + pointB[0], pointA[1] + pointB[1]];
    }

    /**
     * invert a point
     * @param point
     * @returns {*[]}
     * @private
     */
    static _invertPoint(point) {
        return [-point[0], -point[1]];
    }

    /**
     * multiply a point by a number
     * @param point
     * @param value
     * @returns {*[]}
     * @private
     */
    static _multiplyPoint(point, value) {
        return [point[0] * value, point[1] * value];
    }

    /** subtracts motion2 from motion1 and returns resulting motion
     * @param motion1
     * @param motion2
     * @returns Array of resulting motion
     * @private
     */
    static _subtractTranslationalMotion(motion1, motion2) {
        let resultingMotion = [];
        resultingMotion[0] = motion1[0] - motion2[0];
        resultingMotion[1] = motion1[1] - motion2[1];

        return resultingMotion;
    }

    /** gives motion1's resulting motion relative to translative reference motion2
     * @param motion1
     * @param motion2
     * @returns Array of resulting translation motion after collision
     * @private
     */
    static _relativeMotion1WRT2(motion1, motion2) {
        let motion1WRT2 = MitoMathHelper._subtractTranslationalMotion(motion1, motion2);
        return MitoMathHelper._addPoints(motion2, motion1WRT2);
    }

    /**
     * returns magnitude of a motion
     * @param motion
     * @returns {number}
     * @private
     */
    static _getMagnitude(motion) {
        return Math.hypot(motion[0], motion[1]);
    }

    /**
     * returns momentum (p = mv)
     * @param body
     * @returns {*}
     * @private
     */
    static _getMomentum(body) {
        return body.getMass() + MitoMathHelper._getMagnitude(body.getVelocity());
    }

    /**
     * returns angle in radians between two bodies
     * @param bodyA
     * @param bodyB
     * @returns {number}
     * @private
     */
    static _getAngleBetweenBodies(bodyA, bodyB) {
        let positionA = bodyA.getPosition();
        let positionB = bodyB.getPosition();
        return Math.atan2(positionB[1] - positionA[1], positionB[0] - positionA[0]);
    }

    /**
     * returns final velocity of bodyA after a perfectly elastic collision
     * @param bodyA
     * @param bodyB
     * @returns {number}
     * @private
     */
    static _getResultingVelocityOfElasticCollision(bodyA, bodyB) {
        let massB = bodyB.getMass();
        let massA = bodyA.getMass();
        let velocityA = MitoMathHelper._getMagnitude(bodyA.getVelocity());
        let momentumB = MitoMathHelper._getMomentum(bodyB);
        let momentumA = MitoMathHelper._getMomentum(bodyA);

        return (2 * momentumB + momentumA - massB * velocityA) / (massA + massB);
    }

    /**
     * returns outgoing angle of bodyA after a perfectly elastic collision
     * @param bodyA
     * @param finalVelocityA
     * @param bodyB
     * @param finalVelocityB
     * @returns {number}
     * @private
     */
    static _getOutgoingAngleOfElasticCollision(bodyA, finalVelocityA, bodyB, finalVelocityB) {
        let massA = bodyA.getMass();
        let massB = bodyB.getMass();
        let momentumA = MitoMathHelper._getMomentum(bodyA);
        let momentumB = MitoMathHelper._getMomentum(bodyB);
        let incomingAngle = MitoMathHelper._getAngleBetweenBodies(bodyA, bodyB);
        let cosAngle = Math.cos(incomingAngle);

        return cosAngle * (momentumA + momentumB) / (massA * finalVelocityA + massB * finalVelocityB);
    }

    /**
     * returns an array of 2 velocities after a perfect elastic collision
     * @param bodyA
     * @param bodyB
     * @returns {*[]}
     */
    //TODO: verify this code actually works...
    static resolveTranslationalElasticCollisions(bodyA, bodyB) {
        let velocityA = MitoMathHelper._getMagnitude(bodyA.getVelocity());
        let velocityB = MitoMathHelper._getMagnitude(bodyB.getVelocity());
        let finalVelocityA = MitoMathHelper._getResultingVelocityOfElasticCollision(bodyA, bodyB);
        let finalVelocityB = velocityA + finalVelocityA - velocityB;
        let outGoingAngleA = MitoMathHelper._getOutgoingAngleOfElasticCollision(bodyA, finalVelocityA, bodyB, finalVelocityB);
        let outGoingAngleB = MitoMathHelper._getOutgoingAngleOfElasticCollision(bodyB, finalVelocityB, bodyA, finalVelocityA);

        let finalVelocityAX = finalVelocityA * Math.cos(outGoingAngleA);
        let finalVelocityAY = finalVelocityA * Math.sin(outGoingAngleA);
        let finalVelocityBX = finalVelocityB * Math.cos(outGoingAngleB);
        let finalVelocityBY = finalVelocityB * Math.sin(outGoingAngleB);

        return [[finalVelocityAX, finalVelocityAY], [finalVelocityBX, finalVelocityBY]];
    }
};