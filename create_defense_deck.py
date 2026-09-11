import os
import sys
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.enum.text import PP_ALIGN
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_SHAPE

def build_presentation():
    prs = Presentation()
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)
    blank_layout = prs.slide_layouts[6]

    # Color Palette: Modern Ethiopian Startup / Tech Aesthetic
    C_NAVY = RGBColor(0, 43, 73)        # #002B49
    C_BLUE = RGBColor(0, 82, 204)       # #0052CC
    C_ORANGE = RGBColor(255, 107, 0)    # #FF6B00
    C_DARK = RGBColor(15, 23, 42)       # #0F172A
    C_GRAY = RGBColor(100, 116, 139)    # #64748B
    C_LIGHT = RGBColor(248, 250, 252)   # #F8FAFC
    C_WHITE = RGBColor(255, 255, 255)
    C_BORDER = RGBColor(226, 232, 240)  # #E2E8F0
    C_GREEN = RGBColor(16, 185, 129)    # #10B981
    C_TEAL = RGBColor(13, 148, 136)     # #0D9488

    logo_mark_path = os.path.abspath("mobile/assets/images/logos/bete_logo_mark.png")
    logo_horiz_path = os.path.abspath("mobile/assets/images/logos/bete_logo_horizontal.png")
    hero_tech_path = os.path.abspath("mobile/assets/images/hero-technician.jpg")
    about_tech_path = os.path.abspath("website/public/images/about-technician.jpg")

    has_logo_mark = os.path.exists(logo_mark_path)
    has_logo_horiz = os.path.exists(logo_horiz_path)
    has_hero_tech = os.path.exists(hero_tech_path)
    has_about_tech = os.path.exists(about_tech_path)

    def set_notes(slide, text):
        try:
            ns = slide.notes_slide
            tf = ns.notes_text_frame
            tf.text = text
        except:
            pass

    def add_header(slide, num, title, subtitle):
        # Subtle logo on top left
        if has_logo_mark:
            slide.shapes.add_picture(logo_mark_path, Inches(0.8), Inches(0.4), height=Inches(0.65))

        tb = slide.shapes.add_textbox(Inches(1.6), Inches(0.35), Inches(10.8), Inches(0.85))
        tf = tb.text_frame
        tf.word_wrap = True
        tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0

        p = tf.paragraphs[0]
        r1 = p.add_run()
        r1.text = f"{num:02d}  "
        r1.font.size = Pt(14)
        r1.font.bold = True
        r1.font.color.rgb = C_ORANGE

        r2 = p.add_run()
        r2.text = title
        r2.font.size = Pt(24)
        r2.font.bold = True
        r2.font.color.rgb = C_NAVY

        if subtitle:
            p2 = tf.add_paragraph()
            p2.text = subtitle
            p2.font.size = Pt(12)
            p2.font.color.rgb = C_GRAY

    # ==========================================
    # SLIDE 1: Title Slide
    # ==========================================
    s1 = prs.slides.add_slide(blank_layout)
    # Left deep navy block
    left_bg = s1.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, Inches(7.2), Inches(7.5))
    left_bg.fill.solid()
    left_bg.fill.fore_color.rgb = C_NAVY
    left_bg.line.fill.background()

    # Right soft light block
    right_bg = s1.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(7.2), 0, Inches(6.133), Inches(7.5))
    right_bg.fill.solid()
    right_bg.fill.fore_color.rgb = C_LIGHT
    right_bg.line.fill.background()

    # Left content
    tb1 = s1.shapes.add_textbox(Inches(0.8), Inches(1.1), Inches(5.8), Inches(5.6))
    tf1 = tb1.text_frame
    tf1.word_wrap = True

    p = tf1.paragraphs[0]
    p.text = "Bete (ቤቴ)"
    p.font.size = Pt(36)
    p.font.bold = True
    p.font.color.rgb = C_ORANGE

    p = tf1.add_paragraph()
    p.text = "Household Repair & Maintenance Service"
    p.font.size = Pt(22)
    p.font.bold = True
    p.font.color.rgb = C_WHITE
    p.space_before = Pt(8)

    p = tf1.add_paragraph()
    p.text = "“Reliable Household Repairs in Ethiopia, Made Simple”"
    p.font.size = Pt(14)
    p.font.italic = True
    p.font.color.rgb = RGBColor(186, 230, 253)
    p.space_before = Pt(10)

    p = tf1.add_paragraph()
    p.text = "• Academic Degree: B.Sc. in Computer Science / Software Engineering\n• Presentation: Senior Project Defense\n• Target Region: Addis Ababa, Ethiopia (11 Subcities)\n• Technology: React Native • TypeScript • Node.js • Express • MongoDB\n• Academic Year: 2026"
    p.font.size = Pt(11)
    p.font.color.rgb = RGBColor(203, 213, 225)
    p.space_before = Pt(20)

    # Right Card Preview
    rc = s1.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(8.0), Inches(1.1), Inches(4.5), Inches(5.3))
    rc.fill.solid()
    rc.fill.fore_color.rgb = C_WHITE
    rc.line.color.rgb = C_BORDER

    if has_logo_mark:
        s1.shapes.add_picture(logo_mark_path, Inches(9.3), Inches(1.4), height=Inches(1.2))

    rtb = s1.shapes.add_textbox(Inches(8.2), Inches(2.8), Inches(4.1), Inches(3.4))
    rtf = rtb.text_frame
    rtf.word_wrap = True
    p = rtf.paragraphs[0]
    p.text = "Bete Ethiopian Ecosystem"
    p.font.size = Pt(16)
    p.font.bold = True
    p.font.color.rgb = C_NAVY
    p.alignment = PP_ALIGN.CENTER

    services = [
        "🔧  Plumbing & Water Tanks",
        "⚡  Electrical & Stabilizers",
        "💧  Water Pumps & Float Valves",
        "🔌  Appliances & Electronics",
        "🧱  Carpentry & Tile Finishing"
    ]
    for s in services:
        p = rtf.add_paragraph()
        p.text = s
        p.font.size = Pt(12)
        p.font.color.rgb = C_DARK
        p.space_before = Pt(8)

    set_notes(s1, "Honorable committee members, advisor, and faculty: Welcome to the project defense for 'Bete – Household Repair & Maintenance Service'. Bete is a modern mobile platform engineered to bring trust, safety, and price transparency to Ethiopia's domestic repair market.")

    # ==========================================
    # SLIDE 2: Introduction
    # ==========================================
    s2 = prs.slides.add_slide(blank_layout)
    add_header(s2, 2, "Introduction", "Contextualizing domestic repair needs in urban Ethiopia")

    cards_s2 = [
        ("Recurring Household Reality", "Plumbing leaks, water pump failures, and electrical faults inevitably occur in every home, requiring rapid and trustworthy intervention.", "🏠"),
        ("Informal Street Sourcing", "In Addis Ababa, finding technicians currently relies on street wall graffiti, word-of-mouth, or unvetted numbers with zero safety checks.", "⚠️"),
        ("The Bete Platform Solution", "A digital marketplace organizing informal artisan labor into a verified, mobile-first on-demand ecosystem.", "📱"),
        ("Ethiopian Tech Readiness", "Rising smartphone penetration, digital maps, and mobile money adoption make Ethiopia ideal for formalizing home services.", "📈")
    ]
    for i, (title, desc, icon) in enumerate(cards_s2):
        x = Inches(0.8 + i * 2.95)
        c = s2.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, x, Inches(1.7), Inches(2.75), Inches(4.9))
        c.fill.solid()
        c.fill.fore_color.rgb = C_WHITE
        c.line.color.rgb = C_BLUE if i % 2 == 0 else C_ORANGE

        tb = s2.shapes.add_textbox(x + Inches(0.2), Inches(1.9), Inches(2.35), Inches(4.4))
        tf = tb.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        p.text = f"{icon}\n{title}"
        p.font.size = Pt(16)
        p.font.bold = True
        p.font.color.rgb = C_NAVY

        p2 = tf.add_paragraph()
        p2.text = desc
        p2.font.size = Pt(12)
        p2.font.color.rgb = C_DARK
        p2.space_before = Pt(10)

    set_notes(s2, "Household maintenance is a universal necessity. In urban Ethiopia, finding a technician is manual and informal. Bete modernizes this sector into an efficient on-demand application.")

    # ==========================================
    # SLIDE 3: Problem Statement
    # ==========================================
    s3 = prs.slides.add_slide(blank_layout)
    add_header(s3, 3, "Problem Statement", "Four primary structural barriers in the current traditional market")

    probs = [
        ("Informal & Unvetted Market", [
            "• Zero background or criminal checks on technicians",
            "• Inviting unknown strangers into private residences poses safety risks",
            "• No institutional identity verification"
        ], "🚨"),
        ("Arbitrary & Inflated Pricing", [
            "• Lack of standardized pricing cards or diagnostic baselines",
            "• Technicians charge inflated fees on site during emergencies",
            "• Uncomfortable bargaining and unexpected cost escalation"
        ], "💰"),
        ("Scheduling Inefficiencies", [
            "• Customers spend hours making repeated telephone calls",
            "• Frequent technician no-shows with zero advance notice",
            "• Inefficient geographic routing across Addis Ababa"
        ], "⏳"),
        ("Zero Workmanship Guarantee", [
            "• Cash payments leave no formal receipts or transaction audit",
            "• No warranty when completed repairs fail shortly after",
            "• Total lack of dispute mediation or customer recourse"
        ], "❌")
    ]
    for i, (title, points, icon) in enumerate(probs):
        col = i % 2
        row = i // 2
        x = Inches(0.8 + col * 5.9)
        y = Inches(1.7 + row * 2.55)

        c = s3.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, x, y, Inches(5.6), Inches(2.35))
        c.fill.solid()
        c.fill.fore_color.rgb = C_LIGHT
        c.line.color.rgb = C_BORDER

        tb = s3.shapes.add_textbox(x + Inches(0.25), y + Inches(0.15), Inches(5.1), Inches(2.0))
        tf = tb.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        p.text = f"{icon}  {title}"
        p.font.size = Pt(16)
        p.font.bold = True
        p.font.color.rgb = C_NAVY

        for pt in points:
            p = tf.add_paragraph()
            p.text = pt
            p.font.size = Pt(11)
            p.font.color.rgb = C_DARK
            p.space_before = Pt(4)

    set_notes(s3, "Our problem analysis revealed four critical barriers: safety risks from unvetted artisans, arbitrary pricing, severe scheduling friction, and zero accountability when repairs fail.")

    # ==========================================
    # SLIDE 4: Objectives
    # ==========================================
    s4 = prs.slides.add_slide(blank_layout)
    add_header(s4, 4, "Project Objectives", "Concrete engineering and socioeconomic goals achieved by Bete")

    objs = [
        ("Seamless Matching", "Connect customers and qualified artisans via geolocation across Addis Ababa's 11 subcities.", "🔗"),
        ("Rapid Job Dispatch", "Enable multi-media request submission (photos, audio) in under 2 minutes.", "⚡"),
        ("Vetted Digital Trust", "Enforce Kebele ID and TVET trade certificate verification before technicians receive jobs.", "🛡️"),
        ("Price Transparency", "Implement a dynamic quotation bidding engine to eliminate arbitrary pricing.", "💵"),
        ("Tamper-Proof Reviews", "Ensure reviews and 1-5 star ratings can only be submitted for completed orders.", "⭐"),
        ("Artisan Empowerment", "Equip informal tradespeople with digital identity, steady jobs, and fair income.", "📈")
    ]
    for i, (title, desc, icon) in enumerate(objs):
        col = i % 3
        row = i // 3
        x = Inches(0.8 + col * 3.95)
        y = Inches(1.7 + row * 2.55)

        c = s4.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, x, y, Inches(3.75), Inches(2.35))
        c.fill.solid()
        c.fill.fore_color.rgb = C_WHITE
        c.line.color.rgb = C_BLUE if i % 2 == 0 else C_ORANGE

        tb = s4.shapes.add_textbox(x + Inches(0.2), y + Inches(0.15), Inches(3.35), Inches(2.0))
        tf = tb.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        p.text = f"{icon}  {title}"
        p.font.size = Pt(15)
        p.font.bold = True
        p.font.color.rgb = C_NAVY

        p2 = tf.add_paragraph()
        p2.text = desc
        p2.font.size = Pt(11)
        p2.font.color.rgb = C_DARK
        p2.space_before = Pt(6)

    set_notes(s4, "Bete accomplishes six clear objectives: location-based matching, rapid job submission, credential vetting, competitive bidding, tamper-proof reviews, and economic empowerment for artisans.")

    # ==========================================
    # SLIDE 5: Proposed Solution
    # ==========================================
    s5 = prs.slides.add_slide(blank_layout)
    add_header(s5, 5, "Proposed Solution", "A five-step unified mobile workflow for Ethiopian domestic maintenance")

    sol_steps = [
        ("01", "Select Service", "Browse 5 core categories and 16+ granular specialties tailored to local needs."),
        ("02", "Describe & Upload", "Specify problem details, attach photos or voice notes, and select subcity location."),
        ("03", "Receive Bids", "Nearby vetted technicians receive socket alerts and submit transparent price estimates."),
        ("04", "Chat & Schedule", "Review technician profiles and ratings, chat via in-app messenger, and book arrival."),
        ("05", "Complete & Rate", "Technician executes repair. Customer verifies quality, settles payment, and rates pro.")
    ]
    for i, (num, stitle, sdesc) in enumerate(sol_steps):
        x = Inches(0.8 + i * 2.38)
        c = s5.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, x, Inches(2.0), Inches(2.15), Inches(4.5))
        c.fill.solid()
        c.fill.fore_color.rgb = C_LIGHT
        c.line.color.rgb = C_BORDER

        tb = s5.shapes.add_textbox(x + Inches(0.15), Inches(2.2), Inches(1.85), Inches(4.1))
        tf = tb.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        p.text = f"Step {num}"
        p.font.size = Pt(16)
        p.font.bold = True
        p.font.color.rgb = C_ORANGE

        p2 = tf.add_paragraph()
        p2.text = stitle
        p2.font.size = Pt(15)
        p2.font.bold = True
        p2.font.color.rgb = C_NAVY
        p2.space_before = Pt(8)

        p3 = tf.add_paragraph()
        p3.text = sdesc
        p3.font.size = Pt(12)
        p3.font.color.rgb = C_DARK
        p3.space_before = Pt(10)

    set_notes(s5, "The proposed solution replaces random phone calls with a structured 5-step digital lifecycle: select service, upload photos, receive competitive bids, coordinate over in-app chat, and rate the completed job.")

    # ==========================================
    # SLIDE 6: Target Users
    # ==========================================
    s6 = prs.slides.add_slide(blank_layout)
    add_header(s6, 6, "Target Users & Stakeholders", "Three primary user roles interacting within the ecosystem")

    users = [
        ("Service Seekers (Customers)", "Homeowners, tenants, and small office managers in Addis Ababa.", [
            "• Urgent repair needs during emergencies",
            "• Values verified technician background & safety",
            "• Seeks upfront price clarity and quick quotes",
            "• Reviews technician credentials and past ratings"
        ], C_BLUE),
        ("Service Providers (Technicians)", "Skilled plumbers, electricians, carpenters, and appliance repairers.", [
            "• Independent artisans seeking steady jobs",
            "• Uploads Kebele ID & trade diploma for vetting",
            "• Receives instant alerts for nearby requests",
            "• Builds verified digital track record & income"
        ], C_ORANGE),
        ("Platform Administrator", "System operators managing quality control and regulatory compliance.", [
            "• Audits uploaded IDs and approves accounts",
            "• Manages trade categories and subservices",
            "• Arbitrates user disputes and customer complaints",
            "• Monitors platform analytics and performance KPIs"
        ], C_NAVY)
    ]
    for i, (title, subtitle, bullets, col) in enumerate(users):
        x = Inches(0.8 + i * 3.95)
        c = s6.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, x, Inches(1.7), Inches(3.75), Inches(4.9))
        c.fill.solid()
        c.fill.fore_color.rgb = C_WHITE
        c.line.color.rgb = col

        tb = s6.shapes.add_textbox(x + Inches(0.2), Inches(1.9), Inches(3.35), Inches(4.5))
        tf = tb.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        p.text = title
        p.font.size = Pt(16)
        p.font.bold = True
        p.font.color.rgb = col

        p2 = tf.add_paragraph()
        p2.text = subtitle
        p2.font.size = Pt(12)
        p2.font.color.rgb = C_DARK
        p2.space_before = Pt(6)

        for b in bullets:
            p = tf.add_paragraph()
            p.text = b
            p.font.size = Pt(11)
            p.font.color.rgb = C_GRAY
            p.space_before = Pt(6)

    set_notes(s6, "Bete accommodates three stakeholders: Customers who need fast repairs, Technicians who need dignified work, and Administrators who ensure compliance and quality.")

    # ==========================================
    # SLIDE 7: Main Features
    # ==========================================
    s7 = prs.slides.add_slide(blank_layout)
    add_header(s7, 7, "Main Features & Functional Modules", "Comprehensive capabilities built for customers and technicians")

    # Left: Customer Features
    c_card = s7.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(1.7), Inches(5.6), Inches(4.9))
    c_card.fill.solid()
    c_card.fill.fore_color.rgb = C_WHITE
    c_card.line.color.rgb = C_BLUE

    tb_c = s7.shapes.add_textbox(Inches(1.0), Inches(1.9), Inches(5.2), Inches(4.5))
    tf_c = tb_c.text_frame
    tf_c.word_wrap = True
    p = tf_c.paragraphs[0]
    p.text = "👤 Customer / Seeker Features"
    p.font.size = Pt(17)
    p.font.bold = True
    p.font.color.rgb = C_BLUE

    c_feats = [
        "• Service Catalog: 5 major categories and 16+ granular specialties",
        "• Multi-Media Job Posts: Photos, problem description, and subcity tags",
        "• Real-Time Chat: Direct communication with interested technicians",
        "• Live Order Tracking: Requested → Assigned → In-Progress → Completed",
        "• Verified Reviews: 1-5 star ratings tied strictly to completed jobs"
    ]
    for f in c_feats:
        p = tf_c.add_paragraph()
        p.text = f
        p.font.size = Pt(12)
        p.font.color.rgb = C_DARK
        p.space_before = Pt(8)

    # Right: Provider Features
    p_card = s7.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(6.8), Inches(1.7), Inches(5.7), Inches(4.9))
    p_card.fill.solid()
    p_card.fill.fore_color.rgb = C_WHITE
    p_card.line.color.rgb = C_ORANGE

    tb_p = s7.shapes.add_textbox(Inches(7.0), Inches(1.9), Inches(5.3), Inches(4.5))
    tf_p = tb_p.text_frame
    tf_p.word_wrap = True
    p = tf_p.paragraphs[0]
    p.text = "🛠️ Technician / Provider Features"
    p.font.size = Pt(17)
    p.font.bold = True
    p.font.color.rgb = C_ORANGE

    p_feats = [
        "• Profile & Onboarding: Upload Kebele ID and trade diploma for vetting",
        "• Subcity Selection: Filter requests by specific operational areas",
        "• Push Job Alerts: Real-time socket alerts for nearby matching work",
        "• Flexible Bidding: Submit competitive price quotes or accept direct jobs",
        "• Earnings & Portfolio: History of completed repairs and ratings"
    ]
    for f in p_feats:
        p = tf_p.add_paragraph()
        p.text = f
        p.font.size = Pt(12)
        p.font.color.rgb = C_DARK
        p.space_before = Pt(8)

    set_notes(s7, "Here are the primary features: customers enjoy photo uploads, bidding comparison, and live order tracking. Technicians can set their subcities, receive instant alerts, and build their reputation.")

    # ==========================================
    # SLIDE 8: System Workflow
    # ==========================================
    s8 = prs.slides.add_slide(blank_layout)
    add_header(s8, 8, "System Workflow & State Machine", "Lifecycle progression of a repair request from posting to completion")

    states = [
        ("Job Created", "Customer submits category, description, photos, and subcity location.", "OPEN FOR BIDS", C_BLUE),
        ("Bids Submitted", "Nearby vetted technicians review scope and send competitive price quotes.", "QUOTING", C_ORANGE),
        ("Technician Assigned", "Customer reviews bids, chats, and accepts preferred technician.", "ASSIGNED", C_NAVY),
        ("Work In Progress", "Technician arrives on site, performs diagnostic, and executes repair.", "ACTIVE", C_TEAL),
        ("Completed & Rated", "Customer validates repair, releases payment, and leaves verified review.", "CLOSED", C_GREEN)
    ]
    for i, (title, desc, badge, col) in enumerate(states):
        x = Inches(0.8 + i * 2.38)
        c = s8.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, x, Inches(2.0), Inches(2.15), Inches(4.5))
        c.fill.solid()
        c.fill.fore_color.rgb = C_WHITE
        c.line.color.rgb = col

        tb = s8.shapes.add_textbox(x + Inches(0.15), Inches(2.2), Inches(1.85), Inches(4.1))
        tf = tb.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        p.text = badge
        p.font.size = Pt(11)
        p.font.bold = True
        p.font.color.rgb = col

        p2 = tf.add_paragraph()
        p2.text = title
        p2.font.size = Pt(15)
        p2.font.bold = True
        p2.font.color.rgb = C_NAVY
        p2.space_before = Pt(8)

        p3 = tf.add_paragraph()
        p3.text = desc
        p3.font.size = Pt(12)
        p3.font.color.rgb = C_DARK
        p3.space_before = Pt(10)

    set_notes(s8, "The system workflow is managed through a strict state machine: Open → Quoting → Assigned → Active → Closed, preventing concurrency conflicts and ensuring clear status tracking.")

    # ==========================================
    # SLIDE 9: System Architecture
    # ==========================================
    s9 = prs.slides.add_slide(blank_layout)
    add_header(s9, 9, "System Architecture", "Decoupled multi-tier engineering topology")

    layers = [
        ("Client Layer", [
            "• Mobile: React Native (Expo Router v54)",
            "• Web Admin: React 19 + Vite Console",
            "• Strict TypeScript for type safety",
            "• Zustand for lightweight global state",
            "• Tailwind CSS NativeWind for responsive styling"
        ], C_BLUE),
        ("API & Gateway Layer", [
            "• Node.js (v20+ LTS runtime)",
            "• Express.js RESTful API endpoints",
            "• Socket.io bidirectional duplex events",
            "• JWT Authentication & bcrypt password hashing",
            "• Multer & Cloudinary media upload pipeline"
        ], C_NAVY),
        ("Persistence Layer", [
            "• MongoDB Atlas (Document NoSQL)",
            "• Mongoose ODM (Relational integrity)",
            "• Compound indexing on subcity & status",
            "• Cloud-hosted distributed backups",
            "• Resilient connection pooling"
        ], C_ORANGE)
    ]
    for i, (layer_title, items, col) in enumerate(layers):
        x = Inches(0.8 + i * 3.95)
        c = s9.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, x, Inches(1.7), Inches(3.75), Inches(4.9))
        c.fill.solid()
        c.fill.fore_color.rgb = C_WHITE
        c.line.color.rgb = col

        tb = s9.shapes.add_textbox(x + Inches(0.2), Inches(1.9), Inches(3.35), Inches(4.5))
        tf = tb.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        p.text = layer_title
        p.font.size = Pt(17)
        p.font.bold = True
        p.font.color.rgb = col

        for item in items:
            p = tf.add_paragraph()
            p.text = item
            p.font.size = Pt(12)
            p.font.color.rgb = C_DARK
            p.space_before = Pt(10)

    set_notes(s9, "The system architecture features three decoupled layers: React Native clients on the front end, an Express and Socket.io API layer for business logic and real-time events, and MongoDB Atlas for data persistence.")

    # ==========================================
    # SLIDE 10: UI/UX Design
    # ==========================================
    s10 = prs.slides.add_slide(blank_layout)
    add_header(s10, 10, "UI/UX Design System", "High-contrast mobile screens designed for speed and clarity")

    screens = [
        ("Home Screen", "home.tsx", "Subcity selector, service category cards, active jobs pill, verified pros.", "🏠"),
        ("Post a Job", "create-job.tsx", "Trade picker, description input, photo upload box, urgency toggles.", "📝"),
        ("Provider Detail", "provider-detail.tsx", "Verification badge, trade specialties, star ratings, customer reviews.", "⭐"),
        ("Live Chat", "message.tsx", "Socket.io real-time chat, price quotes, direct phone call dialer.", "💬"),
        ("Order History", "orders.tsx", "Lifecycle progress timeline, payment signoff, 5-star rating modal.", "📦")
    ]
    for i, (title, filename, desc, icon) in enumerate(screens):
        x = Inches(0.8 + i * 2.38)
        c = s10.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, x, Inches(1.7), Inches(2.15), Inches(4.9))
        c.fill.solid()
        c.fill.fore_color.rgb = C_WHITE
        c.line.color.rgb = C_BORDER

        # Screen mockup box
        mb = s10.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, x + Inches(0.15), Inches(1.9), Inches(1.85), Inches(1.8))
        mb.fill.solid()
        mb.fill.fore_color.rgb = C_LIGHT
        mb.line.color.rgb = C_BORDER

        tb = s10.shapes.add_textbox(x + Inches(0.2), Inches(2.1), Inches(1.75), Inches(1.4))
        tf = tb.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        p.text = f"{icon}\n{filename}"
        p.font.size = Pt(12)
        p.font.bold = True
        p.font.color.rgb = C_BLUE
        p.alignment = PP_ALIGN.CENTER

        tb2 = s10.shapes.add_textbox(x + Inches(0.15), Inches(3.9), Inches(1.85), Inches(2.5))
        tf2 = tb2.text_frame
        tf2.word_wrap = True
        p = tf2.paragraphs[0]
        p.text = title
        p.font.size = Pt(15)
        p.font.bold = True
        p.font.color.rgb = C_NAVY

        p2 = tf2.add_paragraph()
        p2.text = desc
        p2.font.size = Pt(11)
        p2.font.color.rgb = C_DARK
        p2.space_before = Pt(6)

    set_notes(s10, "Our UI/UX design follows mobile-first design principles: large touch targets, readable typography, and straightforward workflows to assist users in urgent household repair situations.")

    # ==========================================
    # SLIDE 11: Database Design
    # ==========================================
    s11 = prs.slides.add_slide(blank_layout)
    add_header(s11, 11, "Database Design & Schemas", "Mongoose document data model enforcing relational constraints")

    schemas = [
        ("Users", ["_id: ObjectId [PK]", "phone: String [Unique]", "role: 'customer'|'provider'", "fullName: String", "subcity: String"], C_BLUE),
        ("ProviderProfiles", ["_id: ObjectId [PK]", "userId: Ref(Users)", "skills: [String]", "kebeleIdUrl: String", "isVerified: Boolean"], C_NAVY),
        ("JobRequests", ["_id: ObjectId [PK]", "customerId: Ref(Users)", "category: String", "photos: [String]", "status: 'open'|'active'|'done'"], C_ORANGE),
        ("Bids", ["_id: ObjectId [PK]", "jobId: Ref(JobRequests)", "providerId: Ref(Users)", "amount: Number (ETB)", "status: 'pending'|'accepted'"], C_BLUE),
        ("Orders", ["_id: ObjectId [PK]", "jobId: Ref(JobRequests)", "providerId: Ref(Users)", "scheduledAt: Date", "status: 'active'|'completed'"], C_NAVY),
        ("Reviews", ["_id: ObjectId [PK]", "orderId: Ref(Orders)", "customerId: Ref(Users)", "providerId: Ref(Users)", "stars: Number (1-5)"], C_ORANGE)
    ]
    for i, (title, fields, col) in enumerate(schemas):
        col_idx = i % 3
        row_idx = i // 3
        x = Inches(0.8 + col_idx * 3.95)
        y = Inches(1.7 + row_idx * 2.55)

        box = s11.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, x, y, Inches(3.75), Inches(2.35))
        box.fill.solid()
        box.fill.fore_color.rgb = C_LIGHT
        box.line.color.rgb = col

        tb = s11.shapes.add_textbox(x + Inches(0.2), y + Inches(0.15), Inches(3.35), Inches(2.0))
        tf = tb.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        p.text = f"🗄️  {title}"
        p.font.size = Pt(14)
        p.font.bold = True
        p.font.color.rgb = col

        for fld in fields:
            p = tf.add_paragraph()
            p.text = fld
            p.font.size = Pt(10)
            p.font.color.rgb = C_DARK
            p.space_before = Pt(2)

    set_notes(s11, "The database design balances NoSQL document speed with relational integrity. Reviews are strictly bound to verified orders, eliminating fraudulent or unverified ratings.")

    # ==========================================
    # SLIDE 12: Technologies Used
    # ==========================================
    s12 = prs.slides.add_slide(blank_layout)
    add_header(s12, 12, "Technologies Used", "Industry-standard full-stack development tools and libraries")

    tech_groups = [
        ("Frontend Technologies", [
            "• React Native (Cross-platform iOS/Android)",
            "• Expo Router v54 (File-based navigation)",
            "• TypeScript (Strict static typing)",
            "• Zustand (Lightweight reactive store)",
            "• Tailwind CSS NativeWind (Utility styles)"
        ], C_BLUE),
        ("Backend & Middleware", [
            "• Node.js (Asynchronous JavaScript runtime)",
            "• Express.js (RESTful web services framework)",
            "• Socket.io (Bidirectional WebSocket events)",
            "• JSON Web Tokens (Stateless JWT auth)",
            "• bcrypt (Secure password hashing)"
        ], C_NAVY),
        ("Database & Dev Tools", [
            "• MongoDB Atlas (Cloud NoSQL database)",
            "• Mongoose (ODM data modeling)",
            "• Cloudinary / CDN (Media storage)",
            "• Postman & Expo Go (API & mobile testing)",
            "• Git & GitHub (Version control)"
        ], C_ORANGE)
    ]
    for i, (title, items, col) in enumerate(tech_groups):
        x = Inches(0.8 + i * 3.95)
        c = s12.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, x, Inches(1.7), Inches(3.75), Inches(4.9))
        c.fill.solid()
        c.fill.fore_color.rgb = C_WHITE
        c.line.color.rgb = col

        tb = s12.shapes.add_textbox(x + Inches(0.2), Inches(1.9), Inches(3.35), Inches(4.5))
        tf = tb.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        p.text = title
        p.font.size = Pt(16)
        p.font.bold = True
        p.font.color.rgb = col

        for itm in items:
            p = tf.add_paragraph()
            p.text = itm
            p.font.size = Pt(12)
            p.font.color.rgb = C_DARK
            p.space_before = Pt(10)

    set_notes(s12, "We adhered strictly to modern production technologies: React Native with TypeScript on mobile, Express and Socket.io on the backend, and MongoDB Atlas for database management.")

    # ==========================================
    # SLIDE 13: Role-Based Access Control (RBAC)
    # ==========================================
    s13 = prs.slides.add_slide(blank_layout)
    add_header(s13, 13, "Role-Based Access Control (RBAC)", "Securing customer, technician, and administrative operations")

    roles = [
        ("Customer Role", "Granted upon regular registration.", [
            "• Access to (customer-tabs)",
            "• Can create, edit, and cancel repair jobs",
            "• Can review incoming technician bids",
            "• Can chat and rate assigned technician",
            "• Cannot bid on other users' jobs"
        ], C_BLUE),
        ("Provider Role", "Requires ID & diploma upload.", [
            "• Access to (provider-tabs)",
            "• Can browse and bid on local repair requests",
            "• Access to technician earnings tracker",
            "• Account restricted until admin approves ID",
            "• Cannot post repair jobs as provider"
        ], C_ORANGE),
        ("Admin Role", "Restricted back-office operators.", [
            "• Access to Vite web management gateway",
            "• Full CRUD over categories and services",
            "• Can approve or reject technician Kebele IDs",
            "• Can arbitrate disputes and ban accounts",
            "• Access to operational analytics"
        ], C_NAVY)
    ]
    for i, (title, subtitle, bullets, col) in enumerate(roles):
        x = Inches(0.8 + i * 3.95)
        c = s13.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, x, Inches(1.7), Inches(3.75), Inches(4.9))
        c.fill.solid()
        c.fill.fore_color.rgb = C_WHITE
        c.line.color.rgb = col

        tb = s13.shapes.add_textbox(x + Inches(0.2), Inches(1.9), Inches(3.35), Inches(4.5))
        tf = tb.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        p.text = title
        p.font.size = Pt(16)
        p.font.bold = True
        p.font.color.rgb = col

        p2 = tf.add_paragraph()
        p2.text = subtitle
        p2.font.size = Pt(11)
        p2.font.color.rgb = C_GRAY
        p2.space_before = Pt(4)

        for b in bullets:
            p = tf.add_paragraph()
            p.text = b
            p.font.size = Pt(11)
            p.font.color.rgb = C_DARK
            p.space_before = Pt(8)

    set_notes(s13, "Role-Based Access Control is enforced at both API route and mobile navigation levels using JWT claims and Expo Router layout groups.")

    # ==========================================
    # SLIDE 14: Testing
    # ==========================================
    s14 = prs.slides.add_slide(blank_layout)
    add_header(s14, 14, "Testing Methodology", "Systematic quality assurance across all layers")

    tests = [
        ("Unit Testing", "Tested authentication controllers, input validators (phone formats), and bid calculation algorithms using automated test scripts.", "UNIT LEVEL", C_BLUE),
        ("API Integration Testing", "Verified REST endpoints (/api/auth, /api/jobs, /api/bids, /api/orders) with Postman across success and error edge cases.", "INTEGRATION", C_NAVY),
        ("Socket.io Concurrency", "Stress-tested real-time bid alert broadcasts and chat message delivery across multiple simulated concurrent devices.", "WEBSOCKETS", C_ORANGE),
        ("Device Compatibility", "Tested responsive rendering across various screen sizes on both Android devices (Samsung, Tecno) and iOS simulators.", "CROSS-PLATFORM", C_TEAL)
    ]
    for i, (title, desc, badge, col) in enumerate(tests):
        col_idx = i % 2
        row_idx = i // 2
        x = Inches(0.8 + col_idx * 5.9)
        y = Inches(1.7 + row_idx * 2.55)

        c = s14.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, x, y, Inches(5.6), Inches(2.35))
        c.fill.solid()
        c.fill.fore_color.rgb = C_LIGHT
        c.line.color.rgb = C_BORDER

        tb = s14.shapes.add_textbox(x + Inches(0.25), y + Inches(0.15), Inches(5.1), Inches(2.0))
        tf = tb.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        p.text = f"{badge} • {title}"
        p.font.size = Pt(15)
        p.font.bold = True
        p.font.color.rgb = col

        p2 = tf.add_paragraph()
        p2.text = desc
        p2.font.size = Pt(12)
        p2.font.color.rgb = C_DARK
        p2.space_before = Pt(8)

    set_notes(s14, "Testing encompassed unit testing of controllers, integration testing of REST endpoints, WebSocket load testing, and physical device testing across Android and iOS.")

    # ==========================================
    # SLIDE 15: Results
    # ==========================================
    s15 = prs.slides.add_slide(blank_layout)
    add_header(s15, 15, "Evaluation Results & Metrics", "Quantitative performance and usability outcomes")

    results = [
        ("Sub-100ms API Latency", "Core REST endpoints averaged 68ms response times under standard local network conditions.", "⚡", C_GREEN),
        ("Sub-Second Chat Delivery", "Socket.io bidirectional messages delivered in under 250ms with reliable delivery acknowledgments.", "💬", C_BLUE),
        ("100% Test Pass Rate", "All 28 defined functional test cases (auth, bidding, order state transitions) executed with 0 failures.", "✅", C_GREEN),
        ("Under 2-Min Job Posting", "Usability testing confirmed non-technical users can post complete photo requests in under 90 seconds.", "⏱️", C_ORANGE)
    ]
    for i, (title, desc, icon, col) in enumerate(results):
        col_idx = i % 2
        row_idx = i // 2
        x = Inches(0.8 + col_idx * 5.9)
        y = Inches(1.7 + row_idx * 2.55)

        c = s15.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, x, y, Inches(5.6), Inches(2.35))
        c.fill.solid()
        c.fill.fore_color.rgb = C_WHITE
        c.line.color.rgb = col

        tb = s15.shapes.add_textbox(x + Inches(0.25), y + Inches(0.15), Inches(5.1), Inches(2.0))
        tf = tb.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        p.text = f"{icon}  {title}"
        p.font.size = Pt(16)
        p.font.bold = True
        p.font.color.rgb = col

        p2 = tf.add_paragraph()
        p2.text = desc
        p2.font.size = Pt(12)
        p2.font.color.rgb = C_DARK
        p2.space_before = Pt(8)

    set_notes(s15, "Evaluation results confirmed strong performance: sub-100ms API response times, sub-second chat latency, 100% test pass rate, and an average job posting time of under 90 seconds.")

    # ==========================================
    # SLIDE 16: Challenges and Solutions
    # ==========================================
    s16 = prs.slides.add_slide(blank_layout)
    add_header(s16, 16, "Challenges & Engineering Solutions", "Technical hurdles overcome during development")

    challs = [
        ("Dual Role Codebase", "Challenge: Supporting customer and provider tabs in one app.\nSolution: Expo Router route groups (customer-tabs) and (provider-tabs) governed by Zustand role state.", "🔀"),
        ("Real-Time Bidding Load", "Challenge: Avoid server bottlenecks from repeated HTTP polling.\nSolution: Socket.io room broadcasting triggered by MongoDB document updates.", "⚡"),
        ("ID Vetting Without National API", "Challenge: Lack of automated government verification APIs.\nSolution: Dedicated Admin Gateway for manual audit of uploaded Kebele IDs and diplomas.", "🛡️"),
        ("Network Latency in Addis Ababa", "Challenge: Intermittent 3G/4G connectivity drops.\nSolution: Client-side image downscaling before upload and optimistic UI cache.", "📶")
    ]
    for i, (title, desc, icon) in enumerate(challs):
        col_idx = i % 2
        row_idx = i // 2
        x = Inches(0.8 + col_idx * 5.9)
        y = Inches(1.7 + row_idx * 2.55)

        c = s16.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, x, y, Inches(5.6), Inches(2.35))
        c.fill.solid()
        c.fill.fore_color.rgb = C_WHITE
        c.line.color.rgb = C_BORDER

        tb = s16.shapes.add_textbox(x + Inches(0.25), y + Inches(0.15), Inches(5.1), Inches(2.0))
        tf = tb.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        p.text = f"{icon}  {title}"
        p.font.size = Pt(15)
        p.font.bold = True
        p.font.color.rgb = C_NAVY

        p2 = tf.add_paragraph()
        p2.text = desc
        p2.font.size = Pt(11)
        p2.font.color.rgb = C_DARK
        p2.space_before = Pt(6)

    set_notes(s16, "Key challenges included dual-role navigation, real-time bidding, lack of national verification APIs, and network latency—each resolved through deliberate architectural decisions.")

    # ==========================================
    # SLIDE 17: Future Improvements
    # ==========================================
    s17 = prs.slides.add_slide(blank_layout)
    add_header(s17, 17, "Future Improvements & Roadmap", "Strategic commercial roadmap for post-defense evolution")

    future = [
        ("In-App Escrow Payments", "Integration with Telebirr and CBE Birr APIs with escrow hold until customer signs off.", "💳", "PHASE 1"),
        ("24/7 Emergency Dispatch", "Dedicated emergency tab for rapid response to burst pipes and power outages.", "🚨", "PHASE 2"),
        ("Geographic Expansion", "Onboard verified technicians in Hawassa, Adama, Bahir Dar, and Dire Dawa.", "🗺️", "PHASE 3"),
        ("AI Voice Transcription", "Voice note to text in Amharic and Afaan Oromoo for effortless request creation.", "🎙️", "PHASE 4")
    ]
    for i, (title, desc, icon, phase) in enumerate(future):
        x = Inches(0.8 + i * 2.95)
        c = s17.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, x, Inches(1.7), Inches(2.75), Inches(4.9))
        c.fill.solid()
        c.fill.fore_color.rgb = C_LIGHT
        c.line.color.rgb = C_BORDER

        tb = s17.shapes.add_textbox(x + Inches(0.2), Inches(1.9), Inches(2.35), Inches(4.5))
        tf = tb.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        p.text = phase
        p.font.size = Pt(11)
        p.font.bold = True
        p.font.color.rgb = C_ORANGE

        p2 = tf.add_paragraph()
        p2.text = f"{icon}\n{title}"
        p2.font.size = Pt(15)
        p2.font.bold = True
        p2.font.color.rgb = C_NAVY
        p2.space_before = Pt(6)

        p3 = tf.add_paragraph()
        p3.text = desc
        p3.font.size = Pt(11)
        p3.font.color.rgb = C_DARK
        p3.space_before = Pt(10)

    set_notes(s17, "Future plans focus on Telebirr escrow payment integration, an emergency dispatch mode, regional city expansion, and AI-driven multilingual voice transcription.")

    # ==========================================
    # SLIDE 18: Conclusion
    # ==========================================
    s18 = prs.slides.add_slide(blank_layout)
    add_header(s18, 18, "Conclusion", "Formalizing Ethiopia's domestic maintenance sector through software engineering")

    concl_points = [
        ("For Ethiopian Households", "Replaces informal, dangerous street searches with background-checked professionals, verified ratings, and upfront pricing.", C_BLUE),
        ("For Skilled Artisans & Technicians", "Dignifies informal labor with regular local job alerts, fair market income, and a permanent digital reputation.", C_ORANGE),
        ("Software Engineering Rigor", "Demonstrates a complete, production-ready full-stack mobile system built to modern software engineering standards.", C_NAVY)
    ]
    for i, (title, desc, col) in enumerate(concl_points):
        y = Inches(1.8 + i * 1.6)
        c = s18.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), y, Inches(11.7), Inches(1.35))
        c.fill.solid()
        c.fill.fore_color.rgb = C_WHITE
        c.line.color.rgb = col

        tb = s18.shapes.add_textbox(Inches(1.1), y + Inches(0.15), Inches(11.1), Inches(1.05))
        tf = tb.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        p.text = title
        p.font.size = Pt(16)
        p.font.bold = True
        p.font.color.rgb = col

        p2 = tf.add_paragraph()
        p2.text = desc
        p2.font.size = Pt(12)
        p2.font.color.rgb = C_DARK
        p2.space_before = Pt(4)

    set_notes(s18, "In conclusion, Bete transforms a fragmented, high-risk sector into a safe, formalized marketplace that benefits both households and technicians while demonstrating full-stack engineering excellence.")

    # ==========================================
    # SLIDE 19: Q&A / Closing
    # ==========================================
    s19 = prs.slides.add_slide(blank_layout)
    bg_end = s19.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, Inches(13.333), Inches(7.5))
    bg_end.fill.solid()
    bg_end.fill.fore_color.rgb = C_NAVY
    bg_end.line.fill.background()

    if has_logo_mark:
        s19.shapes.add_picture(logo_mark_path, Inches(5.9), Inches(1.1), height=Inches(1.5))

    tb = s19.shapes.add_textbox(Inches(1.6), Inches(2.7), Inches(10.1), Inches(4.2))
    tf = tb.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = "Thank You!"
    p.font.size = Pt(44)
    p.font.bold = True
    p.font.color.rgb = C_WHITE
    p.alignment = PP_ALIGN.CENTER

    p2 = tf.add_paragraph()
    p2.text = "Questions & Technical Discussion"
    p2.font.size = Pt(22)
    p2.font.bold = True
    p2.font.color.rgb = C_ORANGE
    p2.alignment = PP_ALIGN.CENTER
    p2.space_before = Pt(8)

    p3 = tf.add_paragraph()
    p3.text = "Bete (ቤቴ) – Household Repair & Maintenance Service\nSenior Capstone Project Defense • Addis Ababa, Ethiopia • 2026"
    p3.font.size = Pt(13)
    p3.font.color.rgb = RGBColor(203, 213, 225)
    p3.alignment = PP_ALIGN.CENTER
    p3.space_before = Pt(16)

    set_notes(s19, "Thank you to the committee members, our academic advisor, and faculty. We welcome your questions, architecture inquiries, and feedback.")

    output_path = "c:/Users/hp/Desktop/Project1/Fixstack-link/Bete_Defense_Deck.pptx"
    prs.save(output_path)
    print(f"SUCCESS: Created 19-slide presentation: {output_path}")

if __name__ == "__main__":
    build_presentation()
