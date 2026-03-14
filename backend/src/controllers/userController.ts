import { Request, Response } from 'express';
import { User } from '../models/User';
import generateToken from '../utils/generateToken';
import { AuthRequest } from '../middleware/authMiddleware';

// @desc    Auth user & get token
// @route   POST /api/users/login
export const authUser = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body || {};
  try {
    const user = await User.findOne({ email });
    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        email: user.email,
        role: user.role,
        token: generateToken(user._id.toString(), user.role),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Register new department user (requires secret key)
// @route   POST /api/users/register
export const registerUser = async (req: Request, res: Response): Promise<void> => {
  const { email, password, role, secretKey } = req.body;
  
  const VALID_SECRET = process.env.ONBOARDING_SECRET || 'sgb_onboard_2024';
  
  if (secretKey !== VALID_SECRET) {
    res.status(403).json({ message: 'Invalid secret key. Department registration denied.' });
    return;
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({ message: 'A user with this email already exists.' });
      return;
    }

    const validRoles = ['ADMIN', 'PACKAGING', 'SHIPMENT', 'ORDER_PLACEMENT', 'BILLING'];
    if (!validRoles.includes(role)) {
      res.status(400).json({ message: 'Invalid department role selected.' });
      return;
    }

    const user = await User.create({ email, password_hash: password, role });

    res.status(201).json({
      _id: user._id,
      email: user.email,
      role: user.role,
      token: generateToken(user._id.toString(), user.role),
      message: 'Department account created successfully!'
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error during registration.' });
  }
};

// @desc    Get user profile
// @route   GET /api/users/profile
export const getUserProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user?._id);
    if (user) {
      res.json({ _id: user._id, email: user.email, role: user.role });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
