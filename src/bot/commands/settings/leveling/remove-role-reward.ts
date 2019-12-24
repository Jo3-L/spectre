import { Command, Flag } from 'discord-akairo';
import { Message } from 'discord.js';

export default class RemoveRoleRewardCommand extends Command {
	public constructor() {
		super('remove-role-reward', {
			category: 'Settings',
			args: [
				{
					id: 'levelToRemove',
					type: (message, level) => {
						if (!/^\d+$/.test(level)) return Flag.fail('NAN');
						const current = this.client.settings.get(message.guild!, 'roleRewards', {} as { [key: string]: string });
						if (!(level in current)) return Flag.fail('NOT_PRESENT');
						return level;
					},
					prompt: {
						start: 'please provide a level to remove the role reward from.',
						retry: (_: Message, { failure }: { failure: { value: string } }) => {
							switch (failure.value) {
								case 'NOT_PRESENT': return 'please provide a level that has an existing role reward.';
								default: return 'please provide a valid level to remove the role reward from.';
							}
						},
					},
				},
			],
		});
	}

	public async exec(message: Message, { levelToRemove }: { levelToRemove: string }) {
		const data = this.client.settings.get(message.guild!, 'roleRewards', {} as { [key: string]: string });
		delete data[levelToRemove];
		await this.client.settings.set(message.guild!, 'roleRewards', data);
		message.util!.send(`${this.client.emojis.success} Successfully removed 1 role reward for the level ${levelToRemove}!`);
	}
}