var udp = require('dgram');

// TODO list data > byte > send

class manager {
    constructor() {
        this.client = udp.createSocket('udp4');
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
        // 0 left 1 center 2 right 3 bottom
        let color = this.data[value].color 
        let trans = this.data[value].trans
        let client = this.client

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
            panel.forEach(element => {

                let val = format(element, 3)
                
                let test = Buffer.from(val);

                client.send(test,60222,element.ip,function(error){
                    if(error) console.log(error)
                    console.log('sent')
                })

                
                


            });
        }

        function bigStream() {
            panel.forEach(element => {
                format(element, 0)
                format(element, 2)
            });
        }

        function leftStream() {
            panel.forEach(element => {
                format(element, 0)
            });
        }

        function rightStream() {
            panel.forEach(element => {
                 format(element, 2)
            });
        }

        function centerStream() {
            panel.forEach(element => {
                format(element, 1)
            });
        }

        function format(element, x) {
            // let total = element.data[x].length
            // si > 8 on prend ce qui est devant pour faire 8 et on convertit le truc pris en décimal, pareil pour le rest = big edian
            let total = 651
            let string = []
            let bin = total.toString(2)
            if (bin.length > 8) {
                let reste = bin.length-8
                let end = bin.substring(reste);
                let start = bin.substring(0,reste)
                let decStart = parseInt(start, 2)
                let decEnd =parseInt(end, 2)
                string.push(decStart, decEnd)
            } else {
                string.push(0,total)
            }
            

            // for(let i=0; i<total; i++) {
            //     string.push(element.data[x][i].id)
            //     color.forEach(col => {
            //         string.push(col)
            //     });
            //     string.push(trans)
            // }
            return string
        }
    }
}

// TODO split panl in 4 (bottom, left, right, center)
// Stream data with udp

module.exports = manager