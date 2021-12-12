// import
const udp = require('dgram');

/*
###############################
manager class:
 - using type and color it will generate byte wich are transmitted to the udp server (nanoleaf)
###############################
*/

class manager {
    constructor() {
        this.client = udp.createSocket('udp4');
        // for each effect we have a different color and transition time
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

        // switch case for each part
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
            case 5:
                fullStream()
                break;
            default:
                break;
        }

        function fullStream() {
            panel.forEach(element => {
                for(let i= 0; i<=3; i++) {
                    send(Buffer.from(format(element, i)), element.ip)
                }
            });
        }

        // same for each function /!\
        function bottomStream() {
            panel.forEach(element => {
                // format string of byte for element (panels) and side (left,right,... (0,1,...))
                let val = format(element, 3)
                
                let buffer = Buffer.from(val);

                // send buffer to each panel
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

        /* big edian conversion :
        651 , ---> panelID (can't be write on 1 bytes -> we use big edian format)
        
        651 in binary = 10 10001011

        we take the last 8 bits wich will be our last byte
        the rest of the bits is the first byte
        we convert this back to decimal and that's it
        
        10001011 = 139, 10 = 2
        return (2 139)

        */
        function binaryConvert(val) {
            // convert to binary
            let bin = val.toString(2)
            // if can't be write on 1 byte (more than 8bits)
            if (bin.length > 8) {
                // get the rest
                let reste = bin.length-8
                let end = bin.substring(reste);
                let start = bin.substring(0,reste)
                // convert back
                let decStart = parseInt(start, 2)
                let decEnd = parseInt(end, 2)

                return [decStart, decEnd]
            } else {
                return [0,val]
            }
        }

        // send data to udp server (nanoleaf)
        function send(data,ip) {
            client.send(data,60222,ip,function(error){
                if(error) console.log(error)
            })
        }

        /* format data of panel to this format :

        (0 3)  ‚---> nPanels
        (1 118) (255 0 255 0) (0 12)  ‚---> Set panel color

        in shematic :

        number of panels,
        Panel Id, {R G B W}, Transition time

        PanelID/TransTime is in big edian format
        */

        function format(element, x) {
            // total of panels, (nPanels)
            let total = element.data[x].length
            // this return it as big edian (eg : 3 = 0 3)
            let data = binaryConvert(total)
            
            let string = [data[0], data[1]]

            // for each panel format
            for(let i=0; i<total; i++) {
                // convert panel id to big edian (eg: 374 = 1 118)
                let dataID = binaryConvert(element.data[x][i].id)
                string.push(dataID[0], dataID[1])
                // push color rgbw to string
                color.forEach(col => {
                    string.push(col)
                });
                // push transition time in big edian (eg : 451 = 1 195)
                let dataTrans = binaryConvert(trans)
                string.push(dataTrans[0], dataTrans[1])
            }
            return string
        }
    }
}

module.exports = manager