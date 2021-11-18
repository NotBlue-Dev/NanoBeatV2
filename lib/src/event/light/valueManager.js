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

    handle(type, value, panels) {

        let panel = panels
        // 0 left 1 center 2 right 3 bottom
        let color = this.data[value].color 
        let trans = this.data[value].trans

        switch (type) {
            case 0:
                bottomStream()
                break;
            case 1:
                bigStream()
                break;
            case 2:
                leftStream()
                break;
            case 3:
                rightStream()
                break;
            case 4:
                centerStream()
                break;
            default:
                break;
        }

        function bottomStream() {
            console.log(color, trans, "bottom", panel[3])
        }

        function bigStream() {
            console.log(color, trans, "big", panel[0], panel[2])
        }

        function leftStream() {
            console.log(color, trans, "left", panel[0])
        }

        function rightStream() {
            console.log(color, trans, "right", panel[2])
        }

        function centerStream() {
            console.log(color, trans, "center", panel[1])
        }
    }
}

// TODO split panl in 4 (bottom, left, right, center)
// Stream data with udp

module.exports = manager