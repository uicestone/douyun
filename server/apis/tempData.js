const Buffer = require('buffer').Buffer;
const Bean = require('../models/bean.js');
const Record = require('../models/record.js');

module.exports = (router, io) => {
    
    router.route('/temp-data').post((req, res) => {

        let beaconsPromise;

        if (req.body && req.body.cloudbeacon) {
            beaconsPromise = parseBrightBeacon(req, res);
        }
        else {
            beaconsPromise = parseAprilBrother(req, res);
        }

        beaconsPromise.then(beacons => {
            saveBeaconsData(beacons);
        });
    });

    const mockBeaconsMac = process.env.MOCK_BEACONS && process.env.MOCK_BEACONS.split(',');
    
    if (mockBeaconsMac) {
        mockBeaconsMac.forEach(mac => {
            setInterval(() => {
                const beacons = [{
                    mac: mac,
                    brand: 'XuXuKou',
                    battery: 100,
                    rssi: 0,
                    temp: 25.0,
                    humi: 50.0,
                    distance: 100
                }];

                saveBeaconsData(beacons);
            }, 1000);            
        });
    }

    function saveBeaconsData (beacons) {

        beacons.map(line => {

            Bean.findOne({mac:line.mac}).then(bean => {
                // create bean if not found
                if (bean) {
                    return bean;
                }
                else {
                    let bean = new Bean({mac:line.mac});
                    return bean.save();
                }
            }).then(bean => {
                // update record into db 

                const record = new Record({
                    bean: bean._id,
                    rssi: line.rssi,
                    temp: line.temp,
                    humi: line.humi,
                    distance: line.distance,
                    updatedAt: new Date()
                });

                record.save();

                bean.rssi = line.rssi;
                bean.temp = line.temp;
                bean.humi = line.humi;
                bean.distance = line.distance;
                bean.lastUpdatedAt = new Date();

                return bean.save();

            }).then(bean => {
                io.to(bean.client && bean.client._id ? `bean ${bean._id}` : 'unbinded beans').emit('temp data update', bean);
            });
            
            // console.log(line.brand, line.mac, line.temp, line.humi, line.battery, line.rssi);
        });        
    }

    function parseAprilBrother (req, res) {

        return new Promise((resolve, reject) => {

            let list = [];

            req.on('data', (chunk) => {
                list.push(chunk);
            })

            req.on('end', () => {

                res.end();

                const buf = Buffer.concat(list);
                const content = buf.toString('hex');
                const lines = content.split('0d0a');

                const pack = lines.filter(lineHexString => lineHexString.length)

                .map(lineHexString => {
                    
                    const line = hexStringToDecArray(lineHexString);
                    
                    const length = line[1];
                    const type = line[2];

                    const mac = decArrayToHexString(line.slice(3, 9), ':');

                    const rssi = line[9] - 255;
                    const data = line.slice(10, line.length);
                    const temp = (data[22] * 256 + data[23]) / 10;
                    const humi = (data[24] * 256 + data[25]) / 10;
                    const battery = data[26];
                    const distance = data[27];
                    const brand = data.slice(2, 9).map(byte => String.fromCharCode(byte)).join('');

                    return {length, type, mac, rssi, temp, humi, distance, brand, battery};

                }).filter(line => {

                    return line.type === 0
                        && line.brand === 'XuXuKou'
                        && !isNaN(line.temp)
                        && !isNaN(line.humi)
                        && !isNaN(line.distance);

                }).reduce((beans, line) => {

                    let bean = beans.filter(bean => bean.mac === line.mac)[0];
                    
                    if (bean) {
                        bean.data.push(line);
                        return beans;
                    }
                    else {
                        beans.push({mac: line.mac, brand: line.brand, battery: line.battery, data: [line]});
                        return beans;
                    }

                }, []).map(bean => {

                    bean.rssi = bean.temp = bean.humi = bean.distance = 0;

                    bean.data.forEach(line => {
                        bean.rssi += line.rssi;
                        bean.temp += line.temp;
                        bean.humi += line.humi;
                        bean.distance += line.distance;
                    });

                    bean.rssi = Math.round(bean.rssi / bean.data.length);
                    bean.temp = Number((bean.temp / bean.data.length).toFixed(1));
                    bean.humi = Number((bean.humi / bean.data.length).toFixed(1));
                    bean.distance = Math.round(bean.distance / bean.data.length);

                    delete bean.data;

                    return bean;
                });

                resolve(pack);
            });
        });
    }

    function parseBrightBeacon (req, res) {

        const beacons = req.body.beacons.map(beacon => {

            const tempDataDecArray = hexStringToDecArray(beacon.temp);
            const humiDataDecArray = hexStringToDecArray(beacon.H);

            return {
                mac: decArrayToHexString(hexStringToDecArray(beacon.ble_addr), ':'),
                rssi: beacon.scan_rssi,
                temp: (tempDataDecArray[0] * 256 + tempDataDecArray[1]) / 10,
                humi: (humiDataDecArray[0] * 256 + humiDataDecArray[1]) / 10,
                battery: parseInt(beacon.battery_power, 16),
                brand: beacon.brand,
                distance: parseInt(beacon.distance, 16)
            }
        });

        return Promise.resolve(beacons);
    }

    function hexStringToDecArray(hexString) {
        return hexString.match(/.{1,2}/g)
            .map(byteString => parseInt(byteString, 16));
    }

    function decArrayToHexString(decArray, delimiter = '') {

        return decArray.map(byte => {
            
            let hexStringByte = byte.toString(16);

            if(hexStringByte.length < 2) {
                hexStringByte = '0' + hexStringByte;
            }

            return hexStringByte;

        }).join(delimiter);
    }

    return router;
};
