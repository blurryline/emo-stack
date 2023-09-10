import type { User } from "./user.server";

import {
  getNote as dbGetNote,
  getNoteListItems as dbGetNoteListItems,
  createNote as dbCreateNote,
  deleteNoteById,
} from "~/db.server";

export type Note = {
  id: string;
  title: string;
  body: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
};

export async function getNote({
  id,
  userId,
}: Pick<Note, "id"> & { userId: User["id"] }) {
  return await dbGetNote(id, userId);
}

export async function getNoteListItems({ userId }: { userId: User["id"] }) {
  return await dbGetNoteListItems(userId);
}

export async function createNote({
  body,
  title,
  userId,
}: Pick<Note, "body" | "title"> & {
  userId: User["id"];
}) {
  return dbCreateNote(body, title, userId);
}

export async function deleteNote({
  id,
  userId,
}: Pick<Note, "id"> & { userId: User["id"] }) {
  return await deleteNoteById(id, userId);
}
