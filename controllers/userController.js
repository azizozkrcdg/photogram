import User from "../models/userModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const createUser = async (req, res) => {
    try {
        const user = await User.create(req.body);

        res.status(201).json({user: user._id});
    } catch (error) {

        let errorsObj = {};

        if(error.code === 11000) {
            errorsObj.email = "Bu email zaten kayıtlı!";
        }

        if(error.name === "ValidationError") {
            Object.keys(error.errors).forEach((key) => {
                errorsObj[key] = error.errors[key].message;
            });
        }

        res.status(400).json(errorsObj);
    }
}

const loginUser = async (req, res) => {
    try {
        const {username, password} = req.body;
        const user = await User.findOne({username: username});

        let same = false;

        if (user) {
            same = await bcrypt.compare(password, user.password);
        }else {
           return res.status(401).json({
                succeded: false,
                error: "There is no such user"
            });
        }

        if(same) {
            const token = createToken(user._id);
            res.cookie("jwt", token, {
                httpOnly: true,
                maxAge: 1000*60*60*24
            });
            res.redirect("/users/dashboard");

        }else {
            res.status(401).json({
                succeded: false,
                error: "Passwords are not matched"
            });
        }
        
    } catch (error) {
        res.status(500).json({
            succeded: false,
            error
        });
    }
}

const createToken = (userId) => {
    return jwt.sign({userId}, process.env.JWT_SECRET, {
        expiresIn: "1d"
    });
}

const getDashboardPage = (req, res) => {
    res.render("dashboard", {
        link: "dashboard"
    });
}


export {createUser, loginUser, createToken, getDashboardPage};