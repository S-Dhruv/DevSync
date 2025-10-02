import { hash, compare } from 'bcryptjs';
import pkg from "jsonwebtoken";
const { sign } = pkg;
import User from "../models/User.js";
import { nanoid } from "nanoid";

export async function signup(req, res) {
  const { username, email, password, role } = req.body;
  try {
    // Check if the email is already taken
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }
    // Hash the password
    const hashedPassword = await hash(password, 10);

    // Create new user
    const userId = nanoid(7);
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      role: role,
      uid: userId,
    });

    await newUser.save();

    res.status(200).json({ message: "User registered successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error registering user", error });
  }
}

export async function login(req, res) {
  const { email, password } = req.body;
  try {
    let user = await User.findOne({ email });
    console.log(user);
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isMatch = await compare(password, user.password);
    console.log(isMatch);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const token = sign(
      { userId: user.uid, 
        role: user.role,
        name:user.username,
        email:user.email,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    console.log(user.uid);
    return res.status(200).json({
      token,
      userId: user.uid,
      message: "User logged in",
      role:user.role
    });
  } catch (error) {
    return res.status(500).json({ message: "Error logging in", error });
  }
}
