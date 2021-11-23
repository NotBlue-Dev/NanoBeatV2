var udp = require('dgram');

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
                trans:5
            },
            3: {
                color:[0,116,210,0],
                trans:5
            },
            5: {
                color:[200,20,20,0],
                trans:0
            },
            6: {
                color:[200,20,20,0],
                trans:5
            },
            7: {
                color:[200,20,20,0],
                trans:5
            }
        }
    }

    handle(type, value, panel) {

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
                
                let buffer = Buffer.from(val);

                send(buffer, element.ip)

            });
        }

        function bigStream() {
            panel.forEach(element => {
                let val = format(element, 0)

                let buffer = Buffer.from(val);

                send(buffer, element.ip)

                let val2 = format(element, 2)

                let buffer2 = Buffer.from(val2);

                send(buffer2, element.ip)
            });
        }

        function leftStream() {
            panel.forEach(element => {
                let val = format(element, 0)

                let buffer = Buffer.from(val);

                send(buffer, element.ip)
            });
        }

        function rightStream() {
            panel.forEach(element => {
                let val = format(element, 2)

                 let buffer = Buffer.from(val);

                 send(buffer, element.ip)
            });
        }

        function centerStream() {
            panel.forEach(element => {
                let val = format(element, 1)

                let buffer = Buffer.from(val);

                send(buffer, element.ip)
            });
        }

        function binaryConvert(val) {
            let bin = val.toString(2)
            if (bin.length > 8) {
                let reste = bin.length-8
                let end = bin.substring(reste);
                let start = bin.substring(0,reste)
                let decStart = parseInt(start, 2)
                let decEnd = parseInt(end, 2)
                return [decStart, decEnd]
            } else {
                return [0,val]
            }
        }

        function send(data,ip) {
            client.send(data,60222,ip,function(error){
                if(error) console.log(error)
            })
        }

        function format(element, x) {
            let total = element.data[x].length
            let data = binaryConvert(total)
            let string = [data[0], data[1]]
            for(let i=0; i<total; i++) {
                let dataID = binaryConvert(element.data[x][i].id)
                string.push(dataID[0], dataID[1])
                color.forEach(col => {
                    string.push(col)
                });
                let dataTrans = binaryConvert(trans)
                string.push(dataTrans[0], dataTrans[1])
            }
            return string
        }
    }
}

module.exports = manager