# Class session workflow

This document explains how **class sessions** relate to **periods**, **semesters**, and **halls**, and how rows are created in the system.

## Concepts

1. **Period (timetable row)**  
   A recurring weekly slot: class, course, lecturer, semester, weekday, time range, type (theory/lab), and optional **hall**. Halls are attached **per period**, so the same class can use different rooms for different slots.

2. **Class session**  
   One **calendar occurrence** of a period: a single teaching day within a semester (for example, “Monday 2026-02-09, 09:00–10:00, Theory”). It stores a **snapshot** of the period at generation time (times, day label, hall, lecturer, etc.) so later timetable edits do not rewrite history.

3. **Generation**  
   For a chosen **class** and **semester**, the system walks that semester’s **date range** (UTC calendar days), finds every **active** period for **that class** in that semester, and for each period creates a session on every day whose weekday matches the period’s day. Existing pairs `(periodId, scheduledDate)` are left unchanged (**upsert with `$setOnInsert`**).  
   The semester is still required because it defines the **calendar window** (start/end dates). The class scopes generation to **one section’s** weekly timetable.  
   The API also supports omitting `classId` to generate for **all** classes in the semester (bulk); the admin UI uses class + semester.

## Step-by-step: from timetable to sessions

1. **Define the semester**  
   Create the semester with correct start and end dates; these bound which calendar days are considered.

2. **Maintain periods**  
   For each class/course/lecturer combination, add periods with the right weekday and time. Set **hall** when the slot has a fixed room; leave hall empty if unknown or N/A.

3. **Generate class sessions**  
   In the admin app, open **Class sessions**, choose the **class**, then a **semester** that has periods for that class, and run **Generate from timetable**.  
   - **`GET /class-sessions/classes-for-generation`** lists classes that have at least one period in your scope.  
   - **`GET /class-sessions/semesters-for-generation?classId=…`** lists semesters that have periods for that class (in scope).  
   **`POST /class-sessions/generate`** accepts `{ semesterId, classId? }`; with `classId` set, only that class’s periods are expanded into dated sessions. The response counts **inserted** vs **already existed** rows.

4. **Use sessions for attendance / status**  
   List and filter sessions by date, class, lecturer, etc. Staff can update **status** (for example cancel a session) without changing the underlying period.

## Permissions and scope

- **Faculty admins** can manage generation and see sessions for classes in their faculty (same rules as periods).  
- **Instructors** see sessions where they are the lecturer and can update status where allowed.

## Design notes

- **Unique key:** `(periodId, scheduledDate)` prevents duplicate sessions for the same slot on the same day.  
- **Hall on the session** is copied from the period at generation time; changing a period later does not automatically change old sessions.  
- **Inactive periods** are skipped during generation so retired timetable rows do not create new occurrences.
