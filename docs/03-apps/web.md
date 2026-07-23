# Web App

The frontend is a Next.js 16 React SPA that communicates with the daemon through API proxies. It handles the entire UI — chat, file browsing, design system picking, plugin marketplace, settings, and more.

- **Package:** `@open-design/web` (v0.14.2)
- **Framework:** Next.js 16 with Turbopack in dev
- **Port:** `3000` (default)
- **Components:** 209 files in `apps/web/src/components/`
- **Entry:** `src/App.tsx` (99KB) — main application component with routing and state

---

## Architecture

The web app uses **Next.js App Router** (`app/` directory) with a catch-all route:

```
app/
├── layout.tsx              # Root layout (providers, CSS, metadata)
├── [[...slug]]/            # Catch-all — most pages render through this
└── desktop-pet/            # Desktop pet feature (standalone route)
```

API calls to `/api/*` are proxied to the daemon via `next.config.ts` rewrite rules in development. In production (static export), calls go direct to the daemon.

The frontend uses a **custom router** instead of React Router — a `useSyncExternalStore`-based implementation that hooks into `pushState`/`popstate` for deep-linkable URLs. This is defined in `src/router.ts`.

---

## Component Map

### Entry Shell
| Component | Purpose |
|-----------|---------|
| `EntryView.tsx` | Main application shell with nav rail |
| `EntryShell.tsx` | Shell wrapper for the entry view |
| `EntryNavRail.tsx` | Left-side navigation rail |
| `EntryHelpMenu.tsx` | Help/support menu |
| `EntrySettingsMenu.tsx` | Settings quick-access menu |
| `AppChromeHeader.tsx` | Top chrome header bar |

### Home
| Component | Purpose |
|-----------|---------|
| `HomeView.tsx` | Homepage root |
| `HomeHero.tsx` | Hero section with tagline and CTA |
| `HomeTemplatesReveal.tsx` | Template showcase grid |
| `RecentProjectsStrip.tsx` | Recent projects row |
| `RecommendedStartRegion.tsx` | Recommended getting-started prompts |

### Project Workspace
| Component | Purpose |
|-----------|---------|
| `ProjectView.tsx` | Project workspace shell (chat + files) |
| `ChatPane.tsx` | Chat message list and stream |
| `ChatComposer.tsx` | Message input with plugin picker |
| `FileWorkspace.tsx` | File browser panel |
| `FileViewer.tsx` | File content viewer/editor |
| `WorkspaceTabsBar.tsx` | Open workspace tabs |
| `DesignBrowserPanel.tsx` | Design files browser |
| `DesignFilesPanel.tsx` | Design files management |
| `GenUIInbox.tsx` | GenUI inbox for agent questions |
| `GenUISurfaceRenderer.tsx` | Renders GenUI surfaces (forms, choices) |
| `AssistantMessage.tsx` | Rendered agent message |
| `ComposerPlusMenu.tsx` | Plus-menu for plugins, files, media |
| `ComposerPluginPreview.tsx` | Plugin preview in composer |
| `InlinePluginsRail.tsx` | Horizontal plugin selector rail |
| `InlineModelSwitcher.tsx` | Model picker inline |
| `ContextChipStrip.tsx` | Context chips display |
| `ProjectActionsToolbar.tsx` | Project action buttons |

### Design Systems
| Component | Purpose |
|-----------|---------|
| `DesignSystemFlow.tsx` | Design system selection flow |
| `DesignSystemPicker.tsx` | Design system picker widget |
| `DesignSystemSwitchPicker.tsx` | Switch design systems |
| `DesignSystemPreviewModal.tsx` | Preview modal for design systems |
| `DesignSystemCreateHero.tsx` | Create new design system |
| `DesignSystemKitPreview.tsx` | Kit preview card |
| `DesignSystemAssetDropzone.tsx` | Asset upload dropzone |
| `DesignSystemsSection.tsx` | Design systems settings section |
| `DesignSystemsTab.tsx` | Design systems tab view |

### Brands
| Component | Purpose |
|-----------|---------|
| `BrandPickerModal.tsx` | Brand selection modal |
| `BrandPreviewCard.tsx` | Brand preview card |
| `BrandsTab.tsx` | Brands tab view |
| `BrandReferencePicker.tsx` | Brand reference picker |
| `BrandReadyPrompt.tsx` | Brand-ready prompt view |
| `NewBrandModal.tsx` | Create new brand modal |
| `MissingBrandFontsBanner.tsx` | Missing fonts warning |
| `BrandEnrichmentBanner.tsx` | Brand enrichment banner |

### Plugins & Marketplace
| Component | Purpose |
|-----------|---------|
| `PluginsView.tsx` | Main plugins view |
| `PluginsSection.tsx` | Plugins settings section |
| `PluginsHomeSection.tsx` | Plugins section on home |
| `MarketplaceView.tsx` | Plugin marketplace browser |
| `PluginDetailView.tsx` | Single plugin detail page |
| `PluginDetailsModal.tsx` | Plugin detail modal |
| `PluginInputsForm.tsx` | Plugin input form |
| `PluginLoopHome.tsx` | Plugin loop home |
| `SkillDetailsModal.tsx` | Skill detail modal |
| `SkillsSection.tsx` | Skills settings section |

### Critique Theater
| Component | Purpose |
|-----------|---------|
| `Theater/` directory | Multi-panelist design critique UI with scored feedback |

