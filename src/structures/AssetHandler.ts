import { readdir, readFile } from 'fs-nextra';
import { join } from 'path';
import { Collection } from 'discord.js';

interface Image {
	buffer: Buffer;
	id: number;
	type: 'levelup' | 'rank';
	url: string;
}

const GITHUB_CDN = 'https://raw.githubusercontent.com/Jo3-L/spectre/master/src/assets/social';

export default class AssetHandler extends Collection<string, Image> {
	public constructor(private readonly _directory: string) {
		super();
	}

	public async init() {
		const levelUpDir = join(this._directory, 'social', 'levelup');
		const rankDir = join(this._directory, 'social', 'rank');

		const levelUpFiles = await readdir(levelUpDir);
		const rankFiles = await readdir(rankDir);

		for (const levelUpFile of levelUpFiles) {
			const id = Number(levelUpFile.replace('.png', '.'));
			this.set(`levelup-${id}`, {
				buffer: await readFile(join(levelUpDir, levelUpFile)),
				id,
				type: 'levelup',
				url: `${GITHUB_CDN}/levelup/${id}.png`,
			});
		}

		for (const rankFile of rankFiles) {
			const id = Number(rankFile.replace('.png', ''));
			this.set(`rank-${id}`, {
				buffer: await readFile(join(rankDir, rankFile)),
				id,
				type: 'rank',
				url: `${GITHUB_CDN}/rank/${id}.png`,
			});
		}
	}

	public fetch({ id, type }: { id: number; type: 'levelup' | 'rank' }): Image {
		return this.get(`${type}-${id}`)!;
	}
}