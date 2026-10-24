---
doc: scope
status: draft
---

# SCOPE — Shared Scope Negotiation

## The Unique Kernel

A small scope change is not only a new price. It is a three-way tradeoff among **work, price, and time** that both parties should be able to inspect and negotiate before they agree.

## Who It's For

Independent studios, freelance service providers, and clients who need to discuss requests that arise after an initial project scope has been agreed.

## The Problem

A client says “could we also add this?” and the true cost of that change becomes hard to discuss. Requests are scattered across conversations, and the implications for budget and delivery can be unclear.

## The Core Loop

A Studio user describes extra work, sees an estimated fee and schedule impact, and publishes a change proposal. The Client opens a review view, inspects the same tradeoffs, then accepts, declines, or adjusts the terms and sends a counterproposal. Studio can review that counterproposal and publish a revision.

## What “Working” Means

In a desktop browser, one participant publishes a proposal in a Studio tab; another tab in **the same browser origin** opens the Client link; the client changes an option and sends it; Studio reloads the updated state; the client can see the revised offer or respond to the proposal. This is the verified interaction target of this hosted proof of concept, not a claim of real cross-device sharing.

## Proof-of-Concept Boundary

### Must have

- One coherent English-only Studio and Client journey.
- Clear baseline and incremental work, price, and delivery views.
- Interactive controls for shaping an offer and client response.
- A visible publish / counter / accept-or-decline sequence using browser-local state.
- Honest indication that GitHub Pages does not provide the original backend.

### Later

- Proper cloud-hosted service, persistent database, and independent access from different devices.
- Identity, authentication, role authorization, and signed audit history.
- Workflow integration and production-ready agreement generation.

### Out of scope

Payments, legally binding signatures, arbitrary CRM integrations, and a guarantee that browser-only sessions synchronize across devices.

## Inspiration and Identity

Fashion-editorial rather than generic SaaS: dark Studio experience, soft Client experience, restrained pink emphasis, dramatic but legible typography, large editable tradeoff values. Existing V0.9 visual choices are the accepted implementation baseline.

## Provenance and limits

SCOPE's public-browser adaptation was built during October 2026 from a user-provided V0.9 archive. These planning notes document the current product and its known limits after the prototype was accepted; they are **not a claim that the original code was planned or built by following every Devpost Learn skill in sequence**.
