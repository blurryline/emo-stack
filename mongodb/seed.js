require("dotenv").config();
const mongodb = require("mongodb");
const bcrypt = require("bcryptjs");

const mongoClient = new mongodb.MongoClient(
  process.env.DATABASE_URL ?? "mongodb://localhost:27017",
);
const dbName = process.env.DATABASE_NAME ?? "mydb";

const seed = async () => {
  await mongoClient.connect();
  const db = mongoClient.db(dbName);
  const email = "rachel@remix.run";
  const hashedPassword = await bcrypt.hash("racheliscool", 10);
  const userCollection = db.collection("users");
  const noteCollection = db.collection("notes");

  const existing = await userCollection.findOne({ email: email });

  if (existing) {
    await userCollection.deleteOne({ email });
    await noteCollection.deleteMany({ userId: existing._id.toString() });
  }

  await userCollection.insertOne({
    email,
    password: hashedPassword,
    createdAt: new Date(),
    modifiedAt: new Date(),
  });
  const user = await userCollection.findOne({ email: email });

  await noteCollection.insertOne({
    userId: user._id.toString(),
    title: "My first note",
    body: "This is my first note",
    createdAt: new Date(),
    modifiedAt: new Date(),
  });
  await noteCollection.insertOne({
    userId: user._id.toString(),
    title: "My second note",
    body: "This is my second note",
    createdAt: new Date(),
    modifiedAt: new Date(),
  });

  console.log(`Database has been seeded. 🌱`);
};

seed()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => {
    mongoClient.close();
  });
