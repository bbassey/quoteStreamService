/**
 * Quote Stream
 *
 * @version 0.2.1
 * @author NodeSocket <http://www.nodesocket.com> <hello@nodesocket.com>
 */

 /*
 * Copyright (C) 2012 NodeSocket LLC 
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and 
 * associated documentation files (the "Software"), to deal in the Software without restriction, including 
 * without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the
 * following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial 
 * portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED
 * TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL
 * THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF
 * CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 * DEALINGS IN THE SOFTWARE.
 */

////
// CONFIGURATION SETTINGS
///
var PORT = 4000;
var FETCH_INTERVAL = 5000;
var PRETTY_PRINT_JSON = true;

///
// START OF APPLICATION
///
var express = require('express');
var http = require('http');
var io = require('socket.io');

var app = express();
var server = http.createServer(app);
var io = io.listen(server);
io.set('log level', 1);

server.listen(PORT);

app.get('/', function(req, res) {
	res.sendfile(__dirname + '/index.html');
});

app.get('/portfolio', function(req, res) {
	res.sendfile(__dirname + '/portfolio.html');
});

app.get('/getStockList', function(req, res) {
	var stockList = getStockList(req);
	res.write(JSON.stringify(stockList, true, '\t') );
	//res.statusCode(200);
	res.end();
});

app.get('/getSingleQuote/:q', function(req, res) {
	console.log("getSingleQuote for  " + req.params.q);
	getSingleQuote(req.params.q,res);
});

io.sockets.on('connection', function(socket) {
	socket.on('ticker', function(ticker) {
		track_ticker(socket, ticker);
	});
});



function track_ticker(socket, ticker) {

	//Run the first time immediately
	get_quote(socket, ticker);

	//Every N seconds
	var timer = setInterval(function() {
		get_quote(socket, ticker)
	}, FETCH_INTERVAL);

	socket.on('disconnect', function () {
		clearInterval(timer);
	});
}

function get_quote(p_socket, p_ticker) {
	http.get({
		host: 'www.google.com',
		port: 80,
		path: '/finance/info?client=ig&q=' + p_ticker
	}, function(response) {
		response.setEncoding('utf8');
		var data = "";
					
		response.on('data', function(chunk) {
			data += chunk;
		});
		
		response.on('end', function() {
			if(data.length > 0) {
				try {
					var data_object = JSON.parse(data.substring(3));
				} catch(e) {
					return;
				}
									
				var quote = {};
				quote.ticker = data_object[0].t;
				quote.exchange = data_object[0].e;
				quote.price = data_object[0].l_cur;
				quote.change = data_object[0].c;
				quote.change_percent = data_object[0].cp;
				quote.last_trade_time = data_object[0].lt;
				quote.dividend = data_object[0].div;
				quote.yield = data_object[0].yld;
				
				p_socket.emit('quote', PRETTY_PRINT_JSON ? JSON.stringify(quote, true, '\t') : JSON.stringify(quote));
			}
		});
	});
}	
function getStockList(req, res){
	var data_object
	http.get({
		host: 'www.google.com',
		port: 80,
		path: '/finance/match?matchtype=matchall&q=g'
	}, function(response) {
		response.setEncoding('utf8');
		var data = "";
					
		response.on('data', function(chunk) {
			data += chunk;
		});
		
		response.on('end', function() {
			
			if(data.length > 0) {
				try {
					//data_object = JSON.parse(data.substring(3));
			//		data_object = JSON.parse("{'matches':[{'t':'GOOGL','n':'Google Inc','e':'NASDAQ','id':'694653'},{'t':'GE','n':'General Electric Company','e':'NYSE','id':'14135'},{'t':'GLD','n':'SPDR Gold Trust (ETF)','e':'NYSEARCA','id':'702696'},{'t':'GRPN','n':'Groupon Inc','e':'NASDAQ','id':'10792264'},{'t':'GS','n':'Goldman Sachs Group Inc','e':'NYSE','id':'663137'},{'t':'GM','n':'General Motors Company','e':'NYSE','id':'14676476'},{'t':'PG','n':'Procter \u0026 Gamble Co','e':'NYSE','id':'29312'},{'t':'GBP','n':'British Pound','e':'CURRENCY','id':'10544306'},{'t':'DLLR','n':'DFC Global Corp','e':'NASDAQ','id':'695894'},{'t':'GILD','n':'Gilead Sciences, Inc.','e':'NASDAQ','id':'656627'},{'t':'GLW','n':'Corning Incorporated','e':'NYSE','id':'8966'},{'t':'PHYS','n':'Sprott Physical Gold Trust','e':'NYSEARCA','id':'9185356'},{'t':'UGL','n':'ProShares Ultra Gold (ETF)','e':'NYSEARCA','id':'10107396'},{'t':'GRBEQ','n':'Grubb \u0026 Ellis Company','e':'OTCMKTS','id':'16451'},{'t':'CMG','n':'Chipotle Mexican Grill, Inc.','e':'NYSE','id':'701829'}]}" );

				} catch(e) {
					return;
				}
									
				var quote = {};
			//	console.log(JSON.stringify(data_object, true, '\t') )
				
				
			}
		});
	});
	return myJson;
}


function getSingleQuote(p_ticker,res) {
	var quote = {};
	http.get({
		host: 'www.google.com',
		port: 80,
		path: '/finance/info?client=ig&q=' + p_ticker
	}, function(response) {
		response.setEncoding('utf8');
		var data = "";
					
		response.on('data', function(chunk) {
			data += chunk;
		});
		
		response.on('end', function() {
			if(data.length > 0) {
				try {
					var data_object = JSON.parse(data.substring(3));
				} catch(e) {
					return;
				}
									
				
				quote.ticker = data_object[0].t;
				quote.exchange = data_object[0].e;
				quote.price = data_object[0].l_cur;
				quote.change = data_object[0].c;
				quote.change_percent = data_object[0].cp;
				quote.last_trade_time = data_object[0].lt;
				quote.dividend = data_object[0].div;
				quote.yield = data_object[0].yld;
				res.send(JSON.stringify(quote));
				res.end();
			}
		});
	});
	
}
	/*
	
	json format for autocomplete
		{
				"id": "1",
				"value": "something",
				"label": "show me"
			},
			{
				"id": "2",
				"value": "something",
				"label": "show me")"
			},
			{
				"id": "3",
				"value": "something",
				"label": "show me"
			}
	
	*/
	var myJson=[ 
		
			{
				"id": "1",
				"value": "BAC",
				"label": "Bac 	BankOfAmerica	:NYSE"
			},
			{
				"id": "2",
				"value": "BABA",
				"label": "BABA	ALIBABA		:NASDAQ"
			},
			{
				"id": "3",
				"value": "BOE",
				"label": "BOE	BOeing		:NYSE"
			}
		
	];