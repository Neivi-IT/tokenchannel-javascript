## [<img src="https://tokenchannel.io/img/logo-color-350.png" alt="TokenChannel" width="30"/>](https://tokenchannel.io/) TokenChannel.io Official Javascript/Typescript library

[![license](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0) <img alt="npm type definitions" src="https://img.shields.io/npm/types/typescript"> [![npm version](https://badge.fury.io/js/tokenchannel.svg)](https://badge.fury.io/js/tokenchannel)

This is the official Javascript/Typescript Library for [TokenChannel.io](https://tokenchannel.io).

### Library Usage

Remember that in order to start using TokenChannel.io API, you will need to register an account at https://tokenchannel.io and get an API KEY.

### Installation
```bash
npm install tokenchannel
```

### Usage Example

#### Challenge Creation: 

```typescript
const apiKey = 'TCk-EjyljGEI032PiREvOJiN9g9RjPYUDWZWxhXE';
const client = new Tokenchannel(apiKey); // new Tokenchannel(apiKey, true) whether test mode is enabled for every challenge
try {
    const channel = Channel.SMS;
    const identifier = '+14155552671'; // E164

    const {requestId} = await client.challenge(channel, identifier);
    console.log("RequestId: ", requestId);
} catch (error) {
  if (error instanceof TargetOptOutError) {
        // handleCustomerOptOut()
  } else if(error instanceof  InvalidIdentifierError) {
        // handleInvalidIdentifier()  
  } else if(error instanceof  OutOfBalanceError) {
        // handleOutOfBalanceError()
  } else {
        // handleError() 
  }
}
```

#### Challenge Authentication
```typescript
let authCode = '123456';
try {
    const {channel, identifier} = await client.authenticate(requestId,  authCode);
    console.log(`Challenge successfully passed: ${identifier} in ${channel}`);
} catch (error) {
    if (error instanceof InvalidCodeError || error instanceof BadRequestError) {
        console.log("Invalid code");
    } else if (error instanceof ChallengeExpiredError || error instanceof ChallengeClosedError 
                || error instanceof ChallengeNotFoundError || error instanceof MaxAttemptsExceededError) {
        console.log("Create a new challenge");
    } else {
        // Handle Unexpected
        console.log("Error: ", error.message);
    }
}
```

#### Execute Example
```bash
node dist/example/example.js challenge PUSHOVER <userId>
```
