import { QueryTypes } from 'sequelize';
import { connection } from '../common/connection';
import { StudentSubjectService } from '../services/modelServices/studentsubjectService';
export const linkStudentSubject = async (req, res) => {
  try {
    const sequelize = await connection();
    const subjectLists: object[] = req.body;
    const sLists = JSON.stringify(subjectLists);
    const studentsubjectService = new StudentSubjectService(sequelize);

    const result = await studentsubjectService.linkStudentSubject(
      req.params.guid,
      sLists
    );
    return res.json(result);
  } catch (err) {
    throw err;
  }
};
