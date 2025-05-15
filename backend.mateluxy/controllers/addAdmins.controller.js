import bcryptjs from "bcryptjs";
import { errorHandler } from "../utils/erros.js";
import Admin from "../models/admin.model.js";

export const addAdmins = async (req, res, next) => {
    try {
        const { username, fullName, email, password, profileImage } = req.body;

        // Check for required fields
        if (!username || !fullName || !email || !password) {
            return next(errorHandler(400, "Required fields are missing"));
        }

        // Check if username or email already exists
        const existingAdmin = await Admin.findOne({
            $or: [
                { username },
                { email }
            ]
        });

        if (existingAdmin) {
            if (existingAdmin.username === username) {
                return next(errorHandler(400, "Username already exists"));
            }
            if (existingAdmin.email === email) {
                return next(errorHandler(400, "Email already exists"));
            }
        }

        const hashedPassword = await bcryptjs.hash(password, 10);

        const newAdmin = new Admin({
            username,
            fullName,
            email,
            password: hashedPassword,
            profileImage: profileImage || '',
            tags: [{ type: String }], // Added for property tags, primarily for Off Plan
        });

        await newAdmin.save();
        
        // Return admin data without password
        const adminResponse = newAdmin.toObject();
        delete adminResponse.password;
        
        res.status(201).json(adminResponse);
    } catch (error) {
        next(error);
    }
};