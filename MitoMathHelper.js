/**
 * Created by Trent on 4/13/2018.
 */

const MitoMathHelper = class MitoMathHelper {

    /** sums motion1 and motion2 and returns resulting motion
     * @param motion1
     * @param motion2
     * @returns Array of resulting motion
     * @private
     */
    static _sumTranslationalMotion(motion1, motion2) {
        let resultingMotion = [];
        resultingMotion[0] = motion1[0] + motion2[0];
        resultingMotion[1] = motion1[1] + motion2[1];

        return resultingMotion;
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
        return MitoMathHelper._sumTranslationalMotion(motion2, motion1WRT2);
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
     * returns KE * 2 = (mv^2)
     * @param body
     * @returns {number}
     * @private
     */
    static _getKineticEnergy(body) {
        let velocity = body.getVelocity();
        return body.getMass() * velocity[0] * velocity[0] * velocity[1] * velocity[1];
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