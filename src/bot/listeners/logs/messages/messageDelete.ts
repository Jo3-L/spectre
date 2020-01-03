import Log from '../../../structures/Log';
import { escapedCodeblock } from '../../../../util/Util';
import { Listener } from 'discord-akairo';
import { Message, MessageEmbed, User } from 'discord.js';

export default class MessageDeleteListener extends Listener {
	public constructor() {
		super('messageDelete', {
			emitter: 'client',
			event: 'messageDelete',
			category: 'Logs',
		});
	}

	public async exec(message: Message) {
		if (!message.guild) return;
		const channel = Log.fetchChannel(message.guild, 'messages');
		if (!channel) return;
		let executor: User;
		const entry = await Log.getEntry(message.guild, 'MESSAGE_DELETE');
		// @ts-ignore
		// eslint-disable-next-line max-len
		if (entry && entry.extra.channel.id === message.channel.id && (entry.target.id === message.author.id) && (entry.createdTimestamp > (Date.now() - 5000)) && (entry.extra.count >= 1)) {
			executor = entry.executor;
		} else {
			executor = message.author;
		}
		const content = escapedCodeblock(message.content);
		const embed = new MessageEmbed()
			.setAuthor(`${message.author.tag}'s message was deleted`, message.author.displayAvatarURL())
			.setColor('RED')
			.setTimestamp()
			.setFooter(`Message ID: ${message.id}`)
			.setDescription(`
				▫️ **Deleted by:** ${Log.formatUser(executor)}
				▫️ **Timestamp of message:** ${Log.formatTime(message.createdAt)}
				▫️ **Channel:** ${message.channel} (ID ${message.channel.id})
				▫️ **Message author:** ${Log.formatUser(message.author)}
				▫️ **Message content:** ${content.length < 1800 ? content : ''}
			`);
		if (message.attachments.size) {
			embed.attachFiles([{
				attachment: message.attachments.first()!.proxyURL,
				name: 'deleted.png',
			}]);
			embed.description += `\n▫️ **Deleted image:**`;
			embed.setImage('attachment://deleted.png');
		}
		if (!content && message.content) {
			embed.attachFiles([{
				attachment: Buffer.from(message.content, 'utf8'),
				name: 'deleted_content.txt',
			}]);
		}
		Log.send(channel, embed);
	}
}