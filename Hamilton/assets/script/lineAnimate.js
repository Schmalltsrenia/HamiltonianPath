const c = {
    hostBlue: new cc.Color(30, 122, 193),
    guestPurp: new cc.Color(137, 87, 161),
    newYellow: new cc.Color(255, 255, 0),
    lineColor: new cc.Color(0, 255, 0)
};
const { ccclass, property } = cc._decorator;
@ccclass
export class LineAnim extends cc.Component {

    onLoad() {
        this.nodesArray = [];
        this.endNode = null;
        this.runningNode = null;
        this.shakingCircleR = 50;
        this.generateNodesCD = 0.3;
        this.lineAnimInterval = 0.3;
        this.circleAnimInterval = 0.2;
        this.circleAnimRatio = -1;
        this.lineSpeed = 0;
        this.lastLength = 0;
        this.lastDistance = 0;
        this.lastVec = null;
        this.waveEff = false;
        this.teamColor = c.hostBlue;

        this.time = this.generateNodesCD;

        this.g = this.node.getComponent(cc.Graphics);
        // this.g.strokeColor = cc.hexToColor("#ff0000");
        // this.g.lineWidth = 5;
        // this.g.circle(100,100,50);
        // this.g.stroke();
        // this.g.strokeColor = cc.hexToColor("#00ff00");
        // this.g.lineWidth = 7;
        // this.g.circle(150, 150, 50);
        // this.g.stroke();
    }

    clear() {
        this.g.clear();
        this.nodesArray.splice(0, this.nodesArray.length);
        this.waveEff = false;
        this.endNode = this.runningNode = null;
        this.shakingCircleR = 50;
        this.circleAnimRatio = -1;
        this.lineSpeed = 0;
        this.lastDistance = this.lastLength = this.lineSpeed = 0;
        this.lastVec = null;
    }

    generateNewNode(endNode) {
        this.teamColor = c.hostBlue;
        let len = this.nodesArray.length;
        this.endNode = endNode;
        this.waveEff = true;
        if(len) {
            this.lastVec = this.endNode.sub(this.nodesArray[len - 1]);
            this.lastDistance = this.lastVec.mag();
            this.lineSpeed = this.lastDistance / this.lineAnimInterval;
            this.runningNode = this.nodesArray[len - 1].clone();
        } else {
            this.nodesArray.push(this.endNode.clone());
        }
        this.circleAnimRatio = -1;
        this.shakingCircleR = 50;
    }

    _random(seed) {
        return (Math.sin(687.3123 * (seed % 1000)) + 1 ) / 2;
    }

    draw() {
        let len = this.nodesArray.length;
        this.g.clear();
        if(len) {
            this.g.fillColor = this.teamColor;
            this.g.lineWidth = 3;
            this.nodesArray.forEach(v => {
                this.g.circle(v.x, v.y, 4);
                this.g.fill();
            });
        }
        let nodesNum = 0
        if(this.endNode) {
            this.g.strokeColor = c.newYellow;
            this.g.lineWidth = 5;
            this.g.circle(this.endNode.x, this.endNode.y, 5);
            this.g.stroke();
            nodesNum = 1;
        }

        if(this.shakingCircleR && this.waveEff) {
            let node = this.endNode || this.nodesArray[len - 1];
            this.g.strokeColor = new cc.Color(0, 0, 255, 255 - this.shakingCircleR * 5.1);
            this.g.lineWidth = 3;
            this.g.circle(node.x, node.y, this.shakingCircleR);
            this.g.stroke();
        }
        nodesNum += len;
        if(nodesNum >= 2) {
            this.g.strokeColor = c.lineColor;
            this.g.lineWidth = 3;
            this.g.lineCap = cc.Graphics.LineCap.ROUND;
            this.g.moveTo(this.nodesArray[0].x, this.nodesArray[0].y);
            for(let i = 1; i < len; i ++) {
                this.g.lineTo(this.nodesArray[i].x, this.nodesArray[i].y);
            }
            if(this.runningNode) {
                this.g.lineTo(this.runningNode.x, this.runningNode.y);
            }
            this.g.stroke();
        }

    }

    update(dt) {
        if(!this.waveEff) return;
        if(this.lastDistance) {
            if(this.lastLength < this.lastDistance) {
                this.lastLength += this.lineSpeed * dt;
                let norm = this.lastVec.mag();
                if(norm) {
                    this.lastVec.mulSelf(this.lastLength / norm);
                }
                this.runningNode = this.lastVec.add(this.nodesArray[this.nodesArray.length - 1]);
            } else {
                this.lastLength = this.lastDistance = this.lineSpeed = 0;
                this.runningNode = null;
                this.circleAnimRatio = 1;
                this.nodesArray.push(this.endNode.clone());
                this.endNode = null;
            }
        }
        // cc.log(this.shakingCircleR);
        if(this.circleAnimRatio && this.waveEff) {
            this.shakingCircleR += this.circleAnimRatio * (50 / this.circleAnimInterval) * dt;
            if(this.shakingCircleR < 0 && this.circleAnimRatio == -1) {
                this.circleAnimRatio = 0;
                this.shakingCircleR = 0;
            }
            if(this.shakingCircleR > 50 && this.circleAnimRatio == 1) {
                this.circleAnimRatio = 0;
                this.shakingCircleR = 0;
            }
        }
        this.draw();
    }

}