### Settings & Config
| Component | Purpose |
|-----------|---------|
| `SettingsDialog.tsx` | Full settings dialog |
| `AgentPicker.tsx` | Agent runtime selector |
| `AgentIcon.tsx` | Agent icon display |
| `AgentDiagnosticRow.tsx` | Agent diagnostic info |
| `MemorySection.tsx` | Memory settings |
| `MemoryHooksPanel.tsx` | Memory hooks configuration |
| `MemoryProfilePanel.tsx` | Memory profile settings |
| `RoutinesSection.tsx` | Automation routines |
| `PrivacySection.tsx` | Privacy settings |
| `LanguageMenu.tsx` | Language switcher |
| `SessionModeToggle.tsx` | Session mode toggle |
| `UpdaterPopup.tsx` | Update notification |

### Design & Preview Tools
| Component | Purpose |
|-----------|---------|
| `FileOpsSummary.tsx` | File operation summary |
| `DeckSlideThumbnail.tsx` | Slide thumbnail |
| `DeckThumbnailRail.tsx` | Thumbnail navigation rail |
| `IframeKeepAlivePool.tsx` | Preview iframe pool |
| `PreviewDrawOverlay.tsx` | Preview overlay |
| `PreviewModal.tsx` | Full preview modal |
| `SketchEditor.tsx` | Sketch/drawing editor |
| `SketchPreview.tsx` | Sketch preview |
| `ManualEditPanel.tsx` | Manual code editing panel |
| `LiveArtifactBadges.tsx` | Live artifact status badges |

### Subdirectories
| Directory | Contents |
|-----------|----------|
| `byok/` | BYOK provider setup UI |
| `composer/` | Composer-specific sub-components |
| `design-files/` | Design file viewers |
| `pet/` | Desktop pet feature |
| `workspace/` | Workspace sub-components |
| `plugin-details/` | Plugin detail components |
| `plugins-home/` | Plugin home section components |
| `share-to-community/` | Community sharing UI |
| `use-everywhere/` | "Use Everywhere" feature |
| `home-hero/` | Home hero sub-components |

---

## Providers (API Layer)

Providers are in `src/providers/` and handle communication with AI backends:

| Provider | Purpose |
|----------|---------|
| `daemon.ts` | SSE client for daemon communication |
| `anthropic.ts` | Direct Anthropic API calls |
| `openai-compatible.ts` | OpenAI-compatible endpoint calls |
| `deepseek-compatible.ts` | DeepSeek API calls |
| `ollama-compatible.ts` | Local Ollama model calls |
| `google-compatible.ts` | Google AI (Gemini) calls |
| `azure-compatible.ts` | Azure OpenAI calls |
| `elevenlabs-voices.ts` | ElevenLabs voice synthesis |
| `senseaudio-compatible.ts` | SenseAudio API |
| `aihubmix-compatible.ts` | AIHubMix API |
| `sse.ts` | Generic SSE client |
| `api-proxy.ts` | API proxy for requests |
| `connection-test.ts` | Agent connection testing |
| `project-events.ts` | Project event handling |
| `provider-models.ts` | Model list management |
| `registry.ts` | Provider registry |

---

## Runtime Utilities

`src/runtime/` contains utilities used by the rendering pipeline:

| File | Purpose |
|------|---------|
| `chat-events.ts` | Chat event parsing and state |
| `markdown.tsx` | Markdown-to-React renderer |
| `design-kit.ts` | Design kit operations |
| `tool-renderers.ts` | Tool call renderers |
| `shiki.ts` | Syntax highlighting with Shiki |
| `brands.ts` | Brand rendering helpers |
| `file-ops.ts` | File operation utilities |
| `design-md-parse.ts` | DESIGN.md parser |

---

## State Management

Client state is managed in `src/state/` through React hooks:

| File | Manages |
|------|---------|
| `projects.ts` | Project list and active project |
| `config.ts` | User configuration |
| `appearance.ts` | Theme and appearance |
| `mcp.ts` | MCP server state |
| `apiProtocols.ts` | API protocol settings |
| `libraryHandoff.ts` | Library handoff state |
| `maxTokens.ts` | Token budget limits |
| `onboarding-profile.ts` | Onboarding flow state |
| `project-locations.ts` | Project directory locations |

---

## Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `next` | 16.2.6 | Framework |
| `react` / `react-dom` | 18.3.1 | UI library |
| `tailwindcss` | 4.3.0 | Styling |
| `motion` | 12.40.0 | Animations |
| `lucide-react` | 1.16.0 | Icons |
| `@xterm/xterm` | 5.5.0 | Terminal emulator |
| `@excalidraw/excalidraw` | 0.18.1 | Drawing |
| `lexical` | 0.36.2 | Rich text editor |
| `shiki` | 4.1.0 | Syntax highlighting |
| `openai` | 6.38.0 | OpenAI SDK |
| `@anthropic-ai/sdk` | 0.32.1 | Anthropic SDK |
| `micromark` | 4.0.2 | Markdown parsing |
| `jspdf` | 4.2.1 | PDF generation |

---

## Build and Run

```bash
# Dev server (with Turbopack)
cd apps/web
pnpm run dev            # next dev --turbopack, port 3000

# Production build
pnpm run build          # next build

# Sidecar build
pnpm run build:sidecar  # tsc -p tsconfig.sidecar.json

# Typecheck
pnpm run typecheck

# Test (max 2 workers — browser environment tests)
pnpm run test           # vitest --maxWorkers=2
```
