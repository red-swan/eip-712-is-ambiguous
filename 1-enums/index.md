---
title: "Ambiguity 1: Enums"
layout: layout.vto
---

Solidity enums ABI-encode as `uint8`. EIP-712 says to use the Solidity type name in
`encodeType` — but it never specifies what name to use for an enum.

## The Struct

```javascript
enum Status { Pending, Active, Closed }

struct Order {
    address buyer;
    Status status;
}
```

## The Divergence

| Interpretation | encodeType |
|---|---|
| A — Solidity name | `Order(address buyer,Status status)` |
| B — ABI type | `Order(address buyer,uint8 status)` |

Both are reasonable readings of the spec. Both produce a valid `bytes32`. They are not
the same hash.

## Why It Matters

Off-chain tools — ethers.js, viem, MetaMask — build the `encodeType` string from the
`types` object you pass them. That object uses concrete ABI types. None of these tools
know what `Status` means. If a Solidity compiler emits `"Status"` and an off-chain
signer emits `"uint8"`, signature verification silently fails.

## Proposed Rule

The EIP-712 type name for an enum member **must** be `uint8`.

Enums are restricted to at most 256 members and ABI-encode identically to `uint8`.
Using `uint8` matches the ABI, requires no type registry, and is already what every
correct off-chain integration does today.
