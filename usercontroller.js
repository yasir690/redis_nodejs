const userModel = require("./user.model");
const bcrypt = require("bcryptjs");
const Redis = require('ioredis');
const redis = new Redis(); // Connects to localhost:6379 by default

const userRegister = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "provide name",
      });
    }
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "provide email",
      });
    }
    if (!password) {
      return res.status(400).json({
        success: false,
        message: "provide password",
      });
    }

    // Check if the user exists in the database
    const userCheck = await userModel.find({ email: email });

    if (userCheck.length !== 0) {
      return res.status(200).json({
        message: "user email already exists",
        success: false,
      });
    }

    // Create user
    const user = new userModel({
      name,
      email,
      password: bcrypt.hashSync(password, 10),
    });

    // Save user to the database
    const saveUser = await user.save();

    if (!saveUser) {
      return res.status(400).json({
        success: false,
        message: "user not created",
      });
    }

    // Save user data in Redis
    await redis.set(`user:${user._id}`, JSON.stringify(saveUser), 'EX', 86400);  // Expiry set to 1 day (86400 seconds)

    return res.status(200).json({
      success: true,
      message: "user created successfully",
      data: saveUser,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

const getSingleUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Check Redis for user data first
    const userFromRedis = await redis.get(`user:${id}`);
    if (userFromRedis) {
      return res.status(200).json({
        success: true,
        message: "User fetched from Redis",
        data: JSON.parse(userFromRedis),
      });
    }

    // If not in Redis, fetch from the database
    const getAllUser = await userModel.findById(id);

    if (!getAllUser) {
      return res.status(400).json({
        success: false,
        message: "user not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "user found successfully",
      data: getAllUser,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Delete user from the database
    const userDelete = await userModel.findByIdAndDelete(id);

    if (!userDelete) {
      return res.status(400).json({
        success: false,
        message: "User not deleted or does not exist",
      });
    }

    // Delete user data from Redis
    await redis.del(`user:${id}`);

    return res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

module.exports = {
  userRegister,
  getSingleUser,
  deleteUser,
};
