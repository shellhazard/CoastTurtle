process.env.TZ = "Pacific/Palau"

const crypto = require('crypto');

exports = module.exports = {}

exports.subtractMinutes = function(date, min) {
	return new Date(date.getTime() - min * 60000);
}

exports.minutesUntilDate = function(date) {
	var difference = date.getTime() - Date.now(); // This will give difference in milliseconds
	var resultInMinutes = Math.round(difference / 60000);
	return resultInMinutes;
}

exports.formatDate = function(date) {
	var hours = date.getHours();
	var minutes = date.getMinutes();
	var ampm = hours >= 12 ? 'pm' : 'am';
	hours = hours % 12;
	hours = hours ? hours : 12; // the hour '0' should be '12'
	minutes = minutes < 10 ? '0'+minutes : minutes;
	var strTime = hours + ':' + minutes + ' ' + ampm;
	return (date.getMonth()+1) + "/" + date.getDate() + "/" + date.getFullYear() + "  " + strTime;
}

exports.hashText = function(text) {
	return crypto.createHash('md5').update(text).digest('hex');
}