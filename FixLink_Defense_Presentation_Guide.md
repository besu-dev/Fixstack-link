# FixLink: Household Repair Service Platform
## Senior Project Defense Presentation Guide & Defense Companion

> **Academic Degree:** Bachelor of Science in Computer Science / Software Engineering  
> **Project Title:** FixLink – Household Repair Service Platform  
> **Presentation Format:** 15-Slide Professional University Defense Deck  
> **Interactive Deck File:** [`FixLink_Presentation.html`](./FixLink_Presentation.html)

---

## Quick Navigation & Presentation Instructions

1. **How to Launch the Interactive Presentation:**
   - Double-click [`FixLink_Presentation.html`](./FixLink_Presentation.html) to open it in Google Chrome, Microsoft Edge, Firefox, or Safari.
   - Alternatively, right-click `FixLink_Presentation.html` and choose **Open with > Chrome / Edge**.
2. **Keyboard Shortcuts During Defense:**
   - **`Right Arrow` / `Space` / `Page Down`:** Advance to next slide.
   - **`Left Arrow` / `Page Up`:** Go to previous slide.
   - **`N`:** Toggle live **Speaker Notes** drawer (contains your exact verbal script).
   - **`O`:** Toggle **Slide Overview & Index** modal to jump to any slide instantly.
   - **`F`:** Toggle **Fullscreen Presentation Mode**.
   - **`Ctrl + P` (or click "PDF / Print"):** Automatically formats all 15 slides into a clean landscape PDF slide deck for academic submission or printout.

---

## Slide-by-Slide Defense Content & Verbal Scripts

---

### Slide 01: Title Slide
- **Slide Title:** FixLink – Household Repair Service Platform
- **Subtitle:** Connecting Customers with Skilled Local Service Providers
- **Metadata Fields:**
  - *Candidate:* [Your Name] (ID: [Your Student ID])
  - *Department:* Department of Computer Science & Engineering
  - *Institution:* [University Name]
  - *Academic Supervisor / Advisor:* [Advisor Name]
  - *Defense Date:* March 2026
- **Visual Design:** Sleek blue-and-white academic branding with FixLink gradient logo, capstone badge, and structured metadata cards.

#### 🎤 Speaker Notes (What to say out loud):
> *"Honorable committee members, esteemed advisor, and members of the faculty: Good morning. Today, I am proud to present my senior mobile application project titled **FixLink – Household Repair Service Platform**.*  
> *FixLink is an on-demand, mobile-first marketplace built to resolve a persistent everyday challenge: connecting everyday households with vetted, skilled local service providers with transparent pricing and real-time coordination."*

---

### Slide 02: Introduction & Context
- **Slide Title:** Introduction
- **Subtitle:** The rapid evolution of on-demand home service marketplaces
- **Key Points:**
  - **Everyday Reality:** Household infrastructure (plumbing, electrical wiring, HVAC, appliances) inevitably breaks down and requires rapid intervention.
  - **Traditional Inefficiencies:** Homeowners rely on fragmented word-of-mouth or paper flyers with zero credential verification.
  - **The FixLink Digital Solution:** A centralized mobile platform that organizes informal labor into a reliable on-demand digital economy.
  - **Core Value Proposition:** Speed of matching, competitive pricing, and verifiable trust.

#### 🎤 Speaker Notes:
> *"To establish the context of our research and implementation: household maintenance is a universal, recurring necessity. Whether a homeowner faces a burst water pipe or a dangerous electrical circuit breaker failure, urgent help is required.*  
> *However, the traditional process of locating a qualified technician is fragmented, opaque, and inefficient. Homeowners must cold-call unfamiliar contacts with no insight into their trustworthiness or fair pricing.*  
> *FixLink modernizes this domain by providing a digital intermediary where requests, quotes, and service delivery occur seamlessly within a mobile application."*

---

