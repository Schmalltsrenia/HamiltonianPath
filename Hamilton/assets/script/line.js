const { ccclass, property } = cc._decorator;
const GRAY = new cc.Color(139, 139, 139);
@ccclass
export class line extends cc.Component {

    onLoad() {
        this.g = this.node.getComponent(cc.Graphics);
    }

    clear() {
        this.g.clear();
    }

    drawLine(start, end) {
        this.g.strokeColor = GRAY;
        this.g.lineWidth = 3;
        this.g.moveTo(start.x, start.y);
        this.g.lineTo(end.x, end.y);
        this.g.stroke();
    }
}