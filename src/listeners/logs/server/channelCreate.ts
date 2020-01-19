import SpectreEmbed from '@structures/SpectreEmbed';
import Log, { emojis } from '@util/logUtil';
import { formatTime, formatUser, removeBlankLines } from '@util/util';
import { Listener } from 'discord-akairo';
import { DMChannel, GuildChannel } from 'discord.js';

export default class ChannelCreateListener extends Listener {
	public constructor() {
		super('channelCreate', {
			emitter: 'client',
			event: 'channelCreate',
		});
	}

	public async exec(channel: GuildChannel | DMChannel) {
		if (!('guild' in channel)) return;
		const { guild } = channel;
		const logChannel = Log.fetchChannel(guild, 'server');
		if (!logChannel) return;
		const entry = await Log.getEntry(guild, 'CHANNEL_CREATE');
		const executor = await Log.getExecutor({ guild, id: channel.id }, 'CHANNEL_CREATE', entry);
		const embed = new SpectreEmbed()
			.setAuthor(`Channel #${channel.name} was created`, emojis.addChannel)
			.setColor('GREEN')
			.setDescription(removeBlankLines`
				▫️ **Parent channel:** ${channel.parent ? `${channel.parent} (${channel.parentID})` : 'n/a'}
				▫️ **Created at:** ${formatTime(channel.createdAt)}
				${executor ? `▫️ **Created by:** ${formatUser(executor)}` : ''}
				${entry?.reason ? `▫️ **Reason:** ${entry.reason}` : ''}
				▫️ **Type:** \`${channel.type}\`
			`)
			.setFooter(`Channel ID: ${channel.id}`)
			.setTimestamp();
		logChannel.send(embed);
	}
}