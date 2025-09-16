import bcrypt from "bcrypt";
import {Director,User} from "../models/user.modal.js"


const registerDirector = async (req, res) => {
  try {
    const {
      name,
      phone,
      email,
      address,
      city,
      state,
      gender,
      dob,
      graduation,
      postGraduation,
      password,
    } = req.body;

    // check if user already exists
    const userExists = await Director.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "Director already exists" });
    }

    // hash password
    const hashedPassword = password
      ? await bcrypt.hash(password, 10)
      : null;

    // create director
    const director = await Director.create({
      name,
      phone,
      email,
      address,
      city,
      state,
      gender,
      dob,
      graduation,
      postGraduation,
      role: "director",
      password: hashedPassword,
    });

    res.status(201).json({
      message: "Director registered successfully",
      director,
    });
  } catch (error) {
    console.error("Error in registerDirector:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};


export { registerDirector };
