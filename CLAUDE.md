Act as a Senior Frontend Developer. I need you to build a "Review Event Roulette Web App" for a Korean restaurant.

**Tech Stack:**
- Framework: Next.js 14+ (App Router)
- Styling: Tailwind CSS
- Animation: Framer Motion
- Icons: Lucide-react
- State Management: React useState + localStorage (for persistence)

**Design Concept:**
- Theme: "Warm & Woody" to match the restaurant's wooden tables.
- Background: Soft ivory or warm beige texture.
- Accents: Dark wood colors (#5D4037) and bright orange (#FF6B6B) for call-to-action buttons.
- Mobile-first: Must look perfect on smartphone screens (use 100dvh).

**Core Logic & Probability (Weighted Randomness):**
1. **"Canned Soda"** (80% chance) - Color: #FF6B6B (Red/Orange)
2. **"1,000 KRW Discount"** (15% chance) - Color: #4ECDC4 (Mint)
3. **"Fried Dumplings (Service)"** (5% chance) - Color: #FFD93D (Yellow)

**User Flow (State Machine):**
The app must handle 4 states: `IDLE` -> `SPINNING` -> `WON_LOCKED` -> `COUPON_ACTIVE`.

1. **IDLE**: Show the Roulette wheel and a big "Spin & Get Gift" button.
2. **SPINNING**: Animate the wheel for 3 seconds using Framer Motion.
3. **WON_LOCKED (Crucial Step)**:
   - The wheel stops at the prize.
   - Show a Modal: "Congratulation! You won [Prize Name]!"
   - **Visual**: The prize coupon looks "Locked" (slightly dimmed or has a lock icon).
   - **Action**: A primary button says "Write Naver Review to Unlock".
   - **Behavior**: Clicking this button opens `https://m.place.naver.com` (placeholder) in a new tab AND updates the state to `COUPON_ACTIVE`.
4. **COUPON_ACTIVE**:
   - When the user returns to the tab (or if the page reloads), show the "Unlocked Coupon" card.
   - Visual: Bright, pulsing animation, big checkmark.
   - Text: "Show this screen to the staff!"

**Technical Requirements:**
- **Persistence**: Save `prizeResult`, `timestamp`, and `isUnlocked` status in `localStorage`. If the user refreshes the page, they should stay in `WON_LOCKED` or `COUPON_ACTIVE` state (do not let them spin again).
- **Confetti**: Trigger a confetti effect when the state becomes `COUPON_ACTIVE`.
- **Code Structure**: Provide the full code in a single file (`page.tsx`) or minimal component structure so I can run it immediately.

Please write the complete, production-ready code.