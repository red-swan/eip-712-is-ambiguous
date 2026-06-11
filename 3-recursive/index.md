---
title: "Ambiguity 3: Recursive Structs"
layout: layout.vto
---

EIP-712 says to collect "referenced struct types" but never explicitly states what to do
when a struct references itself — directly or via a cycle with other structs.

## Self-Referential Structs

```javascript
struct Node {
    uint256 value;
    Node[] children;
}
```

### The Divergence

| Interpretation | encodeType |
|---|---|
| A — primary type excluded | `Node(uint256 value,Node[] children)` |
| B — primary type included in referenced set | `Node(uint256 value,Node[] children)Node(uint256 value,Node[] children)` |

Interpretation B loops forever in a naive recursive collector. If it terminates by some
cycle guard, the primary type appears twice — which no current tool parses correctly.

## Mutually Recursive Structs

```javascript
struct Left  { Right[] right; }
struct Right { Left[]  left;  }
```

### The Divergence

| | encodeType(Left) |
|---|---|
| A — primary type excluded | `Left(Right[] right)Right(Left[] left)` |
| B — naive (loops) | stack overflow / infinite string |

The spec's "collect referenced struct types" language is ambiguous about whether to
continue recursing when you encounter a type you've already seen. A cycle-unaware
implementation hangs.

## Proposed Rule

The primary type **must not** appear in its own referenced-type set, regardless of
whether it is reached directly or via a cycle. Implementations must use a visited set
to terminate recursion. The primary type appears exactly once as the leading string;
all other types in the transitive closure appear exactly once in the referenced set,
sorted lexicographically by name.
