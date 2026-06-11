---
title: EIP-712 Is Ambiguous
layout: layout.vto
---

# EIP-712 Is Ambiguous

<p class="lead">EIP-712's <code>encodeType</code> grammar covers only atomic Solidity types. Five categories of modern Solidity are unspecified — different implementations make different choices silently, producing different hashes for the same struct with no error on either side.</p>

## Enums are ambiguous

```javascript
enum Status { Pending, Active, Closed }

struct Order {
    address buyer;
    Status status;
}

// Should we use the type name here?   
"Order(address buyer,Status status)"

// Or the ABI type instead?  
"Order(address buyer,uint8 status)"

```




## User-Defined Value Types are ambiguous

```javascript
type Amount is uint256;

struct Transfer {
    address to;
    Amount value;
}

// Should we use the wrapper name?
"Transfer(address to,Amount value)"

// Or the underlying type name?
"Transfer(address to,uint256 value)"

```


## Mutually recursive structs are ambiguous

```javascript

struct Left  { Right[] right; }
struct Right { Left[] left; }

// EIP-712 doesn't address cycles — a naive collector loops forever
"Left(Right[] right)Right(Left[] left)Left(Right[] right)Right(Left[] left)Left(Right[] right)Right(Left[] left)..."

```


## Import Aliases are ambiguous

```javascript
// A.sol
struct S { uint256 x; }

// B.sol
import {S as T} from "./A.sol";
struct B { S t; uint256 y; }

// Do we use the alias?
"B(T t,uint256 y)T(uint256 x)"

// Or the declared name?
"B(S t,uint256 y)S(uint256 x)"
```

## Name Collisions are ambiguous

```javascript
// A.sol — struct S { uint256 x; }
// B.sol — struct S { address addr; uint256 y; }

struct Root { A.S a; B.S b; }

// EIP-712 states that the correct encoding includes both `S` 
// definitions, sorted by name

// So, how do we break ties when they have the same name?
// sort by struct size?
"Root(S a,S b)S(uint256 x)S(address addr,uint256 y)"

// alphabetically?
"Root(S a,S b)S(address addr,uint256 y)S(uint256 x)"
```

Compounding this problem, existing tooling (ethers.js, viem, MetaMask) uses a `types` object keyed by name. A JS object cannot hold two `"S"` entries — one is silently dropped, producing a hash over an incomplete type tree with no warning.

Womp. Womp.

# So what's the solution? {#solutions}

## Enums

```javascript
// just use uint8  
"Order(address buyer,uint8 status)"
```

## User-Defined Value Types can be unambiguous

```javascript
// just use the underlying type name
"Transfer(address to,uint256 value)"
```

## Mutually Recursive Structs 

```javascript
// amend EIP-712 to simply exclude types already seen
"Left(Right[] right)Right(Left[] left)
```


## Import aliases can be unambiguous

The EIP-712 type name **must** be the struct's declaration name — the identifier in the `struct` keyword's definition — regardless of any alias at the import site. The alias is a scoping convenience with no ABI-level significance.

```javascript
// just use the declaration name
"B(S t,uint256 y)S(uint256 x)"
```

## Name collisions can be unambiguous

```javascript
// just sort alphabetically
"Root(S a,S b)S(address addr,uint256 y)S(uint256 x)"
```

# And why do we need to make EIP-712 unambiguous?

```javascript
// to allow Solidity to do all the typehashes for you
type(YourType).typehash
```
