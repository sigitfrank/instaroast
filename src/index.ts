import express, {
    Express,
    Request,
    Response
} from "express";

import dotenv from "dotenv";
dotenv.config();

import puppeteer from 'puppeteer'
import cors from 'cors'
import { model } from "./lib/gemini";
import { createPrompt } from "./helpers/prompt";
import { validateInstagramProfile } from "./validation/roast";

const app: Express = express();
const port = process.env.PORT || 4000;
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const delay = (time: number) => new Promise((resolve) => setTimeout(resolve, time));

app.get("/", async (req: Request, res: Response) => {
    res.json({
        status: 200,
        message: 'OK'
    });
});
app.post("/scrape", async (req: Request, res: Response) => {

    const {
        username,
        postsLimit = 5
    } = req.body;

    if (!username) {
        return res.status(400).json({
            error: 'Username is required'
        });
    }

    const limit = postsLimit || 3;

    try {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.goto(`https://www.instagram.com/${username}/`);

        await page.waitForSelector('article div img', {
            visible: true
        });

        const profileData = await page.evaluate(() => {
            const fullName = (document.querySelector('header h2') as any)?.innerText;
            const bio = (document.querySelector('header section div.-vDIg span') as any)?.innerText || '';
            const postsCount = (document.querySelector('header section ul li span span') as any)?.innerText;
            const followersCount = (document.querySelector('header section ul li:nth-child(2) span span') as any).innerText;
            const followingCount = (document.querySelector('header section ul li:nth-child(3) span span') as any).innerText;

            return {
                fullName,
                bio,
                postsCount,
                followersCount,
                followingCount,
            };
        });

        let loadedPosts = 0;
        while (loadedPosts < limit) {
            await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
            await delay(2000)

            const currentPosts = await page.evaluate(() => {
                return Array.from(document.querySelectorAll('article div img')).length;
            });

            if (currentPosts >= limit) break;

            loadedPosts = currentPosts;
        }

        const postDetails = await page.evaluate((limit: number) => {
            const posts: any[] = [];
            const postElements = document.querySelectorAll('article div img');

            postElements.forEach((img: any, index) => {
                if (index < limit) {
                    const postImage = img.src;
                    const postAltText = img.alt;

                    const postAnchor = img.closest('a');
                    let postDescription = '';

                    if (postAnchor) {
                        const postParentDiv = postAnchor.closest('article');
                        if (postParentDiv) {
                            const captionElement = postParentDiv.querySelector('ul li span');
                            if (captionElement) {
                                postDescription = captionElement.innerText;
                            }
                        }
                    }

                    posts.push({
                        postImage,
                        postAltText,
                        postDescription,
                    });
                }
            });

            return posts;
        }, limit);

        await browser.close();

        res.status(200).json({
            ...profileData,
            recentPosts: postDetails,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: 'Failed to scrape profile data'
        });
    }
});


app.post("/roast", async (req: Request, res: Response) => {
    const {
        profileData
    } = req.body;

    if (!profileData) return res.status(400).json({
        error: 'profile data is required'
    });

    try {

        const isValid = validateInstagramProfile(profileData)

        if (!isValid) {
            return res.status(400).json({
                error: 'profile is not valid'
            });
        }

        const prompt = createPrompt(profileData)
        const result = await model.generateContent([prompt]);
        res.status(200).json({
            data: {
                roastedMessage: result.response.text()
            },
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: 'Failed to roast instagram account'
        });
    }
});

app.listen(port, () => {
    console.log(`[server]: Server is running at http://localhost:${port}`);
});