import { cohere } from "../.././api/ia.js";
import { SlashCommandBuilder } from "discord.js";

const data = new SlashCommandBuilder()
  .setName('fix')

  .setDescription('This command help you to fix your English grammar').addStringOption(option => option.setRequired(true).setName("input").setDescription("The sentences to evaluate"));
async function execute(interaction) {
  try {
    await interaction.deferReply();
    const res = await cohere.generate({
      prompt: `This is a spell checker generator.

Incorrect: "He like play soccer with his friend after school."
Correct: "He likes to play soccer with his friends after school."

Incorrect: "She wants read mystery novels in her free time."
Correct: "She wants to read mystery novels in her free time."

Incorrect: "They loves to watch action movies on the weekend."
Correct: "They love to watch action movies on the weekends."

Incorrect: "They is good"
Correct: "They are good"

Incorrect: "She dont like to basketball."
Correct: "She dislikes playing basketball."

Incorrect: "It like to playing soccer with its friends after school."
Correct: "It likes to play soccer with its friends after school."

Incorrect: "We wants to reads mystery novel in our free time."
Correct: "We want to read mystery novels in our free time."

Incorrect: "You love to watches actions movies on the weekends."
Correct: "You love to watch action movies on the weekends."

Incorrect: "He like read computer programming."
Correct: "He likes to read about computer programming."

Incorrect: "you dis likes playing basketball."
correct: "you dislike playing basketball."

input: ${interaction.options.getString('input')}
output: ""
`,
      temperature: 0.3
    });
    await interaction.editReply({ content: `**${res.generations[0].text}**` });
    // await interaction.reply({ content: "replied" });
  } catch (error) {
    await interaction.editReply({ content: `There was an error: ${error}`, ephemeral: true });
  }
}
export default {
  data,
  execute
}
