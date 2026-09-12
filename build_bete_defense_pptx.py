import os
import sys
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.enum.text import PP_ALIGN
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_SHAPE

def create_presentation():
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

    # Image Paths
    logo_mark_path = os.path.abspath("mobile/assets/images/logos/bete_logo_mark.png")
    logo_horiz_path = os.path.abspath("mobile/assets/images/logos/bete_logo_horizontal.png")
    logo_stacked_path = os.path.abspath("mobile/assets/images/logos/bete_logo_stacked.png")
    
    img_login = os.path.abspath("docs/presentation_screenshots/screen_login.png")
    img_home = os.path.abspath("docs/presentation_screenshots/screen_home.png")
    img_post = os.path.abspath("docs/presentation_screenshots/screen_post.png")
    img_provider = os.path.abspath("docs/presentation_screenshots/screen_provider_detail.png")
    img_chat = os.path.abspath("docs/presentation_screenshots/screen_chat.png")
    img_profile = os.path.abspath("docs/presentation_screenshots/screen_profile.png")

    has_logo_mark = os.path.exists(logo_mark_path)
    has_logo_horiz = os.path.exists(logo_horiz_path)
    has_logo_stacked = os.path.exists(logo_stacked_path)

    def set_notes(slide, text):
        try:
            ns = slide.notes_slide
            tf = ns.notes_text_frame
            tf.text = text
        except:
            pass

    def add_header(slide, num, title, subtitle):
        # Header banner shape
        header_bg = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, Inches(13.333), Inches(1.15))
        header_bg.fill.solid()
        header_bg.fill.fore_color.rgb = C_WHITE
        header_bg.line.color.rgb = C_BORDER

        # Logo on top left
        if has_logo_mark:
            slide.shapes.add_picture(logo_mark_path, Inches(0.8), Inches(0.2), height=Inches(0.75))

        tb = slide.shapes.add_textbox(Inches(1.8), Inches(0.18), Inches(9.5), Inches(0.85))
        tf = tb.text_frame
        tf.word_wrap = True
        tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0

        p = tf.paragraphs[0]
        r1 = p.add_run()
        r1.text = f"{num:02d} | "
        r1.font.size = Pt(13)
        r1.font.bold = True
        r1.font.color.rgb = C_ORANGE

        r2 = p.add_run()
        r2.text = title
        r2.font.size = Pt(22)
        r2.font.bold = True
        r2.font.color.rgb = C_NAVY

        if subtitle:
            p2 = tf.add_paragraph()
            p2.text = subtitle
            p2.font.size = Pt(11)
            p2.font.color.rgb = C_GRAY

        # Tag on top right
        tag = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(11.2), Inches(0.35), Inches(1.4), Inches(0.42))
        tag.fill.solid()
        tag.fill.fore_color.rgb = RGBColor(238, 242, 255)
        tag.line.fill.background()
        ttb = tag.text_frame
        ttb.text = "Bete Defense"
        ttb.paragraphs[0].font.size = Pt(10)
        ttb.paragraphs[0].font.bold = True
        ttb.paragraphs[0].font.color.rgb = C_BLUE
        ttb.paragraphs[0].alignment = PP_ALIGN.CENTER

    # ==========================================
    # SLIDE 1: Title Slide
    # ==========================================
    s1 = prs.slides.add_slide(blank_layout)
    bg1 = s1.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, Inches(13.333), Inches(7.5))
    bg1.fill.solid()
    bg1.fill.fore_color.rgb = C_NAVY
    bg1.line.fill.background()

    # Left content block
    tb1 = s1.shapes.add_textbox(Inches(1.0), Inches(1.1), Inches(6.8), Inches(5.4))
    tf1 = tb1.text_frame
    tf1.word_wrap = True

    if has_logo_horiz:
        s1.shapes.add_picture(logo_horiz_path, Inches(1.0), Inches(1.0), height=Inches(0.9))
    elif has_logo_mark:
        s1.shapes.add_picture(logo_mark_path, Inches(1.0), Inches(1.0), height=Inches(0.9))

    p = tf1.paragraphs[0]
    p.text = "\n\nBete (ቤቴ)"
    p.font.size = Pt(36)
    p.font.bold = True
    p.font.color.rgb = C_ORANGE

    p = tf1.add_paragraph()
    p.text = "Household Repair & Maintenance Service"
    p.font.size = Pt(24)
    p.font.bold = True
    p.font.color.rgb = C_WHITE
    p.space_before = Pt(4)

    p = tf1.add_paragraph()
    p.text = "Senior Project Defense Presentation"
    p.font.size = Pt(15)
    p.font.color.rgb = RGBColor(186, 230, 253)
    p.space_before = Pt(12)

    p = tf1.add_paragraph()
    p.text = "• Presenter / Student: [Student Name(s)]\n• Department: Computer Science / Software Engineering\n• Institution: [University Name]\n• Academic Year: 2026\n• Technology: React Native • TypeScript • Node.js • Express • MongoDB"
    p.font.size = Pt(11)
    p.font.color.rgb = RGBColor(203, 213, 225)
    p.space_before = Pt(20)

    # Right Card: App Preview Box
    rc = s1.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(8.3), Inches(1.1), Inches(4.2), Inches(5.3))
    rc.fill.solid()
    rc.fill.fore_color.rgb = C_WHITE
    rc.line.color.rgb = C_BLUE

    rtb = s1.shapes.add_textbox(Inches(8.5), Inches(1.3), Inches(3.8), Inches(4.9))
    rtf = rtb.text_frame
    rtf.word_wrap = True

    p = rtf.paragraphs[0]
    p.text = "Domestic Service Ecosystem"
    p.font.size = Pt(16)
    p.font.bold = True
    p.font.color.rgb = C_NAVY
    p.alignment = PP_ALIGN.CENTER

    highlights = [
        ("🔧 Plumbing & Water Systems", "Pipe repairs, water tanks, pump installations"),
        ("⚡ Electrical & Power", "Breakers, rewiring, appliance repairs"),
        ("📱 On-Demand Dispatch", "Connects customers with verified nearby technicians"),
        ("💬 Real-time Coordination", "Direct in-app chat & instant push notifications"),
        ("🛡️ Verified Artisan Trust", "Vetted Kebele ID & certified trade qualifications")
    ]
    for h_title, h_sub in highlights:
        p = rtf.add_paragraph()
        p.text = h_title
        p.font.size = Pt(12)
        p.font.bold = True
        p.font.color.rgb = C_BLUE
        p.space_before = Pt(10)

        p2 = rtf.add_paragraph()
        p2.text = h_sub
        p2.font.size = Pt(10)
        p2.font.color.rgb = C_DARK

    set_notes(s1, "Honorable members of the examination committee, academic advisor, and faculty: Welcome to my senior project defense for 'Bete – Household Repair & Maintenance Service'. Bete is a comprehensive mobile platform developed with React Native and Node.js to formalize, streamline, and secure domestic repairs across Ethiopian urban households.")

    # ==========================================
    # SLIDE 2: Introduction
    # ==========================================
    s2 = prs.slides.add_slide(blank_layout)
    add_header(s2, 2, "Introduction", "What is Bete and background of the project")

    cards_s2 = [
        ("What is Bete? (ቤቴ)", [
            "• An on-demand mobile marketplace connecting Ethiopian households with vetted repair technicians.",
            "• 'Bete' translates to 'My Home' in Amharic, representing domestic safety, care, and reliable sanctuary.",
            "• Serves homeowners, tenants, and verified trade professionals through dedicated, role-based mobile interfaces."
        ], "🏠", C_BLUE),
        ("Project Background", [
            "• Rapid urbanization across Addis Ababa has created intense daily demand for home maintenance.",
            "• Traditional sourcing relies heavily on word-of-mouth or street wall advertisements with zero verification.",
            "• Technicians operate informally without digital tools to showcase qualifications or manage client bookings.",
            "• High mobile phone adoption and mobile money growth in Ethiopia make this the perfect timing for formalization."
        ], "🌍", C_ORANGE)
    ]
    for i, (title, points, icon, border_c) in enumerate(cards_s2):
        x = Inches(0.8 + i * 5.95)
        c = s2.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, x, Inches(1.5), Inches(5.75), Inches(5.3))
        c.fill.solid()
        c.fill.fore_color.rgb = C_WHITE
        c.line.color.rgb = border_c

        tb = s2.shapes.add_textbox(x + Inches(0.3), Inches(1.8), Inches(5.15), Inches(4.7))
        tf = tb.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        p.text = f"{icon}  {title}"
        p.font.size = Pt(18)
        p.font.bold = True
        p.font.color.rgb = C_NAVY

        for pt in points:
            p = tf.add_paragraph()
            p.text = pt
            p.font.size = Pt(12)
            p.font.color.rgb = C_DARK
            p.space_before = Pt(12)

    set_notes(s2, "To introduce Bete: It is an on-demand mobile ecosystem engineered specifically for Ethiopia. 'Bete' means 'My Home'. Today in urban centers like Addis Ababa, whenever a pipe bursts or an electrical short occurs, residents struggle to find trusted help. Bete bridges this gap through verified digital coordination.")

    # ==========================================
    # SLIDE 3: Problem Statement
    # ==========================================
    s3 = prs.slides.add_slide(blank_layout)
    add_header(s3, 3, "Problem Statement", "Four primary structural barriers in the current traditional repair market")

    probs = [
        ("Difficulty Finding Trusted Technicians", [
            "• Zero formal background checks or identity vetting on informal artisans",
            "• Homeowners face security and theft concerns when admitting strangers into private homes",
            "• Lack of verified reviews or quality records for technicians"
        ], "🚨"),
        ("Delayed Household Repairs", [
            "• Emergency plumbing leaks and electrical faults cause compounding property damage",
            "• Prolonged phone calls, repeated technician cancellations, and no-shows",
            "• Lack of immediate emergency broadcast dispatch"
        ], "⏱️"),
        ("Lack of Convenient Service Booking", [
            "• No unified digital platform to browse standardized service categories and upfront prices",
            "• Unpredictable price haggling and arbitrary on-site fee inflations",
            "• Inefficient manual coordination with zero digital audit trail or warranty"
        ], "📱"),
        ("Difficulty for Technicians to Find Customers", [
            "• Skilled tradespeople rely on street advertisements or small neighborhood networks",
            "• Irregular work pipeline leads to unstable daily income and financial insecurity",
            "• No digital portfolio to showcase trade certifications or client testimonials"
        ], "📉")
    ]
    for i, (title, points, icon) in enumerate(probs):
        col = i % 2
        row = i // 2
        x = Inches(0.8 + col * 5.95)
        y = Inches(1.5 + row * 2.7)

        c = s3.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, x, y, Inches(5.75), Inches(2.45))
        c.fill.solid()
        c.fill.fore_color.rgb = C_WHITE
        c.line.color.rgb = C_BORDER

        tb = s3.shapes.add_textbox(x + Inches(0.25), y + Inches(0.2), Inches(5.25), Inches(2.05))
        tf = tb.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        p.text = f"{icon}  {title}"
        p.font.size = Pt(15)
        p.font.bold = True
        p.font.color.rgb = C_NAVY

        for pt in points:
            p = tf.add_paragraph()
            p.text = pt
            p.font.size = Pt(11)
            p.font.color.rgb = C_DARK
            p.space_before = Pt(4)

    set_notes(s3, "Our problem statement identifies four core bottlenecks: First, the acute difficulty in finding trusted, verified technicians. Second, delays that lead to property damage. Third, the total absence of convenient digital booking. And fourth, the struggle of honest technicians to secure steady work.")

    # ==========================================
    # SLIDE 4: Project Objectives
    # ==========================================
    s4 = prs.slides.add_slide(blank_layout)
    add_header(s4, 4, "Project Objectives", "Defining the overall mission and specific engineering targets of Bete")

    # General Objective Box (Top)
    g_box = s4.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(1.5), Inches(11.733), Inches(1.7))
    g_box.fill.solid()
    g_box.fill.fore_color.rgb = RGBColor(238, 242, 255)
    g_box.line.color.rgb = C_BLUE

    gtb = s4.shapes.add_textbox(Inches(1.1), Inches(1.65), Inches(11.133), Inches(1.4))
    gtf = gtb.text_frame
    gtf.word_wrap = True
    p = gtf.paragraphs[0]
    p.text = "🎯  General Objective"
    p.font.size = Pt(16)
    p.font.bold = True
    p.font.color.rgb = C_BLUE

    p2 = gtf.add_paragraph()
    p2.text = "To design, develop, and deploy a secure, mobile-first on-demand household repair and maintenance application that connects Ethiopian service seekers with verified, skilled technicians through real-time request broadcasting, competitive bidding, in-app messaging, and reliable quality ratings."
    p2.font.size = Pt(12)
    p2.font.color.rgb = C_DARK
    p2.space_before = Pt(4)

    # Specific Objectives (Bottom 3 Columns)
    s_objs = [
        ("Engineering & Mobile Access", [
            "• Build cross-platform Android/iOS client using React Native & Expo",
            "• Create responsive, intuitive UI tailored for local user accessibility",
            "• Implement role-based navigation for Customers and Technicians"
        ], "📱"),
        ("Broadcasting & Real-Time Sync", [
            "• Implement instant job broadcasting by subcity & trade category",
            "• Deploy WebSocket chat & Expo push notification alerts",
            "• Establish Connects credit system to prevent spam proposals"
        ], "⚡"),
        ("Security, Vetting & Trust", [
            "• Enforce JWT token authentication & bcrypt password hashing",
            "• Support document upload for ID and vocational trade certificates",
            "• Provide verified customer ratings to incentivize top workmanship"
        ], "🛡️")
    ]
    for i, (title, points, icon) in enumerate(s_objs):
        x = Inches(0.8 + i * 3.95)
        c = s4.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, x, Inches(3.45), Inches(3.75), Inches(3.45))
        c.fill.solid()
        c.fill.fore_color.rgb = C_WHITE
        c.line.color.rgb = C_BORDER

        tb = s4.shapes.add_textbox(x + Inches(0.2), Inches(3.6), Inches(3.35), Inches(3.1))
        tf = tb.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        p.text = f"{icon}  {title}"
        p.font.size = Pt(14)
        p.font.bold = True
        p.font.color.rgb = C_NAVY

        for pt in points:
            p = tf.add_paragraph()
            p.text = pt
            p.font.size = Pt(10.5)
            p.font.color.rgb = C_DARK
            p.space_before = Pt(6)

    set_notes(s4, "Our general objective is building a secure, reliable marketplace for home repairs. Our specific objectives span cross-platform mobile development, real-time job broadcasting via WebSockets and push notifications, and rigorous security with verified trust mechanisms.")

    # ==========================================
    # SLIDE 5: Proposed Solution
    # ==========================================
    s5 = prs.slides.add_slide(blank_layout)
    add_header(s5, 5, "Proposed Solution", "How Bete addresses each traditional repair challenge systematically")

    sol_items = [
        ("Instant Broadcasting", "Customers post issue details, photos, and subcity location in under 2 minutes. The job is instantly dispatched to matching technicians.", "📡", C_BLUE),
        ("Verified Technician Profiles", "Service providers must submit identification and trade qualifications. Customers can inspect ratings, past reviews, and completed tasks.", "✅", C_ORANGE),
        ("Transparent Bidding Engine", "Technicians submit itemized price proposals. Customers compare bids, preventing extortionate price haggling or hidden charges.", "💰", C_BLUE),
        ("Real-time In-App Chat", "Built-in direct messaging powered by WebSockets allows seamless coordination, photo sharing, and arrival scheduling without sharing phone numbers.", "💬", C_ORANGE)
    ]
    for i, (title, desc, icon, border_c) in enumerate(sol_items):
        col = i % 2
        row = i // 2
        x = Inches(0.8 + col * 5.95)
        y = Inches(1.5 + row * 2.7)

        c = s5.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, x, y, Inches(5.75), Inches(2.45))
        c.fill.solid()
        c.fill.fore_color.rgb = C_WHITE
        c.line.color.rgb = border_c

        tb = s5.shapes.add_textbox(x + Inches(0.25), y + Inches(0.2), Inches(5.25), Inches(2.05))
        tf = tb.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        p.text = f"{icon}  {title}"
        p.font.size = Pt(16)
        p.font.bold = True
        p.font.color.rgb = C_NAVY

        p2 = tf.add_paragraph()
        p2.text = desc
        p2.font.size = Pt(12)
        p2.font.color.rgb = C_DARK
        p2.space_before = Pt(8)

    set_notes(s5, "The proposed solution systematically dismantles the traditional market barriers through instant request broadcasting, verified technician credentials, a transparent bidding mechanism, and integrated real-time chat.")

    # ==========================================
    # SLIDE 6: Target Users
    # ==========================================
    s6 = prs.slides.add_slide(blank_layout)
    add_header(s6, 6, "Target Users & Stakeholders", "Three primary roles interacting within the Bete digital ecosystem")

    roles = [
        ("Service Seekers", "Homeowners & Tenants", [
            "• Individuals and businesses requiring reliable maintenance",
            "• Search by subcity and trade category",
            "• Post service requests with photos and budgets",
            "• Review provider profiles, chat, and rate services"
        ], "👤", C_BLUE),
        ("Service Providers", "Certified Technicians", [
            "• Plumbers, electricians, appliance technicians, carpenters",
            "• Toggle on/off-duty availability status",
            "• Receive real-time push alerts for matching jobs",
            "• Submit competitive bids and grow digital reputation"
        ], "🔧", C_ORANGE),
        ("Platform Admin", "System Oversight", [
            "• Platform administrators ensuring service quality",
            "• Verify technician identity and trade certificates",
            "• Monitor platform analytics, dispute mediation",
            "• Manage service categories and user compliance"
        ], "🛡️", C_NAVY)
    ]
    for i, (title, role_sub, points, icon, border_c) in enumerate(roles):
        x = Inches(0.8 + i * 3.95)
        c = s6.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, x, Inches(1.5), Inches(3.75), Inches(5.3))
        c.fill.solid()
        c.fill.fore_color.rgb = C_WHITE
        c.line.color.rgb = border_c

        tb = s6.shapes.add_textbox(x + Inches(0.25), Inches(1.8), Inches(3.25), Inches(4.7))
        tf = tb.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        p.text = f"{icon}  {title}"
        p.font.size = Pt(17)
        p.font.bold = True
        p.font.color.rgb = C_NAVY

        p2 = tf.add_paragraph()
        p2.text = role_sub
        p2.font.size = Pt(11)
        p2.font.color.rgb = C_GRAY
        p2.space_before = Pt(2)

        for pt in points:
            p = tf.add_paragraph()
            p.text = pt
            p.font.size = Pt(11)
            p.font.color.rgb = C_DARK
            p.space_before = Pt(8)

    set_notes(s6, "Bete defines three primary stakeholders: Service Seekers who request repairs, Service Providers who deliver trade expertise, and System Administrators who oversee verification, quality control, and platform compliance.")

    # ==========================================
    # SLIDE 7: Main Features
    # ==========================================
    s7 = prs.slides.add_slide(blank_layout)
    add_header(s7, 7, "Main Features", "Core capabilities delivered across the mobile platform")

    features = [
        ("Service Selection", "5 core categories & 16+ granular specialties (plumbing, electrical, appliance repair).", "📋"),
        ("Problem Description", "Detailed problem description with custom urgency levels: Today & Emergency (+5).", "📝"),
        ("Photo Attachment", "Direct camera/gallery image picker to attach visual evidence of household damage.", "📷"),
        ("Technician Discovery", "Browse verified technicians filtered by subcity, trade category, and customer rating.", "🔍"),
        ("Service Request & Bidding", "Automated broadcasting with a competitive quotation engine and connects balance.", "💼"),
        ("Ratings & Reviews", "Verified customer feedback with 1–5 star scores to build long-term artisan trust.", "⭐"),
        ("User Profiles & Vetting", "Edit profile, upload credentials, manage availability, and view transaction history.", "👤"),
        ("Role-Based Access", "Dedicated navigation flows and distinct permissions for customers vs. technicians.", "🔒")
    ]
    for i, (title, desc, icon) in enumerate(features):
        col = i % 4
        row = i // 4
        x = Inches(0.8 + col * 2.95)
        y = Inches(1.5 + row * 2.7)

        c = s7.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, x, y, Inches(2.8), Inches(2.45))
        c.fill.solid()
        c.fill.fore_color.rgb = C_WHITE
        c.line.color.rgb = C_BORDER

        tb = s7.shapes.add_textbox(x + Inches(0.18), y + Inches(0.15), Inches(2.44), Inches(2.1))
        tf = tb.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        p.text = f"{icon}  {title}"
        p.font.size = Pt(13)
        p.font.bold = True
        p.font.color.rgb = C_NAVY

        p2 = tf.add_paragraph()
        p2.text = desc
        p2.font.size = Pt(10.5)
        p2.font.color.rgb = C_DARK
        p2.space_before = Pt(6)

    set_notes(s7, "Here are the eight core features of Bete: service selection, problem description with emergency priority, photo attachment, technician discovery, competitive bidding, verified ratings, profile management, and role-based access control.")

    # ==========================================
    # SLIDE 8: System Workflow / How Bete Works
    # ==========================================
    s8 = prs.slides.add_slide(blank_layout)
    add_header(s8, 8, "System Workflow / How Bete Works", "Step-by-step lifecycle from request posting to completed repair")

    steps = [
        ("1", "Customer Requests Service", "Customer selects service category, writes issue description, attaches photos, sets urgency, and broadcasts request.", "📝"),
        ("2", "Technician Receives Request", "Matching technicians in the subcity receive instant push notifications & socket alerts on their Jobs feed.", "🔔"),
        ("3", "Technician Bids / Accepts", "Technician reviews details and submits price proposal. Customer reviews bids and accepts preferred technician.", "🤝"),
        ("4", "Service Execution & Chat", "Technician and customer coordinate arrival details via real-time in-app chat. Technician completes the repair.", "🔧"),
        ("5", "Completion & Rating", "Customer confirms successful completion, settles payment, and submits a 1-5 star verified rating & review.", "⭐")
    ]
    for i, (num, stitle, sdesc, icon) in enumerate(steps):
        x = Inches(0.8 + i * 2.38)
        c = s8.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, x, Inches(1.8), Inches(2.2), Inches(4.8))
        c.fill.solid()
        c.fill.fore_color.rgb = C_WHITE
        c.line.color.rgb = C_BLUE if i % 2 == 0 else C_ORANGE

        tb = s8.shapes.add_textbox(x + Inches(0.15), Inches(2.0), Inches(1.9), Inches(4.3))
        tf = tb.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        p.text = f"{icon} Step {num}"
        p.font.size = Pt(15)
        p.font.bold = True
        p.font.color.rgb = C_ORANGE

        p2 = tf.add_paragraph()
        p2.text = stitle
        p2.font.size = Pt(13)
        p2.font.bold = True
        p2.font.color.rgb = C_NAVY
        p2.space_before = Pt(8)

        p3 = tf.add_paragraph()
        p3.text = sdesc
        p3.font.size = Pt(10.5)
        p3.font.color.rgb = C_DARK
        p3.space_before = Pt(10)

    set_notes(s8, "The system workflow operates as a transparent 5-stage lifecycle: customer posts request, technician receives real-time alert, technician bids and customer accepts, repair is executed with chat coordination, and the customer finalizes by rating the artisan.")

    # ==========================================
    # SLIDE 9: System Architecture
    # ==========================================
    s9 = prs.slides.add_slide(blank_layout)
    add_header(s9, 9, "System Architecture", "Three-tier distributed architecture ensuring scalability, speed, and security")

    arch_layers = [
        ("Mobile Client (Presentation)", [
            "• React Native & Expo SDK 54",
            "• Expo Router file-based navigation",
            "• TypeScript for type safety & fewer runtime bugs",
            "• SecureStore for encrypted local JWT tokens",
            "• Responsive scaling utility across Android devices"
        ], "📱", C_BLUE),
        ("Backend Server (Application Logic)", [
            "• Node.js & Express.js REST API",
            "• Socket.io for bidirectional live chat rooms",
            "• JWT Middleware for role-based authentication",
            "• Multer for photo/document multipart uploads",
            "• Hosted on Render Cloud Infrastructure"
        ], "⚙️", C_ORANGE),
        ("Data & Services (Persistence & Cloud)", [
            "• MongoDB Atlas NoSQL document database",
            "• Mongoose ODM for structured data modeling",
            "• Expo Push Notification HTTP Service",
            "• RESTful API communication over TLS/HTTPS",
            "• Automated database indexes for rapid queries"
        ], "🗄️", C_NAVY)
    ]
    for i, (title, points, icon, border_c) in enumerate(arch_layers):
        x = Inches(0.8 + i * 3.95)
        c = s9.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, x, Inches(1.5), Inches(3.75), Inches(5.3))
        c.fill.solid()
        c.fill.fore_color.rgb = C_WHITE
        c.line.color.rgb = border_c

        tb = s9.shapes.add_textbox(x + Inches(0.25), Inches(1.8), Inches(3.25), Inches(4.7))
        tf = tb.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        p.text = f"{icon}  {title}"
        p.font.size = Pt(15)
        p.font.bold = True
        p.font.color.rgb = C_NAVY

        for pt in points:
            p = tf.add_paragraph()
            p.text = pt
            p.font.size = Pt(11)
            p.font.color.rgb = C_DARK
            p.space_before = Pt(8)

    set_notes(s9, "Our architecture follows an enterprise 3-tier pattern: The mobile presentation tier built in React Native/Expo, the application logic tier running Node.js and Socket.io, and the persistence tier leveraging MongoDB Atlas with cloud push notification dispatch.")

    # ==========================================
    # SLIDE 10: UI/UX Design
    # ==========================================
    s10 = prs.slides.add_slide(blank_layout)
    add_header(s10, 10, "UI/UX Design & Key Mobile Screens", "Clean Ethiopian startup aesthetic with high visual contrast and intuitive layouts")

    # Show actual screenshots if available
    screenshots = [
        (img_home, "Home & Services", "Browse categories, view banner promotions, discover certified technicians."),
        (img_post, "Service Request Screen", "Input problem details, select urgency (Today/Emergency), attach photos."),
        (img_provider, "Technician Profile", "View verified credentials, completed tasks, customer reviews, and direct hire."),
        (img_chat, "In-App Direct Chat", "Full-height conversation screen with online status, timestamps, and input dock.")
    ]
    for i, (img_path, title, desc) in enumerate(screenshots):
        x = Inches(0.8 + i * 2.95)
        # Card container
        c = s10.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, x, Inches(1.5), Inches(2.8), Inches(5.4))
        c.fill.solid()
        c.fill.fore_color.rgb = C_WHITE
        c.line.color.rgb = C_BORDER

        # Image
        if os.path.exists(img_path):
            s10.shapes.add_picture(img_path, x + Inches(0.4), Inches(1.65), width=Inches(2.0))

        # Text below
        tb = s10.shapes.add_textbox(x + Inches(0.15), Inches(5.65), Inches(2.5), Inches(1.1))
        tf = tb.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        p.text = title
        p.font.size = Pt(11)
        p.font.bold = True
        p.font.color.rgb = C_NAVY

        p2 = tf.add_paragraph()
        p2.text = desc
        p2.font.size = Pt(9)
        p2.font.color.rgb = C_GRAY
        p2.space_before = Pt(2)

    set_notes(s10, "This slide showcases the UI/UX design: Onboarding, Home screen with quick service shortcuts, the Post Request interface, comprehensive Technician Profiles, and the active Chat interface which cleanly hides the bottom navigation bar.")

    # ==========================================
    # SLIDE 11: Database Design
    # ==========================================
    s11 = prs.slides.add_slide(blank_layout)
    add_header(s11, 11, "Database Design", "Core MongoDB collections, document schemas, and relational integrity")

    entities = [
        ("Users Collection", [
            "• fullName, email, phone, role (customer/provider/admin)",
            "• password (bcrypt hashed), pushToken for alerts",
            "• connectsBalance, isAvailable (on/off duty)",
            "• avatarUrl, documents (ID & trade certifications)"
        ], "👤"),
        ("Jobs Collection", [
            "• title, category, description, subcity location",
            "• budget (ETB), urgency (Today / Emergency)",
            "• status (open, assigned, in-progress, completed)",
            "• photos array, customerId (Ref: User), technicianId"
        ], "📋"),
        ("Bids Collection", [
            "• jobId (Ref: Job), providerId (Ref: User)",
            "• proposedPrice, estimatedDays, coverNote",
            "• status (pending, accepted, rejected)",
            "• timestamps (createdAt, updatedAt)"
        ], "💼"),
        ("Messages & Notifications", [
            "• senderId, receiverId, jobId, text content",
            "• isRead flag, timestamps for socket delivery",
            "• Notifications: recipient, title, body, type, isRead",
            "• Fast indexes on (userId, createdAt, jobId)"
        ], "💬")
    ]
    for i, (title, points, icon) in enumerate(entities):
        col = i % 2
        row = i // 2
        x = Inches(0.8 + col * 5.95)
        y = Inches(1.5 + row * 2.7)

        c = s11.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, x, y, Inches(5.75), Inches(2.45))
        c.fill.solid()
        c.fill.fore_color.rgb = C_WHITE
        c.line.color.rgb = C_BORDER

        tb = s11.shapes.add_textbox(x + Inches(0.25), y + Inches(0.2), Inches(5.25), Inches(2.05))
        tf = tb.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        p.text = f"{icon}  {title}"
        p.font.size = Pt(15)
        p.font.bold = True
        p.font.color.rgb = C_NAVY

        for pt in points:
            p = tf.add_paragraph()
            p.text = pt
            p.font.size = Pt(10.5)
            p.font.color.rgb = C_DARK
            p.space_before = Pt(4)

    set_notes(s11, "Our database schema leverages MongoDB for flexible document storage: Users table with role-based attributes, Jobs collection with geolocation subcities, Bids collection connecting technicians with proposals, and Messages for real-time chat persistence.")

    # ==========================================
    # SLIDE 12: Implementation / Technologies Used
    # ==========================================
    s12 = prs.slides.add_slide(blank_layout)
    add_header(s12, 12, "Implementation & Technologies Used", "Production technology stack powering the Bete platform")

    tech_categories = [
        ("Frontend / Mobile", [
            "• React Native 0.76+ & Expo SDK 54",
            "• TypeScript for robust static typing",
            "• Expo Router for modern file-based routing",
            "• React Native Reanimated for smooth UI animations",
            "• Expo SecureStore & ImagePicker"
        ], "📱", C_BLUE),
        ("Backend & APIs", [
            "• Node.js runtime environment",
            "• Express.js REST API framework",
            "• Socket.io for low-latency WebSocket messaging",
            "• Multer for multipart form & file handling",
            "• JSON Web Tokens (JWT) & bcrypt.js"
        ], "⚙️", C_ORANGE),
        ("Database & DevOps", [
            "• MongoDB Atlas (cloud database)",
            "• Mongoose ODM schema validation",
            "• Expo Application Services (EAS Build) for APK",
            "• Render Cloud Platform (backend hosting)",
            "• Git & GitHub for version control"
        ], "☁️", C_NAVY)
    ]
    for i, (title, points, icon, border_c) in enumerate(tech_categories):
        x = Inches(0.8 + i * 3.95)
        c = s12.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, x, Inches(1.5), Inches(3.75), Inches(5.3))
        c.fill.solid()
        c.fill.fore_color.rgb = C_WHITE
        c.line.color.rgb = border_c

        tb = s12.shapes.add_textbox(x + Inches(0.25), Inches(1.8), Inches(3.25), Inches(4.7))
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
            p.space_before = Pt(8)

    set_notes(s12, "We selected our tech stack for rapid cross-platform capability and real-time responsiveness: React Native and Expo for mobile, Node.js and Express with Socket.io for backend, and MongoDB Atlas for cloud storage.")

    # ==========================================
    # SLIDE 13: Security / Role-Based Access Control
    # ==========================================
    s13 = prs.slides.add_slide(blank_layout)
    add_header(s13, 13, "Security & Role-Based Access Control (RBAC)", "Multi-layered defensive architecture protecting user identity, privacy, and data")

    sec_layers = [
        ("Authentication & Passwords", [
            "• Industry-standard bcrypt hashing with 10 salt rounds",
            "• Stateless JWT token authentication with configurable expiry",
            "• Hardware-encrypted local token storage via Expo SecureStore",
            "• Route guards preventing unauthorized API access"
        ], "🔐"),
        ("Role-Based Access (RBAC)", [
            "• Service Seeker: Can post jobs, view bids, accept quotes, review pros",
            "• Service Provider: Can view job broadcasts, submit bids, update duty status",
            "• Admin: System-wide oversight, user verification, compliance enforcement",
            "• Separate mobile navigation stacks preventing role crossover"
        ], "🛡️"),
        ("Data Protection & Privacy", [
            "• Sensitive user credentials excluded from API responses (password omitted)",
            "• Input validation and sanitization on all endpoints to prevent NoSQL injection",
            "• TLS/HTTPS encrypted network traffic in transit",
            "• Safe multipart file validation checking MIME types & sizes"
        ], "🔒"),
        ("Anti-Spam Virtual Connects", [
            "• Virtual connects mechanism limits proposal and posting spam",
            "• Emergency requests deduct additional connects (+5) for priority queuing",
            "• Account activity monitoring to prevent fraudulent reviews",
            "• Secure balance deduction before task broadcast"
        ], "⚡")
    ]
    for i, (title, points, icon) in enumerate(sec_layers):
        col = i % 2
        row = i // 2
        x = Inches(0.8 + col * 5.95)
        y = Inches(1.5 + row * 2.7)

        c = s13.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, x, y, Inches(5.75), Inches(2.45))
        c.fill.solid()
        c.fill.fore_color.rgb = C_WHITE
        c.line.color.rgb = C_BORDER

        tb = s13.shapes.add_textbox(x + Inches(0.25), y + Inches(0.2), Inches(5.25), Inches(2.05))
        tf = tb.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        p.text = f"{icon}  {title}"
        p.font.size = Pt(15)
        p.font.bold = True
        p.font.color.rgb = C_NAVY

        for pt in points:
            p = tf.add_paragraph()
            p.text = pt
            p.font.size = Pt(10.5)
            p.font.color.rgb = C_DARK
            p.space_before = Pt(4)

    set_notes(s13, "Security is fundamental to domestic services. We enforce JWT and bcrypt password encryption, strict role-based access separating customers from technicians, and virtual connects to eliminate spam requests.")

    # ==========================================
    # SLIDE 14: Testing & Quality Assurance
    # ==========================================
    s14 = prs.slides.add_slide(blank_layout)
    add_header(s14, 14, "Testing & Quality Assurance", "Comprehensive verification across functionality, UI/UX, APIs, and physical devices")

    tests = [
        ("Functional Testing", [
            "• Verified end-to-end user registration and role assignment",
            "• Tested job broadcasting, proposal submission, and acceptance",
            "• Validated connects deduction and wallet balance updates",
            "• Verified rating submission upon order completion"
        ], "🧪", C_BLUE),
        ("UI / UX Testing", [
            "• Screen responsiveness tested across different Android screen densities",
            "• Verified keyboard avoidance and smooth message scrolling",
            "• Tested dynamic tab bar hiding during active chat conversations",
            "• Verified Amharic and English typography rendering"
        ], "📱", C_ORANGE),
        ("API & Integration Testing", [
            "• Tested REST endpoints via Postman with edge cases",
            "• Validated JWT token expiration and route protection",
            "• Verified Socket.io connection stability and room join logic",
            "• Tested multipart image upload limits and error handling"
        ], "⚡", C_BLUE),
        ("Physical Device Testing", [
            "• Tested live in Expo Go on real Android smartphone",
            "• Built and installed standalone APK (com.bete.app)",
            "• Validated Expo Push Notifications receiving remote banners",
            "• Tested offline handling and network error recovery"
        ], "📲", C_ORANGE)
    ]
    for i, (title, points, icon, border_c) in enumerate(tests):
        col = i % 2
        row = i // 2
        x = Inches(0.8 + col * 5.95)
        y = Inches(1.5 + row * 2.7)

        c = s14.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, x, y, Inches(5.75), Inches(2.45))
        c.fill.solid()
        c.fill.fore_color.rgb = C_WHITE
        c.line.color.rgb = border_c

        tb = s14.shapes.add_textbox(x + Inches(0.25), y + Inches(0.2), Inches(5.25), Inches(2.05))
        tf = tb.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        p.text = f"{icon}  {title}"
        p.font.size = Pt(15)
        p.font.bold = True
        p.font.color.rgb = C_NAVY

        for pt in points:
            p = tf.add_paragraph()
            p.text = pt
            p.font.size = Pt(10.5)
            p.font.color.rgb = C_DARK
            p.space_before = Pt(4)

    set_notes(s14, "Testing covered four dimensions: functional verification of all user journeys, UI responsiveness testing across Android screen sizes, API testing of all backend endpoints, and live device testing on physical smartphones.")

    # ==========================================
    # SLIDE 15: Results & Working Application
    # ==========================================
    s15 = prs.slides.add_slide(blank_layout)
    add_header(s15, 15, "Results & Working Application", "Tangible achievements and screenshots of the functional deployed system")

    # Metrics Summary Bar
    m_box = s15.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(1.4), Inches(11.733), Inches(0.85))
    m_box.fill.solid()
    m_box.fill.fore_color.rgb = RGBColor(238, 242, 255)
    m_box.line.color.rgb = C_BLUE

    mtb = s15.shapes.add_textbox(Inches(1.0), Inches(1.45), Inches(11.333), Inches(0.75))
    mtf = mtb.text_frame
    mtf.word_wrap = True
    p = mtf.paragraphs[0]
    p.text = "🏆 Key Results: Fully Functional Cross-Platform Mobile Application Built & Verified on Physical Android Devices"
    p.font.size = Pt(12)
    p.font.bold = True
    p.font.color.rgb = C_BLUE

    p2 = mtf.add_paragraph()
    p2.text = "• 100% Core Features Completed  • Real-Time WebSocket Messaging  • Expo Push Alerts Live  • Standalone APK Built"
    p2.font.size = Pt(10)
    p2.font.color.rgb = C_DARK

    # 3 Screenshots Showcase
    screens_s15 = [
        (img_login, "Authentication & Role Selection", "Clean branded login screen with seamless role selection between Seeker and Provider."),
        (img_post, "Service Request Broadcasting", "Categorized request form with image attachment and live connects balance check."),
        (img_profile, "User Profile & Wallet", "Connects balance display, quick top-up modal, and account management.")
    ]
    for i, (img_path, title, desc) in enumerate(screens_s15):
        x = Inches(0.8 + i * 3.95)
        c = s15.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, x, Inches(2.4), Inches(3.75), Inches(4.5))
        c.fill.solid()
        c.fill.fore_color.rgb = C_WHITE
        c.line.color.rgb = C_BORDER

        if os.path.exists(img_path):
            s15.shapes.add_picture(img_path, x + Inches(0.9), Inches(2.55), width=Inches(1.95))

        tb = s15.shapes.add_textbox(x + Inches(0.2), Inches(5.95), Inches(3.35), Inches(0.85))
        tf = tb.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        p.text = title
        p.font.size = Pt(11)
        p.font.bold = True
        p.font.color.rgb = C_NAVY

        p2 = tf.add_paragraph()
        p2.text = desc
        p2.font.size = Pt(9)
        p2.font.color.rgb = C_GRAY

    set_notes(s15, "Our results demonstrate a 100% functional product: The login flow, job broadcasting with image uploads, and profile management with virtual connects balance have all been successfully validated on real devices.")

    # ==========================================
    # SLIDE 16: Challenges and Solutions
    # ==========================================
    s16 = prs.slides.add_slide(blank_layout)
    add_header(s16, 16, "Challenges and Solutions", "Key technical obstacles encountered during development and how they were overcome")

    challenges = [
        ("Push Notifications on Real Devices", "Challenge: Generating push tokens in modern Expo SDK and dispatching alerts to devices reliably.", "Solution: Implemented Expo Push HTTP API utility on backend and configured automatic token registration on user login.", "🔔"),
        ("Real-time Chat Room Orchestration", "Challenge: Synchronizing multi-user WebSocket connections without message drops during tab switches.", "Solution: Designed room-based Socket.io listeners paired with persistent MongoDB fallback storage.", "💬"),
        ("UI Layout Across Android Devices", "Challenge: Diverse Android screen sizes caused clipping on smaller screens and stretching on tablets.", "Solution: Built a mathematical responsive scaling module (scale, verticalScale, moderateScale) for fluid layouts.", "📐"),
        ("Preventing Spam & Fake Requests", "Challenge: Preventing malicious users from flooding technicians with fake repair broadcasts.", "Solution: Introduced virtual Connects system where broadcasting and bidding deduct credits, curbing abuse.", "🛡️")
    ]
    for i, (title, chall, sol, icon) in enumerate(challenges):
        col = i % 2
        row = i // 2
        x = Inches(0.8 + col * 5.95)
        y = Inches(1.5 + row * 2.7)

        c = s16.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, x, y, Inches(5.75), Inches(2.45))
        c.fill.solid()
        c.fill.fore_color.rgb = C_WHITE
        c.line.color.rgb = C_BORDER

        tb = s16.shapes.add_textbox(x + Inches(0.25), y + Inches(0.18), Inches(5.25), Inches(2.1))
        tf = tb.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        p.text = f"{icon}  {title}"
        p.font.size = Pt(14)
        p.font.bold = True
        p.font.color.rgb = C_NAVY

        p2 = tf.add_paragraph()
        p2.text = f"• {chall}"
        p2.font.size = Pt(10.5)
        p2.font.color.rgb = RGBColor(220, 38, 38)
        p2.space_before = Pt(4)

        p3 = tf.add_paragraph()
        p3.text = f"• {sol}"
        p3.font.size = Pt(10.5)
        p3.font.color.rgb = RGBColor(16, 185, 129)
        p3.space_before = Pt(4)

    set_notes(s16, "We faced four significant engineering hurdles: push notification delivery, real-time message room orchestration, Android UI responsiveness, and spam prevention. Each was solved using robust architectural patterns.")

    # ==========================================
    # SLIDE 17: Future Improvements
    # ==========================================
    s17 = prs.slides.add_slide(blank_layout)
    add_header(s17, 17, "Future Improvements & Roadmap", "Strategic roadmap for the commercialization and expansion of Bete")

    future_items = [
        ("Online Payment Integration", "Direct integration with Ethiopian payment gateways like Telebirr, CBE Birr, and Chapa for automated escrow settlement.", "💳"),
        ("Live Location & GPS Tracking", "Interactive map view showing technician transit route in real-time as they travel to the customer's home.", "📍"),
        ("In-App Audio & Voice Messages", "Voice note messaging for customers to explain repair sounds or plumbing leaks with greater clarity.", "🎙️"),
        ("Expanded Service Categories", "Broaden into solar installation, home security systems, painting, and HVAC refrigeration maintenance.", "🔧"),
        ("Ethiopian City Expansion", "Scale service operations beyond Addis Ababa to secondary urban hubs: Bahir Dar, Hawassa, Adama, and Dire Dawa.", "🏙️"),
        ("Multilingual Localization", "Add full native support for Amharic and Afaan Oromoo interfaces to maximize local accessibility.", "🌐")
    ]
    for i, (title, desc, icon) in enumerate(future_items):
        col = i % 3
        row = i // 3
        x = Inches(0.8 + col * 3.95)
        y = Inches(1.5 + row * 2.7)

        c = s17.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, x, y, Inches(3.75), Inches(2.45))
        c.fill.solid()
        c.fill.fore_color.rgb = C_WHITE
        c.line.color.rgb = C_BORDER

        tb = s17.shapes.add_textbox(x + Inches(0.2), y + Inches(0.18), Inches(3.35), Inches(2.1))
        tf = tb.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        p.text = f"{icon}  {title}"
        p.font.size = Pt(14)
        p.font.bold = True
        p.font.color.rgb = C_NAVY

        p2 = tf.add_paragraph()
        p2.text = desc
        p2.font.size = Pt(11)
        p2.font.color.rgb = C_DARK
        p2.space_before = Pt(8)

    set_notes(s17, "Our future roadmap includes Telebirr and Chapa digital payments, real-time GPS technician tracking, voice notes, expanded trade categories, expansion to cities like Hawassa and Bahir Dar, and local language localization.")

    # ==========================================
    # SLIDE 18: Conclusion
    # ==========================================
    s18 = prs.slides.add_slide(blank_layout)
    add_header(s18, 18, "Conclusion", "Synthesizing the engineering and socioeconomic impact of Bete")

    concl_points = [
        ("Modernizing Informal Labor", "Bete transitions Ethiopian household repairs from unvetted street sourcing into a structured, accountable digital marketplace.", "🏗️"),
        ("Empowering Local Artisans", "Equips verified Ethiopian tradespeople with sustainable customer pipelines, professional digital identities, and fair income.", "📈"),
        ("Restoring Domestic Peace of Mind", "Provides families and tenants with trusted, rapid, and transparent home repairs at the tap of a button.", "🛡️"),
        ("Scalable Foundation", "Engineered with modular React Native, Node.js, and MongoDB foundations ready for commercial deployment.", "🚀")
    ]
    for i, (title, desc, icon) in enumerate(concl_points):
        col = i % 2
        row = i // 2
        x = Inches(0.8 + col * 5.95)
        y = Inches(1.5 + row * 2.7)

        c = s18.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, x, y, Inches(5.75), Inches(2.45))
        c.fill.solid()
        c.fill.fore_color.rgb = C_WHITE
        c.line.color.rgb = C_BLUE if i % 2 == 0 else C_ORANGE

        tb = s18.shapes.add_textbox(x + Inches(0.25), y + Inches(0.2), Inches(5.25), Inches(2.05))
        tf = tb.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        p.text = f"{icon}  {title}"
        p.font.size = Pt(16)
        p.font.bold = True
        p.font.color.rgb = C_NAVY

        p2 = tf.add_paragraph()
        p2.text = desc
        p2.font.size = Pt(11.5)
        p2.font.color.rgb = C_DARK
        p2.space_before = Pt(8)

    set_notes(s18, "In conclusion, Bete is more than just a software application—it is a digital bridge that formalizes Ethiopia's informal repair economy, empowers skilled artisans, and gives households peace of mind.")

    # ==========================================
    # SLIDE 19: Thank You / Q&A
    # ==========================================
    s19 = prs.slides.add_slide(blank_layout)
    bg19 = s19.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, Inches(13.333), Inches(7.5))
    bg19.fill.solid()
    bg19.fill.fore_color.rgb = C_NAVY
    bg19.line.fill.background()

    # Center card
    card19 = s19.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(2.5), Inches(1.1), Inches(8.333), Inches(5.3))
    card19.fill.solid()
    card19.fill.fore_color.rgb = C_WHITE
    card19.line.color.rgb = C_ORANGE

    tb19 = s19.shapes.add_textbox(Inches(2.8), Inches(1.3), Inches(7.733), Inches(4.9))
    tf19 = tb19.text_frame
    tf19.word_wrap = True

    if has_logo_stacked:
        s19.shapes.add_picture(logo_stacked_path, Inches(5.8), Inches(1.5), height=Inches(1.2))
    elif has_logo_mark:
        s19.shapes.add_picture(logo_mark_path, Inches(6.0), Inches(1.5), height=Inches(1.2))

    p = tf19.paragraphs[0]
    p.text = "\n\n\nThank You!"
    p.font.size = Pt(36)
    p.font.bold = True
    p.font.color.rgb = C_NAVY
    p.alignment = PP_ALIGN.CENTER

    p = tf19.add_paragraph()
    p.text = "Questions & Answers (Q&A)"
    p.font.size = Pt(22)
    p.font.bold = True
    p.font.color.rgb = C_ORANGE
    p.alignment = PP_ALIGN.CENTER
    p.space_before = Pt(6)

    p = tf19.add_paragraph()
    p.text = "I welcome feedback, inquiries, and technical discussion from the examination committee."
    p.font.size = Pt(13)
    p.font.color.rgb = C_DARK
    p.alignment = PP_ALIGN.CENTER
    p.space_before = Pt(16)

    p = tf19.add_paragraph()
    p.text = "Bete – Household Repair & Maintenance Service\nAddis Ababa, Ethiopia • 2026"
    p.font.size = Pt(12)
    p.font.italic = True
    p.font.color.rgb = C_GRAY
    p.alignment = PP_ALIGN.CENTER
    p.space_before = Pt(16)

    set_notes(s19, "Thank you very much for your time, attention, and guidance throughout this project defense. I am now honored to answer any questions or technical inquiries from the committee.")

    output_path = "Bete_Project_Defense.pptx"
    prs.save(output_path)
    print(f"Presentation saved successfully to: {os.path.abspath(output_path)}")

if __name__ == "__main__":
    create_presentation()
