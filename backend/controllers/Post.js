const Post = require("../models/Post");
const User = require("../models/User");
const cloudinary = require("cloudinary");
require("dotenv").config();

const supportedImageTypes = ["jpeg", "jpg", "png"];

async function uploadImageToCloud(file, folder, quality) {
    const options = { folder, resource_type: "auto" };
    if (quality) options.quality = quality;
    return await cloudinary.uploader.upload(file.tempFilePath, options);
}

exports.createPost = async (req, res) => {
    try {
        const { title } = req.body;
        const file = req.files?.image;
        const user = req.user;

        if (!title || !file) return res.status(400).json({ success: false, message: "Title and image are required" });

        const fileExt = file.name.split('.').pop().toLowerCase();
        if (!supportedImageTypes.includes(fileExt)) return res.status(400).json({ success: false, message: "Unsupported file type" });

        const uploadedImage = await uploadImageToCloud(file, "Instagram");
        const newPost = await Post.create({ title, createdBy: user.id, postImage: uploadedImage.secure_url });

        user.posts.push(newPost._id);
        await user.save();

        res.status(200).json({ success: true, message: "Post created successfully", data: newPost });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Error creating post", error: error.message });
    }
};

exports.editPost = async (req, res) => {
    try {
        const { title, body, postId } = req.body;
        const user = req.user;

        if (!title || !body || !postId) return res.status(400).json({ success: false, message: "All fields are required" });

        const post = await Post.findById(postId);
        if (!post) return res.status(404).json({ success: false, message: "Post not found" });
        if (post.createdBy.toString() !== user.id) return res.status(403).json({ success: false, message: "Unauthorized" });

        post.title = title;
        post.body = body;
        await post.save();

        res.status(200).json({ success: true, message: "Post updated successfully", data: post });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Error updating post", error: error.message });
    }
};

exports.deletePost = async (req, res) => {
    try {
        const { postId } = req.body;
        const user = req.user;

        if (!postId) return res.status(400).json({ success: false, message: "Post ID is required" });

        const post = await Post.findById(postId);
        if (!post) return res.status(404).json({ success: false, message: "Post not found" });
        if (post.createdBy.toString() !== user.id) return res.status(403).json({ success: false, message: "Unauthorized" });

        await post.deleteOne();

        const currentUser = await User.findById(user.id);
        currentUser.posts.pull(postId);
        await currentUser.save();

        res.status(200).json({ success: true, message: "Post deleted successfully", data: currentUser });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Error deleting post", error: error.message });
    }
};

exports.getAllPost = async (req, res) => {
    try {
        const posts = await Post.find({}).populate("createdBy").exec();
        if (!posts.length) return res.status(204).json({ success: false, message: "No posts found" });

        res.status(200).json({ success: true, message: "Posts fetched successfully", data: posts });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Error fetching posts", error: error.message });
    }
};
