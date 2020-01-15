/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
export interface IChallengeResponse {
    requestId: string;
}

export interface IAuthenticateResponse {
    channel: Channel;
    identifier: string;
}

export interface ITestResponse {
    channel: Channel;
    identifier: string;
    validationCode: string;
}

export enum Channel {
    EMAIL = 'email',
    SMS = 'sms',
    PUSHOVER = 'pushover',
    VOICE = 'voice',
    TELEGRAM = 'telegram'
}

export enum Charset {
    DEC = 'dec',
    HEX = 'hex',
    ALPHA = 'alpha',
    UPPER = 'upper'
}

export interface IChallengeOptions {
    language: string;
    expirationInMinutes?: number;
    maxAttempts?: number;
    codeLength?: number;
    charset?: Charset;
    test?: boolean;
}

export interface ISMSPriceItem {
    code: string;
    country: string;
    price: number;
}

export interface IVoicePriceItem {
    code: string;
    country: string;
    type: string;
    price: number;
}
