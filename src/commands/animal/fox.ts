import { Command } from 'discord-akairo';
import fetch from 'node-fetch';
import { MessageEmbed, Message } from 'discord.js';

export default class FoxCommand extends Command {
	public constructor() {
		super('fox', {
			aliases: ['fox'],
			description: {
				content: '🦊 Sends a random fox in the chat.',
				usage: '',
				examples: [''],
			},
			category: 'Animals',
			clientPermissions: ['EMBED_LINKS', 'SEND_MESSAGES'],
			ratelimit: 2,
		});
	}

	public async exec(message: Message) {
		const { link } = await fetch('https://some-random-api.ml/img/fox').then(res => res.json()) as ApiResponse;
		const embed = new MessageEmbed()
			.setTitle('🦊 Fox')
			.setImage(link)
			.setColor(this.client.config.color)
			.setURL(link)
			.setFooter('Powered by some-random-api.ml')
			.setTimestamp();
		return message.util!.send(embed);
	}
}

interface ApiResponse {
	link: string;
}