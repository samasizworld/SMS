import { ExpressServer } from '../express';
const app = new ExpressServer();
const router = app.routerr();
import {
  createNewStudent,
  deleteStudent,
  updateStudent,
  getAllStudents,
  getStudentById,
  getResultByStudentId,
  sendStudentResultsToMail,
  downloadStudentResultById,
} from '../controllers/StudentController';
import { admin } from '../middleware/adminMiddleware';
import { auth } from '../middleware/authMiddleware';
import { linkStudentSubject } from '../controllers/stusubController';
router.route('/').post(auth, admin, createNewStudent).get(getAllStudents);
router
  .route('/:guid')
  .get(getStudentById)
  .put(updateStudent)
  .delete(deleteStudent);

router.route('/:guid/result').get(getResultByStudentId);
router.route('/:guid/sendemail').get(sendStudentResultsToMail);
router.route('/:guid/managesubject').put(linkStudentSubject);
router.route('/:guid/result/download').get(downloadStudentResultById);
export default router;
