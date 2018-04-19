/**
 * Created by Trent on 4/13/2018.
 */

const MitoMathHelper = class MitoMathHelper {
    /**
     * Detects whether or not two bounding circles collide taking velocity into account.
     * @param boundingCircleA
     * @param boundingCircleB
     * @param positionOffsetA
     * @param positionOffsetB
     * @param velocityA
     * @param velocityB
     * @param interval
     * @returns {boolean}
     */
    static detectMitoBoundingCirclePotentialCollision(boundingCircleA, boundingCircleB, positionOffsetA, positionOffsetB, velocityA, velocityB, interval) {
        let relativePositionA = boundingCircleA.getPosition();
        let relativePositionB = boundingCircleB.getPosition();
        let positionA = [positionOffsetA[0] + relativePositionA[0], positionOffsetA[1] + relativePositionA[1]];
        let positionB = [positionOffsetB[0] + relativePositionB[0], positionOffsetB[1] + relativePositionB[1]];
        let radiusA = boundingCircleA.getRadius();
        let radiusB = boundingCircleB.getRadius();

        let distanceA = [velocityA[0] * interval, velocityA[1] * interval];
        let invertedDistanceB = [-velocityB[0] * interval, -velocityB[1] * interval];
        let combinedDistance = [distanceA[0] + invertedDistanceB[0], distanceA[1] + invertedDistanceB[1]];
        let combinedMagnitude = Math.hypot(combinedDistance[0], combinedDistance[1]);
        let maximumDistanceAllowance = radiusA + radiusB + combinedMagnitude;
        let maximumDistanceAllowanceSquared = maximumDistanceAllowance * maximumDistanceAllowance;
        let distanceBetweenCirclesSquared = MitoMathHelper._distanceSquaredBetweenTwoPoints(positionA, positionB);

        return distanceBetweenCirclesSquared <= maximumDistanceAllowanceSquared;
    }

    /**
     * Calculates the time at which two circles will collide in the interval.
     * @param circleA
     * @param circleB
     * @param positionOffsetA
     * @param positionOffsetB
     * @param velocityA
     * @param velocityB
     * @param interval
     * @returns {?number}
     */
    static detectMitoCircleCollisionTime(circleA, circleB, positionOffsetA, positionOffsetB, velocityA, velocityB, interval) {
        let potentialCollision = MitoMathHelper.detectMitoBoundingCirclePotentialCollision(circleA.getBoundingCircle(), circleB.getBoundingCircle(), positionOffsetA, positionOffsetB, velocityA, velocityB, interval);
        if (!potentialCollision) {
            return null;
        }

        let relativePositionA = circleA.getPosition();
        let relativePositionB = circleB.getPosition();
        let positionA = [positionOffsetA[0] + relativePositionA[0], positionOffsetA[1] + relativePositionA[1]];
        let positionB = [positionOffsetB[0] + relativePositionB[0], positionOffsetB[1] + relativePositionB[1]];
        let radiusA = circleA.getRadius();
        let radiusB = circleB.getRadius();

        let distanceA = [velocityA[0] * interval, velocityA[1] * interval];
        let invertedDistanceB = [-velocityB[0] * interval, -velocityB[1] * interval];
        let combinedDistance = [distanceA[0] + invertedDistanceB[0], distanceA[1] + invertedDistanceB[1]];
        let combinedMagnitude = Math.hypot(combinedDistance[0], combinedDistance[1]);

        // if they're moving in the same direction with the same velocity then they're not colliding
        if (!combinedMagnitude) {
            return null;
        }

        // Calculate closest point on combined velocities to circleB
        let positionACombinedDistancePoint = [
            positionA[0] + combinedDistance[0],
            positionA[1] + combinedDistance[1]
        ];
        let positionACombinedDistanceClosestPoint = MitoMathHelper._getClosestPointOnLine(
            [positionA, positionACombinedDistancePoint],
            positionB,
        );

        // If closest circle is in range calculate back off distance
        // Tick percentage should be between 0 - 1
        let positionBToClosestPointDistanceSquared = MitoMathHelper._distanceSquaredBetweenTwoPoints(positionACombinedDistanceClosestPoint, positionB);
        let radiusTotal = radiusA + radiusB;
        let radiusTotalSquared = radiusTotal * radiusTotal;
        if (radiusTotalSquared < positionBToClosestPointDistanceSquared) {
            return null
        }

        let backOffAmount = Math.sqrt(radiusTotalSquared - positionBToClosestPointDistanceSquared); // TODO shouldn't this be Math.sqrt(radiusTotalSquared) - Math.sqrt(positionBToClosestPointDistanceSquared) ?????
        let invertedBackPoint = [-backOffAmount * (combinedDistance[0] / combinedMagnitude), -backOffAmount * (combinedDistance[1] / combinedMagnitude)]; // TODO since this is now invertedBackPoint, shouldn't this be forward point or something?
        let closestPointWithinVelocity = [
            positionACombinedDistanceClosestPoint[0] + invertedBackPoint[0],
            positionACombinedDistanceClosestPoint[1] + invertedBackPoint[1],
        ];
        let distanceBetween = MitoMathHelper._distanceBetweenTwoPoints(positionA, closestPointWithinVelocity);
        let tickPercentage = distanceBetween / combinedMagnitude;
        if (tickPercentage < 0 || tickPercentage > 1) {
            return null;
        }

        return tickPercentage * interval;
    }

    /**
     * Returns the point most likely to be colliding between two colliding circles based on their radii and positions.
     * @param positionOffsetA
     * @param positionOffsetB
     * @param circleA
     * @param circleB
     * @returns {[number, number]}
     */
    static detectCollidingCirclesCollisionPoint(circleA, circleB, positionOffsetA, positionOffsetB) {
        let relativePositionA = circleA.getPosition();
        let relativePositionB = circleB.getPosition();
        let positionA = [positionOffsetA[0] + relativePositionA[0], positionOffsetA[1] + relativePositionA[1]];
        let positionB = [positionOffsetB[0] + relativePositionB[0], positionOffsetB[1] + relativePositionB[1]];
        let radiusA = circleA.getRadius();
        let radiusB = circleB.getRadius();

        let combinedRadii = radiusA + radiusB;
        let percentThrough = radiusA / combinedRadii;

        let dx = positionB[0] - positionA[0];
        let dy = positionB[1] - positionA[1];

        return [positionA[0] + dx * percentThrough, positionA[1] + dy * percentThrough];
    }

    /**
     * Returns distance squared.
     * @param pointA
     * @param pointB
     * @returns {number}
     * @private
     */
    static _distanceSquaredBetweenTwoPoints(pointA, pointB) {
        let dx = pointB[0] - pointA[0];
        let dy = pointB[1] - pointA[1];

        return dx * dx + dy * dy;
    }

    /**
     * Returns distance between two points.
     * @param pointA
     * @param pointB
     * @returns {number}
     * @private
     */
    static _distanceBetweenTwoPoints(pointA, pointB) {
        return Math.sqrt(MitoMathHelper._distanceSquaredBetweenTwoPoints(pointA, pointB));
    }

    /**
     * Return the closest point on a line to a single point.
     * @param line
     * @param singlePoint
     * @returns {[number, number]}
     * @private
     */
    static _getClosestPointOnLine(line, singlePoint) {
        let linePointA = line[0];
        let linePointB = line[1];
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
     * Returns the dot product.
     * @param vectorA
     * @param vectorB
     * @returns {number}
     * @private
     */
    static _dotProduct(vectorA, vectorB) {
        return vectorA[0] * vectorB[0] + vectorA[1] * vectorB[1];
    }

    /** Uses a math formula to find the resulting translational velocity of one vector after an elastic collision.
     * @param massA
     * @param positionA
     * @param velocityA
     * @param massB
     * @param positionB
     * @param velocityB
     * @returns {[numbers, numbers]}
     * @private
     */
    static _getOneTranslationalVelocityAfterElasticCollision(massA, positionA, velocityA, massB, positionB, velocityB) {
        //TODO: refactor variables names to whatever mr boss boy tells me to
        let partOne = (2 * massB) / (massA + massB);

        let velocityDifference = [velocityA[0] - velocityB[0], velocityA[1] - velocityB[1]];
        let positionDifference = [positionA[0] - positionB[0], positionA[1], positionB[1]];
        let velDiffPosDiffDotProduct = MitoMathHelper._dotProduct(velocityDifference, positionDifference);
        let positionMagnitudeSquared =  positionDifference[0] * positionDifference[0] + positionDifference[1] * positionDifference[1];

        let partTwo = partOne * velDiffPosDiffDotProduct / positionMagnitudeSquared;
        let finalVector = [positionDifference[0] * partTwo, positionDifference[1] * partTwo];

        return [velocityA[0] - finalVector[0], velocityA[1] - finalVector[1]];
    }

    /**
     * Returns both resulting translational velocities after collision.
     * @param bodyA
     * @param bodyB
     * @param collisionPoint
     * @returns {[[number, number], [number, number]]}
     * @private
     */
    static getMitoPhysicsBodyVelocitiesAfterCollision(bodyA, bodyB, collisionPoint) {
        let massA = bodyA.getMass();
        let massB = bodyB.getMass();
        let positionA = bodyA.getPosition();
        let positionB = bodyB.getPosition();
        let velocityA = bodyA.getVelocity();
        let velocityB = bodyB.getVelocity();

        let resultingVelocityA = MitoMathHelper._getOneTranslationalVelocityAfterElasticCollision(massA, positionA, velocityA, massB, positionB, velocityB);
        let resultingVelocityB = MitoMathHelper._getOneTranslationalVelocityAfterElasticCollision(massB, positionB, velocityB, massA, positionA, velocityA);

        return [resultingVelocityA, resultingVelocityB];
    }
};