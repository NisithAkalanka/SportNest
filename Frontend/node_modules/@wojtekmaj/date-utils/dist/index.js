/**
 * Utils
 */
function makeGetEdgeOfNeighbor(getPeriod, getEdgeOfPeriod, defaultOffset) {
    return function makeGetEdgeOfNeighborInternal(date, offset = defaultOffset) {
        const previousPeriod = getPeriod(date) + offset;
        return getEdgeOfPeriod(previousPeriod);
    };
}
function makeGetEnd(getBeginOfNextPeriod) {
    return function makeGetEndInternal(date) {
        return new Date(getBeginOfNextPeriod(date).getTime() - 1);
    };
}
function makeGetRange(getStart, getEnd) {
    return function makeGetRangeInternal(date) {
        return [getStart(date), getEnd(date)];
    };
}
/**
 * Simple getters - getting a property of a given point in time
 */
/**
 * Gets year from a given date.
 *
 * @param {DateLike} date Date to get year from
 * @returns {number} Year
 */
export function getYear(date) {
    if (date instanceof Date) {
        return date.getFullYear();
    }
    if (typeof date === 'number') {
        return date;
    }
    const year = Number.parseInt(date, 10);
    if (typeof date === 'string' && !Number.isNaN(year)) {
        return year;
    }
    throw new Error(`Failed to get year from date: ${date}.`);
}
/**
 * Gets month from a given date.
 *
 * @param {Date} date Date to get month from
 * @returns {number} Month
 */
export function getMonth(date) {
    if (date instanceof Date) {
        return date.getMonth();
    }
    throw new Error(`Failed to get month from date: ${date}.`);
}
/**
 * Gets human-readable month from a given date.
 *
 * @param {Date} date Date to get human-readable month from
 * @returns {number} Human-readable month
 */
export function getMonthHuman(date) {
    if (date instanceof Date) {
        return date.getMonth() + 1;
    }
    throw new Error(`Failed to get human-readable month from date: ${date}.`);
}
/**
 * Gets day of the month from a given date.
 *
 * @param {Date} date Date to get day of the month from
 * @returns {number} Day of the month
 */
export function getDate(date) {
    if (date instanceof Date) {
        return date.getDate();
    }
    throw new Error(`Failed to get year from date: ${date}.`);
}
/**
 * Gets hours from a given date.
 *
 * @param {Date | string} date Date to get hours from
 * @returns {number} Hours
 */
export function getHours(date) {
    if (date instanceof Date) {
        return date.getHours();
    }
    if (typeof date === 'string') {
        const datePieces = date.split(':');
        if (datePieces.length >= 2) {
            const hoursString = datePieces[0];
            if (hoursString) {
                const hours = Number.parseInt(hoursString, 10);
                if (!Number.isNaN(hours)) {
                    return hours;
                }
            }
        }
    }
    throw new Error(`Failed to get hours from date: ${date}.`);
}
/**
 * Gets minutes from a given date.
 *
 * @param {Date | string} date Date to get minutes from
 * @returns {number} Minutes
 */
export function getMinutes(date) {
    if (date instanceof Date) {
        return date.getMinutes();
    }
    if (typeof date === 'string') {
        const datePieces = date.split(':');
        if (datePieces.length >= 2) {
            const minutesString = datePieces[1] || '0';
            const minutes = Number.parseInt(minutesString, 10);
            if (!Number.isNaN(minutes)) {
                return minutes;
            }
        }
    }
    throw new Error(`Failed to get minutes from date: ${date}.`);
}
/**
 * Gets seconds from a given date.
 *
 * @param {Date | string} date Date to get seconds from
 * @returns {number} Seconds
 */
