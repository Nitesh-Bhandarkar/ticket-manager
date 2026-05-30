## Problem
1. High volume of incoming emails makes it difficult for agents to read each one and check if a similar issue has already been resolved.
2. Canned replies feel impersonal and are not well received by customers.
3. Tracking and managing email queries at scale is difficult without a structured system.


## Solution
1. Build a web-based ticketing app that reads incoming emails to a target Gmail inbox and converts them into structured tickets.
2. Classify tickets by predefined categories and priorities automatically.
3. Search the knowledge base for similar past resolutions using similarity scoring.
4. For known issues (high similarity score, recognized category): AI drafts and sends a human-friendly reply automatically, no human intervention needed.
5. For unknown issues (low similarity score or unrecognized category): escalate the ticket to a human agent for manual handling.
6. Allow human agents to polish and send replies for escalated tickets.
7. Agents can add resolved responses to the knowledge base to improve future AI responses.


## Features

### Email Integration
- Connect to a designated Gmail inbox (target email ID) to receive customer queries.
- Parse incoming emails and create tickets automatically.
- If a customer replies to a resolved/closed ticket, reopen it and update the status to Re-opened.
- Track full email thread per ticket.

### Ticket Management
- Auto-create tickets from incoming emails with category and priority classification.
- Ticket statuses:
  - **Open** — newly created, not yet acted upon
  - **In Progress** — being worked on by an agent
  - **Resolved** — replied to (by AI or agent), awaiting confirmation or closure
  - **Closed** — fully completed, no further action needed
  - **Re-opened** — customer replied after ticket was resolved or closed
- Assign escalated tickets to specific human agents.
- Support multiple agents; tickets can be reassigned between agents.

### AI Response Engine
- For known issues: AI auto-drafts and sends a human-friendly reply without human approval.
- Similarity score and category recognition determine whether AI handles or escalates.
- Feed past resolutions from the knowledge base into the LLM to generate contextual replies.

### Knowledge Base
- Store past resolutions and their associated ticket categories.
- Agents can mark a resolution as "add to knowledge base" after closing a ticket.
- Used by the AI engine to find relevant past responses for new tickets.

### Escalation
- Tickets are escalated when similarity score falls below a threshold or the category is unrecognized.
- Escalated tickets are assigned to a human agent from the agent pool.
- Agents can reply and polish the response before sending.

### User Roles
- **Admin**: full visibility across all tickets, agents, and reporting; manage categories, SLAs, and agent assignments.
- **Agent**: view and manage their assigned tickets; reply to escalated tickets; add resolutions to knowledge base.

### Web Dashboard
- Agents see their own ticket queue with status, priority, and SLA indicators.
- Admins see all tickets across all agents with filters and search.
- Both roles can view ticket details, email thread history, and AI-drafted responses.

### Reporting
- Ticket volume over time (daily, weekly, monthly).
- Resolution rate: AI-resolved vs. agent-resolved.
- Average resolution time per category and per agent.
- SLA compliance rate (percentage of tickets resolved within SLA).
- Knowledge base hit rate (how often AI finds a matching resolution).

### SLA
- Configurable SLA per ticket priority (e.g., High: 4 hours, Medium: 24 hours, Low: 72 hours).
- Visual SLA indicators on ticket cards (on-track, at-risk, breached).
- Admins receive alerts for breached or at-risk SLAs.


## Out of Scope (for now)
- Support for email providers other than Gmail.
- Multiple target inboxes or multi-department routing.
- Mobile app.
- Customer-facing portal.