#!/usr/bin/node

var HTTP = require("http");

var options = {
        hostname: 'localhost',
        port: 1918,
        path: '/upload',
        method: 'GET',
        headers: {
            'Content-Type': 'text/plain'
        }
    };

var request = HTTP.request(options, function(response){
	console.log(response);
});