export function getSeconds(date) {
    if (date instanceof Date) {
        return date.getSeconds();
    }
    if (typeof date === 'string') {
        const datePieces = date.split(':');
        if (datePieces.length >= 2) {
            const secondsWithMillisecondsString = datePieces[2] || '0';
            const seconds = Number.parseInt(secondsWithMillisecondsString, 10);
            if (!Number.isNaN(seconds)) {
                return seconds;
            }
        }
    }
    throw new Error(`Failed to get seconds from date: ${date}.`);
}
/**
 * Gets milliseconds from a given date.
 *
 * @param {Date | string} date Date to get milliseconds from
 * @returns {number} Milliseconds
 */
export function getMilliseconds(date) {
    if (date instanceof Date) {
        return date.getMilliseconds();
    }
    if (typeof date === 'string') {
        const datePieces = date.split(':');
        if (datePieces.length >= 2) {
            const secondsWithMillisecondsString = datePieces[2] || '0';
            const millisecondsString = secondsWithMillisecondsString.split('.')[1] || '0';
            const milliseconds = Number.parseInt(millisecondsString, 10);
            if (!Number.isNaN(milliseconds)) {
                return milliseconds;
            }
        }
    }
    throw new Error(`Failed to get seconds from date: ${date}.`);
}
/**
 * Century
 */
/**
 * Gets century start date from a given date.
 *
 * @param {DateLike} date Date to get century start from
 * @returns {Date} Century start date
 */
export function getCenturyStart(date) {
    const year = getYear(date);
    const centuryStartYear = year + ((-year + 1) % 100);
    const centuryStartDate = new Date();
    centuryStartDate.setFullYear(centuryStartYear, 0, 1);
    centuryStartDate.setHours(0, 0, 0, 0);
    return centuryStartDate;
}
/**
 * Gets previous century start date from a given date.
 *
 * @param {DateLike} date Date to get previous century start from
 * @param {number} [offset=-100] Offset in years to calculate previous century start from
 * @returns {Date} Previous century start date
 */
export const getPreviousCenturyStart = makeGetEdgeOfNeighbor(getYear, getCenturyStart, -100);
/**
 * Gets next century start date from a given date.
 *
 * @param {DateLike} date Date to get next century start from
 * @param {number} [offset=100] Offset in years to calculate next century start from
 * @returns {Date} Next century start date
 */
export const getNextCenturyStart = makeGetEdgeOfNeighbor(getYear, getCenturyStart, 100);
/**
 * Gets century end date from a given date.
 *
 * @param {DateLike} date Date to get century end from
 * @returns {Date} Century end date
 */
export const getCenturyEnd = makeGetEnd(getNextCenturyStart);
/**
 * Gets previous century end date from a given date.
 *
 * @param {DateLike} date Date to get previous century end from
 * @param {number} [offset=-100] Offset in years to calculate previous century end from
 * @returns {Date} Previous century end date
 */
export const getPreviousCenturyEnd = makeGetEdgeOfNeighbor(getYear, getCenturyEnd, -100);
/**
 * Gets next century end date from a given date.
 *
 * @param {DateLike} date Date to get next century end from
 * @param {number} [offset=100] Offset in years to calculate next century end from
 * @returns {Date} Next century end date
 */
export const getNextCenturyEnd = makeGetEdgeOfNeighbor(getYear, getCenturyEnd, 100);
/**
 * Gets century start and end dates from a given date.
 *
 * @param {DateLike} date Date to get century start and end from
 * @returns {[Date, Date]} Century start and end dates
 */
export const getCenturyRange = makeGetRange(getCenturyStart, getCenturyEnd);
/**
 * Decade
 */
/**
 * Gets decade start date from a given date.
 *
 * @param {DateLike} date Date to get decade start from
 * @returns {Date} Decade start date
 */
export function getDecadeStart(date) {
    const year = getYear(date);
    const decadeStartYear = year + ((-year + 1) % 10);
    const decadeStartDate = new Date();
    decadeStartDate.setFullYear(decadeStartYear, 0, 1);
    decadeStartDate.setHours(0, 0, 0, 0);
    return decadeStartDate;
}
/**
 * Gets previous decade start date from a given date.
 *
 * @param {DateLike} date Date to get previous decade start from
 * @param {number} [offset=-10] Offset in years to calculate previous decade start from
 * @returns {Date} Previous decade start date
 */
