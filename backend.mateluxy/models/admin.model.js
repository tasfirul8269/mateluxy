import mongoose from 'mongoose';

const AdminSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    fullName: {
        type: String,
        required: true,
        trim: true
    },
    profileImage: {
        type: String,
        default: ''
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    adminId: {
        type: String,
        default: function() {
            return 'ADM' + Math.floor(1000 + Math.random() * 9000);
        }
    }
}, { timestamps: true });

const Admin = mongoose.model('Admin', AdminSchema);

export default Admin;