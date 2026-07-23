# Video Templates

Video templates are plugins optimized for motion and video output. They live in `plugins/_official/video-templates/` and include MP4 preview files showing the expected output.

---

## What Makes Video Templates Different

Regular plugins produce HTML artifacts. Video templates target motion output using HyperFrames (HTML-based motion composition) or direct video generation. They ship with MP4 previews so users can see the cinematic result before generating.

### Structure

```text
video-template-example/
  SKILL.md              # Motion/video workflow instructions
  open-design.json      # OD sidecar with video-specific pipeline
  preview/
    demo.mp4            # Rendered video preview
```

---

## Video Modes

Video templates target one of these `od.mode` values:

| Mode | Output | Pipeline Difference |
|------|--------|-------------------|
| `video` | Video prompt → storyboard → rendered clip | Uses media adapters for rendering |
| `hyperframes` | HyperFrames-ready HTML motion composition | Uses HyperFrames pipeline atoms |

Plugins can also use `od.mode: "video"` with a `hyperframes` tag when they should appear beside video tooling.

---

## Available Templates

63 video templates are bundled in `plugins/_official/video-templates/`, covering:

- Shortform social video
- Motion graphics compositions
- Cinematic intros/outros
- Animated data stories
- Frame-by-frame animation sequences
- HyperFrames motion templates

Check `plugins/_official/video-templates/` for the full catalog. Each template folder contains its `SKILL.md`, `open-design.json`, and `preview/` directory.

---

## Using Video Templates

1. Select a video template from the Plugins/Examples section in the web UI
2. The template provides a pipeline tuned for video output
3. Send a prompt describing the scene, style, and content
4. The agent generates frames, composes the motion, and produces the output

For HyperFrames templates, the output is an HTML file that plays as motion. For video mode templates, the output is an MP4 file generated via the daemon's media adapters.
