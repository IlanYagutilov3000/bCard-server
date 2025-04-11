const express = require("express");
const router = express.Router();
const Joi = require("joi");
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken");
const _ = require("lodash")
const User = require("../models/User");
const auth = require("../middlewares/auth");
const isAdminOrUser = require("../middlewares/isAdminOrUser");

const userSchema = Joi.object({
    name: Joi.object({
        first: Joi.string().required().min(2),
        middle: Joi.string().optional().allow(""),
        last: Joi.string().required().min(2),
    }),
    phone: Joi.string().required().pattern(/^(?:\+972|0)([23489]|5[0123456789])\d{7}$/).min(9).max(11),
    email: Joi.string().required().min(2).email(),
    password: Joi.string().required().min(7),
    image: Joi.object({
        url: Joi.string().uri(),
        alt: Joi.string().required().min(2)
    }),
    address: Joi.object({
        state: Joi.string().optional().allow(""),
        country: Joi.string().required().min(2),
        city: Joi.string().required().min(2),
        street: Joi.string().required().min(2),
        houseNumber: Joi.number().required().min(2),
        zip: Joi.number().required().min(2),
    }),
    isAdmin: Joi.boolean(),
    isBusiness: Joi.boolean()
});
// login schema
const loginSchema = Joi.object({
    email: Joi.string().required().min(2).email(),
    password: Joi.string().required().min(8)
});

// schema for editing the user, not sending here the password
const editUserSchema = Joi.object({
    name: Joi.object({
        first: Joi.string().required().min(2),
        middle: Joi.string().optional().allow(""),
        last: Joi.string().required().min(2),
    }),
    phone: Joi.string().required().pattern(/^(?:\+972|0)([23489]|5[0123456789])\d{7}$/).min(9).max(11),
    email: Joi.string().required().min(2).email(),
    image: Joi.object({
        url: Joi.string().uri(),
        alt: Joi.string().required().min(2)
    }),
    address: Joi.object({
        state: Joi.string().optional().allow(""),
        country: Joi.string().required().min(2),
        city: Joi.string().required().min(2),
        street: Joi.string().required().min(2),
        houseNumber: Joi.number().required().min(2),
        zip: Joi.number().required().min(2),
    }),
});

// register
router.post("/", async (req, res) => {
    try {
        // validate body
        const { error } = await userSchema.validateAsync(req.body)
        if (error) return res.status(400).send(error.details[0].message)
        // check if user exits
        let user = await User.findOne({ email: req.body.email });
        if (user) return res.status(404).send("User already exists")
        // create the user if user not exists
        user = new User(req.body)
        // before sending the user encrypt the password
        const salt = await bcrypt.genSalt(10)
        user.password = await bcrypt.hash(user.password, salt)
        await user.save()

        const userDetails = await User.findById(user._id).select("-isAdmin -__v -address.zip -createdAt -failedAttempts -lockUntil -name._id -address._id -image._id -_id ");

        res.status(201).send(userDetails)
    } catch (error) {
        res.status(400).send(error)
    }
});

// login
router.post("/login", async (req, res) => {
    try {
        // validate body
        const { error } = await loginSchema.validateAsync(req.body)
        if (error) return res.status(400).send(error.details[0].message)
        // check if user exist
        const user = await User.findOne({ email: req.body.email })
        if (!user) return res.status(404).send("Invalid email or password")

        if (user.lockUntil && user.lockUntil > Date.now()) return res.status(400).send("Account is locked. Please try again later.");
        // comparing the passwords
        const result = await bcrypt.compare(req.body.password, user.password);
        if (!result) {
            user.failedAttempts += 1;
            if (user.failedAttempts >= 3) {
                user.lockUntil = new Date(Date.now() + 24 * 60 * 60 * 1000); // Lock for 24 hours
            }
            await user.save();

            return res.status(404).send("Invalid email or passqord");
        }
        // reseting the lockUntil to null baisicly nothing and the faled attempts to zero
        user.failedAttempts = 0;
        user.lockUntil = null;
        await user.save();
        //send token
        const token = jwt.sign({ _id: user._id, isBusiness: user.isBusiness, isAdmin: user.isAdmin }, process.env.JWTKEY)
        res.status(200).send(token)
    } catch (error) {
        res.status(400).send(error)
    }
});

// get all users if admin
router.get("/", auth, async (req, res) => {
    try {
        if (!req.payload.isAdmin) return res.status(401).send("Access denied")
        const users = await User.find({}, { password: 0, __v: 0 })
        res.status(200).send(users)
    } catch (error) {
        res.status(400).send(error)
    }
});

// get specific user if you are admin or registered user
router.get("/:id", auth, isAdminOrUser, async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select("-password");
        if (!user) return res.status(404).send("user not found")
        res.status(200).send(user)
    } catch (error) {
        res.status(400).send(error)
    }
});

// upadte specifc user
router.put("/:id", auth, isAdminOrUser, async (req, res) => {
    try {
        // alidate body of the request
        const { error } = await editUserSchema.validateAsync(req.body)
        if (error) return res.status(400).send(error.details[0].message)
        // find and update the user
        const user = await User.findOneAndUpdate({ _id: req.params.id }, req.body, { new: true })
        if (!user) return res.status(404).send("User not found")

        res.status(200).send(user)
    } catch (error) {
        res.status(400).send(error)
    }
});

// change the is business status
router.patch("/:id", auth, isAdminOrUser, async (req, res) => {
    try {
        // find and patch the user
        const user = await User.findByIdAndUpdate(req.params.id, { isBusiness: req.body.isBusiness }, { new: true })
        if (!user) return res.status(404).send("User not found")
        res.status(200).send(user)
    } catch (error) {
        res.status(400).send(error)
    }
});

// delete user
router.delete("/:id", auth, isAdminOrUser, async (req, res) => {
    try {
        // find user and delete him
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) return res.status(404).send("User not found")
        res.status(200).send("User was deleted")
    } catch (error) {
        res.status(400).send(error)
    }
})

module.exports = router