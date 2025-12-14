const User = require("../models/User");
const Profile = require("../models/Profile");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// =======================
// User Signup
// =======================
exports.signUp = async (req, res) => {
    try {
        const { userName, fullName, email, password } = req.body;

        // Validate input
        if (!userName || !fullName || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "Please fill all required fields",
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ userName });
        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "User already exists! Please login.",
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a blank profile
        const additionDetails = await Profile.create({
            gender: null,
            dateOfBirth: null,
            about: null,
            mobileNumber: null,
        });

        // Create the user
        const user = await User.create({
            userName,
            fullName,
            email,
            password: hashedPassword,
            additionDetails: additionDetails._id,
            image: `https://api.dicebear.com/7.x/initials/svg?seed=${fullName}`, // Default avatar
        });

        // Link profile to user
        additionDetails.user = user._id;
        await additionDetails.save();

        // Hide password before sending response
        user.password = undefined;

        return res.status(201).json({
            success: true,
            message: "User registered successfully",
            user,
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error occurred during sign up",
            error: error.message,
        });
    }
};

// =======================
// User Login
// =======================
exports.login = async (req, res) => {
    try {
        const { userName, password } = req.body;

        // Validate input
        if (!userName || !password) {
            return res.status(400).json({
                success: false,
                message: "Please provide both username and password",
            });
        }

        // Find user by username
        const user = await User.findOne({ userName }).populate("additionDetails");
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found! Please sign up first",
            });
        }

        // Compare password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(403).json({
                success: false,
                message: "Invalid password",
            });
        }

        // Create JWT payload
        const payload = {
            username: user.userName,
            id: user._id,
            additionDetails: user.additionDetails,
        };

        // Generate token
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "5h" });

        // Hide password before sending response
        user.password = undefined;

        // Set token in cookie
        res.cookie("token", token, {
            expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
            httpOnly: true,
        });

        return res.status(200).json({
            success: true,
            message: "User logged in successfully",
            token,
            user,
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error occurred during login",
            error: error.message,
        });
    }
};
