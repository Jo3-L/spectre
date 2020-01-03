import Log from '../../../structures/Log';
import { removeBlankLines } from '../../../../util/Util';
import { Listener } from 'discord-akairo';
import { GuildMember, MessageEmbed } from 'discord.js';

export default class GuildMemberRemoveListener extends Listener {
	public constructor() {
		super('guildMemberRemove', {
			emitter: 'client',
			event: 'guildMemberRemove',
			category: 'Logs',
		});
	}

	public async exec(member: GuildMember) {
		const channel = Log.fetchChannel(member.guild, 'join');
		if (!channel) return;
		const { user, guild } = member;
		const entry = await Log.getEntry(guild, 'MEMBER_KICK');
		const executor = await Log.getExecutor({ guild, id: member.id }, 'MEMBER_KICK', entry);
		const embed = new MessageEmbed()
			.setAuthor(`${user.tag} ${executor ? 'was kicked' : 'left'}`, user.displayAvatarURL())
			.setColor('RED')
			.setDescription(removeBlankLines`
					${executor ? `**▫️ Kicked by:** ${Log.formatUser(executor)}` : ''}
					${executor && entry?.reason ? `**▫️ Reason:** ${entry.reason}` : ''}
					▫️ **Account created at:** ${Log.formatTime(user.createdAt)}
					▫️ **Joined guild at:** ${Log.formatTime(member.joinedAt!)}
					▫️ **Membercount:** ${guild.memberCount}
				`)
			.setFooter(`User ID: ${user.id}`)
			.setTimestamp();
		await Log.send(channel, embed);
	}
}