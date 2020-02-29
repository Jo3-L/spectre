import Log, { emojis } from '@util/logUtil';
import SpectreEmbed from '@util/SpectreEmbed';
import { formatTime, formatUser } from '@util/util';
import { stripIndents } from 'common-tags';
import { Listener } from 'discord-akairo';
import { Collection, Message, Snowflake, TextChannel } from 'discord.js';

export default class MessageDeleteBulkListener extends Listener {
	public constructor() {
		super('messageDeleteBulk', {
			emitter: 'client',
			event: 'messageDeleteBulk',
		});
	}

	public async exec(messages: Collection<Snowflake, Message>) {
		const guild = messages.first()!.guild;
		if (!guild) return;
		const channel = Log.fetchChannel(guild, 'messages');
		if (!channel) return;
		const embed = new SpectreEmbed()
			.setAuthor(`Messages were bulk deleted in #${(messages.first()!.channel as TextChannel).name}`,
				emojis.deleteMessage)
			.setColor('RED')
			.setTimestamp()
			.setFooter(`Channel ID: ${messages.first()!.channel.id}`)
			.setDescription(`
				▫️ **Amounted deleted:** ${messages.size}
				▫️ **Channel:** ${messages.first()!.channel} (${messages.first()!.channel.id})
			`)
			.attachFiles([{
				attachment: Buffer.from(
					messages
						.map(msg =>
							stripIndents`[${formatTime(msg.createdAt)}] ${formatUser(msg.author)}: ${msg.content}
							${msg.attachments.first()?.proxyURL ?? ''}`)
						.reverse()
						.join('\r\n'), 'utf8',
				),
				name: 'deleted_messages.txt',
			}]);
		channel.send(embed);
	}
}