/**
 * Copyright (c) 2019 Ben Gubler <nebrelbug@gmail.com>
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const unchangedCLICommands = ['init', 'run', 'test', 'login', 'logout', 'link', 'publish', 'cache'];

const npmToPnpmTable = {
	install(command) {
		if (/^install *$/.test(command)) {
			return 'install';
		}

		return command
			.replace('install', 'add')
			.replace(/\s*--save/, '--save-prod')
			.replace('--no-package-lock', '');
	},
	uninstall(command) {
		return command
			.replace('uninstall', 'remove')
			.replace(/\s*--save/, '--save-prod')
			.replace('--no-package-lock', '');
	},
	version(command) {
		return command.replace(/(major|minor|patch)/, '--$1');
	},
	rebuild(command) {
		return command.replace('rebuild', 'add --force');
	}
};

function npmToPnpm(m, command) {
	command = (command || '').trim();
	const firstCommand = (/\w+/.exec(command) || [''])[0];

	if (unchangedCLICommands.includes(firstCommand)) {
		return `pnpm ${command}`;
	} else if (Object.prototype.hasOwnProperty.call(npmToPnpmTable, firstCommand) && npmToPnpmTable[firstCommand]) {
		if (typeof npmToPnpmTable[firstCommand] === 'function') {
			return `pnpm ${npmToPnpmTable[firstCommand](command)}`;
		}
		return `pnpm ${command.replace(firstCommand, npmToPnpmTable[firstCommand])}`;
	}
	return `pnpm ${command}\n# couldn't auto-convert command`;
}

module.exports = function convert(str) {
	return str.replace(/npm(?: +([^&\n\r]*))?/gm, npmToPnpm);
};