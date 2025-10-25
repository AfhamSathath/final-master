mongoose.connect("mongodb://localhost:27017/finaljob_edu");
import mongoose from "mongoose";
import User from "./models/User.js";
import { faker } from "@faker-js/faker";

mongoose.connect("mongodb://localhost:27017/finaljob_edu");

const users = Array.from({ length: 20 }, () => ({
  name: faker.person.fullName(),
  email: faker.internet.email(),
  password: faker.internet.password(), // You may want to hash this
  role: "user"
}));

User.insertMany(users)
  .then(() => {
    console.log("Random users imported!");
    mongoose.disconnect();
  })
  .catch((err) => {
    console.error("Import failed:", err);
    mongoose.disconnect();
  });
