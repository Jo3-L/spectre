import Confirmation, { Responses } from '@structures/Confirmation';
import { CATEGORIES } from '@util/constants';
import SpectreEmbed from '@util/SpectreEmbed';
import { Command } from 'discord-akairo';
import { Message } from 'discord.js';

export default class RebootCommand extends Command {
	public constructor() {
		super('reboot', {
			aliases: ['reboot', 'die', 'shutdown'],
			category: CATEGORIES.OWNER,
			clientPermissions: ['SEND_MESSAGES'],
			description: {
				content: 'Reboots the bot.',
				examples: [''],
				usage: '',
			},
			ownerOnly: true,
			ratelimit: 2,
		});
	}

	public async exec(message: Message) {
		const confirm = await new Confirmation(message, new SpectreEmbed()
			.setColor('YELLOW')
			.setAuthor('Confirmation')
			.setDescription('Are you sure you wish to reload the bot? Respond with `yes/no`.')
			.setFooter('You may respond with \'cancel\' to cancel the command.')).run();
		switch (confirm) {
			case Responses.Canceled:
			case Responses.No: return message.reply('the command has been cancelled.');
			case Responses.Timeout: return message.reply('you didn\'t respond in time. The command has been cancelled.');
			default:
				await message.channel.send(`${this.client.emojis.loading} Rebooting...`);
				await this.client.destroy();
				await process.exit();
		}
	}
}