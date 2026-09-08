# FlowBots.ai — ledger

Design direction ledger. Asymmetric split hero, warm grey shell, editorial hairline rules, oversized Archivo display. Problem-first section order.

**Review link:** https://justineriv.github.io/flowbots-ledger/

## Palette
| Role | Hex | Measured |
|---|---|---|
| Ground | `#FFFFFF` | — |
| Text / dark grounds | `#0A1628` | 18.13:1 on white |
| Accent | `#2E96B7` | 3.41:1 on white (large text and UI only) |
| CTA fill / links | `#267B96` | 4.82:1 both ways |
| Text on tinted pills | `#22708A` | 4.85–5.60:1 |

`#38BADF` (the logo's own cyan) measures 2.27:1 on white and appears only
inside the logo artwork. It never carries text.

## Verified
Zero contrast failures, zero horizontal overflow, zero undersized tap targets,
zero clipped button captions, zero empty boxes, zero heading skips, zero
missing alt, zero unresolved anchors — measured at 320 / 390 / 768 / 1024 / 1440.

## Not wired
- The lead form has no endpoint. It validates, then says plainly that nothing
  was sent and gives the phone number and booking link.
- No analytics tag is installed. The page pushes named CTA events to
  `window.dataLayer`, but nothing consumes them yet. A GTM container snippet
  (or `gtag.js`) has to be added to the page and configured before any of it
  reaches GA4. The events are ready to be picked up; they are not reporting.

Design preview. Not for public indexing.
