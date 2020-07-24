const fs = require('fs'); 
const fetch = require('node-fetch')

const utils = require('./utils.js')

const config = require('../config.json')

exports.checkUpdate = async function() {
	// Fetch update text
	let response = await fetch(config.updateUrl);
	let data = await response.text();
	// Get md5 hash
	let newhash = utils.hashText(data);
	// Check hashfile and compare
	let oldhash = await fs.promises.readFile(config.hashfilePath, 'utf8')
	// If it matches, then do nothing
	if (newhash == oldhash) return null;
	// Else write the new hash and return updated data
	await fs.promises.writeFile(config.hashfilePath, newhash, 'utf8')
	return exports.parse(data);
}

exports.parse = function(text) {
	while (/\[.*\](.+?)\[\-\]/.test(text)) {
		text = text.replace(/\[.*\](.+?)\[\-\]/, "**[$1]**")
	}
	return text;
}