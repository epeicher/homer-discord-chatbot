// discord.js import
import { Client, GatewayIntentBits } from 'discord.js';
// node-fetch for making HTTP requests
import fetch from 'node-fetch';
import { config } from 'dotenv';

if (process.env.NODE_ENV === 'dev') config();

// initialize client
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});
// my model URL
const API_URL =
  'https://api-inference.huggingface.co/models/epeicher/DialoGPT-medium-homer';

// log out some info
client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

// when the bot receives a message
// need async message because we are making HTTP requests
client.on('messageCreate', async (message) => {
  // ignore messages from the bot itself
  if (message.author.bot) {
    return;
  }
  // form the payload
  const payload = {
    inputs: {
      text: message.content,
    },
  };
  // form the request headers with Hugging Face API key
  const headers = {
    Authorization: 'Bearer ' + process.env.HUGGINGFACE_TOKEN,
  };

  // set status to typing
  await message.channel.sendTyping();
  // query the server
  const response = await fetch(API_URL, {
    method: 'post',
    body: JSON.stringify(payload),
    headers: headers,
  });
  const data = await response.json();
  let botResponse = '';
  if (data.hasOwnProperty('generated_text')) {
    botResponse = data.generated_text;
  } else if (data.hasOwnProperty('error')) {
    // error condition
    botResponse = data.error;
  }
  // send message to channel as a reply
  message.reply({ content: botResponse });
});

client.login(process.env.DISCORD_TOKEN);
