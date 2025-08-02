import { z } from 'zod';

const signUpSchema = z.object({
    username : z.string().min(3, "Username must be at least 3 characters long"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters long"),
    role: z.enum(["admin", "user"]).default("user")
});

const loginSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters long")
});

const validateSignUp = (req, res, next) => {
  const result = signUpSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ 
        message: "Validation error in signup",
        errors: result.error.errors
     });
  }
  next();
};

const validateLogin = (req, res, next) => {
  const result = loginSchema.safeParse(req.body);   
    if (!result.success) {
        return res.status(400).json({ 
            message: "Validation error in login",
            errors: result.error.errors
         });
    }
  next();
};

export { validateSignUp, validateLogin };