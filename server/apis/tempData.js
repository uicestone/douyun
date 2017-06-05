const Buffer = require('buffer').Buffer;
const Bean = require('../models/bean.js');
const Record = require('../models/record.js');
const Log = require('../models/log.js');
const Client = require('../models/client.js');
const regression = require('regression');
const recentRecords = {};

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
            
            let beacons = [{
                mac: mac,
                brand: 'XuXuKou',
                battery: 100,
                rssi: 0,
                temp: 25.0,
                humi: 50.0,
                distance: 100
            }];

            setInterval(() => {
                beacons[0].rssi = Math.min(0, Math.round(beacons[0].rssi + Math.random() - 0.5));
                beacons[0].distance = Math.max(0, Math.min(1000, Math.round(beacons[0].rssi + Math.random() - 0.5)));
                beacons[0].temp = Math.max(30, Math.min(37, beacons[0].temp + Math.random() - 0.5));
                beacons[0].humi = Math.max(60, Math.min(100, beacons[0].humi + (Math.random() - 0.5) * 5));
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

                // save record into db
                const record = new Record({
                    bean: bean._id,
                    rssi: line.rssi,
                    temp: line.temp,
                    humi: line.humi,
                    distance: line.distance,
                    updatedAt: new Date()
                });

                record.save();

                // and send record to client
                bean.rssi = line.rssi;
                bean.temp = line.temp;
                bean.humi = line.humi;
                bean.distance = line.distance;
                bean.lastUpdatedAt = new Date();

                // save current stat to the bean
                bean.save();

                // beans not binded to client should not go further
                if (!bean.client) {
                    return;
                }
                
                io.to(bean.client && bean.client._id ? `bean ${bean._id}` : 'unbinded beans').emit('temp data update', bean);

                // update recentRecords
                if (!recentRecords[bean._id]) {
                    recentRecords[bean._id] = [];
                }
                recentRecords[bean._id].push(record);

                recentRecords[bean._id] = recentRecords[bean._id].filter(record => new Date() - record.updatedAt < 7000);

                if (recentRecords[bean._id].length >= 5) {
                    const recentRecordsData = recentRecords[bean._id].map(record => [(record.updatedAt - new Date()) / 1000, record.humi]);
                    const regressionResult = regression('linear', recentRecordsData);

                    const slope = regressionResult.equation[0];

                    // we guess the client has just pee
                    if (slope >= 0.8) {

                        const log = new Log({
                            createdAt: new Date(),
                            title: '排尿',
                            client: bean.client
                        });

                        log.save();

                        const status = {since: new Date(), name: '湿润'};
                        Client.findByIdAndUpdate(bean.client._id, {status: status}).exec();

                        io.to(bean.client && bean.client._id ? `bean ${bean._id}` : 'unbinded beans').emit('client status update', status);

                        // console.log(`\x1b[33m[${new Date()}] ${bean.mac} ${slope.toFixed(2)}\x1b[0m`);
                    }
                    else {
                        // console.log(`[${new Date()}] ${bean.mac} ${slope.toFixed(2)}`);
                    }
                }
            })
            .catch(err => {
                console.error(err);
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
                    bean.temp = bean.temp / bean.data.length;
                    bean.humi = bean.humi / bean.data.length;
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