### Slide 03: Problem Statement
- **Slide Title:** Problem Statement
- **Subtitle:** Four major friction points in conventional household repair arrangements
- **Key Points (The 4 Core Dilemmas):**
  1. **Difficulty Finding Trusted Technicians:** High search effort with no background checks, certified trade credentials, or security guarantees.
  2. **Information Asymmetry:** Customers lack visibility into provider work history, verified qualifications, and authentic past performance.
  3. **Price Haggling & Unclear Communication:** Unstandardized pricing leads to arbitrary overcharging, without written records or quotes.
  4. **Absence of Tracking & Recourse:** No digital audit trail during job execution, and no mechanism to review or hold technicians accountable.

#### 🎤 Speaker Notes:
> *"Through our domain analysis, we identified four fundamental pain points:*  
> *First, **finding trusted technicians** is difficult and carries safety risks.*  
> *Second, **information asymmetry** leaves customers in the dark regarding a technician's true skill and reliability.*  
> *Third, **pricing and communication friction** is widespread; without standardized quotes, overcharging is rampant.*  
> *Finally, there is **zero tracking or accountability**. Once a technician leaves, if the repair fails the next day, the customer has no recourse.*  
> *These four challenges formed the core requirements for FixLink."*

---

### Slide 04: Project Objectives
- **Slide Title:** Project Objectives
- **Subtitle:** Measurable software engineering deliverables designed to solve domain pain points
- **Key Points (6 Core Goals):**
  1. **Connect Customers & Technicians:** Engineer a cross-platform mobile application uniting both sides of the repair economy.
  2. **Streamline Service Requests:** Provide structured posting with category hierarchies, issue descriptions, and scheduling.
  3. **Dynamic Bidding Engine:** Facilitate transparent quotation submissions where multiple technicians can bid on a single request.
  4. **Duplex In-App Chat:** Embed real-time WebSocket communication for secure, in-app scope clarification.
  5. **Event-Driven Notifications:** Implement real-time alerts for bid receipts, status changes, and incoming messages.
  6. **Verified Ratings & Reviews:** Build a two-way feedback system strictly tied to completed jobs.

#### 🎤 Speaker Notes:
> *"To systematically resolve these problems, we formulated six concrete project objectives:*  
> *First, build an accessible mobile client that seamlessly connects both stakeholders.*  
> *Second, simplify how requests are published using structured categories and fault parameters.*  
> *Third, empower fair market pricing through a competitive bidding engine.*  
> *Fourth, eliminate third-party phone messaging by embedding real-time chat directly into the app.*  
> *Fifth, keep both parties synchronized using real-time notification events.*  
> *And sixth, enforce service quality through a verified rating and review ecosystem."*

---

### Slide 05: Target Users & Personas
- **Slide Title:** Target Users
- **Subtitle:** Three core user personas driving the FixLink service platform
- **Key Points:**
  - **Service Seekers (Customers):** Homeowners, apartment tenants, and property managers seeking fast, vetted assistance with fair pricing and progress tracking.
  - **Service Providers (Technicians):** Independent electricians, plumbers, carpenters, and appliance mechanics seeking steady local job leads without costly advertising.
  - **System Administrator:** Platform operators managing user verification, catalog taxonomy, review integrity, and operational health.

#### 🎤 Speaker Notes:
> *"FixLink caters to three primary user roles:*  
> *Our **Customers** need prompt, reliable help without phone tag, and value fair market pricing through quotes.*  
> *Our **Service Providers** are skilled tradespeople who want consistent, localized job opportunities without paying for expensive marketing.*  
> *Finally, our **System Administrator** operates from a web dashboard to verify technician credentials, regulate categories, arbitrate disputes, and monitor platform health."*

---

### Slide 06: Proposed Solution & Conceptual Flow
- **Slide Title:** Proposed Solution
- **Subtitle:** A centralized digital intermediary transforming informal repairs into a verified workflow
- **Visual Diagram:**
  ```
  [ Customer ] ──( 1. Job Request )──> [ FixLink Platform ] ──( 2. Match Alert )──> [ Technician ]
  [ Customer ] <──( 4. Accept Bid )──── [ Real-Time Engine ] <──( 3. Send Quote )──── [ Technician ]
  [ Customer ] <═══════════( 5. In-App Chat & Status Tracking )════════════════════> [ Technician ]
  [ Customer ] ──( 6. Rate & Complete )─> [ Trust Database ] <──( 7. Reputation )── [ Technician ]
  ```
