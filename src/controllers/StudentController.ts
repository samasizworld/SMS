import { connection } from '../common/connection';
import { StudentService } from '../services/modelServices/StudentService';
import nodemailer from 'nodemailer';
import converter from 'json-2-csv';
import moment from 'moment';
import { config } from '../appConfig';
import { compileTemplate, pdfGenerateByHtml } from '../utils/pdfGenerate';
import * as log from '../utils/logger';

export const getAllStudents = async (req, res) => {
  try {
    const sequelize = await connection();
    const studentService = new StudentService(sequelize);

    if (req.query.pageNumber && req.query.pageSize) {
      const pN = parseInt(req.query.pageNumber);
      const pS = parseInt(req.query.pageSize);
      const students = await studentService.getAllStudents(pN, pS);
      log.info(
        'Students Data fetched with pageNo and pageSize',
        '/getallstudents',
        null,
        req.loginUserInfo.userid
      );
      return res.json(students);
    } else {
      const students = await studentService.getAllStudents(null, null);
      log.info(
        'Students Data fetched with no pageNo and no pageSize',
        '/getallstudents',
        null,
        req.loginUserInfo.userid
      );
      return res.json(students);
    }
  } catch (err) {
    log.error(
      'Error while fetching students data',
      '/getallstudents',
      err,
      null
    );
    return err;
  }
};

export const getStudentById = async (req, res) => {
  try {
    const sequelize = await connection();
    const studentService = new StudentService(sequelize);
    const stu = await studentService.getOneStudentbyId(req.params.guid);
    log.info(
      'Student Data fetched by id',
      '/getstudentbyid',
      null,
      req.loginUserInfo.userid
    );
    return res.json(stu);
  } catch (err) {
    log.error('Error while getting studentby id', '/getstudentbyid', err, null);
    return err;
  }
};

export const createNewStudent = async (req, res) => {
  try {
    const sequelize = await connection();
    const studentService = new StudentService(sequelize);
    const { firstname, lastname, address } = req.body;
    const studentDetails = await studentService.getStudentDetails(firstname);
    if (!studentDetails) {
      const createdStudent: any = await studentService.insertStudent({
        firstname,
        lastname,
        address,
      });
      log.info(
        'Student Created',
        '/createStudent',
        null,
        req.loginUserInfo.userid
      );
      return res.json({ message: 'Created', createdStudent });
    } else {
      log.info(
        'Student already there with same name',
        '/createStudent',
        null,
        req.loginUserInfo.userid
      );
      return res.json({ message: 'Already Created with same firstname' });
    }
  } catch (err) {
    log.error(err.message, '/createnewstudent', err.stack, null);
    return err;
  }
};

export const updateStudent = async (req, res) => {
  try {
    const sequelize = await connection();
    const studentService = new StudentService(sequelize);
    const { firstname, lastname, address } = req.body;

    const updatedStudent: any = await studentService.updateStudent(
      { firstname, lastname, address },
      req.params.guid
    );
    return res.json({ message: 'Student Data Updated', updatedStudent });
  } catch (err) {
    return err;
  }
};

export const deleteStudent = async (req, res) => {
  try {
    const sequelize = await connection();
    const studentService = new StudentService(sequelize);
    await studentService.deleteStudent(req.params.guid); //return row affected
    return res.json({ message: 'Student Data deleted' });
  } catch (err) {
    log.error(err.message, '/deletestudent', err.stack, null);
    return err;
  }
};

export const getResultByStudentId = async (req, res) => {
  try {
    const guid = req.params.guid;
    const sequelize = await connection();
    const studentService = new StudentService(sequelize);
    // sequelize way of raw query
    const students = await studentService.executeQuery(guid);
    const stu = students[0];
    if (stu.results.a === null) {
      stu.results = {};
      log.info(
        'student Details found by id with no result',
        '/getresultbystudentid',
        null,
        req.loginUserInfo.userid
      );
      return res.json(stu);
    } else {
      log.info(
        'student Details found by id with result',
        '/getresultbystudentid',
        null,
        req.loginUserInfo.userid
      );
      return res.json(stu);
    }
  } catch (err) {
    log.error(err.message, '/getresultbystudentid', err.stack, null);
    return err;
  }
};

