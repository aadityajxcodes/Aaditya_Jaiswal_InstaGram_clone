const Comment = require("../models/Comment");
const Post = require("../models/Post");

// =======================
// Create a Comment
// =======================
exports.createComment = async (req, res) => {
    try {
        const { comment, postId } = req.body;

        // 1. Validate input
        if (!comment || !postId) {
            return res.status(400).json({
                success: false,
                message: "Please provide both comment and postId",
            });
        }

        // 2. Check if post exists
        const existingPost = await Post.findById(postId);
        if (!existingPost) {
            return res.status(404).json({
                success: false,
                message: "Post not found",
            });
        }

        // 3. Get user from middleware token
        const user = req.user;
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid token",
            });
        }

        // 4. Create the comment
        const newComment = await Comment.create({
            comment,
            user: user.id,
            post: postId,
        });

        // 5. Add comment reference to post
        existingPost.comments.push(newComment._id);
        await existingPost.save();

        return res.status(201).json({
            success: true,
            message: "Comment created successfully",
            data: newComment,
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Error occurred while creating the comment",
            error: error.message,
        });
    }
};

// =======================
// Delete a Comment
// =======================
exports.deleteComment = async (req, res) => {
    try {
        const { postId, commentId } = req.body;

        // Validate input
        if (!postId || !commentId) {
            return res.status(400).json({
                success: false,
                message: "Please provide both postId and commentId",
            });
        }

        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({
                success: false,
                message: "Post not found",
            });
        }

        const user = req.user;
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid token",
            });
        }

        const comment = await Comment.findById(commentId);
        if (!comment) {
            return res.status(404).json({
                success: false,
                message: "Comment not found",
            });
        }

        // Only owner can delete
        if (comment.user.toString() !== user.id) {
            return res.status(403).json({
                success: false,
                message: "You cannot delete someone else's comment",
            });
        }

        await comment.deleteOne();

        // Remove comment reference from post
        post.comments.pull(commentId);
        await post.save();

        return res.status(200).json({
            success: true,
            message: "Comment deleted successfully",
            data: comment,
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Error occurred while deleting the comment",
            error: error.message,
        });
    }
};

// =======================
// View Comments of a Post
// =======================
exports.viewComment = async (req, res) => {
    try {
        const { postId } = req.body;

        if (!postId) {
            return res.status(400).json({
                success: false,
                message: "Please provide postId",
            });
        }

        const comments = await Comment.find({ post: postId }).populate("user");

        return res.status(200).json({
            success: true,
            message: "Comments fetched successfully",
            data: comments,
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Error occurred while fetching comments",
            error: error.message,
        });
    }
};

// =======================
// Edit a Comment
// =======================
exports.editComment = async (req, res) => {
    try {
        const { comment, postId, commentId } = req.body;

        // Validate input
        if (!comment || !postId || !commentId) {
            return res.status(400).json({
                success: false,
                message: "Please provide comment, postId and commentId",
            });
        }

        const user = req.user;
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid token",
            });
        }

        const existingComment = await Comment.findOne({ _id: commentId, post: postId });
        if (!existingComment) {
            return res.status(404).json({
                success: false,
                message: "Comment not found for this post",
            });
        }

        // Only owner can edit
        if (existingComment.user.toString() !== user.id) {
            return res.status(403).json({
                success: false,
                message: "You cannot edit someone else's comment",
            });
        }

        existingComment.comment = comment;
        await existingComment.save();

        return res.status(200).json({
            success: true,
            message: "Comment updated successfully",
            data: existingComment,
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Error occurred while editing the comment",
            error: error.message,
        });
    }
};
