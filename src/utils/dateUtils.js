const moment = require('moment');

// Get week number for a given date
const getWeekNumber = (date) => {
	return moment(date).isoWeek();
};

module.exports = {
	getWeekNumber,
};
