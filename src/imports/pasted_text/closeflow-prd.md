📄 Product Requirements Document (PRD)

Product Name (Working)

CloseFlow (placeholder)

⸻

🧠 1. Overview

Problem

Real estate transactions are:
	•	fragmented across email, text, and multiple tools
	•	deadline-driven and error-prone
	•	dependent on manual coordination (transaction coordinators)

This leads to:
	•	missed deadlines
	•	poor visibility
	•	inefficient communication

⸻

Solution

A desktop-first web app that:

Centralizes deal tracking, task management, and communication into a single shared workspace.

⸻

Product Vision

Become the operating system for real estate transactions, starting with workflow + communication, and evolving into automation (AI TC).

⸻

🎯 2. Goals & Success Metrics

Primary Goal

Enable transaction coordinators and agents to successfully manage deals without missing deadlines

⸻

Success Metrics (MVP)
	•	% of deals with 2+ active users (network signal)
	•	of deals created per user
	•	% of tasks completed on time
	•	Daily active usage per deal

⸻

Non-Goals (IMPORTANT)

We are NOT building:
	•	document storage system
	•	e-signature system
	•	CRM
	•	accounting / commissions
	•	full brokerage compliance system

⸻

👥 3. Users

⸻

Primary User: Transaction Coordinator (TC)
	•	manages multiple deals
	•	tracks deadlines
	•	communicates with agents
	•	responsible for keeping deals on track

⸻

Secondary User: Realtor (Agent)
	•	participates in deals
	•	needs visibility into status
	•	communicates with TC and other agents

⸻

🧩 4. Core Features (MVP Scope)

⸻

🏠 4.1 Deals Dashboard

Description

Central hub to view all active deals.

⸻

Requirements
	•	Display list of deals
	•	Each deal shows:
	•	property address
	•	buyer name
	•	closing date
	•	progress %
	•	status (active, at risk, overdue, complete)

⸻

UX Requirements
	•	High scannability
	•	Card-based layout (initially)
	•	Click → opens Deal Detail

⸻

⸻

🧱 4.2 Deal Detail (Core Workspace)

Description

Primary working screen for each transaction.

⸻

Layout

Split view:
	•	Left (60%): Timeline (tasks)
	•	Right (40%): Chat

⸻

Deal Summary (Top)
	•	property address
	•	closing date
	•	progress bar
	•	“At Risk” indicator (e.g. “2 items at risk”)

⸻

⸻

🧾 4.3 Task / Timeline System

Description

Track all required steps in a transaction.

⸻

Requirements

Each task includes:
	•	name
	•	due date
	•	status:
	•	upcoming
	•	active
	•	at risk
	•	overdue
	•	complete
	•	optional assignee

⸻

Functionality
	•	mark task complete/incomplete
	•	tasks ordered by timeline

⸻

System Logic
	•	At Risk = due within threshold (e.g. 48 hrs) and incomplete
	•	Overdue = past due date

⸻

⸻

💬 4.4 Chat System

Description

Deal-specific communication thread.

⸻

Requirements
	•	each deal has chat
	•	messages include:
	•	sender
	•	text
	•	timestamp

⸻

Functionality
	•	send message
	•	view thread in chronological order

⸻

UX Constraints
	•	simple (no threads, reactions, etc.)
	•	real-time updates (if possible)

⸻

⸻

➕ 4.5 Create Deal

Description

Create a new transaction.

⸻

Requirements

Fields:
	•	property address
	•	closing date
	•	buyer name
	•	seller name

⸻

UX
	•	modal form
	•	minimal friction
	•	redirect to Deal Detail on submit

⸻

⸻

📄 4.6 Documents (Lightweight Coordination)

Description

Track document and signature status (NOT storage)

⸻

Requirements

Each document item includes:
	•	name
	•	status:
	•	not started
	•	requested
	•	uploaded
	•	awaiting signature
	•	signed
	•	signature status:
	•	not required
	•	requested
	•	partially signed
	•	fully signed
	•	optional:
	•	due date
	•	link (DocuSign, Dotloop, etc.)
	•	notes

⸻

UX
	•	displayed in Deal Detail (tab or section)
	•	scannable list

⸻

Constraints
	•	no file storage
	•	no e-signature functionality

⸻

⸻

🔗 4.7 Collaboration (Multi-user Deals)

Description

Enable multiple users to collaborate on a deal.

⸻

Requirements
	•	invite users via email
	•	multiple users can access same deal
	•	all updates visible to all users

⸻

⸻

🧠 5. System Behavior

⸻

Progress Calculation
	•	Based on % of completed tasks
	•	Updates automatically

⸻

Risk Detection
	•	Task-based:
	•	at risk (due soon)
	•	overdue
	•	Document-based:
	•	missing
	•	awaiting signature

⸻

Alerts (MVP)
	•	visual only (no push notifications yet)

⸻

🧱 6. Data Model (High-Level)

⸻

Entities

User
	•	id
	•	name
	•	email

⸻

Deal
	•	id
	•	propertyAddress
	•	buyerName
	•	sellerName
	•	closingDate
	•	status

⸻

Task
	•	id
	•	dealId
	•	name
	•	dueDate
	•	status
	•	assigneeId

⸻

Message
	•	id
	•	dealId
	•	senderId
	•	text
	•	createdAt

⸻

DocumentItem
	•	id
	•	dealId
	•	name
	•	status
	•	signatureStatus
	•	dueDate
	•	referenceLink
	•	notes

⸻

🎨 7. UX Principles
	•	clarity over complexity
	•	status visibility is critical
	•	minimize clicks
	•	prioritize speed and scannability
	•	everything should feel actionable

⸻

⚙️ 8. Technical Requirements
	•	responsive web app (desktop-first)
	•	modular architecture (feature-based)
	•	reusable components
	•	single source of truth for state
	•	scalable for future AI + marketplace

⸻

🚀 9. Future Phases (Not MVP)

⸻

Phase 2
	•	notifications
	•	AI timeline suggestions
	•	smarter risk detection

⸻

Phase 3
	•	TC marketplace
	•	agent discovery
	•	ratings

⸻

Phase 4
	•	AI transaction coordinator (partial automation)

⸻

💥 10. Key Risks
	•	competing with entrenched tools (Dotloop, SkySlope)
	•	overbuilding too early
	•	lack of differentiation if communication layer is weak

⸻

🧠 Final Summary

This MVP is:

A shared transaction workspace
that combines timeline + communication + visibility

NOT:

a full real estate platform
