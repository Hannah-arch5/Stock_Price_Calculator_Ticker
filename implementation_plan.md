# Add Draggable Splitter for UI Resize

The user requested the ability to drag the middle divider to resize the left and right panels. The minimum width for each panel should be their respective minimum widths from the initial default interface.

## User Review Required

I recall that the initially confirmed interface width was **490px** (before we made further adjustments). 
Therefore, I plan to set the `min-width` of **both** the left and right panels to **490px**. 
Since both panels need at least 490px, the window's total minimum width will be increased to `490 + 490 + divider = ~1000px`. 
- **Is 490px the exact minimum width you want for each panel?** (Or did you mean 560px / 420px?)
- **Are you okay with the overall window minimum width expanding to ~1000px to accommodate both panels side-by-side?**

## Open Questions

- Should the draggable divider be completely invisible (relying only on the mouse cursor changing to indicate it's draggable), or should it have a subtle vertical line to act as a visual hint? (I will implement a very subtle vertical line by default to match the "分割线" description, but let me know if you want it invisible).

## Proposed Changes

### 1. HTML Update (`index.html`)
- [MODIFY] `index.html`: Insert a `<div class="resizer" id="split-resizer"></div>` between `.control-panel` and `.history-panel`.

### 2. CSS Layout (`styles.css`)
- [MODIFY] `styles.css`: Change `.split-view` from `grid` to `flex`.
- [MODIFY] `styles.css`: Set `.control-panel` to `flex: 0 0 490px` and `min-width: 490px`.
- [MODIFY] `styles.css`: Set `.history-panel` to `flex: 1 1 0%` and `min-width: 490px`.
- [NEW] `styles.css`: Add styles for `.resizer` with `cursor: col-resize`, `width: 24px`, and a subtle visual vertical line in the center.

### 3. Drag Logic (`script.js`)
- [MODIFY] `script.js`: Add event listeners for `mousedown`, `mousemove`, and `mouseup` on the `.resizer` to adjust the `flex-basis` or `width` of `.control-panel` dynamically. 
- [MODIFY] `script.js`: Add `user-select: none` to the `body` during dragging to prevent text highlighting.
- [MODIFY] `script.js`: Save the user's preferred left panel width to `localStorage` so the layout persists across app restarts!

### 4. Window Size (`main.js`)
- [MODIFY] `main.js`: Update the fallback default width to `1024px` and set `minWidth: 1000` to prevent the window from being squished smaller than the combined `490px + 490px` limit.

## Verification Plan
1. Launch the app and verify the window defaults to a wider size.
2. Drag the middle divider and ensure the left panel resizes smoothly.
3. Ensure dragging is constrained by the 490px `min-width` on both sides.
4. Restart the app to ensure the custom width is remembered.
