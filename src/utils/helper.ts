import * as crypto from 'crypto';
import moment from 'moment';

export const HashPassword = (saltKey, password) => {
  var encryptTimes = 1024;

  password = saltKey + password;

  for (var i = 0; i < encryptTimes; i++) {
    password = Hash(password);
  }

  return password;
};

export const Hash = (value) => {
  var buffer = Buffer.from(value);
  var decrypt = crypto.createHash('sha1');

  decrypt.update(buffer);

  var hexString = decrypt.digest('hex');

  return hexString;
};
export const calculateTotalSeconds = (dT) => {
  const datetime = moment(dT).format('YYYY-MM-DD HH:mm:ss');
  const date = datetime.split(' ')[0];
  const time = datetime.split(' ')[1];
  const month = parseInt(date.split('-')[1]);
  const day = parseInt(date.split('-')[2]);

  const hr = parseInt(time.split(':')[0]);
  const min = parseInt(time.split(':')[1]);
  const sec = parseInt(time.split(':')[2]);

  return (
    12 * 30 * 24 * 60 * 60 +
    month * 30 * 24 * 60 * 60 +
    day * 24 * 60 * 60 +
    hr * 60 * 60 +
    min * 60 +
    sec
  );
};

export const isGuid = (guidToTest) => {
  var regexGuid = /^(\{){0,1}[0-9a-fA-F]{8}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{12}(\}){0,1}$/gi;
  return regexGuid.test(guidToTest);
};
