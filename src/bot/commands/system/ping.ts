import { Command } from 'discord-akairo';
import { MessageEmbed, Message } from 'discord.js';

export default class PingCommand extends Command {
	public constructor() {
		super('ping', {
			aliases: ['ping', 'pong'],
			category: 'System',
			description: {
				content: 'Check the latency of the bot.',
				examples: [''],
				usage: '',
			},
			clientPermissions: ['EMBED_LINKS'],
			ratelimit: 2,
		});
	}

	public async exec(message: Message) {
		const msg = await message.util!.send(new MessageEmbed().setTitle('Pinging...').setColor(this.client.config.color));
		return message.util!.send(new MessageEmbed()
			.setTitle('🏓 Pong!')
			.setDescription(`• Latency: \`${((msg.editedTimestamp || msg.createdTimestamp) - (message.editedTimestamp || message.createdTimestamp)).toString()}\`ms\n• API Latency: \`${this.client.ws.ping.toFixed(2)}\`ms`)
			.setColor(this.client.config.color));
	}
}