# SDR-0001: Stack Choice

## Status
Accepted

## Date
2026-05-02

## Context
The application is a simple interactive tool for generating a study schedule. The requirements explicitly state that the app should not be a heavy full-stack project and there is no need for backend authorization or external APIs. The primary logic is a scheduling algorithm and standard DOM manipulations.

## Decision
We will use Vanilla HTML, CSS, and JavaScript.

## Options considered
- Plain HTML, CSS, and JavaScript
- Vite with Vanilla JavaScript
- Vite with React and TypeScript

## Consequences
Using Plain HTML/CSS/JS without a build step makes the project incredibly simple to deploy to GitHub Pages (as a static folder). It removes dependency bloat and build configurations. The downside is lack of componentization (which is fine since the UI is small).

## Requirements touched
- 2. Межі системи: "Авторизація та реєстрація користувачів" не входить у систему
- 9. Припущення та обмеження: "зберігаючи виключно Vanilla JS + LocalStorage"

## Rejected options and rationale
- Vite with React/TS was rejected because the UI state is not complex enough to warrant React. The forms are straightforward, and a simple DOM update suffices.
- Vite with Vanilla JS was rejected to avoid adding node_modules and a build step to what is essentially a single-page script.
