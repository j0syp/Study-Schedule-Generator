# SDR-0003: Routing, State, and Data Model

## Status
Accepted

## Date
2026-05-02

## Context
The user needs to add subjects and then view a generated schedule. These represent two distinct views, but the project aims to avoid complex full-stack solutions and routing frameworks. We also need a clear definition of how the data will be modeled.

## Decision
- **Routing**: Single Page Application (SPA) where "pages" are switched by toggling CSS `display` properties between the Form/List view and the Schedule view.
- **State**: Maintained in two global JavaScript arrays: `subjects` and `schedule`.
- **Data Model**:
  - **Subject**: `{ id: string, name: string, time: number, deadline: string, priority: 'Низький' | 'Середній' | 'Високий' }`
  - **Schedule Session**: `{ id: string, subjectId: string, name: string, day: number, dayName: string, duration: number, status: 'Pending' | 'Completed' | 'Missed', isHeavy: boolean, isCritical: boolean }`

## Options considered
- Client-side router (e.g., hash router)
- Multi-page application (multiple HTML files)
- Simple DOM toggling

## Consequences
- Simple DOM toggling requires very little boilerplate. We don't need history management for this type of isolated tool.
- The state model perfectly maps to the required output: flattening subjects into individual schedule chunks (sessions) allows tracking the completion state of each individual 120-minute (or less) block independently.

## Requirements touched
- FR4. Зміна стану об'єкта (Pending -> Completed/Missed on specific sessions)
- FR5. Фільтрація
- BR4. Дроблення довгих сесій (necessitating a separate `Schedule Session` model from `Subject`)

## Rejected options and rationale
- Client-side router: Overkill for an app with only two states (setup and result).
- Multi-page app: Hard to share `localStorage` state updates and keep the UI snappy compared to a single-page script.
