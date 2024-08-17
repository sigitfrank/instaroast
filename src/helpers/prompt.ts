import {  InstagramProfile } from "../types";

export const createPrompt = (profileData: InstagramProfile) => {
    let prompt = `I have scraped an Instagram profile, and I need you to analyze or "roast" the profile based on the data provided. Here are the details:\n\n`;
    prompt += `- **Full Name**: ${profileData.fullName}\n`;
    prompt += `- **Bio**: ${profileData.bio}\n`;
    prompt += `- **Number of Posts**: ${profileData.postsCount}\n`;
    prompt += `- **Number of Followers**: ${profileData.followersCount}\n`;
    prompt += `- **Number of Following**: ${profileData.followingCount}\n\n`;
    prompt += `### Recent Posts:\n`;

    profileData.recentPosts.forEach((post, index) => {
        prompt += `${index + 1}. **Post Image URL**: ${post.postImage}\n`;
        prompt += `   - **Alt Text**: ${post.postAltText}\n`;
        prompt += `   - **Description**: ${post.postDescription}\n\n`;
    });

    prompt += `Please provide an analysis or a humorous "roast" of this profile based on the above information.`;

    return prompt;
};
