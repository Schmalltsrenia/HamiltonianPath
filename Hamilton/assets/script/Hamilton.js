/**
 Created By:
  _____  ________         _____
   \  / / /\   /    /\    \   /
    \ \/ /  | |    /  \    | |
     >  <   | |   / /\ \   | |
    / /\ \  | |  / /__\ \  | |
   / /  \ \_| |_/ /\___\ \ | |
  <_/   /________/      \_\/ /
                         \__/
 */


import { LineAnim } from "./lineAnimate";
import { line } from "./line";
const { ccclass, property } = cc._decorator;
const STATUS = cc.Enum({
    ADD_P: 0,
    LINE: 1
});
export var drawGrayLine = null;
@ccclass
class Hamilton extends cc.Component {

    @property(cc.Node)
    myCanvasNode = null;

    @property(cc.Label)
    info = null;

    @property(cc.Prefab)
    pointPrefab = null;

    @property(cc.NodePool)
    _pointPool = null;

    @property(line)
    line = null;

    @property(LineAnim)
    lineA = null;

    pointsArr = [];
    status = STATUS.ADD_P;
    startIndex = 0;
    endIndex = 0;
    lineStartPos = null;
    lineEndPos = null;
    handlingP = 0;
    footPrint = {};

    onLoad() {
        let wordPos = this.myCanvasNode.getNodeToWorldTransformAR()
        this.myCavnasPos = cc.p(wordPos.tx, wordPos.ty);
        this._pointPool = new cc.NodePool();
        drawGrayLine = this.drawGrayLine.bind(this);
        this.hamiltonPath = [];
        this.cb = this.drawAnimLine.bind(this);
    }

    lineStartPos_SET_(p) {
        this.lineStartPos = p;
        let str = p.x + "," + p.y + "\n";
        if(this.lineEndPos) str += this.lineEndPos.x + "," + this.lineEndPos.y + "\n";
        this.info.string = str;
    }

    lineEndPos_SET_(p) {
        this.lineEndPos = p;
        let str;
        if(this.lineStartPos) str = this.lineStartPos.x + "," + this.lineStartPos.y + "\n";
        if(p) {
            str += p.x + "," + p.y + "\n";
        }
        this.info.string = str;
    }

    addPoint() {
        this.status = STATUS.ADD_P;
    }

    linePoint() {
        this.status = STATUS.LINE;
    }

    drawGrayLine(index) {
        switch(this.handlingP) {
            case 0:
            this.lineStartPos_SET_(this.pointsArr[index]);
            this.handlingP = 1;
            break;
            case 1:
            this.lineEndPos_SET_(this.pointsArr[index]);
            this.handlingP = 2;
            this.line.drawLine(this.lineStartPos, this.lineEndPos);
            this.lineStartPos.joints.push(this.lineEndPos);
            this.lineEndPos.joints.push(this.lineStartPos);
            break;
            case 2:
            this.lineStartPos_SET_(this.pointsArr[index]);
            this.lineEndPos_SET_(null);
            this.handlingP = 1;
            break;
        }
    }

    myCanvas(event) {
        if(this.status === STATUS.ADD_P) {
            let point = cc.pSub(event.getLocation(), this.myCavnasPos);
            let pointNode = this._pointPool.get() || cc.instantiate(this.pointPrefab);
            pointNode.parent = this.myCanvasNode;
            pointNode.position = point;
            let index = this.pointsArr.length;
            pointNode.index = index;
            point.index = index;
            point.joints = [];
            this.pointsArr.push(point);
        }
    }

