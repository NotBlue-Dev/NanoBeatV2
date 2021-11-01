class manager {
    constructor() {
        this.data = {
            0: {
                color:[0,0,0,0],
                trans:0
            },
            1: {
                color:[0,116,210,0],
                trans:0
            },
            2: {
                color:[0,116,210,0],
                trans:200
            },
            3: {
                color:[0,116,210,0],
                trans:200
            },
            5: {
                color:[200,20,20,0],
                trans:0
            },
            6: {
                color:[200,20,20,0],
                trans:200
            },
            7: {
                color:[200,20,20,0],
                trans:200
            }
        }
    }

    handle(type, value, panel) {
        let color = this.data[value].color 
        let trans = this.data[value].trans
        switch (type) {
            case 0:
                bottomStream(color, trans)
                break;
            case 1:
                bigStream(color, trans)
                break;
            case 2:
                leftStream(color, trans)
                break;
            case 3:
                rightStream(color, trans)
                break;
            case 4:
                centerStream(color, trans)
                break;
            default:
                break;
        }

        function bottomStream(color, trans) {
            console.log(color, trans, "bottom")
        }

        function bigStream(color, trans) {
            console.log(color, trans, "big")
        }

        function leftStream(color, trans) {
            console.log(color, trans, "left")
        }

        function rightStream(color, trans) {
            console.log(color, trans, "right")
        }

        function centerStream(color, trans) {
            console.log(color, trans, "center")
        }
    }
}

// TODO split panl in 4 (bottom, left, right, center)
// Stream data with udp

module.exports = manager