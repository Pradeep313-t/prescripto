import express from 'express';
import { registerUser, loginUser, getProfile, updateProfile, checkUserExists, bookAppointment, listAppointments, cancelAppointment, deleteAppointment, payAppointment } from '../controllers/userController.js';
import authUser from '../middleware/authUser.js';
import upload from '../middleware/multer.js';

const userRouter = express.Router();

userRouter.post('/register', registerUser);
userRouter.post('/login', loginUser);

userRouter.get('/get-profile', authUser, getProfile);
userRouter.get('/check-exists', checkUserExists);

userRouter.post('/update-profile', upload.single('image'), authUser , updateProfile);

userRouter.post('/book-appointment', authUser, bookAppointment);
userRouter.get('/appointments', authUser, listAppointments);
userRouter.post('/cancel-appointment', authUser, cancelAppointment);
userRouter.post('/delete-appointment', authUser, deleteAppointment);
userRouter.post('/pay-appointment', authUser, payAppointment);

export default userRouter;