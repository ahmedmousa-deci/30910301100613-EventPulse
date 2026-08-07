const config = require("./config/config");
const connectDB = require("./db/db");
const Category = require("./modules/category.model");
const User = require("./modules/user.model");
const Event = require("./modules/event.model");
const Registration = require("./modules/registration.model");
const Message = require("./modules/message.model");
const bcrypt = require("bcrypt");

const MONGO_URL = config.MONGO_URL;

async function seed() {
  try {
    await connectDB(MONGO_URL);

    await Category.deleteMany();
    await User.deleteMany();
    await Event.deleteMany();
    await Registration.deleteMany();
    await Message.deleteMany();

    const categories = await Category.create([
      { name: "Music" },
      { name: "Business" },
      { name: "Sports" },
      { name: "Arts" },
    ]);

    const saltRounds = 10;
    const adminPasswordHash = await bcrypt.hash("admin123", saltRounds);
    const userPasswordHash = await bcrypt.hash("password123", saltRounds);

    const users = await User.create([
      {
        name: "Admin User",
        email: "admin@example.com",
        passwordHash: adminPasswordHash,
        role: "admin",
      },
      {
        name: "Alice Johnson",
        email: "alice@example.com",
        passwordHash: userPasswordHash,
        role: "attendee",
      },
      {
        name: "Marcus Lee",
        email: "marcus@example.com",
        passwordHash: userPasswordHash,
        role: "attendee",
      },
      {
        name: "Nina Patel",
        email: "nina@example.com",
        passwordHash: userPasswordHash,
        role: "attendee",
      },
    ]);

    const events = await Event.create([
      {
        title: "Summer Jazz Night",
        city: "Chicago",
        date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        capacity: 120,
        category: categories.find((cat) => cat.name === "Music")._id,
      },
      {
        title: "Startup Pitch Weekend",
        city: "San Francisco",
        date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        capacity: 80,
        category: categories.find((cat) => cat.name === "Business")._id,
      },
      {
        title: "City Marathon Expo",
        city: "New York",
        date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
        capacity: 500,
        category: categories.find((cat) => cat.name === "Sports")._id,
      },
      {
        title: "Local Art Showcase",
        city: "Austin",
        date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        capacity: 60,
        category: categories.find((cat) => cat.name === "Arts")._id,
      },
    ]);

    await Registration.create([
      {
        event: events[0]._id,
        user: users[0]._id,
      },
      {
        event: events[1]._id,
        user: users[1]._id,
      },
      {
        event: events[2]._id,
        user: users[2]._id,
      },
    ]);

    await Message.create([
      {
        event: events[0]._id,
        user: users[0]._id,
        text: "Can't wait for the jazz night!",
      },
      {
        event: events[1]._id,
        user: users[1]._id,
        text: "Is there a time for open coach feedback?",
      },
      {
        event: events[2]._id,
        user: users[2]._id,
        text: "Will there be a hydration station?",
      },
      {
        event: events[3]._id,
        user: users[0]._id,
        text: "I love local art events like this.",
      },
    ]);

    console.log("Database seeded successfully.");
    process.exit(0);
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exit(1);
  }
}

seed();
