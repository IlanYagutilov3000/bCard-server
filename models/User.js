const { Schema, model } = require("mongoose");

const userSchema = new Schema({
    name: {
        type: {
            first: {
                type: String,
                required: true,
                minlength: 2
            },
            middle: {
                type: String,
            },
            last: {
                type: String,
                required: true,
                minlength: 2
            }
        }
    },
    phone: {
        type: String,
        required: true,
        minlength: 9,
        maxlength: 11,
        match: [/^(?:\+972|0)([23489]|5[0123456789])\d{7}$/, "Invalid Israeli phone number format"]
    },
    email: {
        type: String,
        required: true,
        minlength: 5,
        unique: true
    },
    password: {
        type: String,
        required: true,
        minlength: 7
    },
    image: {
        type: {
            url: {
                type: String,
                minlength: 14,
                default: "https://static.vecteezy.com/system/resources/thumbnails/024/983/914/small_2x/simple-user-default-icon-free-png.png"
            },
            alt: {
                type: String,
                required: true,
                minlength: 2,
                maxlength: 256
            }
        }
    },
    address: {
        type: {
            state: {
                type: String,
                default: "not defined",
            },
            country: {
                type: String,
                required: true,
                minlength: 2,
                maxlength: 256
            },
            city: {
                type: String,
                required: true,
                minlength: 2,
                maxlength: 256
            },
            street: {
                type: String,
                required: true,
                minlength: 2,
                maxlength: 256
            },
            houseNumber: {
                type: Number,
                required: true,
                min: 2,
                max: 256
            },
            zip: {
                type: Number,
                required: true,
                min: 2,
            }
        }
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
    isBusiness: {
        type: Boolean,
        default: false,
    },
    failedAttempts: {
        type: Number,
        default: 0
    },
    lockUntil: {
        type: Date,
        default: null
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
})

const User = model("users", userSchema)
module.exports = User