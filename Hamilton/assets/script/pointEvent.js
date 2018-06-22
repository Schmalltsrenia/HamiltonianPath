import { drawGrayLine } from "./Hamilton";
const { ccclass, property } = cc._decorator;
@ccclass
class point extends cc.Component {
    line() {
        drawGrayLine(this.node.index);
    }
}