- **Key Points:**
  - **Marketplace Facilitator:** Operates as a double-sided platform managing matching, quoting, and verification.
  - **Algorithmic Broadcast:** Distributes requests to qualified technicians filtered by skill category and location.
  - **Transparent Negotiation:** Replaces verbal guesswork with written quotes and verifiable milestones.

#### 🎤 Speaker Notes:
> *"Here we illustrate the conceptual paradigm of FixLink. Rather than direct, unmonitored communication, FixLink sits as a trusted digital mediator.*  
> *When a customer submits a service request, the platform broadcasts the opportunity to matching providers.*  
> *Providers inspect the job and return written quotes. The customer selects the best bid based on price, timeline, and provider reputation.*  
> *All communication, status transitions, and reviews remain tracked within the platform."*

---

### Slide 07: Main Features & Functional Modules
- **Slide Title:** Main Features
- **Subtitle:** Comprehensive functional modules engineered within the mobile platform
- **Key Points (10 Core Modules):**
  - *Authentication & Authorization:* JWT-based session security and role separation.
  - *Service Taxonomy:* Categorized services (plumbing, electrical, appliances, painting, carpentry) and sub-services.
  - *Service Requests:* Creation of detailed job listings with schedules and photos.
  - *Provider Search & Filtering:* Category discovery, ratings, and skill exploration.
  - *Bidding & Quotations:* Dynamic proposal submission and customer acceptance.
  - *Real-Time Chat:* Instant two-way messaging powered by Socket.io.
  - *Notification Center:* Alerts for bids, message delivery, and job updates.
  - *Order & Task Tracking:* Real-time status pipeline: `Pending` ➔ `In-Progress` ➔ `Completed`.
  - *Verified Reviews:* Star ratings and written reviews locked to finished orders.
  - *Profile Management:* Portfolio galleries, trade certifications, bio, and operational stats.

#### 🎤 Speaker Notes:
> *"FixLink encompasses ten major software modules.*  
> *From a functional perspective, they cover the full lifecycle: from secure JWT-based authentication and category browsing, to dynamic request creation and bidding.*  
> *For engagement and fulfillment, we integrated Socket.io duplex chat, automated notifications, active task order tracking, and a verified rating system to protect platform integrity."*

---

### Slide 08: Customer Workflow
- **Slide Title:** Customer Workflow
- **Subtitle:** The eight-stage end-to-end journey of a household service seeker
- **Visual Progression (8 Steps):**
  1. **Register / Login:** Secure onboarding and role verification.
  2. **Browse & Select:** Choose repair category and specific sub-service.
  3. **Post Request:** Specify issue details, timing, and attach photos.
  4. **Receive Quotes:** Review competitive bids submitted by local technicians.
  5. **Hire Provider:** Compare price and rating, then accept the preferred quote.
  6. **Chat & Track:** Coordinate via real-time chat and follow work milestones.
  7. **Inspect & Complete:** Verify completed work on-site.
  8. **Rate & Review:** Submit 1–5 star rating and feedback to build the community reputation.

#### 🎤 Speaker Notes:
> *"Slide 8 depicts the end-to-end user experience for a customer in eight distinct stages.*  
> *Notice how the process shields the customer from uncertainty: after posting a job, technicians compete for the work with transparent quotes.*  
> *Once hired, the customer can chat in real time, monitor progress, verify completion, and leave a review.*  
> *This structure removes the traditional anxiety associated with hiring contractors."*

---

