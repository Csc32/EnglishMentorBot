import { cohere } from "../.././api/ia.js";
import { SlashCommandBuilder } from "discord.js";

const data = new SlashCommandBuilder()
  .setName('vocabulary')
  .setDescription('Generate a list specific vocabulary').addStringOption(option => option.setRequired(true).setName("input").setDescription("The vocabulary to be generated"))
async function execute(interaction) {
  try {
    await interaction.deferReply();
    const res = await cohere.generate({
      prompt: `Please generate a list of vocabulary of: ${interaction.options.getString('input')}`,
      temperature: 1
    });
    await interaction.editReply({ content: res.generations[0].text });
  } catch (error) {
    await interaction.editReply({ content: `There was an error: ${error}`, ephemeral: true });
  }
}
export default {
  data,
  execute,
  cooldown: 50
}
