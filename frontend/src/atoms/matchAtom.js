import { atom } from "recoil";

// Atom to store match posts
const matchPostsAtom = atom({
  key: "matchPostsAtom", // Unique ID for the atom
  default: [], // Default value (empty array to start with)
});

export default matchPostsAtom;