### Slide 09: Service Provider Workflow
- **Slide Title:** Service Provider Workflow
- **Subtitle:** Structured acquisition and delivery cycle for independent service professionals
- **Visual Progression (8 Steps):**
  1. **Register & Verify:** Create technician account with credentials and experience.
  2. **Configure Skills:** Select trade specialties and coverage areas.
  3. **Receive Alerts:** Instant notification when a relevant local job is posted.
  4. **Inspect Job Scope:** Examine customer issue descriptions and photos.
  5. **Submit Quote:** Send a competitive price bid and estimated duration.
  6. **Coordinate via Chat:** Discuss requirements and confirm arrival time.
  7. **Execute Service:** Perform on-site repair and mark job completed.
  8. **Earn & Build Reputation:** Receive customer rating and boost profile ranking.

#### 🎤 Speaker Notes:
> *"Slide 9 shows the workflow from the service provider's viewpoint.*  
> *Technicians select their trade specialties upon onboarding. Whenever a matching job is posted in their area, they receive an instant notification.*  
> *They inspect the scope, submit a bid, and upon selection, communicate directly with the customer through the in-app chat.*  
> *Completing the job successfully yields verified ratings, which naturally attracts more high-value clients."*

---

### Slide 10: System Architecture
- **Slide Title:** System Architecture
- **Subtitle:** Multi-tier decoupled stack utilizing React Native, Node.js/Express, and MongoDB
- **Architecture Layers:**
  - **Client Presentation Layer:**
    - Mobile Application: React Native + Expo (cross-platform iOS & Android).
    - Web Admin Console: React.js + Vite (single-page management application).
  - **Network & API Layer:**
    - RESTful API over HTTPS for transactional operations.
    - WebSockets (Socket.io) for real-time duplex chat and instant notifications.
  - **Application Server Layer:**
    - Node.js + Express.js backend with Model-View-Controller (MVC) pattern.
    - JWT security middleware, bcrypt password hashing, input validation.
  - **Data & Media Layer:**
    - MongoDB Atlas: Document database utilizing Mongoose ODM.
    - Cloudinary: Cloud CDN storage for user avatars and job photos.

#### 🎤 Speaker Notes:
> *"Our technical architecture follows a modular, three-tier decoupled paradigm:*  
> *The **Client Layer** consists of a React Native / Expo mobile application supporting both iOS and Android, accompanied by a React-based web dashboard for administrators.*  
> *The **Server Layer** is driven by Node.js and Express. It serves RESTful API endpoints for standard transactions while maintaining persistent Socket.io connections for low-latency chat and event delivery.*  
> *In the **Storage Layer**, MongoDB handles unstructured and relational document collections via Mongoose, while Cloudinary provides optimized CDN storage for media assets."*

---

### Slide 11: Database Design & Relational Schema
- **Slide Title:** Database Design & Data Entities
- **Subtitle:** Normalized Mongoose schemas illustrating primary collections and relational references
- **Key Collections & Schemas:**
  - `User`: `_id`, `name`, `email`, `passwordHash`, `role` (Customer/Provider/Admin), `skills`, `ratingAverage`.
  - `Service`: `_id`, `title`, `description`, `iconUrl`, `subServices[]`, `basePrice`, `isActive`.
  - `ServiceRequest` (Job): `_id`, `customerRef`, `serviceRef`, `title`, `description`, `status`, `location`, `scheduledDate`.
  - `Bid` (Quote): `_id`, `jobRef`, `providerRef`, `proposedPrice`, `noteMessage`, `status`.
  - `Order` (Task): `_id`, `jobRef`, `acceptedBidRef`, `customerRef`, `providerRef`, `agreedCost`, `status`.
  - `Message`: `_id`, `senderRef`, `receiverRef`, `orderRef`, `text`, `attachments[]`, `timestamp`.
  - `Notification`: `_id`, `recipientRef`, `title`, `body`, `type`, `readStatus`, `targetId`.
  - `Review`: `_id`, `orderRef`, `customerRef`, `providerRef`, `rating` (1–5), `comment`, `createdAt`.

