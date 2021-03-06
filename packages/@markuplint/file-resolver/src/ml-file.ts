import fs from 'fs';
import path from 'path';
import util from 'util';

const stat = util.promisify(fs.stat);
const readFile = util.promisify(fs.readFile);
const fileCaches = new WeakMap<MLFile, string>();

export class MLFile {
	readonly anonymous: boolean;
	#filePath: string;

	/**
	 *
	 * @param filePathOrContext A file path or context
	 * @param anonymous if 1st param is a context
	 * @param workspace context of workspace
	 * @param name context of name
	 */
	constructor(filePathOrContext: string, anonymous = false, workspace = process.cwd(), name = '<AnonymousFile>') {
		this.anonymous = anonymous;
		if (anonymous) {
			this.#filePath = `${workspace}/${name}`;
			// `filePath` is context
			fileCaches.set(this, filePathOrContext);
		} else {
			this.#filePath = path.resolve(filePathOrContext);
		}
	}

	get path() {
		return this.#filePath;
	}

	async isExist() {
		return !!(await stat(this.#filePath));
	}

	async getContext() {
		return fileCaches.get(this) || (await this._fetch());
	}

	private async _fetch() {
		const context = await readFile(this.#filePath, { encoding: 'utf-8' });
		fileCaches.set(this, context);
		return context;
	}
}
