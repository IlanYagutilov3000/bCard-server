const express = require("express");
const router = express.Router();
const Joi = require("joi");
const auth = require("../middlewares/auth");
const Card = require("../models/Card");

const cardSchema = Joi.object({
    title: Joi.string().required().min(2),
    subtitle: Joi.string().required().min(10),
    description: Joi.string().required().min(10),
    phone: Joi.string().required().pattern(/^(?:\+972|0)([23489]|5[0123456789])\d{7}$/),
    email: Joi.string().required().min(2).email(),
    web: Joi.string().required().min(10).uri(),
    image: {
        url: Joi.string().uri(),
        alt: Joi.string().min(2).required().max(256)
    },
    address: {
        state: Joi.string().optional().allow(""),
        country: Joi.string().required().min(2),
        city: Joi.string().required().min(2),
        street: Joi.string().required().min(2),
        houseNumber: Joi.number().required().min(2),
        zip: Joi.number().required().min(2),
    },
})

// get cards
router.get("/", async (req, res) => {
    try {
        // find but with projection
        const cards = await Card.find({}, { bizNumber: 0, __v: 0, likes: 0, _id: 0, userId: 0, createdAt: 0, "address._id": 0, "image._id": 0})
        res.status(200).send(cards)
    } catch (error) {
        res.status(400).send(error)
    }
});

// get cards that belong to the registed user
router.get("/my-cards", auth, async (req, res) => {
    try {
        // check which cards hold the user id
        const cards = await Card.find({ userId: req.payload._id })
        // maybe do with th .lengh later
        if (!cards) return res.status(404).send("No cards found")
        res.status(200).send(cards)
    } catch (error) {
        res.status(400).send(error)
    }
})

// get a specifc card by id(need to see if only admin or all)
router.get("/:id", async (req, res) => {
    try {
        // get card by its id
        const card = await Card.findById(req.params.id)
        if (!card) return res.status(404).send("No card found")
        res.status(200).send(card)
    } catch (error) {
        res.status(400).send(error)
    }
});

// create card only if you are business user
router.post("/", auth, async (req, res) => {
    try {
        // check if user has business account
        if (!req.payload.isBusiness) return res.status(401).send("Access denied")
        // body validation
        const { error } = cardSchema.validate(req.body)
        if (error) return res.status(400).send(error.details[0].message)
        // check for existing card / business
        let card = await Card.findOne({ email: req.body.email })
        if (card) return res.status(400).send("card already exists")
        // add card
        card = new Card({ ...req.body, userId: req.payload._id })
        await card.save()
        res.status(201).send(card)
    } catch (error) {
        res.status(400).send(error)
    }
})

// update card
router.put("/:id", auth, async (req, res) => {
    try {
        // find the card
        const findCard = await Card.findById(req.params.id)
        if (!findCard) return res.status(404).send("Card not found")

        if (!req.payload.isAdmin && findCard.userId.toString() !== req.payload._id) return res.status(400).send("Access denied. Not authorized")
        // body validation
        const { error } = cardSchema.validate(req.body)
        if (error) return res.status(400).send(error.details[0].message)
        // find card and update
        const card = await Card.findOneAndUpdate({ _id: req.params.id }, req.body, { new: true })
        if (!card) return res.status(404).send("Card not found")
        res.status(200).send(card)
    } catch (error) {
        res.status(400).send(error)
    }
})

// add likes or unlike
router.patch("/:id", auth, async (req, res) => {
    try {
        // fidning and getting the card by id
        const card = await Card.findById(req.params.id);
        if (!card) return res.status(404).send("card not found");
        // checking to see if the card likes has the user id, if yes and the user clicked again the user id gets removed if no the user id gets saved into the likes array
        if (card.likes.includes(req.payload._id)) {
            card.likes.pull(req.payload._id); // Unlike
        } else {
            card.likes.push(req.payload._id); // Like
        }
        // Save the updated card
        await card.save();
        res.status(200).send(card);
    } catch (error) {
        res.status(400).send(error);
    }
});

//patch the bizz number only if no other business hold that number
router.patch("/bizz-number/:id", auth, async (req, res) => {
    try {
        // check if user is admin
        if (!req.payload.isAdmin) return res.status(400).send("Access denied")
        // check if the bizz number is in use or not
        const bizzNumberCheck = await Card.findOne({ bizNumber: req.body.bizNumber })
        if (bizzNumberCheck) return res.status(400).send("Bizz number is in use")
        // patch only the bizz number and noting else
        const card = await Card.findByIdAndUpdate(req.params.id, { bizNumber: req.body.bizNumber }, { new: true })
        if (!card) res.status(404).send("Card not found")

        res.status(200).send(card)
    } catch (error) {
        res.status(400).send(error)
    }
})

// delete card
router.delete("/:id", auth, async (req, res) => {
    try {
        // find the card
        const findCard = await Card.findById(req.params.id)
        if (!findCard) return res.status(404).send("Card not found")
        // checking to see if the user is admin or the user who created the card
        if (!req.payload.isAdmin && findCard.userId.toString() !== req.payload._id) return res.status(400).send("Access denied. Not authorized")
        // find and delete card
        const card = await Card.findByIdAndDelete(req.params.id)
        if (!card) return res.status(404).send(card)
        res.status(200).send(card)
    } catch (error) {
        res.status(400).send(error)

    }
})

module.exports = router;