export const sendStudentResultsToMail = async (req, res) => {
  try {
    const guid = req.params.guid;
    const sequelize = await connection();
    const studentService = new StudentService(sequelize);
    // sequelize way of raw query
    const students = await studentService.executeQuery(guid);
    const stu = students[0];
    if (stu.results.a === null) {
      stu.results = {};
      log.error(
        'No result found',
        '/sendstudentresulttomail',
        null,
        req.loginUserInfo.userid
      );
      return res.json({ err: 'No Result Found' });
    } else {
      const position = stu.results.score;
      delete stu.results.score;
      stu.results.Score = position;
      const results = { Name: stu.firstName, ...stu.results };
      const csvFile = await converter.json2csvAsync(results);
      const transporter = nodemailer.createTransport({
        // service: config.serviceName,
        host: config.hostName,
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
          user: config.emailId, // generated ethereal user
          pass: config.emailPassword, // generated ethereal password
        },
      });
      // send mail with defined transport object
      let info = await transporter.sendMail({
        from: `"Results" <${config.emailId}>`, // sender address
        to: stu.email, // list of receivers
        subject: `Result`, // Subject line
        text: `Hi,${stu.firstName}`, // plain text body
        attachments: [
          {
            filename: `Result-${stu.firstName}-${moment().format(
              'HH:mm:ss YYYY'
            )}.csv`,
            content: csvFile, //Buffer.from(csvFile, 'utf-8'),
            contentType: 'text/csv',
          },
        ],
      });
      console.log('Message sent: %s', info.messageId);
      log.info(
        'Message Sent',
        '/sendstudentresult',
        null,
        req.loginUserInfo.userid
      );
      return res.json({ message: `Mail Sent to ${stu.email}` });
    }
  } catch (err) {
    log.error(err.message, '/sendstudentresultscsvTomail', err.stack, null);
    throw err;
  }
};

export const downloadStudentResultById = async (req, res) => {
  try {
    const guid = req.params.guid;
    const sequelize = await connection();
    const studentService = new StudentService(sequelize);
    // sequelize way of raw query
    const students = await studentService.executeQuery(guid);
    const stu = students[0];
    if (stu.results.a === null) {
      stu.results = {};
      return res.json({ err: 'No Result Found' });
    } else {
      const position = stu.results.score;
      delete stu.results.score;
      stu.results.Score = position;
      const results = { Name: stu.firstName, ...stu.results };
      const csvFile = await converter.json2csvAsync(results);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=results.csv');
      res.end(csvFile);
    }
  } catch (err) {
    return err;
  }
};

export const getStudentPdfInResultByStudentId = async (req, res) => {
  try {
    const guid = req.params.guid;
    const sequelize = await connection();
    const studentService = new StudentService(sequelize);
    // sequelize way of raw query
    const students = await studentService.executeQuery(guid);
    const stu = students[0];
    if (stu.results.a === null) {
      stu.results = {};
      return res.json(stu);
    } else {
      try {
        const { firstName, results } = stu;
        const score = results.score;
        delete results.score;
        const template = await compileTemplate('results', {
          firstName,
          results,
          score,
        });
        await pdfGenerateByHtml(template);

        return res.json({ message: 'Pdf Created' });
      } catch (err) {
        return err;
      }
    }
  } catch (err) {
    throw err;
  }
};

export const SendStudentPdfInEmailByStudentId = async (req, res) => {
  try {
    const guid = req.params.guid;
    const sequelize = await connection();
    const studentService = new StudentService(sequelize);
    // sequelize way of raw query
    const students = await studentService.executeQuery(guid);
    const stu = students[0];
    if (stu.results.a === null) {
      stu.results = {};
      log.info(
        'No result found',
        '/sendstudentpdfinemailbystudentid',
        null,
        req.loginUserInfo.userid
      );
      return res.json({
        message: `There is no result associated with ${stu.firstName}`,
      });
    } else {
      try {
        const { firstName, results } = stu;
        const score = results.score;
        delete results.score;
        const template = await compileTemplate('results', {
          firstName,
          results,
          score,
        });

        const pdf = await pdfGenerateByHtml(template);
        const transporter = nodemailer.createTransport({
          // service: config.serviceName,
          host: config.hostName,
          port: 587,
          secure: false, // true for 465, false for other ports
          auth: {
            user: config.emailId, // generated ethereal user
            pass: config.emailPassword, // generated ethereal password
          },
        });
        // send mail with defined transport object
        let info = await transporter.sendMail({
          from: `"Results" <${config.emailId}>`, // sender address
          to: stu.email, // list of receivers
          subject: `Result`, // Subject line
          text: `Hi,${stu.firstName}`, // plain text body
          attachments: [
            {
              filename: `Result-${stu.firstName}-${moment().format(
                'HHmmssYYYYmmddss'
              )}.pdf`,
              content: Buffer.from(pdf, 'utf-8'),
              contentType: 'text/pdf',
            },
          ],
        });
        console.log('Message sent: %s', info.messageId);
        log.info(
          'Mail sent',
          '/sendstudentresultpdfTomail',
          null,
          req.loginUserInfo.userid
        );
        return res.json({ message: `Mail Sent to ${stu.email}` });
      } catch (err) {
        log.error(err.message, '/sendstudentresultpdftomail', err.stack, null);
        return err;
      }
    }
  } catch (err) {
    log.error(err.message, '/sendstudentresultpdfbystudentid', err.stack, null);
    return err;
  }
};
