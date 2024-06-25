const moment = require('moment');
const { getWeekNumber } = require('./utils/dateUtils');

// Load configurations
const cashInConfig = require('./config/cashInConfig.json');
const cashOutNaturalConfig = require('./config/cashOutNaturalConfig.json');
const cashOutJuridicalConfig = require('./config/cashOutJuridicalConfig.json');

const userCashOutHistory = {};

// Calculate commission fees for all operations
const calculateCommission = (operations) => {
	return operations.map(operation => calculateOperationCommission(operation));
};

// Calculate commission fee for a single operation
const calculateOperationCommission = (operation) => {
	const { type, user_type, operation: { amount } } = operation;
	switch (type) {
		case 'cash_in':
			return calculateCashInCommission(amount);
		case 'cash_out':
			return user_type === 'natural'
				? calculateCashOutNaturalCommission(operation)
				: calculateCashOutJuridicalCommission(amount);
		default:
			throw new Error(`Unsupported operation type: ${type}`);
	}
};

// Cash In commission calculation
const calculateCashInCommission = (amount) => {
	const commission = (amount * cashInConfig.percents) / 100;
	const finalCommission = Math.min(commission, cashInConfig.max.amount);
	return finalCommission.toFixed(2);
};

// Cash Out commission calculation for natural persons
const calculateCashOutNaturalCommission = (operation) => {
	const { date, user_id, operation: { amount } } = operation;
	const weekNumber = getWeekNumber(date);
	
	if (!userCashOutHistory[user_id]) {
		userCashOutHistory[user_id] = {};
	}
	if (!userCashOutHistory[user_id][weekNumber]) {
		userCashOutHistory[user_id][weekNumber] = 0;
	}
	
	const totalAmountThisWeek = userCashOutHistory[user_id][weekNumber];
	const newTotalAmount = totalAmountThisWeek + amount;
	
	let commissionableAmount = 0;
	if (totalAmountThisWeek >= cashOutNaturalConfig.week_limit.amount) {
		commissionableAmount = amount;
	} else if (newTotalAmount > cashOutNaturalConfig.week_limit.amount) {
		commissionableAmount = newTotalAmount - cashOutNaturalConfig.week_limit.amount;
	}
	
	userCashOutHistory[user_id][weekNumber] = newTotalAmount;
	const commission = (commissionableAmount * cashOutNaturalConfig.percents) / 100;
	return (Math.ceil(commission * 100) / 100).toFixed(2); // Rounding up to the nearest cent
};

// Cash Out commission calculation for juridical persons
const calculateCashOutJuridicalCommission = (amount) => {
	const commission = (amount * cashOutJuridicalConfig.percents) / 100;
	const finalCommission = Math.max(commission, cashOutJuridicalConfig.min.amount);
	return finalCommission.toFixed(2);
};

module.exports = calculateCommission;
