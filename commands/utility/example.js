import { cohere } from "../.././api/ia.js";
import { SlashCommandBuilder } from "discord.js";

const data = new SlashCommandBuilder()
  .setName('example')
  .setDescription('Generate an example about a specific topic').addStringOption(option => option.setRequired(true).setName("topic").setDescription("The topic of the example"))
async function execute(interaction) {
  try {
    await interaction.deferReply();
    const res = await cohere.generate({
      prompt: `Please generate just one example of ${interaction.options.getString('topic')}`,
      temperature: 1
    });
    await interaction.editReply({ content: res.generations[0].text });
  } catch (error) {
    await interaction.editReply({ content: `There was an error: ${error}`, ephemeral: true });
  }
}
export default {
  data,
  execute
}