    generate() {

        var maxNum = this.pointsArr.length;
        var s = this.pointsArr[0], t; // 初始化搜索点取0号点
        t = s.joints[0]; // t为一个任意邻接点,不妨取0号点
        this.hamiltonPath.push(s);
        this.hamiltonPath.push(t);
        this.footPrint[s.index] = true;
        this.footPrint[t.index] = true;
        while(true) {
            var len0 = this.hamiltonPath.length;
            if(!this.expand(t)) {
                this.reverse(0, this.hamiltonPath.length - 1);
                cc.log("reverse Path");
            };
            s = this.hamiltonPath[0];
            t = this.hamiltonPath[this.hamiltonPath.length - 1];
            if(!this.expand(t)) {
                var isLoop = s.joints.includes[t];
                if(!isLoop) {
                    isLoop = this.findAPathNodeID(s, t);
                }
                if(isLoop && this.hamiltonPath.length !== maxNum) this.handleLoop();
            }
            s = this.hamiltonPath[0];
            t = this.hamiltonPath[this.hamiltonPath.length - 1];
            if(len0 === this.hamiltonPath.length) break;
        }

        this.drawAnimLine(0);
    }

    // 扩展路径, i 当前路径的其中一个端点
    expand(i) {
        for(let j = 0, len = i.joints.length; j < len; j ++) {
            let p = i.joints[j];
            if(!this.footPrint[p.index]) {
                this.hamiltonPath.push(p);
                this.footPrint[p.index] = true;
                cc.log(this.hamiltonPath.slice());
                return true;
            }
        }
        return false;
    }

    findAPathNodeID(s, t) {
        cc.log("尝试形成回路");
        for(let i = 1, len = this.hamiltonPath.length; i < len - 2; i ++) {
            if(this.hamiltonPath[i].joints.includes(t) && this.hamiltonPath[i + 1].joints.includes(s)) {
                this.reverse(i + 1, this.hamiltonPath.length - 1);
                cc.log("success");
                return true;
            }
        }
        return false;
    }

    handleLoop() {
        for(let i = 1, len = this.hamiltonPath.length; i < len - 1; i ++) {
            for(let j = 0, leng = this.hamiltonPath[i].joints.length; j < leng; j ++) {
                let joint = this.hamiltonPath[i].joints[j];
                if(!this.footPrint[joint.index]) {
                    cc.log("处理回路", i);
                    this.reverse(0, i - 1);
                    this.reverse(i, this.hamiltonPath.length - 1);
                    this.hamiltonPath.push(joint);
                    this.footPrint[joint.index] = true;
                    return;
                }
            }
        }

    }

    reverse(s, t) {
        var temp;
        while(s < t) {
            temp = this.hamiltonPath[s];
            this.hamiltonPath[s] = this.hamiltonPath[t];
            this.hamiltonPath[t] = temp;
            s = s + 1;
            t = t - 1;
        }
    }

    drawAnimLine(i) {
        this.lineA.generateNewNode(this.hamiltonPath[i]);
        i = i + 1;
        if(i < this.hamiltonPath.length) {
            setTimeout(() => {
                this.cb(i);
            }, 400);
        }
    }

    generate1() {
        var maxNum = this.pointsArr.length;
        var dfsHamilton = (footPrint, hamiltonPath, currentLen) => {
            if(currentLen === maxNum) {
                var s = hamiltonPath[0];
                var t = hamiltonPath[currentLen - 1];
                if(s.joints.includes(t)) {
                    return true;
                } else {
                    return false;
                }
            }
            for(var i = 0, len = hamiltonPath[currentLen - 1].joints.length; i < len; i ++) {
                let joint = hamiltonPath[currentLen - 1].joints[i];
                if(!footPrint[joint.index]) {
                    footPrint[joint.index] = true;
                    hamiltonPath.push(joint);
                    if(dfsHamilton(footPrint, hamiltonPath, currentLen + 1)) {
                        return true;
                    }
                    footPrint[joint.index] = false;
                    hamiltonPath.pop();
                }
            }
            return false;
        };

        this.hamiltonPath.push(this.pointsArr[0]);
        this.footPrint[0] = true;
        dfsHamilton(this.footPrint, this.hamiltonPath, 1);

        this.drawAnimLine(0);
    }

}