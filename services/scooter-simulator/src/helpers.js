/**
 * Select a random value between min and max
 *
 * @param {Number} min
 * @param {Number} max
 * @returns {Number}
 */
export function rand(min, max) {
    return min + Math.random() * (max - min);
}

/**
 * Make sure a given number is in the range min-max.
 * If not, clamp it to min or max.
 *
 * @param {Number} n
 * @param {Number} min
 * @param {Number} max
 * @returns {Number}
 */
export function clamp(n, min, max) {
    return Math.max(min, Math.min(max, n));
}

/**
 * Select a random value from an array.
 *
 * @param {Array} arr
 * @returns a random value from the array
 */
export function pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Sleep for `n` ms
 *
 * @param {number} n
 * @returns {Promise}
 */
export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
