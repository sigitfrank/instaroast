import { InstagramProfile } from "../types";

export function validateInstagramProfile(profile: any): profile is InstagramProfile {
    if (
        typeof profile.fullName !== 'string' ||
        typeof profile.postsCount !== 'string' ||
        typeof profile.followersCount !== 'string' ||
        typeof profile.followingCount !== 'string' ||
        !Array.isArray(profile.recentPosts)
    ) {
        return false;
    }

    for (const post of profile.recentPosts) {
        if (
            typeof post.postImage !== 'string' ||
            typeof post.postAltText !== 'string' ||
            typeof post.postDescription !== 'string'
        ) {
            return false;
        }
    }

    return true;
}