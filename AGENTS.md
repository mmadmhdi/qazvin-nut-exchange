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

- Public localization uses locale-keyed copy maps and the shared translation provider; this prevents Persian UI leakage while keeping business logic unchanged.
- All public SEO URLs derive from SITE_URL in src/lib/seo.ts (including route metadata, structured data, and the sitemap); this keeps canonical domain changes consistent without duplicating configuration.
