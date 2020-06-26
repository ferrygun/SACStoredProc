'use strict';

const port = process.env.PORT || 3000;
const server = require("http").createServer();
const express = require("express");
const fs = require('fs');
const url = require('url');
const bodyParser = require("body-parser");
const request = require('request');
const util = require('util');
const async = require('async');
const client = require('./client');

var SP_1 = '_REPLACE_WITH_STORED_PROCEDURE_TO_POPULATE_DATA_';
var SP_2 = '_REPLACE_WITH_STORED_PROCEDURE_TO_DELETE_DATA_';

var app = express();
app.use(bodyParser.json());

server.on("request", app);

// use socket.io
var io = require('socket.io').listen(server);
// define interactions with client
io.sockets.on("connection", function(socket) {
    socket.on('disconnect', function(data) {
        console.log("Disconnected: " + socket.id);
        io.to(socket.id).emit("cmd_req_srv", {
            status: data.message + "|disconnected"
        });
    });
    socket.on('cmd_req', function(data) {
        async.waterfall([connect, 
			async.apply(prepare, SP_1), 
			async.apply(callProc, socket.id, io, data.message)
		], function (err, parameters, rows) {
			client.end();
			if (err) {
				io.to(socket.id).emit("cmd_req_srv", {
                    status: data.message + "|error"
                });
				return console.error('error', err);
			}
		});
    });
    socket.on('cmd_req_del', function(data) {
        async.waterfall([connect, 
			async.apply(prepare, SP_2), 
			async.apply(callProc, socket.id, io, data.message)
		], function (err, parameters, rows) {
			client.end();
			if (err) {
				io.to(socket.id).emit("cmd_req_srv", {
                    status: data.message + "|error"
                });

				return console.error('error', err);
			}
		});
    });
});

function connect(cb) {
    client.connect(cb);
}

function prepare(sql, cb) {
    var sql = 'call ' + sql;
	console.log(sql);
    client.prepare(sql, cb);
}

function callProc(socketid, io, message, statement, cb) {
    var values = {};
    statement.exec(values, function onexec(err, parameters, rows) {
        statement.drop();

		io.to(socketid).emit("cmd_req_srv", {
			status: message + "|success"
        });
        cb(err, parameters, rows);
    });
}

//Start the Server 
server.listen(port, function() {
    console.info(`Bot Server: ${server.address().port}`);
});
