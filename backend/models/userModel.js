import bcrypt from "bcryptjs";
import "dotenv/config";
import mongoose from "mongoose";
import validator, { trim } from "validator";
import { USER } from "../constants/index.js";

const { Schema } = mongoose;

const userSchema = new Schema(
  {
    email: {
      type: String,
      required: [true, "Please provide an email address"],
      lowercase: true,
      unique: true,
      validate: [validator.isEmail, "Please provide a valid email address"],
    },
    username: {
      type: String,
      required: [true, "Please provide a username"],
      unique: true,
      trim: true,
      validate: {
        validator: function (value) {
          // return validator.isAlphanumeric(value) && validator.isLength(value, { min: 3, max: 15 });
          return /^[A-z][A-z0-9-_]{3,23}$/.test(value);
        },
        message:
          "Username must be alphanumeric and between 3 and 23 characters, without special characters.Hyphens and underscore are allowed.",
      },
    },
    firstName: {
      type: String,
      required: [true, "Please provide a first name"],
      trim: true,
      validate: [validator.isAlphanumeric, "First name must be alphabetic"],
    },
    lastName: {
      type: String,
      required: [true, "Please provide a last name"],
      trim: true,
      validate: [validator.isAlphanumeric, "Last name must be alphabetic"],
    },
    password: {
      type: String,
      required: [true, "Please provide a password"],
      minlength: [8, "Password must be at least 8 characters"],
      select: false,
      validate: [
        validator.isStrongPassword,
        "Password must contain at least 1 lowercase, 1 uppercase, 1 number, 1 special character, and must be at least 8 characters long",
      ],
    },
    passwordConfirm: {
      type: String,
      required: [true, "Please confirm your password"],
      validate: {
        validator: function (value) {
          return this.password === value;
        },
        message: "Passwords do not match",
      },
    },
    isEmailVerified: {
      type: Boolean,
      required: true,
      default: false,
    },
    provider: {
      type: String,
      required: true,
      default: "email",
    },
    googleId: String,
    avatar: String,
    businessName: String,
    phoneNumber: {
      type: String,
      default: "+6281234567890",
      validate: [
        validator.isMobilePhone,
        "Your phone number must begin with +62 and contain 10-12 digits",
      ],
    },
    address: String,
    city: String,
    country: String,
    passwordChangedAt: Date,
    roles: {
      type: [String],
      default: [USER],
    },
    active: {
      type: Boolean,
      default: true,
    },
    refreshToken: [String],
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function (next) {
    if (this.roles.length === 0) {
        this.roles.push(USER);
        next();
    }
});

userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();

    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);

    this.passwordConfirm = undefined;
    next();
});

userSchema.pre("save", async function (next) {
    if (!this.isModified("password") || this.isNew) return next();

    this.passwordChangedAt = Date.now();
    next();
});

userSchema.methods.comparePassword = async function (givenPassword, userPassword) {
    return await bcrypt.compare(givenPassword, this.password);
}

const User = mongoose.model("User", userSchema);

export default User;