export const getPreviousDecadeStart = makeGetEdgeOfNeighbor(getYear, getDecadeStart, -10);
/**
 * Gets next decade start date from a given date.
 *
 * @param {DateLike} date Date to get next decade start from
 * @param {number} [offset=10] Offset in years to calculate next decade start from
 * @returns {Date} Next decade start date
 */
export const getNextDecadeStart = makeGetEdgeOfNeighbor(getYear, getDecadeStart, 10);
/**
 * Gets decade end date from a given date.
 *
 * @param {DateLike} date Date to get decade end from
 * @returns {Date} Decade end date
 */
export const getDecadeEnd = makeGetEnd(getNextDecadeStart);
/**
 * Gets previous decade end date from a given date.
 *
 * @param {DateLike} date Date to get previous decade end from
 * @param {number} [offset=-10] Offset in years to calculate previous decade end from
 * @returns {Date} Previous decade end date
 */
export const getPreviousDecadeEnd = makeGetEdgeOfNeighbor(getYear, getDecadeEnd, -10);
/**
 * Gets next decade end date from a given date.
 *
 * @param {DateLike} date Date to get next decade end from
 * @param {number} [offset=10] Offset in years to calculate next decade end from
 * @returns {Date} Next decade end date
 */
export const getNextDecadeEnd = makeGetEdgeOfNeighbor(getYear, getDecadeEnd, 10);
/**
 * Gets decade start and end dates from a given date.
 *
 * @param {DateLike} date Date to get decade start and end from
 * @returns {[Date, Date]} Decade start and end dates
 */
export const getDecadeRange = makeGetRange(getDecadeStart, getDecadeEnd);
/**
 * Year
 */
/**
 * Gets year start date from a given date.
 *
 * @param {DateLike} date Date to get year start from
 * @returns {Date} Year start date
 */
export function getYearStart(date) {
    const year = getYear(date);
    const yearStartDate = new Date();
    yearStartDate.setFullYear(year, 0, 1);
    yearStartDate.setHours(0, 0, 0, 0);
    return yearStartDate;
}
/**
 * Gets previous year start date from a given date.
 *
 * @param {DateLike} date Date to get previous year start from
 * @param {number} [offset=-1] Offset in years to calculate previous year start from
 * @returns {Date} Previous year start date
 */
export const getPreviousYearStart = makeGetEdgeOfNeighbor(getYear, getYearStart, -1);
/**
 * Gets next year start date from a given date.
 *
 * @param {DateLike} date Date to get next year start from
 * @param {number} [offset=1] Offset in years to calculate next year start from
 * @returns {Date} Next year start date
 */
export const getNextYearStart = makeGetEdgeOfNeighbor(getYear, getYearStart, 1);
/**
 * Gets year end date from a given date.
 *
 * @param {DateLike} date Date to get year end from
 * @returns {Date} Year end date
 */
export const getYearEnd = makeGetEnd(getNextYearStart);
/**
 * Gets previous year end date from a given date.
 *
 * @param {DateLike} date Date to get previous year end from
 * @param {number} [offset=-1] Offset in years to calculate previous year end from
 * @returns {Date} Previous year end date
 */
export const getPreviousYearEnd = makeGetEdgeOfNeighbor(getYear, getYearEnd, -1);
/**
 * Gets next year end date from a given date.
 *
 * @param {DateLike} date Date to get next year end from
 * @param {number} [offset=1] Offset in years to calculate next year end from
 * @returns {Date} Next year end date
 */
export const getNextYearEnd = makeGetEdgeOfNeighbor(getYear, getYearEnd, 1);
/**
 * Gets year start and end dates from a given date.
 *
 * @param {DateLike} date Date to get year start and end from
 * @returns {[Date, Date]} Year start and end dates
 */
