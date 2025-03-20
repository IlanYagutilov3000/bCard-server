const express = require("express")
const mongoose = require("mongoose")
const Card = require("./models/Card");
const User = require("./models/User");
const bcrypt = require("bcrypt")

// this function does the intial data when server is running for the first time and the collection is empty as wll, if the collection isn't empty then the function wont run
async function seedDataBase() {
    try {
        const users = await User.countDocuments();
        if (users === 0) {
            // hashing the paswords of the hard coded users
            const hashedPasswords = await Promise.all([
                bcrypt.hash("123456789", 10),
                bcrypt.hash("123456789", 10),
                bcrypt.hash("123456789", 10)
            ]);

            await User.insertMany([
                {
                    _id: new mongoose.Types.ObjectId('60d5ec49f1b2f9a7d1234561'),
                    name: { first: "John", last: "Doe" },
                    phone: "0521234567",
                    email: "regular@example.com",
                    password: hashedPasswords[0],
                    image: { alt: "User profile" },
                    address: {
                        country: "Israel",
                        city: "Tel Aviv",
                        street: "Herzl",
                        houseNumber: 10,
                        zip: 12345
                    },
                    isAdmin: false,
                    isBusiness: false
                },
                {
                    _id: new mongoose.Types.ObjectId('60d5ec49f1b2f9a7d1234758'),
                    name: { first: "Sarah", last: "Levi" },
                    phone: "0539876543",
                    email: "business@example.com",
                    password: hashedPasswords[1],
                    image: { alt: "Business user" },
                    address: {
                        country: "Israel",
                        city: "Haifa",
                        street: "Ben Gurion",
                        houseNumber: 50,
                        zip: 54321
                    },
                    isAdmin: false,
                    isBusiness: true
                },
                {
                    _id: new mongoose.Types.ObjectId('60d5ec49f1b2f9a7d1237895'),
                    name: { first: "Admin", last: "User" },
                    phone: "0547654321",
                    email: "admin@example.com",
                    password: hashedPasswords[2],
                    image: { alt: "Admin profile" },
                    address: {
                        country: "Israel",
                        city: "Jerusalem",
                        street: "King David",
                        houseNumber: 11,
                        zip: 10000
                    },
                    isAdmin: true,
                    isBusiness: false
                }
            ]);
            console.log("inserting default users is complete");
        } else {
            console.log("There are already users in the data base");
        }
        const cards = await Card.countDocuments();
        if (cards === 0) {
            await Card.insertMany([
                {
                    title: "Business Card 1",
                    subtitle: "Best in Tel Aviv",
                    description: "Quality services for all",
                    phone: "0523334444",
                    email: "card1@example.com",
                    web: "https://www.youtube.com/",
                    image: { alt: "Business logo 1" },
                    address: {
                        country: "Israel",
                        city: "Tel Aviv",
                        street: "Dizengoff",
                        houseNumber: 22,
                        zip: 67890
                    },
                    bizNumber: 1234567,
                    userId: new mongoose.Types.ObjectId('60d5ec49f1b2f9a7d1234561')
                },
                {
                    title: "Business Card 2",
                    subtitle: "Haifa Experts",
                    description: "Reliable and trusted",
                    phone: "0529998888",
                    email: "card2@example.com",
                    web: "https://www.youtube.com/",
                    image: { alt: "Business logo 2" },
                    address: {
                        country: "Israel",
                        city: "Haifa",
                        street: "Hahistadrut",
                        houseNumber: 12,
                        zip: 65432
                    },
                    bizNumber: 2345678,
                    userId: new mongoose.Types.ObjectId('60d5ec49f1b2f9a7d1234758')
                },
                {
                    title: "Business Card 3",
                    subtitle: "Tech Solutions",
                    description: "Innovative and efficient",
                    phone: "0525556666",
                    email: "card3@example.com",
                    web: "https://www.youtube.com/",
                    image: { alt: "Business logo 3" },
                    address: {
                        country: "Israel",
                        city: "Jerusalem",
                        street: "Jaffa",
                        houseNumber: 30,
                        zip: 78901
                    },
                    bizNumber: 3456789,
                    userId: new mongoose.Types.ObjectId('60d5ec49f1b2f9a7d1237895')
                }
            ]);
            console.log("inserting default cards is complete");
        } else {
            console.log("There are already cards in the data base");
        }
    } catch (error) {
        console.log(error);
    }
}

module.exports = seedDataBase