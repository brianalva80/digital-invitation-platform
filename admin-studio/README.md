# AMPLOP Private Admin Studio

This is an owner-operated local tool. It has no authentication and must never be exposed to a network or included in a public deployment. Browser storage is not a backup: export project backups regularly and keep them outside this repository. Clearing browser data, storage eviction, or device loss can permanently remove projects.

## Start locally

From the repository root, serve only this directory and bind to loopback:

```sh
cd admin-studio
python3 -m http.server 4173 --bind 127.0.0.1
```

Open `http://127.0.0.1:4173/`. Do not run a server from the repository root. Stop the server when finished. Projects and uploaded media are stored in this browser's IndexedDB origin. Use the Backup control to download one project's validated JSON backup; store actual customer backups outside the repository.

The standalone invitation export is for later static hosting and does not include the editor or project database. Demo RSVP interactions are removed; RSVP is not operational.

Use **Export sharing package** on the selected project to download a static ZIP containing `index.html`, `share/index.html`, and `share/share.css`. Extract it and serve the extracted directory over HTTP for local preview; enter only fictional guest names. `file://` and loopback URLs are not publicly shareable. The sharing page derives personalized invitation links from its deployment location. Names in those URLs may appear in browser history and logs; this tool does not provide authentication or guest-list confidentiality. **Export HTML** remains a separate standalone invitation export.