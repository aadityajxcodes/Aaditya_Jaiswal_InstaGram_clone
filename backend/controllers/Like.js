const Like = require("../models/Like");
const Post = require("../models/Post");

exports.likePost = async (req, res) => {
    try {
        const { postId } = req.body;
        const user = req.user;

        if (!postId) return res.status(400).json({ success: false, message: "Post ID is required" });
        if (!user) return res.status(401).json({ success: false, message: "Unauthorized" });

        const post = await Post.findById(postId);
        if (!post) return res.status(404).json({ success: false, message: "Post not found" });

        const alreadyLiked = await Like.findOne({ post: postId, like: user.id });
        if (alreadyLiked) return res.status(409).json({ success: false, message: "Already liked this post" });

        const newLike = await Like.create({ post: postId, like: user.id });
        post.likes.push(user.id);
        await post.save();

        res.status(200).json({ success: true, message: "Post liked", data: post });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal server error", error: error.message });
    }
};

exports.dislikePost = async (req, res) => {
    try {
        const { postId } = req.body;
        const user = req.user;

        if (!postId) return res.status(400).json({ success: false, message: "Post ID is required" });
        if (!user) return res.status(401).json({ success: false, message: "Unauthorized" });

        const post = await Post.findById(postId);
        if (!post) return res.status(404).json({ success: false, message: "Post not found" });

        const likeEntry = await Like.findOne({ post: postId, like: user.id });
        if (!likeEntry) return res.status(403).json({ success: false, message: "You haven't liked this post" });

        await likeEntry.deleteOne();
        post.likes.pull(user.id);
        await post.save();

        res.status(200).json({ success: true, message: "Post disliked" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal server error", error: error.message });
    }
};