export const getYearRange = makeGetRange(getYearStart, getYearEnd);
/**
 * Month
 */
function makeGetEdgeOfNeighborMonth(getEdgeOfPeriod, defaultOffset) {
    return function makeGetEdgeOfNeighborMonthInternal(date, offset = defaultOffset) {
        const year = getYear(date);
        const month = getMonth(date) + offset;
        const previousPeriod = new Date();
        previousPeriod.setFullYear(year, month, 1);
        previousPeriod.setHours(0, 0, 0, 0);
        return getEdgeOfPeriod(previousPeriod);
    };
}
/**
 * Gets month start date from a given date.
 *
 * @param {DateLike} date Date to get month start from
 * @returns {Date} Month start date
 */
export function getMonthStart(date) {
    const year = getYear(date);
    const month = getMonth(date);
    const monthStartDate = new Date();
    monthStartDate.setFullYear(year, month, 1);
    monthStartDate.setHours(0, 0, 0, 0);
    return monthStartDate;
}
/**
 * Gets previous month start date from a given date.
 *
 * @param {Date} date Date to get previous month start from
 * @param {number} [offset=-1] Offset in months to calculate previous month start from
 * @returns {Date} Previous month start date
 */
export const getPreviousMonthStart = makeGetEdgeOfNeighborMonth(getMonthStart, -1);
/**
 * Gets next month start date from a given date.
 *
 * @param {Date} date Date to get next month start from
 * @param {number} [offset=1] Offset in months to calculate next month start from
 * @returns {Date} Next month start date
 */
export const getNextMonthStart = makeGetEdgeOfNeighborMonth(getMonthStart, 1);
/**
 * Gets month end date from a given date.
 *
 * @param {Date} date Date to get month end from
 * @returns {Date} Month end date
 */
export const getMonthEnd = makeGetEnd(getNextMonthStart);
/**
 * Gets previous month end date from a given date.
 *
 * @param {Date} date Date to get previous month end from
 * @param {number} [offset=-1] Offset in months to calculate previous month end from
 * @returns {Date} Previous month end date
 */
export const getPreviousMonthEnd = makeGetEdgeOfNeighborMonth(getMonthEnd, -1);
/**
 * Gets next month end date from a given date.
 *
 * @param {Date} date Date to get next month end from
 * @param {number} [offset=1] Offset in months to calculate next month end from
 * @returns {Date} Next month end date
 */
export const getNextMonthEnd = makeGetEdgeOfNeighborMonth(getMonthEnd, 1);
/**
 * Gets month start and end dates from a given date.
 *
 * @param {Date} date Date to get month start and end from
 * @returns {[Date, Date]} Month start and end dates
 */
export const getMonthRange = makeGetRange(getMonthStart, getMonthEnd);
/**
 * Day
 */
function makeGetEdgeOfNeighborDay(getEdgeOfPeriod, defaultOffset) {
    return function makeGetEdgeOfNeighborDayInternal(date, offset = defaultOffset) {
        const year = getYear(date);
        const month = getMonth(date);
        const day = getDate(date) + offset;
        const previousPeriod = new Date();
        previousPeriod.setFullYear(year, month, day);
        previousPeriod.setHours(0, 0, 0, 0);
        return getEdgeOfPeriod(previousPeriod);
    };
}
/**
 * Gets day start date from a given date.
 *
 * @param {DateLike} date Date to get day start from
 * @returns {Date} Day start date
 */
export function getDayStart(date) {
    const year = getYear(date);
    const month = getMonth(date);
    const day = getDate(date);
    const dayStartDate = new Date();
    dayStartDate.setFullYear(year, month, day);
    dayStartDate.setHours(0, 0, 0, 0);
    return dayStartDate;
}
/**
 * Gets previous day start date from a given date.
 *
 * @param {Date} date Date to get previous day start from
 * @param {number} [offset=-1] Offset in days to calculate previous day start from
 * @returns {Date} Previous day start date
 */
