import Log, { emojis } from '@util/logUtil';
import SpectreEmbed from '@util/SpectreEmbed';
import { formatTime, formatUser, removeBlankLines } from '@util/util';
import { Listener } from 'discord-akairo';
import { Role } from 'discord.js';
import { stringify } from 'querystring';

export default class RoleDeleteListener extends Listener {
	public constructor() {
		super('roleDelete', {
			emitter: 'client',
			event: 'roleDelete',
		});
	}

	public async exec(role: Role) {
		const { guild } = role;
		const channel = await Log.fetchChannel(guild, 'server');
		if (!channel) return;
		const entry = await Log.getEntry(guild, 'ROLE_DELETE');
		const executor = await Log.getExecutor({ guild, id: role.id }, 'ROLE_DELETE', entry);
		const embed = new SpectreEmbed()
			.setAuthor('A role was deleted', emojis.deleteRole)
			.setTimestamp()
			.setFooter(`Role ID: ${role.id}`)
			.setColor('RED')
			.setDescription(removeBlankLines`
				${executor ? `▫️ **Deleted by:** ${formatUser(executor)}` : ''}
				${entry?.reason ? `▫️ **Reason:** ${entry.reason}` : ''}
				▫️ **Role:** \`${role.name}\` (${role.id})
				▫️ **Color:** ${role.color ? role.hexColor : 'Default color'}
				▫️ **Mentionable:** ${role.mentionable ? 'yes' : 'no'}
				▫️ **Hoisted:** ${role.hoist ? 'yes' : 'no'}
				▫️ **Timestamp of creation:** ${formatTime(role.createdAt)}
			`)
			.setImage(`https://dummyimage.com/400/${role.hexColor.substr(1)}/ffffff/&${stringify({ text: 'Role color' })}`);
		channel.send(embed);
	}
}