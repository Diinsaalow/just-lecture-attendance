# Software Requirements Document
## QR Code–Enabled Instructor Attendance and Teaching Duration Monitoring System for JUST

## 1. Project Title

**Design and Development of a QR Code–Enabled Instructor Attendance and Teaching Duration Monitoring System for Jamhuriya University of Science and Technology (JUST)**

## 2. Project Overview

This project is a mobile and web-based system designed to monitor **instructor attendance**, **class-session participation**, and **actual teaching duration** at Jamhuriya University of Science and Technology. The system is intended to solve the limitations of the current attendance process by moving from general campus-level presence tracking to **classroom-level attendance verification**. It will support instructors through a mobile application and administrative users through a centralized web dashboard. The system is specifically designed for JUST’s **multi-campus environment** and is focused on **instructors only**, not students.

The final system also includes **absence submission** as a core feature. Instructors will be able to view their timetable, select the session they are about to teach, check in and check out for that session, and submit absence requests when they cannot attend. Faculty Admins will manage and review faculty-specific data, while Super Admins will manage the full institution.

## 3. Problem Statement

JUST currently needs a more accurate and reliable way to verify whether instructors actually attend their scheduled classroom sessions, arrive on time, and complete the required teaching period. Existing attendance practice mainly confirms general presence rather than actual classroom instruction, which creates a gap between recorded attendance and real teaching activity. This is especially important in a multi-campus environment and for part-time teaching staff. The proposed system addresses this by linking attendance to a specific class session and by recording both session start and end.

## 4. Project Objectives

### 4.1 General Objective
To design and develop a digital system that improves the **accuracy**, **efficiency**, and **real-time visibility** of instructor attendance and teaching duration monitoring at JUST.

### 4.2 Specific Objectives
- To support classroom-level instructor attendance recording.
- To support instructor check-in and check-out for scheduled class sessions.
- To calculate actual teaching duration automatically.
- To support absence submission and approval.
- To improve transparency and administrative monitoring across faculties and campuses.
- To generate reliable attendance and teaching-duration reports for academic management.

## 5. Scope of the System

### 5.1 In Scope
The system will cover:

- Instructor login and authentication
- Instructor timetable viewing on mobile
- Session-based attendance check-in
- Session-based attendance check-out
- Teaching duration calculation
- Attendance verification using:
  - selected timetable session
  - mobile device fingerprint
  - hall QR code fallback
  - device binding
  - Wi-Fi SSID validation
  - GPS geofencing
- Absence request submission by instructors
- Absence approval or rejection by Faculty Admin
- Attendance and absence monitoring by faculty
- Institution-wide monitoring by Super Admin
- Timetable upload and management
- Reports on attendance and scheduled vs completed hours
- Multi-campus operation

### 5.2 Out of Scope
The following are outside the current project scope:

- Student attendance
- Payroll or compensation integration
- HR-specific user role
- Substitute or replacement instructor workflow
- Offline mode
- Notifications
- Advanced manual correction workflows
- Advanced report export features for now

## 6. Stakeholders

The main stakeholders are:

- JUST management
- Super Admin
- Faculty Admins
- Instructors
- Academic monitoring personnel using Super Admin access
- System developers and maintainers

## 7. User Roles

### 7.1 Instructor
The Instructor uses the mobile application and can:

- Log into the system
- View personal timetable
- Select a scheduled session
- Check in for the selected session
- Check out after the session
- Use mobile fingerprint for attendance confirmation
- Use hall QR scanner when fingerprint is unavailable
- View own attendance history
- Submit absence requests

### 7.2 Faculty Admin
The Faculty Admin manages only data related to their own faculty and can:

- Manage instructors in their faculty
- Manage classrooms/halls in their faculty
- Manage periods and sessions in their faculty
- Review attendance records for their faculty
- Review absence requests for their faculty
- Approve or reject absence requests
- Handle missed check-out by checking out on behalf of the instructor
- Monitor reports for their faculty

### 7.3 Super Admin
The Super Admin has full system control and can:

- Manage all faculties
- Manage all instructors
- Manage all halls, sessions, and timetable structures
- Monitor all attendance data
- Access institution-wide reports
- Manage configuration and overall system administration

## 8. High-Level Workflow

### 8.1 Attendance Workflow
1. Instructor logs into the mobile app.
2. Instructor views personal timetable.
3. Instructor selects the session they are about to teach.
4. The system loads session context, including class, date, start time, and duration.
5. The instructor confirms attendance using one of two methods:
   - mobile fingerprint authentication
   - hall QR code scan, when fingerprint is unavailable
6. Backend validates:
   - the selected session
   - the instructor identity
   - registered device identity
   - approved Wi-Fi SSID
   - GPS location within allowed boundary
7. System records check-in timestamp.
8. At the end of the session, the instructor performs check-out.
9. Backend validates again and records check-out timestamp.
10. System calculates total teaching duration.
11. If irregularities exist, the system flags them.

