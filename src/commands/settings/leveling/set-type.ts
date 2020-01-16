import { Command } from 'discord-akairo';
import { Message } from 'discord.js';
import { stripIndents } from 'common-tags';
import { CATEGORIES } from '@util/Constants';

export default class SetTypeRoleRewardsCommand extends Command {
	public constructor() {
		super('role-rewards-set-type', {
			category: CATEGORIES.SETTINGS,
			args: [
				{
					id: 'type',
					type: ['stack', 'highest'],
					prompt: {
						start: stripIndents`please choose one of the following types of role reward giving type to switch to.
						
						1. \`stack\` (Roles will be given at the appropriate level and not removed)
						2. \`highest\` (Only the highest role reward that has been reached will be kept)`,
						retry: 'that was not a valid type. Try again.',
					},
				},
			],
		});
	}

	public async exec(message: Message, { type }: { type: 'stack' | 'highest' }) {
		// For convenience
		const name = 'type of role reward giving';
		const guild = message.guild!;
		const current = this.client.settings.get(guild, 'rewardType', 'stack');
		if (current === type) return message.util!.reply(`${current} is already the ${name} for this guild.`);
		await this.client.settings.set(guild, 'rewardType', type);
		return message.util!.send(`${this.client.emojis.success} Successfully set the ${name} for this guild to ${type}!`);
	}
}