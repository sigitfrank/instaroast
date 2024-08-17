export interface RecentPost {
    postImage: string;
    postAltText: string;
    postDescription: string;
}

export interface InstagramProfile{
    fullName:string
    bio:string
    postsCount:string
    followersCount:string
    followingCount:string
    recentPosts:RecentPost[]
}

