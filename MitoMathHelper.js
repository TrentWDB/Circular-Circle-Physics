/**
 * Created by Trent on 4/13/2018.
 */

const MitoMathHelper = class MitoMathHelper {



    detectCollisionTime(circleA, velocityA, circleB, velocityB, interval){

        let velocityIntA = this.multiplyPoint(velocityA, interval);
        let velocityIntB = this.multiplyPoint(velocityB, interval);
        let combineVelocity = this.addPoints(velocityIntA, this.invertPoint(velocityIntB));
        let combineMagnitude = Math.hypot(combineVelocity[0], combineVelocity[1]);
        //Early escape: Calculate bounds based on combine velocities
        let bounds = new MitoCircle();
        bounds.setPosition(circleA.getPosition()[0], circleA.getPosition()[1]);
        bounds.setRadius(circleA.getRadius() +  combineMagnitude);
        if(!this.detectCollisionCirCir(bounds, circleB)){
            return null;
        }
        //Calculate closest point on combined velocities to circleB
        let appliedVelocitiesToPositionA = this.addPoints(circleA.getPosition(), combineVelocity);
        let closestPoint = this.getClosestPoint(circleA.getPosition(),
            appliedVelocitiesToPositionA,
            circleB.getPosition());
        let closestCircle = new MitoCircle();
        closestCircle.setPosition(closestPoint[0], closestPoint[1]);
        closestCircle.setRadius(circleA.getRadius());
        //If closest circle is in range calculate back off distance
        //Tick percentage should be between 0 - 1
        let distance = this.distanceBetweenTwoPoints(closestCircle.getPosition(), circleB.getPosition());
        let radiusTotal = circleA.getRadius() + circleB.getRadius();
        if(radiusTotal >= distance){
            let backOff = Math.sqrt((radiusTotal*radiusTotal) - (distance*distance));
            let backPoint = [backOff *( combineVelocity[0] / combineMagnitude) , backOff *( combineVelocity[1] / combineMagnitude)];
            let closestPointWithinVelocity = this.addPoints(closestPoint , this.invertPoint(backPoint));
            let distanceBetween = this.distanceBetweenTwoPoints(circleA.getPosition(), closestPointWithinVelocity);
            let tickPercentage = distanceBetween / combineMagnitude;
            console.assert(tickPercentage >= 0 && tickPercentage <= 1, "detectCollisionTime: value outside of range: " + tickPercentage );
            return tickPercentage;
        }else{
            return null;
        }

    }

    distanceBetweenTwoPoints(pointA, pointB){
        return Math.hypot(pointB[0] - pointA[0], pointB[1] - pointA[1]);
    }

    detectCollisionCirCir(circleA, circleB){
        let distance = Math.hypot(
            circleB.getPosition()[0] - circleA.getPosition()[0],
            circleB.getPosition()[1] - circleA.getPosition()[1]);
        let radiusTotal = circleA.getRadius() + circleB.getRadius();
        return  radiusTotal >= distance;
    }

    getClosestPoint(linePointA, linePointB, singlePoint){
        let A_to_P = [singlePoint[0] - linePointA[0], singlePoint[1] - linePointA[1]] ;
        let A_to_B = [linePointB[0] - linePointA[0], linePointB[1] - linePointA[1]];
        let atb2 = (A_to_B[0] * A_to_B[0]) + (A_to_B[1] * A_to_B[1]);

        if(atb2 === 0){return linePointA;}

        let atp_dot_atb = (A_to_P[0]*A_to_B[0]) + (A_to_P[1] * A_to_B[1]);
        let normalizedDistance = atp_dot_atb / atb2;
        return [linePointA[0] + (A_to_B[0] * normalizedDistance) , linePointA[1] + (A_to_B[1] * normalizedDistance)]
    }

    addPoints(pointA, pointB){
        return [pointA[0] + pointB[0] , pointA[1] + pointB[1]];
    }

    invertPoint(point){
        return [point[0] * -1 , point[1] * -1];
    }

    multiplyPoint(point, value){
        return [point[0] * value , point[1] * value];
    }


};