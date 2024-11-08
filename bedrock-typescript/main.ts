import express from "express";
import {config} from 'dotenv';
import {BedrockRuntimeClient, InvokeModelCommand} from "@aws-sdk/client-bedrock-runtime";


const REGION = "us-west-2";
const bedrockClient = new BedrockRuntimeClient({ region: REGION });
const app = express();
const env = config().parsed;

export function now() {
    let today = new Date(),
        todayTime = today.toTimeString().substr(0, 8),
        todayMS = today.getMilliseconds().toString().padStart(3, '0');
    
    return todayTime + '.' + todayMS;
}

app.get("/", function(_, res) {
    console.log(`${now()} Answering for /`);
    res.send("Alive and kicking");
});

app.get("/question", async (req, res) => {
    const {
        q,
    } = req.query;
    
    if (q == null || q === '') {
        return res.status(400).send('Missing question parameter');
    }
    
    console.log(`${now()}  Received question: ${q}`);
    
    let modelId = "anthropic.claude-3-5-sonnet-20241022-v2:0";
    
    const response = await bedrockClient.send(
        new InvokeModelCommand({
            contentType: "application/json",
            body: JSON.stringify({
                "anthropic_version": "bedrock-2023-05-31",
                "max_tokens": 1000,
                "temperature": 0.75,
                "messages": [
                    {
                        "role": "user",
                        "content": `You are an expert of products of the fictional FakeCerved company, market leader in
                                    company information used for lead generation, marketing automation, third party risk
                                    assessments and more.
         
                                    You answer to the best of your fictional knowledge but when you dont know the answer say it
                                    clearly and apologize.
         
                                    You can answer in HTML format, encoding images in data:BASE64 format.`,
                    },
                    {
                        "role": "user",
                        "content": q,
                    },
                
                ],
            }),
            modelId,
        }),
    );
    
    const decodedResponseBody = new TextDecoder().decode(response.body);
    const responseBody = JSON.parse(decodedResponseBody);
    const responses = responseBody.content;
    
    console.log(responses);
    
    if (responses.length > 0) {
        res.write(responses[0].text);
    } else {
        res.write("C'è stato un errore.. per favore riprova.");
    }
    
    console.log(`${now()} Done with question: ${q}`);
    console.log(`${now()}          Answer is: ${responses[0].text}`);
    
    res.end();
});


app.listen(9300, '0.0.0.0', () => {
    console.log(`${now()} Server is running on port 9300`);
});
