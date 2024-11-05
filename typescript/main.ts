import {openai} from "@ai-sdk/openai";
import {streamText} from "ai";
import express from "express";
import {config} from 'dotenv';

const app = express();
const env = config().parsed;

export function now() {
    let today = new Date(),
        todayTime = today.toTimeString().substr(0, 8),
        todayMS = today.getMilliseconds().toString().padStart(3, '0');
    
    return todayTime + '.' + todayMS;
}

app.get("/question", async (req, res) => {
    const {
        q,
    } = req.query;
    
    if (q == null || q === '') {
        return res.status(400).send('Missing question parameter');
    }
    
    console.log(`${now()}  Received question: ${q}`);
    
    const {textStream, usage} = await streamText({
        model: openai("gpt-4o"),
        system: `You are an expert of products of the fictional FakeCerved company, market leader in
         company information used for lead generation, marketing automation, third party risk
         assessments and more.
         
         You answer to the best of your fictional knowledge but when you dont know the answer say it
         clearly and apologize.
         
         You can answer in HTML format, encoding images in data:BASE64 format.
         `,
        prompt: `Given your knowledge about FakeCerved answer this question: ${q}`,
    });
    
    let response = '';
    for await (const chunk of textStream) {
        // console.log(`${now()} Chunk: ${chunk}`);
        res.write(chunk);
        response += chunk;
    }
    
    console.log(`${now()} Done with question: ${q}`);
    console.log(`${now()}          Answer is: ${response}`);
    console.log(`${now()}              Usage: ${JSON.stringify(await usage)}`);
    
    res.end();
});


app.listen(8300, () => {
    console.log(`${now()} Server is running on port 8300`);
});
