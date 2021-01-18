import moment from 'moment';
import { LogInfoService } from '../services/modelServices/loginfoService';
import { connection } from '../common/connection';
import fs from 'fs';
import createFile from 'create-file';
import path from 'path';

// file writing and db inserting for info
export async function info(
  description: string,
  message: string,
  additionaldetails: string,
  userid: number
) {
  await Log(description, message, additionaldetails, userid, 'I');
  await FileLog(description, message, additionaldetails, userid, 'I');
}

//file writing and db inserting for error
export async function error(
  description: string,
  message: string,
  additionaldetails: string,
  userid: number
) {
  await Log(description, message, additionaldetails, userid, 'E');
  await FileLog(description, message, additionaldetails, userid, 'E');
}

//db logging
const Log = async (
  description: string,
  message: string,
  additionaldetails: string,
  userid: number,
  severity: string
) => {
  try {
    const sequelize = await connection();
    const loginfoService = new LogInfoService(sequelize);
    const createClause = {
      processname: 'sms',
      description: JSON.stringify(description),
      message: message,
      userid: userid,
      severity: severity,
      additionaldetails: JSON.stringify(additionaldetails),
    };
    const loginfo = await loginfoService.insertloginfo(createClause);
    return loginfo;
  } catch (err) {}
};

//file logging
const FileLog = async (
  description: string,
  message: string,
  additionaldetails: string,
  userid: number,
  severity: string
) => {
  var logFilePath = path.join(
    __dirname,
    'log',
    `${`logger-${moment().format('YYYYMMDD')}_logs.log`}`
  );
  var logText =
    'UserId: ' +
    userid +
    ', ' +
    'Time: ' +
    moment().format('YYYY-MM-DD HH:mm:ss') +
    ', ' +
    'Severity: ' +
    severity +
    ', ' +
    'Desc: ' +
    description +
    ', ' +
    '\n' +
    'Msg:\n' +
    message +
    ',' +
    '\n' +
    'ErrStack:\n' +
    additionaldetails +
    '\n\n\n';

  if (!fs.existsSync(path.join(__dirname, 'log'))) {
    fs.mkdirSync(path.join(__dirname, 'log'));
    createFile(logFilePath, '', (err: any) => {
      if (err) console.log(err);
    });
  }
  var infoStream = await fs.createWriteStream(logFilePath, { flags: 'a' });
  infoStream.write(logText);
  infoStream.end();
};
