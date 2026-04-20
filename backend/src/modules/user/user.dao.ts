import { type QueryFilter, type Types } from "mongoose";
import UserModel, { type IUser } from "./user.model.js";
import type { RegisterInput } from "../auth/auth.schema.js";

// ================= CHECK USER EXIST =================

export const checkUserExist = (query: QueryFilter<IUser>) => {
  return UserModel.exists(query);
};

// ================= FIND BY EMAIL =================

export const findUserByEmail = (email: string) => {
  return UserModel.findOne({ email });
};

// ================= CREATE USER =================

export const createUser = (data: RegisterInput) => {
  return UserModel.create(data);
};

// ================= FIND BY ID =================

export const findUserById = (id: string | Types.ObjectId) => {
  return UserModel.findById(id);
};

// ================= FIND BY EMAIL (with password for auth) =================

export const findUserWithPasswordByEmail = (email: string) => {
  return UserModel.findOne({ email }).select("+password +refreshTokenHash");
};

// ================= SAVE REFRESH TOKEN HASH =================

export const saveRefreshTokenHash = (userId: string, hash: string) => {
  return UserModel.findByIdAndUpdate(userId, { refreshTokenHash: hash });
};

// ================= CLEAR REFRESH TOKEN =================

export const clearRefreshToken = (userId: string) => {
  return UserModel.findByIdAndUpdate(userId, { refreshTokenHash: null });
};

// ================= GET USER WITH REFRESH HASH  =================

export const findUserWithRefreshHash = (userId: string) => {
  return UserModel.findById(userId).select("+refreshTokenHash");
};

// ================= GET ALL USERS =================

export const getAllUsers = (
  page: number,
  limit: number,
  sortField: keyof IUser,
  sortOrder: 1 | -1,
) => {
  const skip = (page - 1) * limit;

  return UserModel.find({}, { password: 0, refreshTokenHash: 0 })
    .sort({ [sortField]: sortOrder })
    .skip(skip)
    .limit(limit)
    .lean();
};

// ================= COUNT USERS =================

export const countUsers = () => UserModel.countDocuments();
