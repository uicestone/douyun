'use strict';

const express     = require('express');
const bodyParser  = require('body-parser');
const compression = require('compression');
const mongoose    = require('mongoose');
const app         = express();
const router      = express.Router();
const httpServer  = require('http').createServer(app);
const io          = require('socket.io')(httpServer);
const env         = require('node-env-file');
const cors        = require('cors');

env(`${__dirname}/.env`);

mongoose.connect(process.env.MONGODB_URL);
mongoose.Promise = global.Promise;

app.use(bodyParser.raw({type:'bin'}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.query());
app.use(compression());

require('./server/apis')(app, router, io);

app.use(express.static('dist'));

app.use('/', (req, res) => {
    if (req.accepts(['html', 'json']) === 'html') {
        res.sendFile(`${__dirname}/dist/index.html`);
    }
    else {
        res.sendStatus(404);
    }
});

const port = process.env.PORT_HTTP;

httpServer.listen(port, () => {
    console.log(`[${new Date()}] HTTP server listening port: ${port}`);
});

io.on('connect', socket => {
    console.log(`[${new Date()}] socket ${socket.conn.remoteAddress} connected`);
    socket.on('disconnect', reason => {
        console.log(`[${new Date()}] socket ${socket.conn.remoteAddress} disconnected: ${reason}`);
    }).on('join', data => {
        socket.join(data);
        console.log(`[${new Date()}] socket ${socket.conn.remoteAddress} joined: ${data}`);
    }).on('leave', data => {
        socket.leave(data);
        console.log(`[${new Date()}] socket ${socket.conn.remoteAddress} left: ${data}`);
    });
});
