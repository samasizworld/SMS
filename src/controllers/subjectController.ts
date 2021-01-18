import { SubjectService } from '../services/modelServices/subjectService';
import { connection } from '../common/connection';
import * as log from '../utils/logger';

export const insertSubject = async (req, res) => {
  try {
    const sequelize = await connection();
    const subjectService = new SubjectService(sequelize);
    const data = req.body;
    const SubjectDetails = await subjectService.getSubjectDetails(
      req.body.subjectname
    );
    if (!SubjectDetails) {
      const sub = await subjectService.insertSubject(data);
      log.info(
        'Subject Created',
        '/createsubject',
        null,
        req.loginUserInfo.userid
      );
      return res.json({ message: 'Subject Created', sub });
    } else {
      log.error(
        'Subject with name already there',
        '/createsubject',
        null,
        req.loginUserInfo.userid
      );
      return res.json({ message: 'Already Created' });
    }
  } catch (err) {
    log.error(err.message, '/createsubject', err.stack, null);
    return err;
  }
};

export const updateSubject = async (req, res) => {
  try {
    const sequelize = await connection();
    const subjectService = new SubjectService(sequelize);
    const data = req.body;
    const sub = await subjectService.updateSubject(data, req.params.guid);
    log.info(
      'Subject Updated',
      '/updatesubject',
      null,
      req.loginUserInfo.userid
    );
    return res.json({ message: 'Subject updated', sub });
  } catch (err) {
    log.error(err.message, '/updatesubject', err.stack, null);
    return err;
  }
};

export const delSubject = async (req, res) => {
  try {
    const sequelize = await connection();
    const subjectService = new SubjectService(sequelize);
    await subjectService.deleteSubject(req.params.guid);
    log.info(
      'subject deleted successfully',
      '/delsubject',
      null,
      req.loginUserInfo.userid
    );
    res.json({ message: 'Subject deleted' });
  } catch (err) {
    log.error(err.message, '/delsubject', err.stack, null);
    throw err;
  }
};

export const getAllSubjects = async (req, res) => {
  try {
    const sequelize = await connection();
    const subjectService = new SubjectService(sequelize);
    const subjects = await subjectService.getAllSubjects();
    log.info(
      'All subjects fetched',
      '/getallsubjects',
      null,
      req.loginUserInfo.userid
    );
    res.json(subjects);
  } catch (err) {
    log.error(err.message, '/getallsubjects', err.stack, null);
    throw err;
  }
};

export const getSubjectById = async (req, res) => {
  try {
    const sequelize = await connection();
    const subjectService = new SubjectService(sequelize);
    const subject = await subjectService.getSubjectById(req.params.guid);
    log.info(
      'Subject details fetched with subjectid',
      '/getsubjectbyid',
      null,
      req.loginUserInfo.userid
    );
    res.json(subject);
  } catch (err) {
    log.error(err.message, '/getsubjectbyid', err.stack, null);
    return err;
  }
};
