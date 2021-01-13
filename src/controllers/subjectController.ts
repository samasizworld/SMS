import { SubjectService } from '../services/modelServices/subjectService';
import { connection } from '../common/connection';

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
      return res.json({ message: 'Subject Created', sub });
    } else {
      return res.json({ message: 'Already Created' });
    }
  } catch (err) {
    return err;
  }
};

export const updateSubject = async (req, res) => {
  try {
    const sequelize = await connection();
    const subjectService = new SubjectService(sequelize);
    const data = req.body;
    const sub = await subjectService.updateSubject(data, req.params.guid);
    return res.json({ message: 'Subject updated', sub });
  } catch (err) {
    throw err;
  }
};

export const delSubject = async (req, res) => {
  try {
    const sequelize = await connection();
    const subjectService = new SubjectService(sequelize);
    await subjectService.deleteSubject(req.params.guid);
    res.json({ message: 'Subject deleted' });
  } catch (err) {
    throw err;
  }
};

export const getAllSubjects = async (req, res) => {
  try {
    const sequelize = await connection();
    const subjectService = new SubjectService(sequelize);
    const subjects = await subjectService.getAllSubjects();
    res.json(subjects);
  } catch (err) {
    throw err;
  }
};

export const getSubjectById = async (req, res) => {
  try {
    const sequelize = await connection();
    const subjectService = new SubjectService(sequelize);
    const subject = await subjectService.getSubjectById(req.params.guid);
    res.json(subject);
  } catch (err) {
    return err;
  }
};
