# Cinematic Rakshabandhan Experience — Design Notes

## Three stylistic approaches

### Theme Name: Midnight Screening
**Very Brief Intro:** A low-key, art-house film experience built from black frames, indigo shadows, and a single thread of warm gold. The interface stays nearly invisible so the story feels discovered rather than browsed.
**Probability:** 0.07

### Theme Name: Paper & Monsoon
**Very Brief Intro:** A tactile memory-box aesthetic pairing monsoon blue with handmade paper, red thread, and imperfect ink. The experience feels intimate, analog, and quietly nostalgic.
**Probability:** 0.04

### Theme Name: Golden Hour Cut
**Very Brief Intro:** A warm, late-evening visual language with faded amber, soft plum, and film stills that feel like a family movie. It leans more radiant and celebratory while keeping the pacing cinematic.
**Probability:** 0.09

## Chosen approach: Midnight Screening

### Design Movement
Contemporary Indian art-house cinema meets title-sequence minimalism: a restrained, widescreen visual system that uses darkness, editorial typography, and measured reveals to make every line feel like a frame from a film.

### Core Principles
1. **Reveal, do not announce.** The interface begins nearly empty and lets meaning surface in paced, short lines.
2. **Darkness is material.** Black, midnight blue, and muted plum create depth; light only appears to point attention.
3. **Warmth is earned.** Marigold-gold and a small amount of rani pink arrive later, at the letter and Rakhi moments, so the emotional arc has a visible temperature shift.
4. **Motion should feel camera-led.** Use cross-dissolves, focus shifts, slow push-ins, and parallax rather than decorative UI animation.

### Color Philosophy
The palette starts at the edge of black (#07070B), where the viewer's eyes adjust as if entering a theater. Midnight indigo (#121428) and bruised plum (#24192B) give the shadows a subtle chromatic life without becoming a generic gradient. Muted marigold (#D9A85A) is the signature brand color: it behaves like a single practical light in a dark room, reserved for progress, thread, paper edges, and the final emotional lift. Dusty rose (#C47A86) is used sparingly as a human pulse rather than a Valentine's motif.

### Layout Paradigm
A full-bleed, one-scene-at-a-time stage replaces normal page sections. Most copy sits on an editorial left axis or slightly off-center rather than in a permanently centered stack. A slim scene rail and chapter counter act as the only navigation cues. The camera stage can drift horizontally, with content arriving from negative space and then receding into black.

### Signature Elements
- **The aperture line:** a thin marigold rule that stretches, breaks, or fades like a film edit point.
- **The frame counter:** small uppercase metadata such as `01 / 11` and `A STORY BETWEEN US`, echoing a call sheet or reel marker.
- **The glowing thread:** a fine animated line that arcs through the letter and Rakhi scenes, acting as a visual metaphor for connection.

### Interaction Philosophy
The viewer should feel like they are choosing when to keep watching, not operating a dashboard. A single `CONTINUE` action advances the story; tapping the stage also works on mobile. A subtle sound toggle stays available but never competes with the narrative. Swipe gestures move forward, while the restart action only appears after the final credits. Hover states are quiet shifts in tracking, glow, or camera position.

### Animation
Scene transitions use a 900–1400ms range for major beats: black-frame cuts for mystery, cross-dissolves for memories, blur-to-sharp for personal lines, and a restrained horizontal wipe for the letter. Individual text reveals use opacity plus 8–18px vertical travel, with staggered lines at 70–110ms. Backgrounds drift at a slower scale than foreground content to imply a camera push-in. Particles are sparse, low-contrast, and paused during the silence scene. The letter opens with a hinged flap and paper depth, while the Rakhi makes a slow 3D float and the connecting thread eases in with a natural arc. All non-essential motion is gated behind `prefers-reduced-motion: no-preference`.

### Typography System
- **Display serif:** `Cormorant Garamond`, with 400/500 weights, italic used only for the most intimate line. Large statements use tight leading and generous tracking.
- **Supporting sans:** `DM Sans`, with 400/500/600 weights for metadata, controls, captions, and long-form readability.
- **Letter script:** `Caveat`, used only inside the editable letter so it reads as a personal note, never as a brand default.
- **Hierarchy:** metadata at 10–11px with 0.24em tracking; scene labels at 12px; body copy 16–20px; cinematic statements clamp from 40px to 92px; the final reveal uses the largest type and the widest breathing room.

### Brand Essence
**A one-sitting cinematic story for the sister life gave you, made for the moment friendship quietly became family.** Personality: **intimate, observant, quietly playful**.

### Brand Voice
Headlines are short, unhurried, and emotionally specific. CTAs are invitations, never commands. Microcopy feels like a director's note: sparse, human, and occasionally self-aware.

Example lines:
- **Headline:** `Some people arrive as a coincidence. Then they stay like a promise.`
- **CTA:** `Keep watching` / `Let the next memory in`

### Wordmark & Logo
The mark is a minimal circular aperture interrupted by one off-center thread stroke, suggesting both a film reel and a Rakhi knot. It is a bold graphic symbol with no text, drawn in muted marigold on transparent ground and used at a clearly visible size in the opening and end-credit scenes.

### Signature Brand Color
**Muted Marigold — #D9A85A.** It is ownable because it is neither festival-bright nor luxury-gold; it is the color of a warm practical light that appears only when the story has earned it.

## Content architecture

All editable narrative content lives in `client/src/lib/content.ts`. The animation engine only reads scene data, so the sister's name, sender name, letter, memories, final message, and credits can be changed without touching scene logic.

## Implementation notes

- Use a one-screen cinematic stage with keyboard, tap, click, and swipe progression.
- Provide a first-frame `Enter story` gate to respect browser audio policies; the ambient audio layer is intentionally optional and silent by default.
- Include a clearly labeled `Edit your story` hint in the final credits, pointing at the content file for future customization without exposing normal website navigation.
- Use generated hero artwork for the letter/paper atmosphere, Rakhi reveal, and abstract memory texture; keep text in HTML for crisp, editable typography.
