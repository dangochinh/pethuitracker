# Design System Strategy: The Digital Nursery

## 1. Overview & Creative North Star
**Creative North Star: "The Tactile Keepsake"**

This design system moves beyond the generic "utility app" aesthetic to create a digital environment that feels like a premium, hand-crafted baby journal. We reject the cold, flat grids of standard SaaS products in favor of a **Layered Playfulness**. The experience is defined by organic shapes, intentional asymmetry, and a sense of physical weight. By using "nested depth" and soft, cloud-like containers, we transform data tracking into a joyful ritual. This is not just a tool; it is a digital sanctuary for a child’s growth.

---

## 2. Colors
Our palette is rooted in a sophisticated interpretation of pastels—avoiding "neon" tones for a more muted, editorial warmth.

*   **Primary Hierarchy:** `primary` (#a53361) and `primary_container` (#f06e9c) drive the core emotional actions.
*   **Secondary Accents:** `secondary` (#006972) and `secondary_fixed_dim` (#54d8e8) provide a calming, gender-neutral balance to the warmer pinks.
*   **The "No-Line" Rule:** Sectioning must never be achieved with 1px solid borders. Use background color shifts. For example, place a `surface_container` (#fee9ee) element against a `surface` (#fff8f8) background to define boundaries through tonal contrast alone.
*   **Surface Hierarchy & Nesting:** Treat the UI as stacked sheets of fine cardstock.
    *   **Level 0:** `surface` (The foundation)
    *   **Level 1:** `surface_container_low` (Subtle grouping)
    *   **Level 2:** `surface_container_highest` (Primary interaction cards)
*   **Signature Textures:** Use subtle linear gradients for large interactive surfaces, transitioning from `primary_container` (#f06e9c) to `primary` (#a53361) at a 135-degree angle. This adds "soul" and dimension that flat fills cannot achieve.

---

## 3. Typography
The typography system balances the whimsical nature of the brand with the high-legibility requirements of tired parents.

*   **The Expressive Duo:** We pair **Plus Jakarta Sans** for high-impact displays with **Be Vietnam Pro** for functional body text. 
*   **Display & Headline (Plus Jakarta Sans):** These levels are designed to feel celebratory. Use `display-lg` (3.5rem) for milestone numbers (e.g., "156 CM") to create a clear visual "hero" on the page.
*   **Body & Label (Be Vietnam Pro):** These are the workhorses. The slightly wider apertures of Be Vietnam Pro ensure that even at `body-sm` (0.75rem), data remains legible during 3 AM tracking sessions.
*   **Editorial Intent:** Use `headline-sm` in `primary` (#a53361) for section titles to guide the eye without the need for heavy separators.

---

## 4. Elevation & Depth
In "The Digital Nursery," depth is felt, not just seen.

*   **The Layering Principle:** Avoid traditional shadows where possible. Instead, stack a `surface_container_lowest` (#ffffff) card on top of a `surface_container` (#fee9ee) background. The natural shift in lightness creates a sophisticated "lift."
*   **Ambient Shadows:** For floating elements like Action Buttons or Profile Orbs, use an "Ambient Glow."
    *   **Formula:** `Box-shadow: 0px 20px 40px rgba(165, 51, 97, 0.08);` (Using a tinted version of the `primary` color instead of black/grey).
*   **Glassmorphism:** For overlays and navigation bars, use `surface` colors at 80% opacity with a `backdrop-blur: 12px`. This allows the playful background illustrations to bleed through, maintaining an integrated, airy feel.
*   **The "Ghost Border" Fallback:** If accessibility requires a stroke, use `outline_variant` at 20% opacity. Never use a 100% opaque border.

---

## 5. Components

### Buttons
*   **Primary:** High-pill roundedness (`full`). Gradient fill from `primary_container` to `primary`. No border.
*   **Secondary:** `surface_container_lowest` fill with a `secondary` (#006972) text label.
*   **Interactions:** On hover/tap, the component should slightly scale (1.02x) rather than just changing color, mimicking the squishy feel of a physical toy.

### Cards & Progress Trackers
*   **The "No-Divider" Rule:** Use vertical white space (Scale `8` or `10`) or subtle background shifts to separate content. 
*   **Growth Charts:** Use `secondary_fixed` (#8ff2ff) for "Normal" ranges and `primary_fixed` (#ffd9e2) for milestones. Lines should be thick (3px+) and rounded at the caps to maintain the "child-friendly" language.

### Input Fields
*   **Style:** Soft-filled containers using `surface_container_low`. 
*   **States:** On focus, the container transitions to `surface_container_highest` with a soft `secondary` ghost border.

### Profile Orb
*   A signature component. The baby's photo should be housed in a large, circular container with a `4px` thick border of `surface_container_lowest`, sitting partially outside its parent container to break the grid.

---

## 6. Do's and Don'ts

### Do
*   **Do** use asymmetrical layouts. Let an illustration peek out from the side of a card.
*   **Do** use the `xl` (3rem) roundedness for main feature cards to create a "bubble" aesthetic.
*   **Do** prioritize `primary_fixed` (#ffd9e2) for background areas to keep the app feeling warm and inviting.

### Don't
*   **Don't** use pure black (#000000) for text. Always use `on_surface` (#24191c) for a softer, premium feel.
*   **Don't** use sharp 90-degree corners. The minimum radius should be `sm` (0.5rem).
*   **Don't** use standard "Drop Shadows." If an element needs to pop, use Tonal Layering or Ambient Glows.
*   **Don't** use horizontal dividers. Let the space breathe.