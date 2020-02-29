import Log, { emojis } from '@util/logUtil';
import SpectreEmbed from '@util/SpectreEmbed';
import { formatTime, formatUser } from '@util/util';
import { Listener } from 'discord-akairo';
import { GuildEmoji } from 'discord.js';

export default class EmojiDeleteListener extends Listener {
	public constructor() {
		super('emojiDelete', {
			emitter: 'client',
			event: 'emojiDelete',
		});
	}

	public async exec(emoji: GuildEmoji) {
		const { guild } = emoji;
		const channel = await Log.fetchChannel(guild, 'server');
		if (!channel) return;
		const entry = await Log.getEntry(guild, 'EMOJI_DELETE');
		const executor = await Log.getExecutor({ guild, id: emoji.id }, 'EMOJI_DELETE', entry);
		const embed = new SpectreEmbed()
			.setAuthor('An emoji was deleted', emojis.deleteEmoji)
			.setTimestamp()
			.setFooter(`Emoji ID: ${emoji.id}`)
			.setColor('RED')
			.setDescription(`
				▫️ **Emoji:** ${emoji}
				▫️ **Emoji name:** \`${emoji.name}\`
				▫️ **Animated:** ${emoji.animated ? 'yes' : 'no'}
				▫️ **URL:** [View here](${emoji.url})
				▫️ **Timestamp of creation:** ${formatTime(emoji.createdAt!)}
				${executor ? `▫️ **Deleted by:** ${formatUser(executor)}` : ''}
				${entry?.reason ? `▫️ **Reason:** ${entry.reason}` : ''}
			`)
			.setThumbnail(emoji.url);
		channel.send(embed);
	}
}