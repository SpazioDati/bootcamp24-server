from flask import Flask, request
from openai import OpenAI

app = Flask(__name__)


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
        client = OpenAI()
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[{
                "role": "system",
                "content": """You are an expert of products of the fictional FakeCerved company, market leader in
                company information used for lead generation, marketing automation, third party risk
                assessments and more.

                You answer to the best of your fictional knowledge but when you dont know the answer say it
                clearly and apologize.

                If you want to use lists or other formatting, you must answer in HTML format.
                Images can be encoded in data:BASE64 format or drawn using SVG."""
            },{
                "role": "user",
                "content": f"Given your knowledge about FakeCerved answer this question: ${q}"
            }],
            stream=False,
            temperature=0
        )
        return str(response.choices[0].message.content)

    # make sure that if an exception is raised, you return a 5** error
    # so that evaluation job will retry to collect the response from your system
    # the content of the exception will be recorded and made available to you
    # so feel free to include any details might help you
    except Exception as e:
        return str(e), 500
