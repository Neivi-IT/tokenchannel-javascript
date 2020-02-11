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
import fetch, {HeadersInit, Response} from "node-fetch";
import {BadRequestError} from "./errors/bad-request";
import {ChallengeClosedError} from "./errors/challenge-closed";
import {ChallengeExpiredError} from "./errors/challenge-expired";
import {ChallengeNotFoundError} from "./errors/challenge-not-found";
import {IErrorInfo} from "./errors/errors";
import {ForbiddenError} from "./errors/forbidden";
import {InvalidCodeError} from "./errors/invalid-code";
import {InvalidIdentifierError} from "./errors/invalid-identifier";
import {MaxAttemptsExceededError} from "./errors/max-attempts-exceeded";
import {TargetOptOutError} from "./errors/opt-out";
import {OutOfBalanceError} from "./errors/out-of-balance";
import {QuotaExceededError} from "./errors/quota-exceeded";
import {UnauthorizedError} from "./errors/unauthorized";
import {
    Channel,
    IAuthenticateResponse,
    IChallengeOptions,
    IChallengeResponse,
    ISMSPriceItem,
    ITestResponse, IVoicePriceItem, IWhatsappPriceItem
} from './model';

export class Tokenchannel {

    public testMode: boolean;

    private BASE_URL: string = 'https://api.tokenchannel.io';
    private CHALLENGE_URL = `${this.BASE_URL}/challenge`;
    private AUTHENTICATE_URL = `${this.BASE_URL}/authenticate`;
    private TEST_URL = `${this.BASE_URL}/test`;
    private headers: HeadersInit;

    constructor(apiKey: string, testMode?: boolean) {
        this.headers = {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'User-Agent': 'tokenchannel/js',
            'X-Api-Key': apiKey,
        };
        this.testMode = !!testMode;
    }

    /**
     * Creates a challenge, ie, generates a token to be sent by a given a channel to a given identifier
     *
     * @param channel - The channel the token is being delivered
     * @param identifier - the customer identifier in the given channel
     * @param options - The challenge workflow configuration
     *
     * @throws {TargetOptOutError} whether the target user opted out this service via this channel
     * @throws {InvalidIdentifierError} whether the identifier is invalid for the given channel
     * @throws {BadRequestError} whether there is an invalid value in the request. The field error info in the BadRequestError describes the invalid value
     * @throws {OutOfBalanceError} whether there is not enough balance to attend a balance consumer challenge creation
     * @throws {ForbiddenError} whether requesting an action that provided api key is not allowed
     * @throws {UnauthorizedError} whether an invalid api key value is provided
     * @throws {QuotaExceededError} whether Sandbox quota, QPS o QPM have been exceeded
     */
    public async challenge(channel: Channel, identifier: string,
                           options: IChallengeOptions): Promise<IChallengeResponse> {

        if (this.testMode) {
            options.test = this.testMode;
        }

        const requestUrl = encodeURI(`${this.CHALLENGE_URL}/${channel}/${identifier}`);
        const payload = (!!options ? JSON.stringify(options) : '{}');
        return fetch(requestUrl, {method: 'POST', body: payload, headers: this.headers})
            .then(this.handleResponse as (response: Response) => Promise<IChallengeResponse>);
    }

    /**
     * Verifies a previously created challenge
     *
     * @param requestId - The handle to a given challenge
     * @param authCode - The token or validation code to try challenge authentication
     *
     * @throws {InvalidCodeError} whether the token or validation code provide is invalid
     * @throws {BadRequestError} whether the requestId format is invalid
     * @throws {ChallengeClosedError} whether the challenge is closed and no interaction is expected
     * @throws {ChallengeExpiredError} whether the challenge validity is over
     * @throws {ChallengeNotFoundError} whether the requestId is well formated but a challenge for that id cannot be found
     * @throws {MaxAttemptsExceededError} whether the max number ot attempts allowed has been reached
     * @throws {ForbiddenError} whether requesting an action t  hat provided api key is not allowed
     * @throws {UnauthorizedError} whether an invalid api key value is provided
     * @throws {QuotaExceededError} whether Sandbox quota, QPS o QPM have been exceeded
     */
    public async authenticate(requestId: string, authCode: string): Promise<IAuthenticateResponse> {
        const requestUrl = encodeURI(`${this.AUTHENTICATE_URL}/${requestId}/${authCode}`);
        return fetch(requestUrl, {method: 'POST', headers: this.headers})
            .then(this.handleResponse as (response: Response) => Promise<IAuthenticateResponse>);
    }

