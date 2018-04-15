/**
 * Created by Trent on 4/13/2018.
 */

const MitoMathHelper = class MitoMathHelper {

    /** sums motion1 and motion2 and returns resulting velocity
     * @param motion1
     * @param motion2
     * @returns Array of resulting motion
     */
    sumTranslationalMotion(motion1, motion2) {
        let resultingMotion = [];
        resultingMotion[0] = motion1[0] + motion2[0];
        resultingMotion[1] = motion1[1] + motion2[1];

        return resultingMotion;
    }

    /** subtracts motion2 from motion1 and returns resulting velocity
     * @param motion1
     * @param motion2
     * @returns Array of resulting motion
     */
    subtractTranslationalVelocity(motion1, motion2) {
        let resultingMotion = [];
        resultingMotion[0] = motion1[0] - motion2[0];
        resultingMotion[1] = motion1[1] - motion2[1];

        return resultingMotion;
    }

    /** gives resulting translational velocity of velocity1 after collision with velocity2
     * @param motion1
     * @param motion2
     * @returns Array of resulting translation motion after collision
     */
    resolveCollidingTranslationalMotion(motion1, motion2) {
        let motion1WRT2 = this.subtractTranslationalVelocity(motion1, motion2);
        return this.sumTranslationalMotion(motion2, motion1WRT2);
    }

};