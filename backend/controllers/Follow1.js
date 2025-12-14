const User = require("../models/User");

exports.followUnfollow = async (req, res) => {
    try {
        const { heroId } = req.body;
        const currentUser = req.user;

        if (!heroId) return res.status(400).json({ success: false, message: "Please provide heroId" });
        if (!currentUser) return res.status(401).json({ success: false, message: "Please login first" });

        const heroUser = await User.findById(heroId);
        if (!heroUser) return res.status(404).json({ success: false, message: "User not found" });

        const alreadyFollowing = heroUser.followers.some(follower => follower.toString() === currentUser.id);

        if (alreadyFollowing) {
            heroUser.followers.pull(currentUser.id);
            await heroUser.save();

            const user = await User.findById(currentUser.id);
            user.following.pull(heroId);
            await user.save();

            return res.status(200).json({ success: true, message: "Unfollowed", data: heroUser });
        } else {
            heroUser.followers.push(currentUser.id);
            await heroUser.save();

            const user = await User.findById(currentUser.id);
            user.following.push(heroId);
            await user.save();

            return res.status(200).json({ success: true, message: "Followed", data: heroUser });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal server error", error: error.message });
    }
};

exports.getAllUsers = async (req, res) => {
    try {
        const currentUser = req.user;
        if (!currentUser) return res.status(401).json({ success: false, message: "Please login first" });

        const users = await User.find({});
        res.status(200).json({ success: true, message: "Users fetched successfully", data: users });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal server error", error: error.message });
    }
};

exports.usersNotFollowed = async (req, res) => {
    try {
        const currentUser = await User.findById(req.user.id);
        if (!currentUser) return res.status(404).json({ success: false, message: "User not found" });

        const followedIds = currentUser.following.map(f => f.toString());
        const users = await User.find({ _id: { $nin: [...followedIds, currentUser.id] } });

        res.status(200).json({ success: true, message: "Users not followed", data: users });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal server error", error: error.message });
    }
};
