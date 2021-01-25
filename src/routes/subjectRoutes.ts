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

import { auth } from '../middleware/authMiddleware';
import { admin } from '../middleware/adminMiddleware';
import { upload } from '../middleware/multerMiddleware';

//routes
router.route('/').post(auth, admin, insertSubject).get(auth, getAllSubjects);
router
  .route('/:guid')
  .put(auth, admin, updateSubject)
  .delete(auth, admin, delSubject)
  .get(auth, getSubjectById);

export default router;
