require('dotenv').config();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../model/userModel');

const JWT_SECRET = process.env.JWT_SECRET;

// Helper function for password validation
const validatePassword = (password) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return regex.test(password);
  };

const logActivity = async (userId, action) => {
    const User = require('../model/userModel'); // Importing here to avoid circular dependency
    try {
      await User.findByIdAndUpdate(userId, {
        $push: { activityLog: { action, timestamp: new Date() } },
      });
    } catch (error) {
      console.error(`Failed to log activity: ${action} for user: ${userId}`, error.message);
    }
  };


const createUser = async (req, res) => {
    const { name, email, password } = req.body;
  
    try {
      // Check if the email is already registered
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'Email is already registered' });
      }
  
      // Validate password strength
      if (!validatePassword(password)) {
        return res.status(400).json({
          message: 'Password must be at least 8 characters long, include uppercase, lowercase, a number, and a special character',
        });
      }
  
      // Hash the password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
  
      // Create a new user
      const newUser = new User({ name, email, password: hashedPassword });
      await newUser.save();
  
      res.status(201).json({ message: 'User created successfully', user: { name, email } });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  };

// Login Logic
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Log user activity
    await logActivity(user._id, `Login`);

    const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: '1h' });
    
    

    res.cookie('authToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Strict',
    });

    res.status(200).json({ message: 'Login successful', user: { name: user.name, email: user.email }});
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

//Fetch user details 
const getUserDetails = async (req, res) => {
    try {
      // Get user ID from the decoded JWT (set by verifyToken middleware)
      const userId = req.user.id;
  
      // Fetch user data from the database, excluding sensitive fields like password
      const user = await User.findById(userId).select('-password');
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      res.status(200).json({ 
        message: 'User details fetched successfully', 
        user 
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  };

const changePassword = async(req,res) => {
  const {currentPassword , newPassword} = req.body;
  try{
    const userId = req.user.id;

    const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Wrong Password' });
    }

    if (!validatePassword(newPassword)) {
      return res.status(400).json({
        message: 'Password must be at least 8 characters long, include uppercase, lowercase, a number, and a special character',
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    const action = "Password change"

    await User.findByIdAndUpdate(userId, {
      $set: {password:hashedPassword},
      $push: { activityLog: {action, timestamp: new Date()} },
    });

    res.status(200).json({ message: 'Password changed successfully' });
    
  }catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}

//Updtae User Details
// const updateUser = async (req, res) => {
//     const { name, email, preferences, newPassword } = req.body;
  
//     try {
//       // Get user ID from the JWT (attached by the verifyToken middleware)
//       const userId = req.user.id;
  
//       // Fetch the user from the database
//       const user = await User.findById(userId);
//       if (!user) {
//         return res.status(404).json({ message: 'User not found' });
//       }
  
//       // Validate new email if provided (ensure it's not already taken)
//       if (email && email !== user.email) {
//         const existingUser = await User.findOne({ email });
//         if (existingUser) {
//           return res.status(400).json({ message: 'Email is already registered' });
//         }
//         user.email = email; // Update email
//       }
  
//       // Update other fields
//       if (name) user.name = name;
//       if (preferences) user.preferences = preferences;
  
//       // If a new password is provided, hash it
//       if (newPassword) {
//         if (!validatePassword(newPassword)) {
//           return res.status(400).json({
//             message: 'Password must be at least 8 characters long, include uppercase, lowercase, a number, and a special character',
//           });
//         }
//         const salt = await bcrypt.genSalt(10);
//         user.password = await bcrypt.hash(newPassword, salt); // Hash the new password
//       }

//       if (name && name !== user.name) {
//         await logActivity(userId, `Name updated to ${name}`);
//       }
//       if (email && email !== user.email) {
//         await logActivity(userId, `Email updated to ${email}`);
//       }
//       if (preferences) {
//         await logActivity(userId, 'Preferences updated');
//       }
//       if (newPassword) {
//         await logActivity(userId, 'Password changed');
//       }
  
//       // Save the updated user
//       await user.save();
  
//       res.status(200).json({
//         message: 'User details updated successfully',
//         user: { name: user.name, email: user.email, preferences: user.preferences },
//       });
//     } catch (error) {
//       res.status(500).json({ message: 'Server error', error: error.message });
//     }
//   };

const updateUser = async (req, res) => {
    const { name, email, preferences, newPassword } = req.body;
  
    try {
      const userId = req.user.id;
  
      // Fetch the user from the database
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      const updateFields = {};
      const activityActions = [];
  
      // Check and update name
      if (name && name !== user.name) {
        updateFields.name = name;
        activityActions.push(`Name updated to ${name}`);
      }
  
      // Check and update email
      if (email && email !== user.email) {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
          return res.status(400).json({ message: 'Email is already registered' });
        }
        updateFields.email = email;
        activityActions.push(`Email updated to ${email}`);
      }
  
      // Check and update preferences
      if (preferences) {
        updateFields.preferences = { ...user.preferences, ...preferences };
  
        // Track specific changes in preferences
        if (preferences.defaultLanguage && preferences.defaultLanguage !== user.preferences.defaultLanguage) {
          activityActions.push(`Default language changed to ${preferences.defaultLanguage}`);
        }
        if (preferences.darkMode !== undefined && preferences.darkMode !== user.preferences.darkMode) {
          activityActions.push(`Dark mode ${preferences.darkMode ? 'enabled' : 'disabled'}`);
        }
        if (preferences.textSize && preferences.textSize !== user.preferences.textSize) {
          activityActions.push(`Text size changed to ${preferences.textSize}`);
        }
      }
  
      // Check and update password
      if (newPassword) {
        if (!validatePassword(newPassword)) {
          return res.status(400).json({
            message: 'Password must be at least 8 characters long, include uppercase, lowercase, a number, and a special character',
          });
        }
        const salt = await bcrypt.genSalt(10);
        updateFields.password = await bcrypt.hash(newPassword, salt);
        activityActions.push('Password changed');
      }
  
      // Perform a single database update
      await User.findByIdAndUpdate(userId, {
        $set: updateFields,
        $push: { activityLog: { $each: activityActions.map(action => ({ action, timestamp: new Date() })) } },
      });
  
      res.status(200).json({
        message: 'User details updated successfully',
        updatedFields: updateFields,
        loggedActions: activityActions,
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  };

const getActivityLog = async (req, res) => {
    try {
      const userId = req.user.id;
  
      const user = await User.findById(userId).select('activityLog');
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      res.status(200).json({
        message: 'Activity log fetched successfully',
        activityLog: user.activityLog,
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  };


//logout 
const logoutUser = async (req, res) => {
    try {
      // Clear the authToken cookie
      res.clearCookie('authToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Strict',
      });
  
      res.status(200).json({ message: 'Logout successful' });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  };




module.exports = {createUser, loginUser, getUserDetails, updateUser, getActivityLog, changePassword, logoutUser};
