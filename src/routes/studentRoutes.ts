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
  getStudentPdfInResultByStudentId,
  SendStudentPdfInEmailByStudentId,
} from '../controllers/StudentController';
import { admin } from '../middleware/adminMiddleware';
import { auth } from '../middleware/authMiddleware';
import { linkStudentSubject } from '../controllers/stusubController';

// route
router.route('/').post(auth, admin, createNewStudent).get(auth, getAllStudents);
router
  .route('/:guid')
  .get(auth, getStudentById)
  .put(auth, admin, updateStudent)
  .delete(auth, admin, deleteStudent);

router.route('/:guid/result').get(auth, getResultByStudentId);
router.route('/:guid/sendemail').get(auth, admin, sendStudentResultsToMail);
router.route('/:guid/managesubject').put(auth, admin, linkStudentSubject);
router.route('/:guid/result/download').get(auth, downloadStudentResultById);
router
  .route('/:guid/getpdf')
  .get(auth, admin, getStudentPdfInResultByStudentId);
router
  .route('/:guid/pdf/send')
  .get(auth, admin, SendStudentPdfInEmailByStudentId);

export default router;
