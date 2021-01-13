import { connection } from '../common/connection';
import { StudentService } from '../services/modelServices/StudentService';
import nodemailer from 'nodemailer';
import converter from 'json-2-csv';
import moment from 'moment';
import { config } from '../appConfig';

export const getAllStudents = async (req, res) => {
  try {
    const sequelize = await connection();
    const studentService = new StudentService(sequelize);

    if (req.query.pageNumber && req.query.pageSize) {
      const pN = parseInt(req.query.pageNumber);
      const pS = parseInt(req.query.pageSize);
      const students = await studentService.getAllStudents(pN, pS);
      return res.json(students);
    } else {
      const students = await studentService.getAllStudents(null, null);
      return res.json(students);
    }
  } catch (err) {
    return err;
  }
};

export const getStudentById = async (req, res) => {
  try {
    const sequelize = await connection();
    const studentService = new StudentService(sequelize);
    const stu = await studentService.getOneStudentbyId(req.params.guid);
    return res.json(stu);
  } catch (err) {
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
      return res.json({ message: 'Created', createdStudent });
    } else {
      return res.json({ message: 'Already Created with same firstname' });
    }
  } catch (err) {
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
      return res.json(stu);
    } else {
      return res.json(stu);
    }
  } catch (err) {
    throw err;
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
      return res.json({ message: `Mail Sent to ${stu.email}` });
    }
  } catch (err) {
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
