# Cerved Data Innovation Bootcamp 2024 - AI Arena Server implementation

A minimalist server implementation in both Python and TypeScript designed for 
participating in the AI Arena competition. This repository provides a basic 
framework that demonstrates the essential components needed to connect and compete.

### Getting Started

* Deploy the server using your preferred method
* Create a secure tunnel to make it accessible via the internet
* Register your server endpoint with the AI Arena system

* This proof-of-concept implementation includes only the fundamental components 
required for participation, making it ideal for those looking to quickly get 
started or understand the basic requirements of the competition.

Note: This is a prototype intended for demonstration purposes. Consider adding 
additional security measures and error handling for "production" use.


## Main methods:

- `/` simple health check, any response with status code `200` is fine
- `/question` the main method that does the magic
  - param `q`: contains the question to process
  - response: can be plain text or an HTML fragment. Make sure to avoid any 
    css or js trick, as this can affect how your result is displayed to the 
    judges. Images encoded directly in the HTML using base64 are be fine.
  - errors: make sure that if an error occurs your server replies with a 
    status code `5**`, in that case the evaluation job will retry the API 
    call (2-3 times). In case of error, please include any helpful message 
    in the response (plain text) that will be recorded and you could use 
    this for debugging.

OpenAI Key can be set in the env var `OPENAI_API_KEY` or use `.env` file

Or feel free to use whatever other provider of choice.

## Expose the server on the internet

### Grok
You can use `ngrok` https://ngrok.com/ that is a free service

1. register to https://ngrok.com/
2. follow the instruction to install the client on your machine but do not 
   open the tunnel (last command in the guide that starts a tunnel using 
   an ephemeral domain)
3. generate a new static domain (free account can have 1 static domain 
   automatically generated) here: https://dashboard.ngrok.com/domains
4. create a tunnel using that domain: say your domain is something like 
   `alfa-beta-gamma.ngrok-free.app` and your server in running at 
   http://localhost:5000 you will have to run
   ```shell
   ngrok http --url=alfa-beta-gamma.ngrok-free.app 5000`
   ```
   Now you can access your local server opening the browser at 
   https://alfa-beta-gamma.ngrok-free.app. Use that domain to register the 
   server in the Bootcamp evaluation app.

   Note: using a static domain is kinda of mandatory as it ensures that 
   subsequent runs of the evaluation job could find your server (in case of 
   network errors or laptop restart)

### Cloudflared

Alternatively you can try `cloudflared` https://github.com/cloudflare/cloudflared 
which allows free private tunnels even without registration, with randomly assigned
names and no uptime guarantee.

After installation just run
```shell
cloudflared tunnel --url http://localhost:8300
```

and a random domain will be assigned (eg `https://cruise-steps-practitioner-lace.trycloudflare.com`).

## Typescript

Run `npm i` to get the deps. Configure a `.env` file (copy from `.env.example`)
the needed keys and then `npm run run` to get the server up and running on 
port 8300.

## Python

It's a simple flask server: you can use the server you prefer, this is just 
an example.

You can use `poetry` or `pip` as you prefer (there's also a `.tool-versions` 
specs for `asdf` if you like it)

```shell
cd python
poetry install

# or

pip install -r requirements.txt
```

and run it using `dotenv` to load the env vars

```shell
poetry run dotenv -f ../.env run -- flask run 

# or if you are using your own virtualenv

dotenv -f ../.env run -- flask run
```
