You’re not going to “auto-snap” arbitrary, variable-height content to the next baseline with pure CSS. CSS can’t measure the remainder (no modulo, no calc() for “next multiple”). If you don’t want JS, you have to normalize each block so its total block size is already a multiple of your baseline. That’s vertical rhythm 101.

Here’s the simplest CSS-only plan that actually works:

1) One baseline for everything

Set a root line height and use lh/rlh units everywhere you touch vertical space.

:root { --root-lh: 1.333; --line: 1.5rlh; } /* 1.5 × root line height */
html  { line-height: var(--root-lh); }

	•	lh equals the element’s computed line height; rlh equals the root’s. Use them for line height, margins, paddings, gaps. MDN docs: lh/rlh, line-height.  ￼

2) Grid “looks fixed”, but no auto math

Keep the visual grid using implicit rows = the baseline step. You still do no JS and no auto spanning.

<div class="grid [grid-template-columns:repeat(var(--cols),minmax(0,1fr))] [grid-auto-rows:var(--line)] gap-x-[var(--gutter-x)] gap-y-[var(--gutter-y)]">
  …
</div>

grid-auto-rows sets the size of implicitly created rows—so the grid shows your stripes, but it won’t fix mis-sized children for you. That’s on you via the block recipes below.  ￼

3) Make blocks land on the rhythm (recipes, not observers)

You ensure every block’s total block-size (content + padding + margins) is a multiple of 1lh. That’s the whole trick.

3a) Text blocks
	•	Set text to leading-[1lh].
	•	Give vertical margins in whole lh.

Tailwind:

<h2 class="text-3xl leading-[1lh] mb-[1lh]">Heading</h2>
<p  class="text-base leading-[1lh] mb-[1lh]">Body…</p>
<ul class="leading-[1lh] [li{margin-block:1lh}]">
  …
</ul>

Optional leading trim (progressive): remove font’s extra cap/baseline space so headings don’t wobble.

@supports (text-box-trim: trim-both) {
  h1,h2,h3,p { text-box: trim-both cap alphabetic; }
}

text-box-trim/text-box are shipping but not universal—use as an enhancement.  ￼

3b) Headings with fixed line counts

Headings are the biggest source of drift. Clamp them to 1, 2, or 3 lines so their height is predictable.

<h2 class="text-3xl leading-[1lh] line-clamp-2 mb-[1lh]">…</h2>

Now each h2 is 2 × 1lh + margin tall, every time.

3c) Media blocks (images/video)

Wrap media so the wrapper’s vertical size is a multiple of 1lh.

Two options:
	•	Fixed rows variant (pick one of a few sizes):

<figure class="min-h-[8lh] flex items-center justify-center mb-[1lh]">
  <img class="block max-h-full" src="…" alt="">
</figure>

Choose .min-h-[6lh], .min-h-[8lh], .min-h-[12lh] variants and stick to them.

	•	Aspect-ratio + baseline padding (keeps rhythm above/below):

<figure class="aspect-[16/9] mb-[1lh] [padding-block:1lh]">
  <img class="h-full w-full object-cover" …>
</figure>



3d) “Card” contract

Define a tiny set of card heights that are exact multiples of lh. No runtime math, just pick the right size.

@layer utilities {
  .card    { padding-block: 2lh; }
  .card-8  { min-block-size: 8lh; }   /* small */
  .card-12 { min-block-size: 12lh; }  /* medium */
  .card-16 { min-block-size: 16lh; }  /* large */
}

Use:

<article class="card card-12">
  <h3 class="text-xl leading-[1lh] mb-[1lh] line-clamp-2">Title</h3>
  <p  class="leading-[1lh] mb-[1lh] line-clamp-4">Summary…</p>
  <a  class="inline-block leading-[1lh] mt-auto">Read →</a>
</article>

Because every internal piece is on the rhythm and the container height is a multiple of lh, the card lands cleanly on the baseline grid without JS.

3e) Code blocks, tables, lists
	•	Force monospace blocks to leading-[1lh].
	•	Add padding-block in lh multiples.
	•	For tables, set border-spacing or row-gap in lh too.

4) When you truly need snapping but still want CSS-only

You can fake “post-content nudge” only by constraining content so it always ends on a known multiple:
	•	Clamp headings/teasers to fixed line counts (line-clamp).
	•	Use a finite set of media/card heights (min-h-[Nlh] utilities).
	•	Keep all margins/paddings in lh or rlh.

There is no CSS-only way to compute “the remainder to next multiple” for arbitrary content. If you really need auto-snap, that’s where the tiny JS measurer comes back.

