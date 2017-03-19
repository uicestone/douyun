const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const cors = require('cors');
const bodyParser = require('body-parser');
const Buffer = require('buffer').Buffer;

const port = 8080;

http.listen(port, () => {
    console.log(`listening on *: ${port}`);
});

app.use(bodyParser.raw({type:'bin'}));

app.all('/', cors(), (req, res) => {
    
    let list = [];

    req.on('data', (chunk) => {
        list.push(chunk);
    })

    req.on('end', () => {
        
        const buf = Buffer.concat(list);
        const content = buf.toString('hex');
        const lines = content.split('0d0a');

        const pack = lines.filter(lineHexString => lineHexString.length).map(lineHexString => {
            
            const line = lineHexString.match(/.{1,2}/g)
                .map(byteString => parseInt(byteString, 16));
            
            const length = line[1];
            const type = line[2];

            const mac = line.slice(3, 9).map(byte => {
                
                let hexStringByte = byte.toString(16);

                if(hexStringByte.length < 2) {
                    hexStringByte = '0' + hexStringByte;
                }

                return hexStringByte;

            }).join(':');

            const rssi = line[9] - 255;
            const data = line.slice(10, line.length);
            const temp = (data[22] * 256 + data[23]) / 10;
            const humi = (data[24] * 256 + data[25]) / 10;
            const distance = data[26];

            return {length, type, mac, rssi, temp, humi, distance};

        }).filter(line => {
            return line.type === 0;
        }).map(line => {
            console.log(line.mac, line.temp, line.humi, line.distance);
        });

        console.log('===============================');

        res.end();
    });
});

io.on('connection', (socket) => {
    console.log('socket connected');
});
