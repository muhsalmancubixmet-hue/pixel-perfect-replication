<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Mock data
- All screen data comes from `src/data/mock.ts` (typed in `src/data/types.ts`); components never hardcode data, so the layer can later be swapped for the Django API.
- Global-first data: locations use GeoPlace (country→region→district?→city→area) from src/data/geo.ts; Kerala is demo data only — never hardcode regions in filters/logic.
- Money always via money(amount, currency) with the CURRENCIES registry in src/data/geo.ts; no hardcoded symbols.
- Maps use the reusable WorldMap (Leaflet + OSM + markercluster), dynamically imported behind ClientOnly for SSR safety.
- Staff auth is a prototype localStorage session (src/lib/auth.ts) checked in __root; public auth screens are listed in PUBLIC_PATHS — swap for Django auth later.
- Row-action forms use the shared FormDialog/FormDrawer/ReasonDialog/ConfirmDialog in src/components/admin/Dialogs.tsx instead of placeholder toasts.