### 8.2 Absence Workflow
1. Instructor opens the absence submission feature.
2. Instructor submits absence for the relevant session.
3. The request is sent to the relevant Faculty Admin.
4. Faculty Admin reviews the request.
5. Faculty Admin approves or rejects the request.
6. If approved, the session is marked as **approved absence** instead of unexcused absence.

### 8.3 Forgot Check-Out Workflow
1. If the instructor forgets to check out, the session remains incomplete.
2. Faculty Admin may perform check-out on behalf of the instructor.
3. The system stores that this action was performed by admin, not by the instructor directly.

## 9. Functional Requirements

### 9.1 Authentication and Access Control

**FR-01** The system shall allow users to log in using **username and numeric passcode**.

**FR-02** The passcode shall be between **6 and 9 digits**.

**FR-03** The system shall authenticate users securely before granting access.

**FR-04** The system shall enforce role-based access control for Instructor, Faculty Admin, and Super Admin.

### 9.2 Instructor Timetable Module

**FR-05** The system shall display the instructor’s timetable in the mobile application.

**FR-06** The timetable shall show scheduled sessions by day and/or week.

**FR-07** Each timetable entry shall include enough information to identify the session, including course/class, date, start time, end time or duration, and hall when available.

**FR-08** The instructor shall select a session before starting attendance.

### 9.3 Attendance Check-In Module

**FR-09** The system shall allow instructors to check in only for a selected scheduled session.

**FR-10** The system shall support attendance confirmation using the instructor’s **mobile fingerprint**.

**FR-11** The system shall support **hall QR code scanning** as an alternative when fingerprint is unavailable.

**FR-12** The system shall validate that the selected session belongs to the logged-in instructor.

**FR-13** The system shall validate that the current time is appropriate for the selected session.

**FR-14** The system shall validate the device identity before recording attendance.

**FR-15** The system shall validate Wi-Fi SSID against approved campus Wi-Fi values.

**FR-16** The system shall validate GPS location within the allowed campus/faculty/session boundary.

**FR-17** The system shall record the server-side check-in timestamp.

**FR-18** The system shall prevent duplicate check-in for the same session.

### 9.4 Attendance Check-Out Module

**FR-19** The system shall allow instructors to check out after the selected session.

**FR-20** The system shall validate the selected session again before check-out is accepted.

**FR-21** The system shall record the server-side check-out timestamp.

**FR-22** The system shall calculate teaching duration automatically using check-in and check-out timestamps.

**FR-23** The system shall flag missing check-out when a session has check-in but no valid check-out.

**FR-24** The system shall allow Faculty Admin to check out on behalf of an instructor when the instructor forgot to do so.

### 9.5 Attendance Validation and Session Logic

**FR-25** The system shall validate attendance against the official timetable.

**FR-26** The system shall reject attendance when the selected session is not part of the instructor’s timetable.

**FR-27** The system shall reject attendance when the action occurs clearly outside the allowed session window.

**FR-28** When QR code is used, the system shall validate the hall QR against the session/hall relationship where relevant.

**FR-29** The system shall record irregular attendance cases for later review.

### 9.6 Teaching Duration and Attendance Status

**FR-30** The system shall calculate actual teaching duration in minutes or hours.

**FR-31** The system shall classify a session as **late** if the instructor checks in **30 minutes after** scheduled start time.

**FR-32** The system shall classify a session as **left early** if the instructor checks out **1 hour before** session end time.

**FR-33** The system shall store scheduled duration and actual duration for each session.

**FR-34** The system shall allow reporting of scheduled hours versus completed hours.

### 9.7 Absence Management Module

**FR-35** The system shall allow instructors to submit absence requests.

**FR-36** The absence request shall be linked to the relevant session.

**FR-37** The absence request shall be sent to the appropriate Faculty Admin.

**FR-38** Faculty Admin shall be able to approve or reject the request.

**FR-39** When approved, the system shall mark that session as **approved absence**.

**FR-40** When rejected, the session shall remain unapproved and be handled according to attendance rules.

**FR-41** The system shall not require absence categories in the current version.

**FR-42** The system shall not require multi-level absence approval in the current version.

### 9.8 Timetable Management Module

**FR-43** The system shall allow timetable upload using a predefined Excel format.

**FR-44** The system shall parse uploaded timetable data and generate session records.

**FR-45** The system shall allow admins to manage timetable and session data.

**FR-46** The system shall support manual timetable adjustment after upload.

### 9.9 Admin and Monitoring Module

**FR-47** Faculty Admin shall only access data belonging to their own faculty.

**FR-48** Super Admin shall access data for all faculties and campuses.

**FR-49** The system shall provide attendance records per instructor, faculty, and date range.

**FR-50** The system shall provide visibility into approved absences and irregular attendance cases.

### 9.10 Reporting Module

**FR-51** The system shall generate monthly attendance reports.

**FR-52** The system shall generate summary reports by faculty or department-equivalent structure.

**FR-53** The system shall generate reports comparing scheduled versus completed teaching hours.

**FR-54** The system shall generate exception logs for cases such as late arrival, early departure, missing check-out, and unapproved absence.

