import { Router } from 'express';
const router = Router();
import { signup, login} from '../controllers/authController.js';
import { validateLogin, validateSignUp } from '../middlewares/Validators.js';

router.post('/signup', validateSignUp, signup);
router.post('/login', validateLogin, login);


export default router;