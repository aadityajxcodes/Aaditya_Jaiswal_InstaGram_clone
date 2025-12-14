const express = require("express");
const router = express.Router();

// Import controllers
const { signUp, login } = require("../controllers/Auth");
const { getCurrentUser } = require("../controllers/User");
const { editAdditionalDetails } = require("../controllers/Profile");
const { createPost, editPost, deletePost, getAllPost } = require("../controllers/Post");
const { likePost, dislikePost } = require("../controllers/Like");
const { createComment, deleteComment, editComment, viewComment } = require("../controllers/Comment");
const { createTag } = require("../controllers/Tag");
const { savePost } = require("../controllers/SavePost");
const { followUnfollow, usersNotFollowed, getAllUsers } = require("../controllers/Follow1");


// Import authentication middleware
const { auth } = require("../middleware/auth");

/* ===================== AUTH ROUTES ===================== */

// Route to sign up a new user
router.post("/signup", signUp);

// Route to login an existing user
router.post("/login", login);

/* ===================== USER ROUTES ===================== */

// Route to fetch current logged-in user details (requires auth)
router.post("/findCurrentUser", auth, getCurrentUser);

// Route to edit additional profile details (requires auth)
router.post("/editProfile", auth, editAdditionalDetails);

/* ===================== POST ROUTES ===================== */

// Route to create a new post (requires auth)
router.post("/createPost", auth, createPost);

// Route to edit an existing post (requires auth)
router.post("/editPost", auth, editPost);

// Route to delete a post (requires auth)
router.post("/deletePost", auth, deletePost);

// Route to fetch all posts (no auth required)
router.get("/getAllPost", getAllPost);

// Route to save a post (requires auth)
router.post("/savePost", auth, savePost);

/* ===================== LIKE ROUTES ===================== */

// Route to like a post (requires auth)
router.post("/like", auth, likePost);

// Route to dislike (remove like) a post (requires auth)
router.post("/dislike", auth, dislikePost);

/* ===================== COMMENT ROUTES ===================== */

// Route to create a comment on a post (requires auth)
router.post("/createComment", auth, createComment);

// Route to delete a comment (requires auth)
router.post("/deleteComment", auth, deleteComment);

// Route to edit a comment (requires auth)
router.post("/editComment", auth, editComment);

// Route to view all comments for a post (no auth required)
router.post("/viewComments", viewComment);

/* ===================== TAG ROUTES ===================== */

// Route to create a tag (requires auth)
router.post("/createTag", auth, createTag);

/* ===================== FOLLOW ROUTES ===================== */

// Route to follow/unfollow a user (requires auth)
router.post("/follow", auth, followUnfollow);

// Route to fetch all users (requires auth)
router.post("/allUsers", auth, getAllUsers);



// Route to fetch users not yet followed by current user (requires auth)
router.post("/userNotFollowed", auth, usersNotFollowed);

module.exports = router;
