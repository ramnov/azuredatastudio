/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the Source EULA. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { ITelemetryService, ITelemetryInfo, ITelemetryData } from 'vs/platform/telemetry/common/telemetry';
import * as fs from 'fs';
import { O_CREAT, O_WRONLY } from 'constants';

/**
 * Write telemetry into a file for test purposes
 */
export class FileTelemetryService implements ITelemetryService {
	_serviceBrand: undefined;
	private _isFirst = true;
	private _enabled: boolean;

	constructor(private _outputFile: string) {
		this._enabled = true;
	}

	publicLog(eventName: string, data?: ITelemetryData): Promise<any> {
		let telemetryData = JSON.stringify(Object.assign({ eventName: eventName, data: data }));
		if (this._outputFile) {
			if (this._isFirst) {
				fs.open(this._outputFile, O_WRONLY | O_CREAT, (err, fr) => {
					fs.writeFileSync(this._outputFile, telemetryData + '\n');
					this._isFirst = false;
				});
			} else {
				fs.appendFileSync(this._outputFile, telemetryData + '\n');
			}
		}
		return null;
	}

	setEnabled(value: boolean): void {
		this._enabled = value;
	}

	isOptedIn: true;
	getTelemetryInfo(): Promise<ITelemetryInfo> {
		let telemetryInfo: ITelemetryInfo = {
			instanceId: 'someValue.instanceId',
			sessionId: 'someValue.sessionId',
			machineId: 'someValue.machineId'
		};

		return new Promise<ITelemetryInfo>(() => telemetryInfo);
	}
}