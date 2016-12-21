var express = require('express');
var router = express.Router();
var request = require('request');
var fs = require('fs');
/**
	 parse row into object
*/
function parseRow(headers, row) {
	var rowVal = {};
	for (var i = 0; i < row.length; i++) {
		rowVal[headers[i]] = row[i];
	}
	return rowVal;
}



router.get('/parseCSV', function(req, res, next) {
	var csvUrl = req.query.q;
	var currentTime = new Date().getTime().toString();
	var fileName = './tmp/tmpfile_' + Math.ceil(Math.random() * 100000) + '_' + currentTime + '.csv'
	var wStream = fs.createWriteStream(fileName); // create write stream to write downloaded file
	request(csvUrl).pipe(wStream); // attach write stream to request 
	wStream.on('finish', function() {
		//once request finished parse
		var responseArray = [];
		//read file
		fs.readFile(fileName, 'utf8', function(err, data) {
			var csvData = data.split(/\r\n/); // split data into rows
			var header = csvData.splice(0, 1)[0].split(/\,/);// extract first line headers
			
			for (var i = 0; i < csvData.length; i++) {
				var row = csvData[i].split(/\,/); // split rows into fields
				var rowVal = parseRow(header, row);
				responseArray.push(rowVal);
			}
			fs.unlink(fileName);
			res.send(responseArray);

		});
	})
});

module.exports = router;