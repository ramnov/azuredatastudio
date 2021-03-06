/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the Source EULA. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

'use strict';

import 'mocha';
import * as azdata from 'azdata';
import { context } from './testContext';
import { getBdcServer, TestServerProfile, getAzureServer, getStandaloneServer } from './testConfig';
import { connectToServer } from './utils';
import assert = require('assert');

if (context.RunTest) {
	suite('Object Explorer integration suite', () => {
		test('BDC instance node label test', async function () {
			const expectedNodeLabel = ['Databases', 'Security', 'Server Objects', 'Data Services'];
			let server = await getBdcServer();
			await VerifyOeNode(server, 6000, expectedNodeLabel);
		});
		test('Standard alone instance node label test', async function () {
			if (process.platform === 'win32') {
				const expectedNodeLabel = ['Databases', 'Security', 'Server Objects'];
				let server = await getStandaloneServer();
				await VerifyOeNode(server, 3000, expectedNodeLabel);
			}
		});
		test('Azure SQL DB instance node label test', async function () {
			const expectedNodeLabel = ['Databases', 'Security'];
			let server = await getAzureServer();
			await VerifyOeNode(server, 3000, expectedNodeLabel);
		});

		test('Standard SQL DB context menu test', async function () {
			let server = await getStandaloneServer();

			let expectedActions: string[];

			// Properties comes from the admin-tool-ext-win extension which is for Windows only, so the item won't show up on non-Win32 platforms
			if (process.platform === 'win32') {
				expectedActions = ['Manage', 'New Query', 'Disconnect', 'Delete Connection', 'Refresh', 'New Notebook', 'Data-tier Application wizard', 'Launch Profiler', 'Properties'];
			} else {
				expectedActions = ['Manage', 'New Query', 'Disconnect', 'Delete Connection', 'Refresh', 'New Notebook', 'Data-tier Application wizard', 'Launch Profiler'];
			}

			await verifyContextMenu(server, expectedActions);
		});

		test('BDC instance context menu test', async function () {
			let server = await getBdcServer();

			let expectedActions: string[];

			// Properties comes from the admin-tool-ext-win extension which is for Windows only, so the item won't show up on non-Win32 platforms
			if (process.platform === 'win32') {
				expectedActions = ['Manage', 'New Query', 'Disconnect', 'Delete Connection', 'Refresh', 'New Notebook', 'Data-tier Application wizard', 'Launch Profiler', 'Properties'];
			} else {
				expectedActions = ['Manage', 'New Query', 'Disconnect', 'Delete Connection', 'Refresh', 'New Notebook', 'Data-tier Application wizard', 'Launch Profiler'];
			}

			await verifyContextMenu(server, expectedActions);
		});

		test('Azure SQL DB context menu test', async function () {
			const server = await getAzureServer();
			// Azure DB doesn't have Properties node on server level
			const expectedActions = ['Manage', 'New Query', 'Disconnect', 'Delete Connection', 'Refresh', 'New Notebook', 'Data-tier Application wizard', 'Launch Profiler'];

			await verifyContextMenu(server, expectedActions);
		});
	});
}

async function verifyContextMenu(server: TestServerProfile, expectedActions: string[]): Promise<void> {
	await connectToServer(server, 3000);
	let nodes = <azdata.objectexplorer.ObjectExplorerNode[]>await azdata.objectexplorer.getActiveConnectionNodes();
	assert(nodes.length > 0, `Expecting at least one active connection, actual: ${nodes.length}`);

	let index = nodes.findIndex(node => node.nodePath.includes(server.serverName));
	assert(index !== -1, `Failed to find server: "${server.serverName}" in OE tree`);

	let node = nodes[index];
	let actions = await azdata.objectexplorer.getNodeActions(node.connectionId, node.nodePath);

	const expectedString = expectedActions.join(',');
	const actualString = actions.join(',');
	assert(expectedActions.length === actions.length && expectedString === actualString, `Expected actions: "${expectedString}", Actual actions: "${actualString}"`);
}

async function VerifyOeNode(server: TestServerProfile, timeout: number, expectedNodeLabel: string[]): Promise<void> {
	await connectToServer(server, timeout);
	let nodes = <azdata.objectexplorer.ObjectExplorerNode[]>await azdata.objectexplorer.getActiveConnectionNodes();
	assert(nodes.length > 0, `Expecting at least one active connection, actual: ${nodes.length}`);

	let index = nodes.findIndex(node => node.nodePath.includes(server.serverName));
	assert(index !== -1, `Failed to find server: "${server.serverName}" in OE tree`);
	let actualNodeLabel = [];
	let children = await nodes[index].getChildren();
	assert(children.length === expectedNodeLabel.length, `Expecting node count: ${expectedNodeLabel.length}, Actual: ${children.length}`);

	children.forEach(c => actualNodeLabel.push(c.label));
	assert(expectedNodeLabel.toLocaleString() === actualNodeLabel.toLocaleString(), `Expected node label: "${expectedNodeLabel}", Actual: "${actualNodeLabel}"`);
}

