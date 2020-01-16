import { Listener } from 'discord-akairo';
import { Role } from 'discord.js';
import Log, { emojis } from '@structures/Log';
import { stringify } from 'querystring';
import { removeBlankLines, formatTime, formatUser } from '@util/Util';
import SpectreEmbed from '@structures/SpectreEmbed';

export default class RoleCreateListener extends Listener {
	public constructor() {
		super('roleCreate', {
			event: 'roleCreate',
			emitter: 'client',
		});
	}

	public async exec(role: Role) {
		const { guild } = role;
		const channel = await Log.fetchChannel(guild, 'server');
		if (!channel) return;
		const entry = await Log.getEntry(guild, 'ROLE_CREATE');
		const executor = await Log.getExecutor({ guild, id: role.id }, 'ROLE_CREATE', entry);
		const embed = new SpectreEmbed()
			.setAuthor('A role was created', emojis.createRole)
			.setTimestamp()
			.setFooter(`Role ID: ${role.id}`)
			.setColor('GREEN')
			.setDescription(removeBlankLines`
				${executor ? `▫️ **Created by:** ${formatUser(executor)}` : ''}
				${entry?.reason ? `▫️ **Reason:** ${entry.reason}` : ''}
				▫️ **Role:** \`${role.name}\` (${role.id})
				▫️ **Color:** ${role.color ? role.hexColor : 'Default color'}
				▫️ **Mentionable:** ${role.mentionable ? 'yes' : 'no'}
				▫️ **Hoisted:** ${role.hoist ? 'yes' : 'no'}
				▫️ **Role position:** ${Math.abs(role.position - guild.roles.size)}
				▫️ **Timestamp of creation:** ${formatTime(role.createdAt)}
			`)
			.setThumbnail(`https://dummyimage.com/500/${role.hexColor.substr(1)}/ffffff/&${stringify({ text: 'Role color' })}`);
		channel.send(embed);
	}
}