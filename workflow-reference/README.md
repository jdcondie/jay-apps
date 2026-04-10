# Workflow Reference

Live audit tool for AI consulting discovery calls. A searchable, filterable library of 20 common workflows with the problem, discovery questions, automation flow, ROI pitch, and tool stack for each.

## Structure

```
workflow-reference/
├── index.html    # markup + layout shell
├── styles.css    # all styling (Plus Jakarta Sans + orange/black theme)
├── data.js       # workflow dataset (20 workflows across 5 categories)
├── app.js        # render, filter, search, card interactions
└── README.md
```

## Categories

- Lead & Communications
- Admin & Data Entry
- Operations
- Sales
- Internal Knowledge

## Usage

Open `index.html` directly in a browser. No build step, no dependencies — just static files.

## Adding a workflow

Append an entry to the array in `data.js`. Required fields: `id`, `category`, `emoji`, `name`, `preview`, `level` (1 or 2), `problem`, `discoveryQs`, `steps`, `roi`, `pitch`, `tools`.
