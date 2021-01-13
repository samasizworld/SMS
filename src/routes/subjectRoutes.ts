import { ExpressServer } from '../express';
const app = new ExpressServer();
const router = app.routerr();
import {
  delSubject,
  updateSubject,
  insertSubject,
  getAllSubjects,
  getSubjectById,
} from '../controllers/subjectController';
router.route('/').post(insertSubject).get(getAllSubjects);
router
  .route('/:guid')
  .put(updateSubject)
  .delete(delSubject)
  .get(getSubjectById);
export default router;
