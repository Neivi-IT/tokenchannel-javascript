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
import {BadRequestError} from "../errors/bad-request";
import {ChallengeClosedError} from "../errors/challenge-closed";
import {ChallengeExpiredError} from "../errors/challenge-expired";
import {ChallengeNotFoundError} from "../errors/challenge-not-found";
import {InvalidCodeError} from "../errors/invalid-code";
import {OutOfBalanceError} from "../errors/out-of-balance";
import {QuotaExceededError} from "../errors/quota-exceeded";
import {Tokenchannel} from "../index";
import {Channel, Charset, IChallengeOptions} from "../model";


async function main() {

    const apiKey = 'TCk-4is10QjmZMjdwVVfhAUCTzscMBZZlM55nfr8';
    const client = new Tokenchannel(apiKey, true);

    // console.log("Supported Countries: ", await client.getSupportedCountries());
    // console.log("Supported Languages: ", await client.getSupportedLanguages());
    // console.log("SMS Prices: ", await client.getSMSPrices());
    // console.log("Voice Call prices: ", await client.getVoicePrices());

    const myArgs = process.argv.slice(2);

    switch (myArgs[0]) {
        case 'challenge':
            try {
                if (!Object.keys(Channel).includes(myArgs[1])) {
                    console.log('Usage: node dist/example/example.js challenge CHANNEL IDENTIFIER');
                    return;
                }

                const channel: Channel = Channel[myArgs[1]];
                const identifier = myArgs[2];
                const options: IChallengeOptions = {
                    "charset": Charset.DEC,
                    "codeLength": 4,
                    "language": "en"
                };

                const {requestId} = await client.challenge(channel, identifier, options);
                if (client.testMode) {
                    console.log(await client.getValidationCodeByTestChallengeId(requestId));
                } else {
                    console.log("Request ID: ", requestId);
                }
            } catch (error) {
                if (error instanceof BadRequestError) {
                    const e = error as BadRequestError;
                    console.log("Bad request: ", JSON.stringify(e.errorInfo));
                } else if (error instanceof OutOfBalanceError) {
                    console.log("Show me the money!");
                }
                console.log("Error: ", error.message);
            }
            break;
        case 'authenticate':
            try {
                const {channel, identifier} = await client.authenticate(myArgs[1], myArgs[2]);
                console.log(`Challenge succeed: ${identifier} in ${channel}`);
            } catch (error) {
                if (error instanceof InvalidCodeError) {
                    console.log("Invalid code");
                } else if (error instanceof BadRequestError) {
                    const e = error as BadRequestError;
                    console.log(JSON.stringify(e.errorInfo));
                } else if (error instanceof QuotaExceededError) {
                    console.log("Two many attemots. Start again ... ");
                } else if (error instanceof ChallengeExpiredError || error instanceof ChallengeClosedError || error instanceof ChallengeNotFoundError) {
                    // Needs to create a new challenge
                    console.log("Create a new challenge");
                } else {
                    // Handle Unexpected
                    console.log("Error: ", error.message);
                }
            }
            break;
        default:
            console.log('Sorry but I dont know what to do');
    }
}

main().then(() => 0).catch(() => 1);
