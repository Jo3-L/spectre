import { CATEGORIES } from '@util/constants';
import { Command, Flag } from 'discord-akairo';
import { Message } from 'discord.js';

export default class RemoveRoleRewardCommand extends Command {
	public constructor() {
		super('role-rewards-remove', {
			args: [
				{
					id: 'levelToRemove',
					prompt: {
						retry: (_: Message, { failure }: { failure: { value: string } }) => {
							if (failure.value) return 'please provide a level that has an existing role reward.';
							return 'please provide a valid level to remove the role reward from.';
						},
						start: 'please provide a level to remove the role reward from.',
					},
					type: (message, level) => {
						if (!/^\d+$/.test(level)) return;
						const current = this.client.settings.get(message.guild!, 'roleRewards', {});
						if (!(level in current)) return Flag.fail('NOT_PRESENT');
						return level;
					},
				},
			],
			category: CATEGORIES.SETTINGS,
		});
	}

	public async exec(message: Message, { levelToRemove }: { levelToRemove: string }) {
		const data = this.client.settings.get(message.guild!, 'roleRewards', {});
		delete data[levelToRemove];
		await this.client.settings.set(message.guild!, 'roleRewards', data);
		message.util!.send(`${this.client.emojis.success} Successfully removed 1 role reward for the level ${levelToRemove}!`);
	}
}