**FR-55** Advanced export/reporting formats may be deferred to a later implementation phase.

## 10. Business Rules

**BR-01** An instructor must select the session before attempting attendance.

**BR-02** Fingerprint is the primary attendance confirmation method on mobile.

**BR-03** Hall QR scanning is the fallback method when fingerprint is unavailable.

**BR-04** Only the instructor assigned to a session may check in or check out for that session.

**BR-05** Faculty Admin can only operate inside their assigned faculty.

**BR-06** Super Admin can operate across the entire system.

**BR-07** No Department Officer role exists in the final system.

**BR-08** No HR role exists in the final system; institution-wide viewing is done through Super Admin.

**BR-09** No substitute instructor workflow is included in the current project.

**BR-10** The system always requires internet connectivity.

**BR-11** The system does not support offline attendance submission.

## 11. Non-Functional Requirements

### 11.1 Performance
Attendance validation response time shall not exceed **3 seconds** under normal operating conditions.

### 11.2 Security
- All API endpoints shall require authentication.
- Communication between clients and server shall use HTTPS.
- The system shall enforce role-based permissions.
- The system shall use server-generated timestamps for critical attendance events.

### 11.3 Reliability
- The system shall prevent duplicate attendance entries.
- The system shall preserve data integrity across multiple campuses and faculties.
- The system shall remain consistent even when attendance is reviewed later by admins.

### 11.4 Scalability
- The system shall support multiple campuses and faculties.
- The system architecture shall support growth in instructors, sessions, and attendance records.

### 11.5 Usability
- The mobile application shall be simple and intuitive for instructors.
- The dashboard shall present clear, structured, and readable reports.

### 11.6 Compatibility
The mobile application shall support **Android and iOS** through Flutter.

### 11.7 Availability
The system shall require internet connection at the time of attendance operation.

## 12. Technical Requirements

### 12.1 Mobile Application
Framework: **Flutter**

Target platforms: **Android and iOS**

Core functions:
- login
- timetable viewing
- session selection
- fingerprint confirmation
- QR scanner fallback
- check-in/check-out
- absence submission

### 12.2 Web Dashboard
Framework: **React with TypeScript**

Core functions:
- user/faculty/session management
- attendance monitoring
- absence review
- timetable management
- reporting

### 12.3 Backend
Framework: **NestJS**

Functions:
- authentication
- authorization
- attendance validation engine
- timetable processing
- reporting
- absence workflow

### 12.4 Database
Database: **MongoDB**

ODM: **Mongoose**

## 13. Hardware and Infrastructure Requirements

The system requires:

- Instructor smartphones
- Stable internet access
- Campus Wi-Fi infrastructure
- Backend hosting server, either cloud VPS or on-campus server
- Development machines with at least minimum practical development capacity, including laptop and required IDE tools

## 14. Core Data Entities

The system should at minimum manage these entities:

- User
- Role
- Faculty
- Campus
- Hall/Classroom
- Instructor Profile
- Bound Device
- Approved Wi-Fi SSID
- Geofence/Location Rule
- Timetable
- Session/Class Session
- Attendance Record
- Attendance Status
- Absence Request
- Absence Decision
- Audit Entry
- Report Definition

## 15. Suggested Attendance Status Values

The system should support attendance statuses such as:

- Scheduled
- Checked In
- Checked Out
- Completed
- Late
- Left Early
- Missing Check-Out
- Absent
- Approved Absence
- Rejected Absence Request
- Exception/Needs Review

## 16. Audit and Traceability Requirements

Even though advanced correction workflows are out of scope, the system should still log major events for accountability:

- user login
- check-in
- check-out
- admin-performed checkout
- absence request submission
- absence approval/rejection
- timetable upload
- critical admin changes

## 17. Assumptions and Constraints

- The system assumes instructors use smartphones regularly.
- The system assumes campus Wi-Fi and GPS information are available during attendance operations.
- The system assumes timetable data can be prepared in the required Excel format.
- The system assumes JUST will manage system users centrally.
- The system is constrained by the lack of offline mode, no substitute workflow, and no payroll integration in the current version.

## 18. Future Enhancements

The following may be added later but are not part of the current version:

- notifications
- manual correction workflow
- absence categories
- multi-level approval
- advanced report export
- payroll integration
- HR read-only role
- substitute instructor handling
- more advanced security analytics

## 19. Acceptance Criteria Summary

The system will be considered functionally acceptable when:

- Instructors can log in successfully.
- Instructors can see their timetable.
- Instructors can select a session and check in.
- Attendance can be confirmed by fingerprint or QR fallback.
- The system rejects invalid session or invalid location attempts.
- The system records check-in and check-out using server time.
- Teaching duration is calculated correctly.
- Late and early-departure cases are flagged correctly.
- Instructors can submit absence requests.
- Faculty Admin can approve or reject absence requests.
- Faculty Admin can perform check-out on behalf of instructors when necessary.
- Super Admin can monitor institution-wide data.
- Reports on scheduled vs completed hours can be generated.
