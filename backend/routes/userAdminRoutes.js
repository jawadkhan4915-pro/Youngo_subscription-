import express from 'express';
import {
  getUsers,
  updateUser,
  deleteUser,
  resetUserWalletCredits,
  getUserPurchases
} from '../controllers/userAdminController.js';
import { protect, authorize } from '../middlewares/auth.js';

const router = express.Router();

router.use(protect, authorize('Admin'));

router.get('/', getUsers);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);
router.post('/reset-wallet', resetUserWalletCredits);
router.get('/:id/purchases', getUserPurchases);

export default router;
