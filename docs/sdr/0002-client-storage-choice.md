# SDR-0002: Client Storage Choice

## Status
Accepted

## Date
2026-05-02

## Context
The application needs to store the user's subjects and generated schedule between sessions. The requirements rule out databases like PostgreSQL or MongoDB and favor a frontend-only approach. 

## Decision
We will use browser `localStorage` as the primary persistence mechanism.

## Options considered
- In-memory state only
- `sessionStorage`
- `localStorage`
- `IndexedDB`
- External backend or service

## Consequences
Using `localStorage` is extremely simple to implement (JSON parsing/stringifying). It will persist data across browser tabs and restarts. However, the data will be local to the specific browser and device the user is working on. There is a ~5MB size limit, which is more than enough for plain text JSON entries of a study schedule.

## Requirements touched
- FR2. Керування списком
- FR4. Зміна стану об'єкта
- Межі проєкту: "Зберігайте все в LocalStorage браузера"

## Rejected options and rationale
- In-memory state only: Rejected because data would be lost on refresh.
- `IndexedDB`: Rejected because the data structure (a flat array of subjects and a flat array of schedule sessions) is too simple to justify the async complexity of IndexedDB.
- External backend: Explicitly forbidden by requirements ("Без складної БД", "Без реєстрації").
