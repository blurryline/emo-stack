import { MongoClient, ObjectId } from "mongodb";
import { singleton } from "./singleton.server";
import bcrypt from "bcryptjs";
import type { User } from "./models/user.server";
import type { Note } from "./models/note.server";

const DbServer = singleton(
  "mongoClient",
  () =>
    new MongoClient(process.env.DATABASE_URL ?? "mongodb://localhost:27017"),
);
const dbName = process.env.DATABASE_NAME ?? "notmydb";
const userCollection = "users";
const noteCollection = "notes";

function updateId(result: any) {
  const { _id: _any, ...withoutObjectId } = result;
  return { ...withoutObjectId, id: result!._id.toString() };
}

export async function getUserCount() {
  await DbServer.connect();
  const db = DbServer.db(dbName);
  return await db.collection(userCollection).countDocuments();
}

export async function getUserById(id: string) {
  await DbServer.connect();
  const db = DbServer.db(dbName);
  const result = await db
    .collection(userCollection)
    .findOne({ _id: new ObjectId(id) });

  if (result === null) {
    return null;
  }

  return updateId(result) as User;
}

export async function getUserByEmail(email: string) {
  await DbServer.connect();
  const db = DbServer.db(dbName);
  const result = await db.collection(userCollection).findOne({ email: email });

  if (result === null) {
    return null;
  }

  return updateId(result) as User;
}

export async function createUser(email: string, password: string) {
  const hashedPassword = await bcrypt.hash(password, 10);
  await DbServer.connect();
  const db = DbServer.db(dbName);
  const result = await db
    .collection(userCollection)
    .insertOne({
      email,
      password: hashedPassword,
      createdAt: new Date(),
      modifiedAt: new Date(),
    });
  return await getUserById(result.insertedId.toString());
}

export async function deleteUserByEmail(email: string) {
  await DbServer.connect();
  const db = DbServer.db(dbName);
  return db.collection(userCollection).deleteOne({ email: email });
}

export async function verifyLogin(email: string, password: string) {
  const userWithPassword = await getUserByEmail(email);

  if (!userWithPassword || !userWithPassword.password) {
    return null;
  }

  const isValid = await bcrypt.compare(password, userWithPassword.password);

  if (!isValid) {
    return null;
  }

  const { password: _password, ...userWithoutPassword } = userWithPassword;

  return userWithoutPassword;
}

export async function getNote(id: string, userId: string) {
  await DbServer.connect();
  const db = DbServer.db(dbName);
  const result = await db
    .collection(noteCollection)
    .findOne({ _id: new ObjectId(id), userId: userId });
  return updateId(result) as Note;
}

export async function getNoteListItems(userId: string) {
  await DbServer.connect();
  const db = DbServer.db(dbName);
  const result = await db
    .collection(noteCollection)
    .find({ userId: userId })
    .toArray();
  return result.map((note) => {
    return updateId(note) as Note;
  });
}

export async function createNote(body: string, title: string, userId: string) {
  await DbServer.connect();
  const db = DbServer.db(dbName);
  const result = await db
    .collection(noteCollection)
    .insertOne({
      body,
      title,
      userId,
      $currentDate: {
        createdAt: { $type: "date" },
        modifiedAt: { $type: "date" },
      },
    });
  return await getNote(result.insertedId.toString(), userId);
}

export async function deleteNoteById(id: string, userId: string) {
  await DbServer.connect();
  const db = DbServer.db(dbName);
  return await db
    .collection(noteCollection)
    .deleteOne({ _id: new ObjectId(id), userId: userId });
}

export { DbServer };
