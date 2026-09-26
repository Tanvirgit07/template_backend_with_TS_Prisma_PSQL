import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync.js";
import { authService } from "./auth.service.js";
import sendResponse from "../../utils/sendResponse.js";

const signup = catchAsync(async (req: Request, res: Response) => {
    const result = await authService.signup(req.body);
    sendResponse(res, {
        statusCode : 201,
        message : "Account created successfuly!",
        data: result
    })
})

const signin = catchAsync(async (req: Request, res: Response) => {
    const result = await authService.signin(req.body);
    sendResponse(res, {
        statusCode : 200,
        message : "Signin successfuly!",
        data: result
    })
})

export const authController = {
    signup,
    signin,
}