---
title: EIP-712 Is Ambiguous
layout: layout.vto
---

EIP-712 defines `encodeType` for Solidity structs but is silent on several type
categories present in modern Solidity. Different implementations make different
choices — silently, with no error on either side — producing different hashes for
the same struct.

This site documents each ambiguity, shows the diverging interpretations, and
proposes an unambiguous rule for each. These proposals are being submitted as
a clarifying EIP.

<div class="ambiguity-list">
  <a class="ambiguity-card" href="/1-enums/">
    <div class="number">Ambiguity 1</div>
    <div class="title">Enums</div>
    <p class="desc">Does <code>Status</code> encode as <code>"Status"</code> or <code>"uint8"</code>?</p>
  </a>
  <a class="ambiguity-card" href="/2-udvt/">
    <div class="number">Ambiguity 2</div>
    <div class="title">User-Defined Value Types</div>
    <p class="desc">Does <code>Amount</code> encode as <code>"Amount"</code> or <code>"uint256"</code>?</p>
  </a>
  <a class="ambiguity-card" href="/3-recursive/">
    <div class="number">Ambiguity 3</div>
    <div class="title">Recursive Structs</div>
    <p class="desc">Does the primary type appear in its own referenced-type set?</p>
  </a>
  <a class="ambiguity-card" href="/4-aliases/">
    <div class="number">Ambiguity 4</div>
    <div class="title">Import Aliases</div>
    <p class="desc">Does <code>import {S as T}</code> encode as <code>"T"</code> or <code>"S"</code>?</p>
  </a>
  <a class="ambiguity-card" href="/5-collisions/">
    <div class="number">Ambiguity 5</div>
    <div class="title">Name Collisions</div>
    <p class="desc">Two distinct structs named <code>S</code> — existing tooling silently drops one.</p>
  </a>
</div>