#### 🎤 Speaker Notes:
> *"Here we present the database architecture designed in MongoDB using Mongoose ODM.*  
> *Although MongoDB is a NoSQL document database, our data model enforces strict referential integrity between collections.*  
> *For example, an **Order** binds together the original **ServiceRequest**, the accepted **Bid**, the **Customer**, and the **Provider**.*  
> *Crucially, **Reviews** cannot exist independently; they require an active reference to a verified, completed Order, ensuring ratings cannot be fabricated."*

---

### Slide 12: Admin Dashboard & Operations
- **Slide Title:** Admin Dashboard & Operations
- **Subtitle:** Centralized portal for platform moderation, analytics, and service management
- **Key Modules & Operational Controls:**
  - **User Management:** Verify technician trade licenses, review complaints, and toggle account statuses.
  - **Service Catalog Management:** Add new categories, edit sub-services, and adjust baseline pricing.
  - **Order & Job Oversight:** Audit active contracts, inspect disputed bids, and arbitrate conflicts.
  - **Review Moderation:** Monitor reviews to flag hate speech, fake content, or abusive behavior.
  - **Real-Time KPI Dashboard:** High-level metrics tracking total users, active requests, and service completion ratios.

#### 🎤 Speaker Notes:
> *"Slide 12 covers the administrative web application.*  
> *A two-sided marketplace requires proactive governance. The admin console allows operators to manage user verification, adjust the service taxonomy dynamically, audit orders, and moderate reviews.*  
> *The analytics dashboard provides real-time visibility into operational KPIs, including active jobs, user growth, and service completion rates."*

---

### Slide 13: User Interface Showcase
- **Slide Title:** User Interface & Screen Showcase
- **Subtitle:** Intuitive, mobile-first design built with React Native and modern visual hierarchy
- **Key Screen Flows:**
  1. **Home Screen:** Quick service search, category grid, dynamic promotional banners.
  2. **Service Catalog:** Filterable list of trade disciplines and sub-services.
  3. **Provider Profile:** Badges, verified reviews, star breakdown, and portfolio.
  4. **Available Jobs Board:** Technician feed displaying local leads with budget and urgency tags.
  5. **Orders & Tasks View:** Tabbed navigation tracking `Pending`, `Active`, and `Completed` jobs.
  6. **In-App Chat:** Real-time conversational interface with message status and timestamps.
  7. **User Profile & Settings:** Credentials, preferences, role switching, and session management.
  8. **Admin Portal:** Desktop dashboard layout with summary cards and data tables.

#### 🎤 Speaker Notes:
> *"This slide showcases the user interface across eight primary application screens.*  
> *Our design emphasizes clear visual hierarchy, accessible contrast, and low cognitive overhead.*  
> *Whether a homeowner is browsing categories or a technician is submitting a bid from the jobs board, key actions are highlighted with consistent visual cues and responsive feedback."*

---

### Slide 14: Testing & Evaluation Results
- **Slide Title:** Testing & Evaluation Results
- **Subtitle:** Rigorous functional and integration verification of primary application workflows
- **Evaluation Matrix:**
  - *Authentication:* JWT token verification, bcrypt hashing, unauthorized route rejection ➔ **PASS**
  - *Service Request Lifecycle:* Job creation, category association, broadcasting ➔ **PASS**
  - *Provider Bidding:* Quote submission, input validation, bid selection, order generation ➔ **PASS**
  - *Real-Time Chat:* Socket.io message emission, delivery latency, database persistence ➔ **PASS**
  - *Notification Dispatch:* Event triggers, badge increments, unread synchronization ➔ **PASS**
  - *Rating & Review Calculation:* Score submission, dynamic average recalculation ➔ **PASS**
- **Conclusion:** 100% core test cases passed without regression or data inconsistency.

#### 🎤 Speaker Notes:
> *"We conducted comprehensive testing across all critical functional modules.*  
> *We verified edge cases such as token expiration, concurrent bid submissions on a single job, WebSocket reconnection resilience, and dynamic rating recalculations.*  
> *All test suites completed with a 100% pass rate, confirming system reliability, data consistency, and robust error handling."*

