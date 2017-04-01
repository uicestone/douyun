const Buffer = require('buffer').Buffer;

module.exports = (router) => {
    
    router.route('/temp-data').post((req, res) => {

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
                const battery = data[26];
                const distance = data[27];
                const brand = data.slice(2, 9).map(byte => String.fromCharCode(byte)).join('');

                return {length, type, mac, rssi, temp, humi, distance, brand, battery};

            }).filter(line => {
                return line.type === 0 && line.brand === 'XuXuKou';
            }).map(line => {
                // console.log(line.mac, line.temp, line.humi, line.battery, line.distance);
            });

            // console.log('===============================');

            res.end();
        });
    });

    return router;
};
