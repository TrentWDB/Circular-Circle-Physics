/**
 * Created by Trent on 4/13/2018.
 */

const MitoMathHelper = class MitoMathHelper {

    /** sums motion1 and motion2 and returns resulting motion
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

    /** subtracts motion2 from motion1 and returns resulting motion
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

    /** gives motion1's resulting motion relative to translative reference motion2
     * @param motion1
     * @param motion2
     * @returns Array of resulting translation motion after collision
     */
    relativeMotion1WRT2(motion1, motion2) {
        let motion1WRT2 = this.subtractTranslationalVelocity(motion1, motion2);
        return this.sumTranslationalMotion(motion2, motion1WRT2);
    }

};