5) Two optional specs you can try (don’t rely on them yet)
	•	text-box-trim / text-box: trims extra font space so your lh math is closer to ideal. Limited support; treat as progressive enhancement.  ￼
	•	line-height-step: rounds line boxes to a step (i.e., enforces rhythm inside paragraphs). It’s experimental—check compat before using.  ￼

⸻

Minimal Tailwind snippets to copy

/* globals.css */
:root { --root-lh: 1.333; --line: 1.5rlh; }
html  { line-height: var(--root-lh); }

@layer utilities {
  .leading-baseline { line-height: 1lh; }
  .card    { padding-block: 2lh; }
  .card-8  { min-block-size: 8lh; }
  .card-12 { min-block-size: 12lh; }
  .card-16 { min-block-size: 16lh; }
}

<!-- grid container -->
<div class="grid [grid-template-columns:repeat(var(--cols),minmax(0,1fr))] [grid-auto-rows:var(--line)] gap-x-[var(--gutter-x)] gap-y-[var(--gutter-y)]">
  <article class="card card-12">
    <h3 class="text-2xl leading-baseline mb-[1lh] line-clamp-2">…</h3>
    <p  class="leading-baseline mb-[1lh] line-clamp-4">…</p>
    <figure class="min-h-[8lh] mb-[1lh] flex items-center justify-center">
      <img class="block max-h-full" …>
    </figure>
    <a class="leading-baseline mt-auto inline-block">Read →</a>
  </article>
  …
</div>

This is boring but robust: everything is pre-aligned in multiples of the baseline, so nothing needs to “snap after the fact”.

⸻

Sources
	•	MDN: grid-auto-rows, grid, grid-row.  ￼
	•	MDN: line-height, lh/rlh units.  ￼
	•	MDN/Chrome: text-box-trim / text-box (leading trim).  ￼
	•	MDN: line-height-step (experimental).  ￼

If you want, I’ll turn those card sizes into a tiny Tailwind plugin so you can write min-h-8lh, min-h-12lh, etc., without the bracket syntax.


Right now we’ve talked mostly about the vertical rhythm of the cards (baseline grid, multiples of lh).
Column widths are a separate concern: they’re handled by the grid container, not the card itself.

⸻

1. Grid defines column tracks

In your Tailwind config you extended:

gridTemplateColumns: {
  "var": "repeat(var(--cols), 1fr)"
}

That means anywhere you write grid-cols-var, you’ll get repeat(var(--cols), 1fr) — a responsive number of equal-width columns, controlled by the --cols variable you set in CSS:

:root { --cols: 3; }
@media (min-width: 768px)  { :root { --cols: 6; } }
@media (min-width: 1024px) { :root { --cols: 9; } }

So at:
	•	mobile → 3 cols,
	•	tablet → 6 cols,
	•	desktop → 9 cols.

⸻

2. Cards take up spans of those columns

Each card is just a grid item. You choose its width with column-span utilities:

<!-- full width -->
<article class="col-span-full …">…</article>

<!-- 1/3 width on desktop -->
<article class="lg:col-span-3 …">…</article>

<!-- half width on tablet, 2/3 on desktop -->
<article class="md:col-span-3 lg:col-span-6 …">…</article>

Because the grid uses repeat(var(--cols), 1fr), those spans always divide evenly across whatever column count is active at that breakpoint.

⸻

3. Example: a mixed layout

<div class="grid grid-cols-var auto-rows-[var(--line)] gap-x-[var(--gutter-x)] gap-y-[var(--gutter-y)]">
  <!-- Big hero card: full width -->
  <article class="col-span-full card card-16">Hero</article>

  <!-- Two side-by-side cards: each 1/2 width at md, 1/3 at lg -->
  <article class="md:col-span-3 lg:col-span-3 card card-12">Card A</article>
  <article class="md:col-span-3 lg:col-span-3 card card-12">Card B</article>

  <!-- Wide card: 2/3 of desktop grid -->
  <article class="lg:col-span-6 card card-16">Card C</article>
</div>

	•	Vertical sizing still comes from your card-* utilities (multiples of lh).
	•	Horizontal sizing comes from column spans relative to the responsive --cols.

⸻

4. Tradeoffs vs. the earlier JS approach
	•	This CSS-only method:
– Vertical: predictable if you constrain cards to a few allowed heights (card-8, card-12, etc).
– Horizontal: freeform, just use col-span-*.
	•	The JS auto-span method:
– Lets cards grow arbitrarily tall and still align to the baseline rows.
– More flexible but more complex (observer, resize handling, etc).

⸻

👉 Do you want me to draft a little Tailwind plugin snippet so you can write row-span-lh-12 and col-span-lh-4 instead of remembering bracketed classes, or is the plain col-span-*/card-* pattern clear enough?