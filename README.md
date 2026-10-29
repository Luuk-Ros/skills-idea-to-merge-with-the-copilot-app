# Idea to Merge with the Copilot App

<img src="https://octodex.github.com/images/Professortocat_v2.png" align="right" height="200px" />

Hey Luuk-Ros!

Mona here. I'm done preparing your exercise. Hope you enjoy! 💚

Remember, it's self-paced so feel free to take a break! ☕️

[![](https://img.shields.io/badge/Go%20to%20Exercise-%E2%86%92-1f883d?style=for-the-badge&logo=github&labelColor=197935)](https://github.com/Luuk-Ros/skills-idea-to-merge-with-the-copilot-app/issues/1)

## Bookmark manager

Save an HTTP(S) URL with or without its protocol. Each bookmark receives a unique
four-character base62 `mona-` slug and is displayed as `<url> :: <slug>`.
Copy copies the slug; it is a local identifier, not a hosted short-link redirect.
Bookmarks stay on this browser under the `mona-bookmarks` localStorage key.
Invalid stored entries are discarded, and storage failures are reported without
clearing the URL you entered. Clear all asks for confirmation before removing data.

Use Node.js 22.19+ and run `npm ci` to install dependencies. `npm test` runs the
pure-helper tests without a browser; `npm run build` generates the static site.
