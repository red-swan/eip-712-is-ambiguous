---
title: "Ambiguity 2: User-Defined Value Types"
layout: layout.vto
---

`type X is T` creates a Solidity-level wrapper around a primitive. EIP-712 does not say
whether the wrapper name or the underlying type name is canonical in `encodeType`.

## The Struct

```javascript
type Amount is uint256;

struct Transfer {
    address to;
    Amount value;
}
```

## The Divergence

| Interpretation | encodeType |
|---|---|
| A — wrapper name | `Transfer(address to,Amount value)` |
| B — underlying type | `Transfer(address to,uint256 value)` |

Both are valid Solidity. Both produce a valid `bytes32`. They are not the same hash.

## Why It Matters

UDVTs exist only at the Solidity level. They have no ABI footprint — `Amount` and
`uint256` are indistinguishable at the ABI layer. Off-chain tools receive no information
about UDVTs; they cannot resolve `Amount` to `uint256` without the source. A compiler
emitting `"Amount"` produces a hash that no standard wallet or SDK can reproduce.

## Proposed Rule

The EIP-712 type name for a UDVT member **must** be the underlying primitive type
(e.g. `uint256`, `bytes32`).

This makes `encodeType` self-contained and verifiable by any EIP-712-compatible tool
without source access.
