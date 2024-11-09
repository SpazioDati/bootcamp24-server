from flask import Flask, request
import boto3
import json

app = Flask(__name__)

BEDROCK_REGION = "us-west-2"
BEDROCK_MODEL_ID = "anthropic.claude-3-5-sonnet-20241022-v2:0"


# health check, any content with status code 200 is fine
@app.route("/")
def home():
    return "I'm alive", 200


# main method, used by the evaluation job
@app.route("/question")
def question():
    q = request.args.get("q", '')

    if not q:
        return "Please enter a question", 404

    try:
        # Token is expected in OPENAI_API_KEY env var
        client = boto3.client(
            "bedrock-runtime",
            region_name=BEDROCK_REGION,
        )

        antrophic_request = json.dumps({
            "anthropic_version": "bedrock-2023-05-31",
            "max_tokens": 300,
            "temperature": 0,
            "system": """You are an expert of products of the fictional FakeCerved company, market leader in
                company information used for lead generation, marketing automation, third party risk
                assessments and more.

                You answer to the best of your fictional knowledge but when you dont know the answer say it
                clearly and apologize.

                If you want to use lists or other formatting, you must answer in HTML format.
                Images can be encoded in data:BASE64 format or drawn using SVG.""",
            "messages": [{
                "role": "user",
                "content": f"Given your knowledge about FakeCerved answer this question: ${q}"
            }
            ]})

        response = client.invoke_model(
            modelId=BEDROCK_MODEL_ID,
            body=antrophic_request
        )
        response_body = json.loads(response['body'].read())
        return str(response_body['content'][0]['text'])

    # make sure that if an exception is raised, you return a 5** error
    # so that evaluation job will retry to collect the response from your system
    # the content of the exception will be recorded and made available to you
    # so feel free to include any details might help you
    except Exception as e:
        return str(e), 500
