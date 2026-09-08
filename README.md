# FlowBots.ai — ledger

White base with hard navy bands and light-grey rests, after the Groks reference. Ground cycles white / navy / grey.

**Review link:** https://justineriv.github.io/flowbots-ledger/

## Type
DM Sans headings, Outfit body — the pairing FlowBots.ai itself declares
(`--font-heading: 'DM Sans'`, `--font-body: 'Outfit'`). No other typefaces.

## Palette
| Role | Hex |
|---|---|
| Accent | `#2E96B7` |
| Deep ground / ink | `#0A1628` |
| CTA fill / links on light | `#267B96` / `#22708A` |
| Accent on dark grounds | `#38BADF` |
| White | `#FFFFFF` |

## Verified
- **Band rhythm:** 15 bands, 3 distinct grounds, **zero runs of three identical grounds.**
  The tone is assigned in one `SEQUENCE` list and the builder asserts no two
  adjacent bands match before it will write a file.
- **Contrast:** every text/ground pairing clears 4.5:1.
- **Footer links:** 23 destinations, each read from the live site's own markup
  and checked for a 200. None guessed, none `href="#"`.
- **Logo:** white mark on dark grounds, dark mark on light. Checked per design.

## Not verified
Layout was **not** checked in a browser — the preview pane was unresponsive.
Colour, rhythm, links and type were verified statically from the built files;
element overlap and responsive behaviour were not.

## Not wired
- The lead form has no endpoint. It validates, then says plainly that nothing
  was sent and gives the phone number and booking link.
- No analytics tag is installed. The page pushes named CTA events to
  `window.dataLayer`, but nothing consumes them yet: a GTM container snippet
  (or `gtag.js`) has to be added and configured before any of it reaches GA4.

Design preview. Not for public indexing.
