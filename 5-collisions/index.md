---
title: "Ambiguity 5: Name Collisions"
layout: layout.vto
---

Two structurally distinct structs from different scopes may share the same declaration
name. EIP-712's referenced-type grammar is keyed by name. The spec is completely silent
on this case.

## The Setup

```javascript
// A.sol
struct S { uint256 x; }

// B.sol
struct S { address addr; uint256 y; }

struct Root { A.S a; B.S b; }
```

Both `S` definitions are reachable from `Root`. What goes in `encodeType(Root)`?

## The Correct Encoding

Both structs must be included, sorted by their full `typeString`. Since both start with
`"S("`, the first diverging character determines order — `"address"` sorts before
`"uint256"`:

```
Root(S a,S b)S(address addr,uint256 y)S(uint256 x)
```

This is internally consistent and deterministic. But no existing tool can represent it.

## Why Existing Tooling Breaks

ethers.js, viem, and MetaMask represent EIP-712 types as a plain object keyed by type
name. A plain object cannot hold two entries for the same key — the second silently
overwrites the first.

Run `node demo.js` in the `ambiguity5/` directory to see this live:

```text
=== Types object as ethers sees it (A.S was silently dropped) ===
{
  "Root": [ { "name": "a", "type": "S" }, { "name": "b", "type": "S" } ],
  "S": [ { "name": "addr", "type": "address" }, { "name": "y", "type": "uint256" } ]
}

=== encodeType('Root') as computed by ethers ===
Root(S a,S b)S(address addr,uint256 y)

=== Correct encodeType ===
Root(S a,S b)S(address addr,uint256 y)S(uint256 x)

match: false
```

ethers silently dropped `A.S` and computed a hash over an incomplete type tree. A signer
and a verifier using different libraries may each silently pick a different `S` and
compute different hashes for the same data — with no error on either side.

## Proposed Rule

Both structs **must** be included in the referenced-type set, sorted by their full
`typeString`. This makes the collision explicit in the encoded string rather than
silently resolving it. It also surfaces the fact that existing tooling cannot represent
this case — which is the correct outcome, forcing developers and tooling authors to
confront the gap.