---

### Slide 15: Conclusion & Future Improvements
- **Slide Title:** Conclusion & Future Improvements
- **Subtitle:** Platform impact and continuous engineering roadmap
- **Project Achievements:**
  - Successfully built and tested a full-stack, cross-platform mobile marketplace.
  - Eliminated search friction, arbitrary pricing, and lack of accountability in home repairs.
  - Validated real-time bidirectional communication and decoupled multi-tier architecture.
- **Future Roadmap:**
  1. **Integrated In-App Escrow Payments:** Stripe/PayPal integration holding funds until customer sign-off.
  2. **Real-Time GPS Tracking:** Live map tracking of en-route technicians via Google Maps/Mapbox.
  3. **AI-Powered Diagnostics:** Computer vision analysis of uploaded damage photos for automated cost estimation.
  4. **Enterprise Cloud Deployment:** Containerization via Docker, Kubernetes cluster orchestration, and automated CI/CD pipelines.

#### 🎤 Speaker Notes:
> *"In conclusion, FixLink demonstrates how modern mobile and web technologies can digitize and elevate an informal, fragmented service industry.*  
> *We have delivered a complete, validated prototype that solves real pain points for both homeowners and skilled technicians.*  
> *Looking ahead, our roadmap includes in-app escrow payments, live GPS tracking of arriving technicians, and AI-driven damage assessment.*  
> *Thank you very much for your time and guidance. I welcome your questions and feedback."*

---

## Defense Committee Anticipated Q&A & Winning Answers

### Q1: Why did you choose MongoDB instead of a traditional relational database (like PostgreSQL or MySQL)?
> **Model Answer:**  
> *"We chose MongoDB for three key reasons: First, our data entities have dynamic attributes—for example, different service categories have varying metadata parameters (e.g., plumbing has pipe specifications, while electrical has voltage requirements). MongoDB's flexible schema handles this without complex join tables. Second, JSON-native document storage aligns naturally with our Node.js and React Native JavaScript ecosystem, avoiding Object-Relational Impedance Mismatch. Third, MongoDB supports horizontal scaling (sharding) and geospatial indexing, which will be essential when we roll out location-based technician dispatching."*

### Q2: How does the system handle real-time chat if a user loses their internet connection?
> **Model Answer:**  
> *"Our chat system uses Socket.io with an HTTP REST fallback. When a device temporarily disconnects, Socket.io buffers events and attempts automatic reconnection. Furthermore, every message emitted over the socket is simultaneously persisted in MongoDB via our Express API. When the client reconnects, the application performs a query for messages timestamped after the last received message ID, guaranteeing no message loss."*

### Q3: What prevents fraudulent reviews or competitors leaving 1-star ratings?
> **Model Answer:**  
> *"We implemented a closed-loop review policy. In our database schema, the `Review` collection requires a valid `orderId`. An order can only exist if a service request was published, a bid was accepted, and both parties marked the order as `Completed`. Unregistered users or individuals without a confirmed transaction cannot generate reviews. Additionally, administrators have moderation tools to investigate and flag suspicious patterns."*

### Q4: How do you prevent race conditions if multiple technicians accept or bid simultaneously?
> **Model Answer:**  
> *"Multiple technicians are encouraged to submit bids simultaneously since FixLink is a competitive bidding platform. When the customer accepts a bid, we use atomic operations in MongoDB (`findOneAndUpdate` with status condition `status: 'Open'`) to transition the job to `'Assigned'`. Any subsequent attempts to accept another bid on that job fail with a concurrency error, preventing duplicate order generation."*

### Q5: Why React Native instead of native iOS (Swift) and Android (Kotlin)?
> **Model Answer:**  
> *"React Native with Expo enabled a single unified codebase for both iOS and Android, drastically cutting development and maintenance overhead while still delivering near-native UI performance through native bridging. For a startup or capstone marketplace platform where feature parity across platforms is critical, React Native provides the optimal balance of speed, code reusability (over 85%), and user experience."*
