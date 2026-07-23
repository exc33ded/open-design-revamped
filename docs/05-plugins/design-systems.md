# Design Systems

Design systems are the visual vocabulary layer. They define colors, typography, spacing, shadows, and animation guidelines that the agent uses to produce consistently styled output. 143 design systems ship bundled in `plugins/_official/design-systems/`.

---

## What a Design System Contains

Each design system is a folder with two files:

```text
apple/
  DESIGN.md             # Design tokens and visual rules
  open-design.json      # OD sidecar with metadata
```

**`DESIGN.md`** contains the full design token definition — palette, type scale, spacing scale, border radius, shadows, motion. This file gets injected in its entirety into the agent's system prompt.

**`open-design.json`** provides metadata — name, description, tags, compatible modes — so the UI can display and filter design systems.

---

## How Design Systems Load

1. At daemon startup, the design system registry walks `plugins/_official/design-systems/`
2. Each directory with valid `DESIGN.md` + `open-design.json` gets registered
3. When a user selects a design system in the web UI, its `DESIGN.md` is loaded
4. The daemon injects the full `DESIGN.md` into the agent's system prompt as Layer 3
5. The agent uses the tokens (colors, spacing, type scale) when building artifacts

---

## Design System Categories

### Brand Systems

Real-world brand design languages. The agent reproduces the visual vocabulary of each:

| Design System | Source Brand |
|---------------|-------------|
| `apple` | Apple design language |
| `stripe` | Stripe design language |
| `linear-app` | Linear design language |
| `notion` | Notion design language |
| `figma` | Figma design language |
| `vercel` | Vercel design language |
| `github` | GitHub design language |
| `openai` | OpenAI design language |
| `claude` | Claude/Anthropic design language |
| `airbnb` | Airbnb design language |
| `shopify` | Shopify design language |
| `spotify` | Spotify design language |
| `uber` | Uber design language |
| `discord` | Discord design language |
| `duolingo` | Duolingo design language |
| `canva` | Canva design language |
| `intercom` | Intercom design language |
| `supabase` | Supabase design language |
| `sentry` | Sentry design language |
| `perplexity` | Perplexity design language |
| `revolut` | Revolut design language |
| `wise` | Wise design language |
| `starbucks` | Starbucks design language |
| `spacex` | SpaceX design language |
| `tesla` | Tesla design language |
| `nike` | Nike design language |
| `playstation` | PlayStation design language |
| `nvidia` | NVIDIA design language |
| `mastercard` | Mastercard design language |
| `coinbase` | Coinbase design language |
| `binance` | Binance design language |
| `kraken` | Kraken design language |
| `huggingface` | Hugging Face design language |
| `replicate` | Replicate design language |
| `together-ai` | Together AI design language |
| `cohere` | Cohere design language |
| `mistral-ai` | Mistral AI design language |
| `ollama` | Ollama design language |
| `lovable` | Lovable design language |
| `cursor` | Cursor design language |
| `warp` | Warp design language |
| `raycast` | Raycast design language |
| `mintlify` | Mintlify design language |
| `resend` | Resend design language |
| `runwayml` | RunwayML design language |
| `elevenlabs` | ElevenLabs design language |
| `composio` | Composio design language |
| `posthog` | PostHog design language |
| `mongodb` | MongoDB design language |
| `clickhouse` | ClickHouse design language |
| `hashicorp` | HashiCorp design language |
| `ibm` | IBM design language |
| `meta` | Meta design language |
| `material` | Material Design language |
| `ant` | Ant Design |
| `shadcn` | shadcn/ui |
| `webflow` | Webflow design language |
| `framer` | Framer design language |
| `x-ai` | xAI design language |
| Various automotive | Ferrari, Lamborghini, Bugatti, BMW, BMW M, Renault |
| Various creative | Xiaohongshu, Pinterest, Lingo, Cal, Zapier, MiMo |

### Aesthetic Styles

Non-brand visual styles — moods and design trends:

