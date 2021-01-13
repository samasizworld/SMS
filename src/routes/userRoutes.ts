import { ExpressServer } from '../express';
const app = new ExpressServer();
const router = app.routerr();
import { auth } from '../middleware/authMiddleware';
import { loginUser, logout } from '../controllers/userController';
router.route('/login').post(loginUser);
router.route('/logout').post(auth, logout);
export default router;
