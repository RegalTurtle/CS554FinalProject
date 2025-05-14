import { ObjectId } from 'mongodb';
export function checkIsProperString(str: string | null, variableName?: string | null, min?: number | null, max?: number | null, validValues?: string[]) {
  if (!str) {
    throw new Error(`${variableName || 'String'} not provided`);
  }

  if (typeof str !== 'string') {
    throw new Error(`${variableName || 'Provided variable'} is not a string`);
  }
  str = str.trim()
  if (str.length === 0) {
    throw new Error(`${variableName || 'Provided string'} is empty`);
  }
  if (min) {
    if (str.length < min) {
      throw new Error(`${variableName || 'Provided string'} needs to have a minimum of ${min} characters`);
    }
  }
  if (max) {
    if (str.length > max) {
      throw new Error(`${variableName || 'Provided string'} needs to have a maximum of ${max} characters`);
    }
  }
  if (validValues) {
    if (Array.isArray(validValues)) {
      if (validValues.length > 0) {
        if (!validValues.includes(str.toLowerCase())) {
          throw new Error(`${variableName || 'Provided string'} is not a valid value`);
        }
      }
    }
  }

  return str
}

export function checkIsProperID(str: string | null, variableName?: string | null) {
  str = checkIsProperString(str, variableName)
  if (!ObjectId.isValid(str)) throw new Error('invalid object ID');
  return str
}
export function checkIsProperPassword(str: string | null, variableName?: string | null, min?: number | null, max?: number | null) {
  str = checkIsProperString(str, variableName, min, max)
  const alphabet = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '1234567890';
  let upper = false;
  let lower = false;
  let num = false;
  let special = false;
  for (let j of str) {
    if (numbers.includes(j)) {
      num = true;
    }
    else if (alphabet.includes(j)) {
      lower = true;
    }
    else if (alphabet.toUpperCase().includes(j)) {
      upper = true;
    }
    else if (j === " ") {
      throw new Error(`${variableName || 'Provided password'} cannot contain spaces`);
    }
    else if (!alphabet.includes(j)) {
      special = true;
    }
  }
  if (!(upper && lower && num && special)) {
    throw new Error(`${variableName || 'Provided password'} is invalid, must contain at least one lowercase letter, at least one uppercase character, at least one number and at least one special character`)
  }

  return str
}


export function checkIsProperEmail(str: string | null, variableName?: string | null) {
  str = checkIsProperString(str, variableName);

  // General email regex covering most common valid formats while rejecting invalid ones like consecutive dots
  const emailRegex =
    /^(?!.*\.\.)(?:[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x20-\x21\x23-\x5B\x5D-\x7E]|\\[\x00-\x7F])*")@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;

  if (!emailRegex.test(str)) {
    throw new Error(`${variableName || 'Provided email'} is not a valid email address`);
  }

  return str;
}

export function isValidName(str: string | null, variableName?: string | null, min?: number | null, max?: number | null) {
  str = checkIsProperString(str, variableName, min, max)
  const regex = /^[a-zA-Z]+([.'’-][a-zA-Z]+)*(\s[a-zA-Z]+([.'’-][a-zA-Z]+)*)*$/;
  if (!regex.test(str)) {
    throw new Error(`${variableName || 'Provided name'} is invalid`)

  }
  return str
}