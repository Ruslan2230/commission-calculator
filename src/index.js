const fs = require('fs');
const path = require('path');
const calculateCommission = require('./commissionCalculator');

const inputFilePath = process.argv[2];

if (!inputFilePath) {
	console.error('Please provide the path to the input file as a command line argument.');
	process.exit(1);
}

let inputData;
try {
	const fileContent = fs.readFileSync(path.resolve(inputFilePath), 'utf8');
	inputData = JSON.parse(fileContent);
} catch (error) {
	console.error('Error reading or parsing the input file:', error.message);
	process.exit(1);
}

const results = calculateCommission(inputData);

results.forEach(result => console.log(result));
