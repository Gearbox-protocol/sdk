# Signature-gated account opening

## Implementation plan and SDK flow

1. Prepare the strategy, loan, or empty account using the existing opportunities API. For a strategy or loan that reuses a credit account, build the ordinary multicall.
2. Pass the prepared request to `sdk.opportunities.execute.buildTx(request)`. For a fresh opening, the builder checks the gate. For a signature-gated market, it reads the owner’s next nonce, calls the configured offchain signers and attaches their approval. Both onchain and combined mode use the SDK’s default signer registry. In onchain mode the builder contacts eligible signer URLs directly. Set `offchain.openingSignerRegistries` to replace it. An explicit `openingApproval` can also be passed to the builder.
3. Simulate and send the returned opening transaction from the owner wallet.

The client posts exactly `chainId`, `creditManager`, and `accountOwner` to each eligible signer. Each service independently selects the deadline. A quorum requires identical EIP-712 digests and distinct authorized signers. For thresholds above one, endpoints must coordinate deadlines to guarantee a quorum. The SDK checks response fields, recomputes the digest, recovers the signer, and orders signatures by address.

The first 503 is retried once per signer, respecting Retry-After seconds, including the screening delays of 60 and 180 seconds. Without a usable header, the wait is one second. An advertised delay above 300 seconds surfaces to the caller. Other HTTP errors surface their status, body, and Retry-After. A second 503 surfaces the signer’s error.

## Handling failures

Preparation returns an `SDKReturn`. A failed `execute.buildTx()` rejects its promise. Catch `OpeningSignerError` from `@gearbox-protocol/sdk/offchain` for HTTP refusals. `status` is the HTTP code, `details` carries the service diagnostic, and `retryAfterSeconds` carries the server’s delay. It also matches `OffchainStatusError` and `OffchainTransportError`. Network, JSON and schema failures use the standard offchain exceptions. When several signers cannot form a quorum, `OpeningSignerQuorumError.errors` contains the individual failures.

## Testnet

The default registry currently contains the development signer at `https://signer.gear-dev.dev/sign`. This service supports the signer-degen-nft fork, which reports chain ID 1.
