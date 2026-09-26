import bcrypt from "bcryptjs";
import { prisma } from "../../config/prisma.js";
import AppError from "../../errors/AppError.js";
import jwt from "jsonwebtoken";
import { env } from "../../config/env.js";

interface SignupInput {
  name: string;
  email: string;
  password: string;
  role?: "CUSTOMER" | "PROVIDER";
}

interface signinPayload {
  email: string;
  password: string;
}

const signup = async (payload: SignupInput) => {
  const { name, email, password, role = "CUSTOMER" } = payload;

  // 1. Check existing account
  const existingAccount = await prisma.account.findUnique({
    where: {
      email: email,
    },
  });

  if (existingAccount) {
    throw new AppError("An account alrady exists with this email", 409);
  }

  // 2.Hash password
  const hashedPassword = await bcrypt.hash(password, 12);

  // 3. Create Account
  const account = await prisma.account.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      updateAt: true,
    },
  });

  return account;
};

const signin = async ({ email, password }: signinPayload) => {
  // 1. Check existing account
  const account = await prisma.account.findUnique({
    where: {
      email: email,
    },
  });

  if (!account) {
    throw new AppError("Invalid credentials", 401);
  }

  // 2.varify password
  const isPasswordValid = await bcrypt.compare(password, account.password);

  if (!isPasswordValid) {
    throw new AppError("Invalid credentials", 401);
  }

  // 3.Payload for access-token
  const accessTokenPayload = {
    id: account.id,
    email: account.email,
    role: account.role,
  };

  // 4. Generate access-token
  const accessToken = jwt.sign(accessTokenPayload, env.jwt.accessSecret, {
    expiresIn: env.jwt.accessExpiresIn as jwt.SignOptions["expiresIn"],
  });

  //   5.Payload for refresh-token
  const refreshTokenPayload = {
    id: account.id,
  };

  // 6. Generate refresh-token
  const refreshToken = jwt.sign(refreshTokenPayload, env.jwt.accessSecret, {
    expiresIn: env.jwt.accessExpiresIn as jwt.SignOptions["expiresIn"],
  });

  // 7. Return access-token and account info
  return {
    accessToken,
    refreshToken,
    account: {
      id: account.id,
      name: account.name,
      email: account.email,
      role: account.role,
    },
  };
};
export const authService = {
  signup,
  signin,
};
