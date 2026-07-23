# Image Templates

Image templates are plugins optimized for static image generation. They live in `plugins/_official/image-templates/` and include preview images showing the expected output. 45 templates ship bundled.

---

## What Makes Image Templates Different

Image templates target `od.mode: "image"` — they guide the agent through image generation using media providers. Each template provides a prompt structure, style reference, and expected output shape for a specific image type.

### Structure

```text
my-image-template/
  SKILL.md              # Image generation workflow
  open-design.json      # OD sidecar with image-specific pipeline
  preview/              # Output previews and style references
```

---

## Template Categories

### Profile Avatars (21 templates)
| Template | Description |
|----------|------------|
| `profile-avatar-anime-girl-to-cinematic-photo` | Anime to cinematic photo transformation |
| `profile-avatar-casual-fashion-grid-photoshoot` | Fashion grid photoshoot |
| `profile-avatar-cinematic-south-asian-male-portrait-with-vultures` | Cinematic male portrait |
| `profile-avatar-cyberpunk-anime-portrait-with-neon-face-text` | Cyberpunk anime portrait |
| `profile-avatar-elegant-fantasy-girl-in-violet-garden` | Fantasy girl portrait |
| `profile-avatar-ethereal-blue-haired-fantasy-portrait` | Ethereal fantasy portrait |
| `profile-avatar-glamorous-woman-in-black-portrait` | Glamorous black portrait |
| `profile-avatar-hyper-realistic-selfie-texture-prompts` | Hyper-realistic selfie |
| `profile-avatar-lavender-fantasy-mage-portrait` | Lavender mage portrait |
| `profile-avatar-monochrome-studio-portrait` | Monochrome studio |
| `profile-avatar-old-photo-restoration-to-dslr-portrait` | Photo restoration |
| `profile-avatar-poetic-woman-in-garden-portrait` | Garden portrait |
| `profile-avatar-professional-identity-portrait-wallpaper` | Professional identity |
| `profile-avatar-realistically-imperfect-ai-selfie` | Realistic imperfect selfie |
| `profile-avatar-signed-marker-portrait-on-shikishi` | Marker portrait on shikishi |
| `profile-avatar-snow-rabbit-empress-portrait` | Snow rabbit empress |
| `profile-avatar-snow-rabbit-mask-hanfu-portrait` | Snow rabbit hanfu |
| `profile-avatar-snowy-rabbit-hanfu-portrait` | Snowy rabbit hanfu |
| `profile-avatar-snowy-rabbit-spirit-portrait` | Snowy rabbit spirit |
| `profile-avatar-song-dynasty-hanfu-portrait` | Song dynasty hanfu |

### Social Media Posts (11 templates)
| Template | Description |
|----------|------------|
| `social-media-post-anime-pokemon-shop-outfit-teaser-poster` | Anime shop teaser |
| `social-media-post-cinematic-elevator-scene` | Cinematic elevator |
| `social-media-post-confused-elf-girl-at-pastel-desk` | Confused elf girl |
| `social-media-post-editorial-fashion-photography` | Editorial fashion |
| `social-media-post-fashion-editorial-collage` | Fashion collage |
| `social-media-post-psg-transfer-announcement-poster` | PSG transfer poster |
| `social-media-post-sensational-girl-dance-storyboard-8-shots` | Dance storyboard |
| `social-media-post-showa-day-retro-culture-magazine-cover` | Retro magazine cover |
| `social-media-post-social-media-fashion-outfit-generation` | Fashion outfit |
| `social-media-post-travel-snapshot-collage-prompt` | Travel snapshot |
| `social-media-post-vintage-sign-painter-sketch` | Vintage sign painter |

### Illustrations & Graphics (6 templates)
| Template | Description |
|----------|------------|
| `3d-stone-staircase-evolution-infographic` | 3D evolution infographic |
| `anime-martial-arts-battle-illustration` | Anime battle illustration |
| `illustrated-city-food-map` | Illustrated city food map |
| `illustration-crayon-kid-drawing-rework` | Crayon kid drawing rework |
| `infographic-otaku-dance-choreography-breakdown-gokurakujodo-16-panels` | Dance choreography breakdown |
| `momotaro-explainer-slide-in-hybrid-style` | Explainer slide hybrid style |

### Game Screens & UI (5 templates)
| Template | Description |
|----------|------------|
| `game-screenshot-anime-fighting-game-captain-ryuuga-vs-kaze-renshin` | Anime fighting game |
| `game-screenshot-three-kingdoms-guanyu-slaying-yanliang` | Three Kingdoms screenshot |
| `game-screenshot-three-kingdoms-lyubu-yuanmen-archery` | Three Kingdoms archery |
| `game-screenshot-three-kingdoms-zhaoyun-cradle-escape` | Three Kingdoms escape |
| `game-ui-ancient-china-open-world-mmo-hud` | Ancient China MMO HUD |

### Other (2 templates)
| Template | Description |
|----------|------------|
| `e-commerce-live-stream-ui-mockup` | E-commerce live stream UI |
| `vr-headset-exploded-view-poster` | VR headset exploded view |
| `notion-team-dashboard-live-artifact` | Notion team dashboard |

---

## Pipeline

Image templates use the media generation pipeline with the `media-image` daemon atom:

```json
{
  "pipeline": {
    "stages": [
      { "id": "discovery", "atoms": ["discovery-question-form"] },
      { "id": "generate", "atoms": ["media-image"] },
      { "id": "critique", "atoms": ["critique-theater"] }
    ]
  },
  "mode": "image"
}
```

The agent structures the prompt according to the template's style guide, then the daemon's media adapters handle the actual image generation via configured providers.

---

## Using Image Templates

1. Select an image template from the Plugins/Examples section
2. Review the preview images to understand the expected style
3. Fill in any template-specific inputs
4. Send your prompt — the agent structures the generation request

Output is an image file in the project workspace, rendered in the preview pane.
