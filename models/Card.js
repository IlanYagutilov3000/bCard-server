const { Schema, model, mongoose } = require("mongoose")

const cardSchema = new Schema({
    title: {
        type: String,
        required: true,
        minlength: 2,
        maxlength: 256
    },
    subtitle: {
        type: String,
        required: true,
        minlength: 2,
        maxlength: 256
    },
    description: {
        type: String,
        required: true,
        minlength: 2,
        maxlength: 1024
    },
    phone: {
        type: String,
        required: true,
        match: [/^(?:\+972|0)([23489]|5[0123456789])\d{7}$/, "Invalid Israeli phone number format"],
        minlength: 9,
        maxlength: 11
    },
    email: {
        type: String,
        required: true,
        minlength: 5,
        unique: true
    },
    web: {
        type: String,
        required: true,
        minlength: 14
    },
    image: {
        type: {
            url: {
                type: String,
                default: "https://media.istockphoto.com/id/1409329028/vector/no-picture-available-placeholder-thumbnail-icon-illustration-design.jpg?s=612x612&w=0&k=20&c=_zOuJu755g2eEUioiOUdz_mHKJQJn-tDgIAhQzyeKUQ=",
                minlength: 14
            },
            alt: {
                type: String,
                required: true,
                minlength: 2,
                maxlength: 256
            }
        },
    },
    address: {
        type: {
            state: {
                type: String,
                default: "",
                set: function (value) {
                    // If the value is empty, return it as is (""), otherwise, apply minlength
                    if (value === "") return value;
                    if (value.length < 2) {
                        throw new Error("State must be at least 2 characters long");
                    }
                    return value;
                }
            },
            country: {
                type: String,
                required: true,
                minlength: 2,
            },
            city: {
                type: String,
                required: true,
                minlength: 2,
            },
            street: {
                type: String,
                required: true,
                minlength: 2
            },
            houseNumber: {
                type: Number,
                required: true,
                min: 1
            },
            zip: {
                type: Number,
                required: true,
                min: 4
            }
        }
    },
    bizNumber: {
        type: Number,
        default: () => Math.floor(Math.random() * (9999999 - 1000000 + 1)) + 1000000,
        unique: true,
        min: 1000000,
        max: 9999999
    },
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        default: []
    }],
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
})

const Card = model("cards", cardSchema)
module.exports = Card