    /**
     *
     * Retrieves the validation code of a challenge that was previously created with test mode enabled
     *
     * @param requestId - The handle to a given challenge
     *
     * @throws {BadRequestError} whether the requestId format is invalid
     * @throws {ForbiddenError} whether requesting an action t  hat provided api key is not allowed
     * @throws {UnauthorizedError} whether an invalid api key value is provided
     * @throws {QuotaExceededError} whether Sandbox quota, QPS o QPM have been exceeded
     */
    public async getValidationCodeByTestChallengeId(requestId: string): Promise<ITestResponse> {
        const requestUrl = encodeURI(`${this.TEST_URL}/${requestId}`);
        return fetch(requestUrl, {method: 'GET', headers: this.headers})
            .then(this.handleResponse as (response: Response) => Promise<ITestResponse>);
    }

    /**
     * Retrieves the countries TokenChannel service is available
     *
     * @throws {QuotaExceededError} whether QPS o QPM have been exceeded
     */
    public async getSupportedCountries(): Promise<string[]> {
        const requestUrl = encodeURI(`${this.BASE_URL}/countries`);
        return fetch(requestUrl, {method: 'GET', headers: this.headers})
            .then(this.handleResponse as (response: Response) => Promise<string[]>);
    }

    /**
     * Retrieves the available languages or locales for the token notification templates
     * @throws {QuotaExceededError} whether QPS o QPM have been exceeded
     */
    public async getSupportedLanguages(): Promise<string[]> {
        const requestUrl = encodeURI(`${this.BASE_URL}/languages`);
        return fetch(requestUrl, {method: 'GET', headers: this.headers})
            .then(this.handleResponse as (response: Response) => Promise<string[]>);
    }

    /**
     * Retrieves the SMS pricing list for supported countries
     *
     * @throws {QuotaExceededError} whether QPS o QPM have been exceeded
     */
    public async getSMSPrices(): Promise<ISMSPriceItem[]> {
        const requestUrl = encodeURI(`${this.BASE_URL}/pricing/sms`);
        return fetch(requestUrl, {method: 'GET', headers: this.headers})
            .then(this.handleResponse as (response: Response) => Promise<ISMSPriceItem[]>);
    }

    /**
     * Retrieves the voice call pricing list for supported countries
     *
     * @throws {QuotaExceededError} whether QPS o QPM have been exceeded
     */
    public async getVoicePrices(): Promise<IVoicePriceItem[]> {
        const requestUrl = encodeURI(`${this.BASE_URL}/pricing/voice`);
        return fetch(requestUrl, {method: 'GET', headers: this.headers})
            .then(this.handleResponse as (response: Response) => Promise<IVoicePriceItem[]>);
    }

    /**
     * Retrieves the Whatsapp pricing list for supported countries
     *
     * @throws {QuotaExceededError} whether QPS o QPM have been exceeded
     */
    public async getWhatsappPrices(): Promise<IWhatsappPriceItem[]> {
        const requestUrl = encodeURI(`${this.BASE_URL}/pricing/whatsapp`);
        return fetch(requestUrl, {method: 'GET', headers: this.headers})
            .then(this.handleResponse as (response: Response) => Promise<IWhatsappPriceItem[]>);
    }

    public async handleResponse<T>(response: Response): Promise<T> {
        if (!response.ok) {
            if (response.status === 400) {
                const errorInfo = await response.json() as IErrorInfo;
                if (errorInfo.code === 'InvalidCode') {
                    throw new InvalidCodeError();
                } else if (errorInfo.code === 'InvalidIdentifier') {
                    throw new InvalidIdentifierError(errorInfo);
                } else if (errorInfo.code === 'OptOut') {
                    throw new TargetOptOutError();
                }
                throw new BadRequestError(errorInfo);
            } else if (response.status === 401) {
                throw new UnauthorizedError();
            } else if (response.status === 402) {
                throw new OutOfBalanceError();
            } else if (response.status === 403) {
                throw new ForbiddenError();
            } else if (response.status === 404) {
                const errorInfo = await response.json() as IErrorInfo;
                if (errorInfo.code === 'ChallengeExpired') {
                    throw new ChallengeExpiredError();
                } else if (errorInfo.code === 'ChallengeClosed') {
                    throw new ChallengeClosedError();
                } else if (errorInfo.code === 'MaxAttemptsExceeded') {
                    throw new MaxAttemptsExceededError();
                }
                throw new ChallengeNotFoundError();
            } else if (response.status === 429) {
                throw new QuotaExceededError();
            }
            throw new Error(response.statusText);
        }
        return await response.json() as Promise<T>;
    }
}

export * from "./model";
export * from "./errors/bad-request";
export * from "./errors/errors";
export * from "./errors/challenge-closed";
export * from "./errors/challenge-expired";
export * from "./errors/challenge-not-found";
export * from "./errors/forbidden";
export * from "./errors/invalid-code";
export * from "./errors/invalid-identifier";
export * from "./errors/max-attempts-exceeded";
export * from "./errors/opt-out";
export * from "./errors/out-of-balance";
export * from "./errors/quota-exceeded";
export * from "./errors/unauthorized";