| Style | Visual Character |
|-------|-----------------|
| `brutalism` | Raw, unpolished, bold typography, stark contrasts |
| `neobrutalism` | Brutalism with color, thick borders, hard shadows |
| `glassmorphism` | Frosted glass, blur, transparency, layered depth |
| `claymorphism` | Soft, puffy, 3D-extruded, playful |
| `neumorphism` | Soft UI, embossed/debossed, monochromatic |
| `skeumorphism` | Realistic textures, physical-world metaphors |
| `flat` | Clean, 2D, minimal shadows, solid colors |
| `bento` | Bento-grid layouts, rounded cards, Apple-style |
| `editorial` | Magazine-style, serif headlines, generous whitespace |
| `corporate` | Professional, structured, conservative |
| `enterprise` | Data-dense, functional, power-user focused |
| `minimal` | Maximum whitespace, minimal elements |
| `retro` | Vintage aesthetic, nostalgic colors and fonts |
| `vintage` | Aged, classic, timeless |
| `futuristic` | Sci-fi, neon, dark themes, glowing accents |
| `cosmic` | Space-themed, dark, starry, celestial |
| `fantasy` | Magical, ornate, whimsical |
| `artistic` | Creative, expressive, unconventional |
| `bold` | High contrast, impactful, loud |
| `vibrant` | Bright colors, energetic, lively |
| `energetic` | Dynamic, active, movement-focused |
| `colorful` | Rainbow-like, multi-colored, playful |
| `elegant` | Sophisticated, refined, tasteful |
| `luxury` | Premium, exclusive, high-end materials |
| `premium` | Upscale, quality-focused, detailed |
| `professional` | Clean, competent, trustworthy |
| `friendly` | Warm, approachable, inviting |
| `playful` | Fun, lighthearted, whimsical |
| `contemporary` | Current, trendy, modern |
| `refined` | Polished, precise, carefully tuned |
| `modern` | Current design trends, clean |
| `clean` | Uncluttered, organized, clear hierarchy |
| `simple` | Minimalist, straightforward |
| `paper` | Paper texture, layered, tactile |
| `gradient` | Gradient-heavy, color transitions |
| `neon` | Glowing, dark backgrounds, electric |
| `mono` | Monochromatic, single-color palette |
| `creative` | Experimental, boundary-pushing |
| `dramatic` | Theatrical, high-impact, bold statements |
| `spacious` | Open, airy, breathing room |
| `expressive` | Emotional, personality-driven |
| `warm-editorial` | Editorial + warm tones |
| `storytelling` | Narrative-driven layouts |
| `cafe` | Coffee shop, cozy, warm |
| `publication` | Newspaper/magazine, editorial hierarchy |
| `dashboard` | Data display optimized |
| `application` | App-like, functional patterns |
| `mission-control` | Command center, overview, monitoring |
| `atelier-zero` | Raw minimal creative studio aesthetic |
| `totality-festival` | Festival-inspired design |
| `urdu` | Urdu design language influence |
| `levels` | Tiered, layered depth |
| `wired` | Hand-drawn, sketchy, wireframe feel |
| `dithered` | Dithering effect, retro computing |
| `doodle` | Hand-drawn illustrations |
| `pacman` | Retro arcade game aesthetic |
| `tetris` | Block-based, game-inspired |
| `perspective` | 3D depth, vanishing points |
| `kami` | Kami-style presentations |
| `opencode-ai` | OpenCode AI branding |
| `voltagent` | VoltAgent design language |
| `miro` | Miro design language |
| `sanity` | Sanity design language |
| `expo` | Expo design language |
| `cal` | Cal.com design language |
| `lingo` | Lingo design language |
| `x-ai` | xAI design language |
| `minimax` | MiniMax design language |

---

## How to Add a New Design System

1. Create a folder under `plugins/_official/design-systems/<system-id>/`
2. Add `DESIGN.md` with full token definitions
3. Add `open-design.json` with metadata
4. Restart the daemon — the registry picks up new systems at startup

### DESIGN.md Format

```markdown
# Design System: Apple

## Colors
- Primary: #007AFF
- Background: #FFFFFF
- Text: #1D1D1F
- Secondary text: #86868B
- Border: #D2D2D7
- Accent: #34C759

## Typography
- Display: SF Pro Display, 56px, -0.005em
- Heading: SF Pro Display, 28px, 1.2 line-height
- Body: SF Pro Text, 17px, 1.47 line-height
- Caption: SF Pro Text, 12px

## Spacing
- Unit: 4px
- Scale: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64

## Border Radius
- Small: 6px
- Medium: 12px
- Large: 20px

## Shadows
- Elevation 1: 0 1px 3px rgba(0,0,0,0.08)
- Elevation 2: 0 4px 12px rgba(0,0,0,0.12)

## Motion
- Default: 0.25s ease-out
- Spring: cubic-bezier(0.4, 0, 0.2, 1)
```
