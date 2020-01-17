import { Command } from 'discord-akairo';
import { Message } from 'discord.js';
import SpectreEmbed from '@structures/SpectreEmbed';
import Confirmation, { Responses } from '@structures/Confirmation';
import { CATEGORIES } from '@util/constants';

export default class ResetRoleRewardsCommand extends Command {
	public constructor() {
		super('role-rewards-reset', {
			category: CATEGORIES.SETTINGS,
		});
	}

	public async exec(message: Message) {
		const confirm = await new Confirmation(message, new SpectreEmbed()
			.setColor('YELLOW')
			.setAuthor('⚠️ This action is irreversible.')
			.setTitle('Confirmation')
			.setDescription('Are you sure you wish to reset all role-reward related settings to default? [yes/no]')
			.setFooter('You can respond with \'cancel\' to cancel the command!')).run();
		switch (confirm) {
			case Responses.Canceled:
			case Responses.No: return message.reply('the command has been cancelled.');
			case Responses.Timeout: return message.reply('you didn\'t respond in time. The command has been cancelled.');
			default:
				await message.util!.send(`${this.client.emojis.loading} Resetting role reward settings to default...`);
				await this.client.settings.delete(message.guild!, 'roleRewards');
				await this.client.settings.delete(message.guild!, 'rewardType');
				message.util!.send(`${this.client.emojis.success} Reset all role-rewards related settings to default.`);
		}
	}
}