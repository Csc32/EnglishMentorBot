import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import { Client, Events, Collection, GatewayIntentBits } from 'discord.js';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

//save the bot token
const token = process.env.BOT_TOKEN;

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.cooldowns = new Collection();
client.commands = new Collection();

//save the dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
//save the commands folder path
const folderPath = join(__dirname, 'commands');

const commandFolders = readdirSync(folderPath);

for (const folder of commandFolders) {

  const commandsPath = join(folderPath, folder);
  const commandFiles = readdirSync(commandsPath).filter(file => file.endsWith("js"));

  for (const file of commandFiles) {
    const filePath = join(commandsPath, file);
    const command = await import(filePath);
    if ('data' in command.default && 'execute' in command.default) {
      client.commands.set(command.default.data.name, command);
    } else {
      console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
    }
  }

}
client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isChatInputCommand()) return;
  const command = interaction.client.commands.get(interaction.commandName);

  if (!command) {
    console.error(`No command matching ${interaction.commandName} was found.`);
    return
  }

  const { cooldowns } = interaction.client;

  if (!cooldowns.has(command.default.data.name)) {
    cooldowns.set(command.default.data.name, new Collection())
  }

  const now = Date.now();

  const timestamps = cooldowns.get(command.default.data.name);

  const defaultCooldownDuration = 50;
  const cooldownAmount = (command.default.cooldown ?? defaultCooldownDuration) * 1_000;

  if (timestamps.has(interaction.user.id)) {
    const expirationTime = timestamps.get(interaction.user.id) + cooldownAmount;

    if (now < expirationTime) {
      const timeLeft = (expirationTime - now) / 1_000;
      return interaction.reply(`Please wait ${timeLeft.toFixed(1)} more second(s) before reusing the \`${command.default.data.name}\` command.`);
    }
  }

  timestamps.set(interaction.user.id, now);
  setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);
  try {

    await command.default.execute(interaction);
  } catch (error) {

    console.error(error);
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
    } else {
      await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
    }

  }
})

client.once(Events.ClientReady, readyClient => {
  console.log(`Ready! logged in as ${readyClient.user.tag}`);
})


client.login(token);

