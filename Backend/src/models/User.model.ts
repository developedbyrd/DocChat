import mongoose, { Document } from "mongoose";
import bcrypt from "bcryptjs";

export interface IUser extends Document {
  email: string;
  password?: string;
  name: string;
  createdAt: Date;
  lastLogin?: Date;
  isActive: boolean;
  comparePassword(password: string): Promise<boolean>;
}


const userSchema = new mongoose.Schema({
  email: { 
    type: String, 
    required: true, 
    unique: true, 
    lowercase: true,
    match: /^[\w\.-]+@[\w\.-]+\.\w+$/,
    index: true
  },
  password: { 
    type: String, 
    required: true,
    minlength: 8
  },
  name: { 
    type: String, 
    required: true 
  },
  createdAt: { 
    type: Date, 
    default: Date.now, 
    index: true 
  },
  lastLogin: { 
    type: Date 
  },
  isActive: { 
    type: Boolean, 
    default: true 
  },
}, {
  timestamps: true,
});

// Hash password before saving
userSchema.pre("save", async function() {
  if (!this.isModified("password")) return;
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(password: string): Promise<boolean> {
  return bcrypt.compare(password, this.password);
};

// Exclude password from queries by default
userSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

export const User = mongoose.model<IUser>("User", userSchema);
