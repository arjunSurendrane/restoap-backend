const crypto = require('crypto');

/**
 * Create a random password
 * @returns {Promise}
 */
const createRandomPassword = async () => {
  const upperCaseCharacters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowerCaseCharacters = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const randomUpper = crypto.randomBytes(7);
  const randomLower = crypto.randomBytes(9);
  const randomNumber = crypto.randomBytes(5);
  const upperCaseResult = new Array(3);
  const lowerCaseResult = new Array(3);
  const numbersResult = new Array(4);

  for (let i = 0; i < 3; i += 1) {
    upperCaseResult[i] = upperCaseCharacters[randomUpper[i] % upperCaseCharacters.length];
  }
  for (let i = 0; i < 3; i += 1) {
    lowerCaseResult[i] = lowerCaseCharacters[randomLower[i] % lowerCaseCharacters.length];
  }
  for (let i = 0; i < 4; i += 1) {
    numbersResult[i] = numbers[randomNumber[i] % numbers.length];
  }

  const finalShuffleString = upperCaseResult.join('') + lowerCaseResult.join('') + numbersResult.join('');

  const password = finalShuffleString
    .split('')
    .sort(() => Math.random() - 0.5)
    .join('');

  return password;
};

module.exports = { createRandomPassword };