export const getPreviousDayStart = makeGetEdgeOfNeighborDay(getDayStart, -1);
/**
 * Gets next day start date from a given date.
 *
 * @param {Date} date Date to get next day start from
 * @param {number} [offset=1] Offset in days to calculate next day start from
 * @returns {Date} Next day start date
 */
export const getNextDayStart = makeGetEdgeOfNeighborDay(getDayStart, 1);
/**
 * Gets day end date from a given date.
 *
 * @param {Date} date Date to get day end from
 * @returns {Date} Day end date
 */
export const getDayEnd = makeGetEnd(getNextDayStart);
/**
 * Gets previous day end date from a given date.
 *
 * @param {DateLike} date Date to get previous day end from
 * @param {number} [offset=-1] Offset in days to calculate previous day end from
 * @returns {Date} Previous day end date
 */
export const getPreviousDayEnd = makeGetEdgeOfNeighborDay(getDayEnd, -1);
/**
 * Gets next day end date from a given date.
 *
 * @param {DateLike} date Date to get next day end from
 * @param {number} [offset=1] Offset in days to calculate next day end from
 * @returns {Date} Next day end date
 */
export const getNextDayEnd = makeGetEdgeOfNeighborDay(getDayEnd, 1);
/**
 * Gets day start and end dates from a given date.
 *
 * @param {DateLike} date Date to get day start and end from
 * @returns {[Date, Date]} Day start and end dates
 */
export const getDayRange = makeGetRange(getDayStart, getDayEnd);
/**
 * Other
 */
/**
 * Returns a number of days in a month of a given date.
 *
 * @param {Date} date Date
 * @returns {number} Number of days in a month
 */
export function getDaysInMonth(date) {
    return getDate(getMonthEnd(date));
}
function padStart(num, val = 2) {
    const numStr = `${num}`;
    if (numStr.length >= val) {
        return num;
    }
    return `0000${numStr}`.slice(-val);
}
/**
 * Returns local hours and minutes (hh:mm).
 *
 * @param {Date | string} date Date to get hours and minutes from
 * @returns {string} Local hours and minutes
 */
export function getHoursMinutes(date) {
    const hours = padStart(getHours(date));
    const minutes = padStart(getMinutes(date));
    return `${hours}:${minutes}`;
}
/**
 * Returns local hours, minutes and seconds (hh:mm:ss).
 *
 * @param {Date | string} date Date to get hours, minutes and seconds from
 * @returns {string} Local hours, minutes and seconds
 */
export function getHoursMinutesSeconds(date) {
    const hours = padStart(getHours(date));
    const minutes = padStart(getMinutes(date));
    const seconds = padStart(getSeconds(date));
    return `${hours}:${minutes}:${seconds}`;
}
/**
 * Returns local month in ISO-like format (YYYY-MM).
 *
 * @param {Date} date Date to get month in ISO-like format from
 * @returns {string} Local month in ISO-like format
 */
export function getISOLocalMonth(date) {
    const year = padStart(getYear(date), 4);
    const month = padStart(getMonthHuman(date));
    return `${year}-${month}`;
}
/**
 * Returns local date in ISO-like format (YYYY-MM-DD).
 *
 * @param {Date} date Date to get date in ISO-like format from
 * @returns {string} Local date in ISO-like format
 */
export function getISOLocalDate(date) {
    const year = padStart(getYear(date), 4);
    const month = padStart(getMonthHuman(date));
    const day = padStart(getDate(date));
    return `${year}-${month}-${day}`;
}
/**
 * Returns local date & time in ISO-like format (YYYY-MM-DDThh:mm:ss).
 *
 * @param {Date} date Date to get date & time in ISO-like format from
 * @returns {string} Local date & time in ISO-like format
 */
export function getISOLocalDateTime(date) {
    return `${getISOLocalDate(date)}T${getHoursMinutesSeconds(date)}`;
}
