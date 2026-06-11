---
title: "Ambiguity 4: Import Aliases"
layout: layout.vto
---

`import {S as T} from "A.sol"` introduces `T` as a local alias for a struct whose
declaration name is `S`. EIP-712 says types are identified by name — but it does not
say whether the alias or the declaration name is canonical.

## The Setup

```javascript
// A.sol
struct S { uint256 x; }

// B.sol
import {S as T} from "./A.sol";

struct B {
    S t;      // declared as type S, but referenced in B.sol as T
    uint256 y;
}
```

## The Divergence

| Interpretation | encodeType(B) |
|---|---|
| A — alias name | `B(T t,uint256 y)T(uint256 x)` |
| B — declaration name | `B(S t,uint256 y)S(uint256 x)` |

Two contracts importing the same struct under different aliases compute different
typehashes for logically identical types.

## Why It Matters

The alias is a property of the import site, not of the struct. Contract A and contract B
may both import the same struct, each under a different local name. If aliases are used,
a signer using one import and a verifier using another compute different hashes for the
same data — with no error on either side.

## Proposed Rule

The EIP-712 type name for any struct **must** be the struct's declaration name — the
identifier in the `struct` keyword's definition — regardless of what alias is used at
the import site.
