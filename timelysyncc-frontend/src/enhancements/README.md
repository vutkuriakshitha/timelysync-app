This folder is the source of truth for the runtime enhancement layer that is served to the current static frontend.

Structure:
- `source/00-bootstrap-and-styles.js`: shared state, API base, and injected styles
- `source/01-auth.js`: login, signup, and forgot-password enhancement flow
- `source/02-smart-intake-core.js`: shared task-intake parsing and draft helpers
- `source/03-accountability.js`: accountability metrics and rendering helpers
- `source/04-preview-and-mode.js`: preview rendering and create-task mode switch
- `source/05-dashboard-and-navigation.js`: dashboard layout cleanup and shared nav tweaks
- `source/06-create-task-workspace.js`: manual add and SmartIntake workspace behavior
- `source/07-routing.js`: route observation and page enhancement bootstrapping

To regenerate the served bundle:

```powershell
npm run build:enhancements
```

Output file:
- `build/static/js/timelysync-enhancements.js`
