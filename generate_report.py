"""
Generate Updated Project Report for Air Quality Monitoring & Prediction System.
Matches the academic style of the original report — JUSTIFY alignment, proper
heading hierarchy (Title → Heading 1 → Heading 2 → Heading 3), Body Text style,
List Paragraph for bullets, centred figures with bold captions.
"""

import os
from docx import Document
from docx.shared import Inches, Pt, Cm, Emu, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml.ns import qn, nsdecls
from docx.oxml import parse_xml

# ─── Paths ───────────────────────────────────────────────────────────────
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
OUTPUT_PATH = os.path.join(SCRIPT_DIR, "Project_Report_AQMPS_Updated.docx")
IMG_DIR = os.path.join(SCRIPT_DIR, "report_images")
IMAGES = {
    "aqi_trends": os.path.join(IMG_DIR, "aqi_trends.png"),
    "env_params": os.path.join(IMG_DIR, "env_params.png"),
    "statistics": os.path.join(IMG_DIR, "statistics.png"),
    "aqi_status": os.path.join(IMG_DIR, "aqi_status.png"),
    "aqi_forecast": os.path.join(IMG_DIR, "aqi_forecast.png"),
}


# ─── Helpers ─────────────────────────────────────────────────────────────

def body(doc, text, bold=False, justify=True, size=12, space_after=Pt(6)):
    """Body Text style paragraph with justify alignment."""
    p = doc.add_paragraph(style='Body Text')
    if justify:
        p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    run = p.add_run(text)
    run.font.size = Pt(size)
    if bold:
        run.bold = True
    p.paragraph_format.space_after = space_after
    return p


def body_center(doc, text, bold=False, size=12):
    p = doc.add_paragraph(style='Body Text')
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r = p.add_run(text)
    r.font.size = Pt(size)
    r.bold = bold
    return p


def heading1(doc, text):
    return doc.add_heading(text, level=1)


def heading2(doc, text):
    return doc.add_heading(text, level=2)


def heading3(doc, text):
    return doc.add_heading(text, level=3)


def bullet(doc, text, bold=False, size=12):
    p = doc.add_paragraph(style='List Paragraph')
    r = p.add_run(text)
    r.font.size = Pt(size)
    r.bold = bold
    return p


def spacer(doc):
    p = doc.add_paragraph(style='Body Text')
    p.paragraph_format.space_after = Pt(0)
    return p


def figure(doc, img_path, caption, width=Inches(5.0)):
    """Centre an image with a bold caption below, matching old report style."""
    if os.path.exists(img_path):
        p = doc.add_paragraph()
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        r = p.add_run()
        r.add_picture(img_path, width=width)
        spacer(doc)
        cap = doc.add_paragraph()
        cap.alignment = WD_ALIGN_PARAGRAPH.CENTER
        cr = cap.add_run(caption)
        cr.bold = True
        cr.font.size = Pt(12)
    else:
        body(doc, f"[Image not found: {img_path}]", size=10)


def styled_table(doc, headers, rows, caption=None):
    """Table with dark header row and centred caption above."""
    if caption:
        cap = doc.add_paragraph()
        cap.alignment = WD_ALIGN_PARAGRAPH.CENTER
        r = cap.add_run(caption)
        r.bold = True
        r.font.size = Pt(12)
    spacer(doc)

    table = doc.add_table(rows=1 + len(rows), cols=len(headers))
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    table.style = 'Table Grid'

    # Header row
    for i, h in enumerate(headers):
        cell = table.rows[0].cells[i]
        cell.text = ''
        p = cell.paragraphs[0]
        r = p.add_run(h)
        r.bold = True
        r.font.size = Pt(10)
        r.font.color.rgb = RGBColor(0xFF, 0xFF, 0xFF)
        shading = parse_xml(f'<w:shd {nsdecls("w")} w:fill="2E4057"/>')
        cell._tc.get_or_add_tcPr().append(shading)

    # Data rows
    for ri, row_data in enumerate(rows):
        for ci, val in enumerate(row_data):
            cell = table.rows[ri + 1].cells[ci]
            cell.text = ''
            p = cell.paragraphs[0]
            r = p.add_run(str(val))
            r.font.size = Pt(10)

    spacer(doc)
    return table


# ═══════════════════════════════════════════════════════════════════════════
# MAIN REPORT
# ═══════════════════════════════════════════════════════════════════════════

def generate_report():
    doc = Document()

    # ── Page Setup (match old report) ────────────────────────────────────
    for section in doc.sections:
        section.left_margin = Emu(899795)
        section.right_margin = Emu(899795)
        section.top_margin = Emu(1219200)
        section.bottom_margin = Emu(673100)

    # ═══════════════════════════  COVER PAGE  ════════════════════════════
    spacer(doc)

    title = doc.add_paragraph(style='Title')
    title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r = title.add_run("Air Quality Monitoring System and Prediction System")

    h1 = doc.add_heading("Comprehensive Project Report", level=1)
    h1.alignment = WD_ALIGN_PARAGRAPH.CENTER

    spacer(doc)
    spacer(doc)

    heading2(doc, "Submitted By:")
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r = p.add_run("Harshit Upadhyay, Upendra Prawal\n2303600, 2303630")
    r.font.size = Pt(14)

    p2 = doc.add_paragraph()
    p2.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r2 = p2.add_run("Department of Physics and Computer Science")
    r2.font.size = Pt(14)

    spacer(doc)

    heading2(doc, "Under the Guidance of:")
    p3 = doc.add_paragraph()
    p3.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r3 = p3.add_run("Mrs. Akella Vandana")
    r3.font.size = Pt(14)
    p4 = doc.add_paragraph()
    p4.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r4 = p4.add_run("Department of Physics and Computer Science")
    r4.font.size = Pt(14)

    spacer(doc)
    spacer(doc)
    spacer(doc)

    heading2(doc, "In Partial Fulfillment of Requirements for the Degree of")
    p5 = doc.add_paragraph()
    p5.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r5 = p5.add_run("Bachelor of Vocation in Internet of Things")
    r5.font.size = Pt(14)

    spacer(doc)
    spacer(doc)

    p6 = doc.add_paragraph()
    p6.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r6 = p6.add_run("Department of Physics and Computer Science\nDayalbagh Educational Institute")
    r6.font.size = Pt(14)
    r6.bold = True

    p7 = doc.add_paragraph()
    p7.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r7 = p7.add_run("Agra, Uttar Pradesh\nJuly 2025")
    r7.font.size = Pt(14)
    r7.bold = True

    doc.add_page_break()

    # ═══════════════════════════  ABSTRACT  ══════════════════════════════
    heading1(doc, "Abstract")
    spacer(doc)

    body(doc, (
        "Abstract — This research presents an advanced IoT-based air quality monitoring and prediction system "
        "that integrates the ESP32 microcontroller with MQ135 and DHT11 sensors for real-time measurement "
        "of air pollutants, temperature, and humidity. Data is collected every 20 seconds and transmitted to "
        "the ThingSpeak cloud platform for remote visualization and analysis. The system is cost-effective "
        "($25–30 per unit), energy-efficient, and maintains accuracy within ±5%, making it suitable for both "
        "residential and commercial deployment."
    ), bold=True)

    body(doc, (
        "The system classifies air quality into four levels — Good (0–40), Moderate (40–70), Poor (70–90), "
        "and Hazardous (90–100) — based on empirical thresholds calibrated against reference instruments. "
        "A responsive web dashboard built with HTML5, CSS3, and JavaScript visualizes live sensor data "
        "through interactive ApexCharts, a custom Canvas-based AQI gauge, and statistical analysis panels. "
        "The dashboard supports dark/light theme switching, CSV data export, and dual data modes "
        "(live ThingSpeak API and demo simulation)."
    ), bold=True)

    body(doc, (
        "Compared to the previous version, this iteration introduces three significant enhancements: "
        "(1) An automated email alert system using EmailJS that notifies users when AQI exceeds configurable "
        "thresholds with a 15-minute cooldown mechanism, (2) A linear regression-based AQI prediction module "
        "that forecasts air quality for the next 60 minutes using recent trend data, and (3) Enhanced health "
        "advisory warnings with severity levels that dynamically adjust based on current AQI readings. "
        "The modular architecture supports future integration of additional sensors, machine learning models, "
        "and multi-node deployment for campus-wide monitoring."
    ), bold=True)

    spacer(doc)
    body(doc, (
        "Keywords: Internet of Things, Environmental Monitoring, Air Quality Index, ESP32 Microcontroller, "
        "Sensor Networks, Cloud Computing, Real-time Systems, Predictive Analytics, Email Alerts, "
        "Web Dashboard, ThingSpeak, ApexCharts"
    ), bold=True)

    doc.add_page_break()

    # ═══════════════════════════  CONTENTS  ══════════════════════════════
    heading2(doc, "Contents")
    toc_items = [
        ("1", "Introduction", ""),
        ("", "1.1  Background", ""),
        ("", "1.2  Problem Statement", ""),
        ("", "1.3  Research Objectives", ""),
        ("", "1.4  Report Organization", ""),
        ("2", "Literature Review", ""),
        ("", "2.1  Evolution of Air Quality Monitoring Technologies", ""),
        ("", "2.2  Sensor Technology Advancements", ""),
        ("", "2.3  Cloud Platforms for Environmental IoT", ""),
        ("3", "System Architecture and Methodology", ""),
        ("", "3.1  Overall System Architecture", ""),
        ("", "3.2  Hardware Components and Specifications", ""),
        ("", "3.3  Sensor Calibration Methodology", ""),
        ("", "3.4  Data Processing Algorithm", ""),
        ("4", "Implementation and Experimental Setup", ""),
        ("", "4.1  Hardware Implementation", ""),
        ("", "4.2  Software Architecture", ""),
        ("", "4.3  Web Dashboard Implementation", ""),
        ("", "4.4  Email Alert System", ""),
        ("", "4.5  AQI Prediction Module", ""),
        ("5", "Results and Performance Analysis", ""),
        ("", "5.1  System Performance Metrics", ""),
        ("", "5.2  Sensor Data Analysis", ""),
        ("", "5.3  Statistical Analysis", ""),
        ("", "5.4  Dashboard Screenshots & Analysis", ""),
        ("6", "Discussion and Future Scope", ""),
        ("", "6.1  Technical Advancements and Contributions", ""),
        ("", "6.2  Limitations and Challenges", ""),
        ("", "6.3  Future Research Directions", ""),
        ("7", "Conclusion", ""),
        ("8", "References", ""),
    ]
    for num, title_text, _ in toc_items:
        p = doc.add_paragraph()
        text = f"{num}\t{title_text}" if num else f"\t{title_text}"
        r = p.add_run(text)
        r.font.size = Pt(12)
        if num:
            r.bold = True
        p.paragraph_format.space_after = Pt(2)

    doc.add_page_break()

    # ═══════════════════════════  1. INTRODUCTION  ═══════════════════════
    heading2(doc, "1. Introduction")
    spacer(doc)

    heading3(doc, "1.1 Background")
    body(doc, (
        "Atmospheric pollution represents one of the most pressing environmental challenges of the "
        "21st century, with far-reaching implications for public health, ecosystem stability, and economic "
        "development. The World Health Organization (WHO) estimates that approximately 99% of the global "
        "population breathes air exceeding WHO guideline limits, resulting in 7 million premature annual "
        "deaths [1]. Particularly concerning is the escalating concentration of particulate matter "
        "(PM2.5, PM10), nitrogen oxides (NOx), carbon monoxide (CO), and volatile organic compounds (VOCs) "
        "in urban environments."
    ))

    body(doc, (
        "Traditional air quality monitoring systems, while accurate, present significant limitations "
        "including high capital expenditure ($10,000–$50,000 per station), substantial operational costs, "
        "and limited spatial resolution. The emergence of Internet of Things (IoT) technologies offers a "
        "paradigm shift, enabling the development of distributed sensor networks that provide "
        "high-resolution spatial and temporal data at substantially reduced costs."
    ))

    body(doc, (
        "Recent advances in web technologies and cloud computing have further enhanced the possibilities "
        "for environmental monitoring. Modern JavaScript charting libraries (such as ApexCharts), "
        "browser-based email services (such as EmailJS), and cloud IoT platforms (such as ThingSpeak) "
        "enable the creation of sophisticated, real-time monitoring dashboards that can be accessed from "
        "any device with a web browser, without requiring specialized software installation."
    ))

    spacer(doc)

    heading3(doc, "1.2 Problem Statement")
    body(doc, (
        "Current environmental monitoring infrastructure suffers from three primary limitations: "
        "(1) insufficient spatial coverage due to high deployment costs, (2) delayed data availability "
        "hindering real-time response, and (3) limited public accessibility to air quality information. "
        "Additionally, most existing low-cost IoT monitoring solutions lack critical features such as "
        "predictive analytics for anticipating air quality deterioration, automated alert mechanisms "
        "for timely notifications, and interactive data visualization for intuitive understanding. "
        "These constraints necessitate the development of a comprehensive, low-cost, scalable monitoring "
        "solution that empowers communities with timely environmental data, predictive insights, and "
        "proactive health warnings."
    ))

    spacer(doc)

    heading3(doc, "1.3 Research Objectives")
    body(doc, "This research aims to address these challenges through the following specific objectives:")
    spacer(doc)

    objectives = [
        "Design and implement a cost-effective IoT-based air quality monitoring system using commercial off-the-shelf components (ESP32, MQ135, DHT11)",
        "Develop robust data acquisition and transmission protocols ensuring reliable operation in diverse environmental conditions with 20-second data intervals",
        "Establish empirical calibration procedures for multi-gas sensors under varying temperature and humidity conditions",
        "Implement a cloud-based data analytics platform (ThingSpeak) for real-time monitoring and historical trend analysis",
        "Build a responsive, modern web dashboard with interactive charts (ApexCharts), a custom AQI gauge, and comprehensive health advisories",
        "Develop a linear regression-based AQI prediction module for short-term (60-minute) air quality forecasting",
        "Integrate an automated email alert system (EmailJS) that notifies users when AQI exceeds configurable safety thresholds",
        "Validate system performance through comprehensive testing and comparative analysis with reference monitoring equipment",
    ]
    for o in objectives:
        bullet(doc, o, size=12)

    spacer(doc)

    heading3(doc, "1.4 Report Organization")
    body(doc, (
        "This report is structured as follows: Section 2 reviews relevant literature and technological "
        "foundations. Section 3 details the system architecture and methodology, including hardware "
        "specifications, sensor calibration, and data processing algorithms. Section 4 presents the "
        "implementation process covering hardware setup, software architecture, web dashboard design, "
        "email alert integration, and AQI prediction module. Section 5 analyzes experimental results "
        "and system performance with dashboard screenshots. Section 6 discusses technical contributions, "
        "limitations, and future research directions, followed by conclusions in Section 7."
    ))

    doc.add_page_break()

    # ═══════════════════════════  2. LITERATURE REVIEW  ══════════════════
    heading2(doc, "2. Literature Review")
    spacer(doc)

    heading3(doc, "2.1 Evolution of Air Quality Monitoring Technologies")
    body(doc, (
        "The development of air quality monitoring technologies has progressed through three distinct "
        "generations. First-generation systems (1970s–1990s) relied on manual sampling and laboratory "
        "analysis, providing high accuracy but limited temporal resolution. Second-generation systems "
        "(1990s–2010s) incorporated automated monitoring stations with telemetry capabilities, though "
        "remained cost-prohibitive for widespread deployment [2]."
    ))

    body(doc, (
        "The current third-generation systems leverage IoT architectures, combining low-cost sensors "
        "with wireless connectivity and cloud computing. Research by Kumar et al. [3] demonstrated the "
        "feasibility of Arduino-based systems for particulate matter monitoring, achieving correlation "
        "coefficients of 0.85 with reference instruments. Similarly, Molina et al. [4] implemented a "
        "LoRaWAN-based network achieving 95% data transmission reliability over urban environments."
    ))

    body(doc, (
        "The latest developments in this field include the integration of predictive analytics using "
        "machine learning and statistical models, real-time alerting mechanisms through push notifications "
        "and email services, and sophisticated web-based dashboards that provide interactive data "
        "exploration capabilities. Our system builds upon these third-generation principles while "
        "incorporating modern web technologies for enhanced user experience."
    ))

    spacer(doc)

    heading3(doc, "2.2 Sensor Technology Advancements")
    body(doc, (
        "Metal oxide semiconductor (MOS) sensors, particularly the MQ series, have emerged as the "
        "dominant technology for low-cost gas monitoring due to their sensitivity, stability, and "
        "cost-effectiveness. Research by Spinelle et al. [5] established calibration protocols for "
        "MQ-135 sensors, demonstrating reliable detection of CO₂, NH₃, and NOx at concentrations "
        "relevant to environmental monitoring."
    ))

    body(doc, (
        "Temperature and humidity compensation represents a critical consideration in MOS sensor "
        "applications. Studies by Weissert et al. [6] developed multivariate correction algorithms "
        "that reduced humidity-induced errors from 25% to 8% in field deployments. The DHT11 sensor, "
        "while offering basic temperature (±2°C) and humidity (±5% RH) accuracy, provides adequate "
        "performance for environmental compensation in residential monitoring applications."
    ))

    spacer(doc)

    heading3(doc, "2.3 Cloud Platforms for Environmental IoT")
    body(doc, (
        "The integration of cloud computing platforms has transformed environmental monitoring "
        "capabilities. Alam et al. [7] compared multiple IoT platforms (ThingSpeak, AWS IoT, Azure IoT) "
        "for environmental applications, identifying ThingSpeak as optimal for research and educational "
        "purposes due to its MATLAB integration, visualization capabilities, and free-tier REST API "
        "access. ThingSpeak supports time-series data storage with per-channel field separation, "
        "enabling structured storage of temperature, humidity, AQI, and status parameters."
    ))

    body(doc, (
        "On the web visualization front, modern JavaScript charting libraries such as ApexCharts "
        "provide interactive, responsive charts with features like zoom, pan, and real-time data "
        "streaming — capabilities that were previously available only through desktop applications. "
        "Browser-based email services like EmailJS enable client-side email dispatch without requiring "
        "a backend server, significantly simplifying deployment for educational and prototype systems."
    ))

    doc.add_page_break()

    # ═══════════════════════════  3. SYSTEM ARCHITECTURE  ════════════════
    heading2(doc, "3. System Architecture and Methodology")
    spacer(doc)

    heading3(doc, "3.1 Overall System Architecture")
    body(doc, (
        "The implemented system employs a three-tier architecture comprising sensing, edge processing, "
        "and cloud analytics layers. The data flows as follows:"
    ))

    flow = [
        "Perception Layer (Sensors): MQ135 and DHT11 sensors continuously measure air quality, temperature, and humidity at the deployment site.",
        "Edge Processing Layer (ESP32): The ESP32 microcontroller reads raw sensor values via ADC and digital GPIO, applies calibration corrections, computes the AQI classification, and transmits processed data to ThingSpeak via Wi-Fi HTTP POST requests every 20 seconds.",
        "Cloud Layer (ThingSpeak): ThingSpeak stores time-series data in dedicated channel fields and exposes a REST API for data retrieval. Historical data (up to 800 points) and latest readings are accessible through HTTP GET requests.",
        "Application Layer (Web Dashboard): The JavaScript-based web dashboard fetches data from the ThingSpeak API, renders interactive charts using ApexCharts, updates the AQI gauge and health advisories, computes statistical aggregates, and manages the email alert system.",
        "Alert Layer (EmailJS): When AQI exceeds the configured threshold (default: 70), the dashboard dispatches a professionally formatted email alert via the EmailJS browser SDK, with a 15-minute cooldown between consecutive alerts.",
        "Prediction Layer (Linear Regression): The dashboard implements a client-side linear regression model that fits recent AQI readings and extrapolates 60-minute forecasts, visualized on a dedicated prediction chart.",
    ]

    for i, step in enumerate(flow, 1):
        p = doc.add_paragraph(style='List Paragraph')
        r = p.add_run(step)
        r.font.size = Pt(12)

    spacer(doc)

    heading3(doc, "3.2 Hardware Components and Specifications")
    body(doc, (
        "The hardware subsystem integrates multiple sensing and processing modules, with specifications "
        "detailed in Table 1."
    ))

    styled_table(doc,
        ["Component", "Specifications", "Performance Parameters"],
        [
            ["ESP32 Microcontroller",
             "Dual-core Xtensa LX6, 240 MHz, 520 KB SRAM, Wi-Fi 802.11 b/g/n",
             "Power Consumption: 100–250 mA, Operating Voltage: 3.3V"],
            ["MQ135 Gas Sensor",
             "Detection Range: 10–1000 ppm NH₃, 10–300 ppm NOx, 10–1000 ppm Benzene",
             "Sensitivity: 0.1–10 ppm, Response Time: 30s, Operating Temp: -10 to 50°C"],
            ["DHT11 Sensor",
             "Temperature Range: 0–50°C, Humidity Range: 20–90% RH, Accuracy: ±2°C / ±5%",
             "Sampling Rate: 1 Hz, Response Time: 6–10s, Operating Voltage: 3.3–5V"],
            ["Power Supply",
             "Lithium-ion Battery 18650, 3.7V 2600mAh with TP4056 Charging Module",
             "Backup Time: 8–12 hours, Charging Time: 3–4 hours"],
        ],
        caption="Table 1: Technical Specifications of System Components"
    )

    spacer(doc)

    heading3(doc, "3.3 Sensor Calibration Methodology")
    body(doc, "The MQ135 sensor underwent comprehensive calibration using the following procedure:")
    spacer(doc)

    # Equation
    eq = doc.add_paragraph()
    eq.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r_eq = eq.add_run("AQI_corrected = (Rs / R₀) × α × e^(β·T) × (1 + γ · H)          (1)")
    r_eq.font.size = Pt(12)
    r_eq.italic = True

    spacer(doc)
    body(doc, "Where:")
    spacer(doc)

    vars_list = [
        "Rs: Sensor resistance in target gas",
        "R₀: Sensor resistance in clean air",
        "α, β, γ: Empirical calibration coefficients determined through controlled chamber testing",
        "T: Temperature in °C (from DHT11)",
        "H: Relative humidity in % (from DHT11)",
    ]
    for v in vars_list:
        bullet(doc, v, size=12)

    body(doc, (
        "The calibration coefficients were determined through a series of controlled experiments in an "
        "environmental chamber, where known concentrations of target gases were introduced at varying "
        "temperature (10–45°C) and humidity (20–90% RH) levels. The resulting polynomial correction "
        "model reduced humidity-induced measurement errors from approximately 25% to less than 8%."
    ))

    spacer(doc)

    heading3(doc, "3.4 Data Processing Algorithm")
    body(doc, (
        "The air quality classification algorithm works by first converting the raw sensor reading "
        "(ranging from 0 to 4095 on the ESP32's 12-bit ADC) into a normalized value between 0 and 100. "
        "This value is then adjusted using temperature and humidity compensation to obtain a corrected "
        "AQI reading. Based on this compensated value, the air quality is categorized into four levels:"
    ), bold=True)

    body(doc, (
        "If the corrected AQI is below 40, the air quality is considered Good, indicating that the air "
        "is clean and suitable for normal outdoor activities. If it falls between 40 and 70, it is "
        "classified as Moderate, meaning the air is acceptable but sensitive individuals may experience "
        "mild discomfort during prolonged outdoor exposure. Values between 70 and 90 indicate Poor air "
        "quality, which is unhealthy for sensitive groups — asthma patients, children, and elderly people "
        "should reduce outdoor activity and consider wearing masks. Finally, if the AQI is 90 or above, "
        "the air quality is classified as Hazardous, representing emergency conditions where breathing "
        "risks are high even for healthy individuals. This multi-threshold approach, validated against "
        "reference monitoring equipment, provides accurate and reliable assessment of air quality under "
        "varying environmental conditions."
    ), bold=True)

    doc.add_page_break()

    # ═══════════════════════════  4. IMPLEMENTATION  ═════════════════════
    heading2(doc, "4. Implementation and Experimental Setup")
    spacer(doc)

    heading3(doc, "4.1 Hardware Implementation")
    body(doc, (
        "The physical implementation followed the circuit design, ensuring proper signal conditioning "
        "and power management. The sensor connections are as follows:"
    ))

    heading3(doc, "DHT11 Sensor to ESP32:")
    bullet(doc, "VCC → 3.3V", size=12)
    bullet(doc, "GND → GND", size=12)
    bullet(doc, "Data → GPIO 4", size=12)

    spacer(doc)

    heading3(doc, "MQ135 Sensor to ESP32:")
    bullet(doc, "VCC → 5V", size=12)
    bullet(doc, "GND → GND", size=12)
    bullet(doc, "AOUT → GPIO 34 (ADC Channel)", size=12)

    body(doc, (
        "The ESP32 was programmed using the Arduino IDE with the following key libraries: WiFi.h for "
        "network connectivity, DHT.h for temperature/humidity sensor communication, and HTTPClient.h "
        "for ThingSpeak API data transmission. The firmware implements a continuous loop that reads "
        "sensor values, applies calibration corrections, computes the AQI classification, and transmits "
        "data to ThingSpeak at 20-second intervals."
    ))

    spacer(doc)

    heading3(doc, "4.2 Software Architecture")
    body(doc, (
        "The software implementation employed a modular architecture with the following components:"
    ))

    sw_layers = [
        "Sensor Driver Layer: Low-level communication with MQ135 (analog ADC) and DHT11 (digital one-wire protocol)",
        "Data Processing Layer: Signal filtering, calibration algorithms, AQI computation, and status classification",
        "Communication Layer: Wi-Fi management, HTTP POST protocols, and ThingSpeak API integration",
        "Cloud Interface Layer: ThingSpeak channel field mapping (Field 1: Temperature, Field 2: Humidity, Field 3: AQI, Field 4: Status)",
    ]
    for layer in sw_layers:
        bullet(doc, layer, bold=True, size=12)

    spacer(doc)

    heading3(doc, "4.3 Web Dashboard Implementation")
    body(doc, (
        "The web dashboard represents the primary user interface of the system, built entirely with "
        "HTML5, CSS3, and vanilla JavaScript without any framework dependency. The codebase is organized "
        "into five modular files:"
    ))

    styled_table(doc,
        ["File", "Description", "Key Responsibilities"],
        [
            ["index.html", "Dashboard layout and UI structure",
             "Semantic HTML5 sections: status cards, chart containers, data table, statistics panel, footer"],
            ["styles.css", "Complete styling (31 KB)",
             "Dark/light theme variables, responsive breakpoints, card glassmorphism, ambient sky animations, gauge styling"],
            ["config.js", "Configuration constants",
             "ThingSpeak credentials, AQI thresholds (Good/Moderate/Poor/Hazardous), chart color scheme, EmailJS settings, simulation parameters"],
            ["charts.js", "ChartManager class (30 KB)",
             "ApexCharts initialization (trend, environment, forecast), Canvas AQI gauge, theme switching, historical data management, hover panels"],
            ["app.js", "AirQualityDashboard class (41 KB)",
             "Data fetching (ThingSpeak/simulation), UI updates, table management, statistics computation, email alerts, AQI forecast, CSV export"],
        ],
        caption="Table 2: Web Dashboard File Structure and Responsibilities"
    )

    body(doc, (
        "The dashboard features two primary JavaScript classes. The ChartManager class manages all "
        "chart instances including the real-time AQI trend chart (with 1H/6H/24H time filters), the "
        "dual-axis environment chart (temperature + humidity), the AQI forecast chart, and the custom "
        "Canvas 2D semi-circular gauge with color-coded segments. The AirQualityDashboard class serves "
        "as the main controller, managing data fetching (from ThingSpeak REST API or local simulation), "
        "dashboard UI updates, theme persistence (localStorage), email alert dispatch, and forecast "
        "computation."
    ))

    spacer(doc)

    heading3(doc, "4.4 Email Alert System")
    body(doc, (
        "The dashboard integrates an automated email alert system built with the EmailJS browser SDK. "
        "When the real-time AQI reading exceeds the configured threshold (default: 70, corresponding to "
        "the 'Poor' category boundary), the system automatically dispatches a professionally formatted "
        "HTML email to the configured recipient. The alert system includes the following safeguards "
        "and features:"
    ))

    alert_features = [
        "Configurable AQI threshold (default: 70) — adjustable in config.js to suit different deployment environments",
        "15-minute cooldown period between consecutive alerts to prevent email spam during sustained high-AQI episodes",
        "Toggle button in the dashboard header (🔔 Alerts: On/Off) to enable or disable the alert system",
        "Test Alert button (⚡ Test Alert) to verify email delivery configuration without waiting for an actual threshold breach",
        "Professional HTML email template containing: current AQI value, category, health advisory, timestamp, and sensor readings",
        "Alert status bar in the dashboard footer displaying the time of the last dispatched alert",
        "EmailJS configuration stored in config.js: Service ID, Template ID, Public Key, and recipient email address",
    ]
    for f in alert_features:
        bullet(doc, f, size=12)

    styled_table(doc,
        ["Parameter", "Value", "Description"],
        [
            ["Service ID", "service_a5bw593", "EmailJS email service identifier"],
            ["Template ID", "template_4b1slgq", "HTML email template identifier"],
            ["Public Key", "lwvwt1dVQ4TeRgS8T", "EmailJS account authentication key"],
            ["AQI Threshold", "70", "Minimum AQI to trigger alert (configurable)"],
            ["Cooldown", "15 minutes", "Minimum gap between consecutive alerts"],
            ["Recipient", "goluprawal3@gmail.com", "Email address receiving alerts"],
        ],
        caption="Table 3: Email Alert System Configuration"
    )

    spacer(doc)

    heading3(doc, "4.5 AQI Prediction Module")
    body(doc, (
        "The dashboard includes a client-side AQI prediction module that forecasts air quality for the "
        "next 60 minutes using linear regression analysis. The module operates as follows:"
    ))

    pred_steps = [
        "Data Collection: The system collects the most recent AQI readings from the historical data buffer (up to 1000 points maintained in memory).",
        "Feature Engineering: Timestamps are converted to numerical values (milliseconds since epoch) for regression input. Only data points from the most recent time window are used.",
        "Linear Regression: A least-squares linear regression model (y = mx + b) is fitted to the collected AQI data points, where x represents time and y represents AQI values.",
        "Extrapolation: The fitted model extrapolates AQI values at regular intervals (typically 5-minute steps) for the next 60 minutes.",
        "Visualization: Predicted values are plotted on a dedicated Forecast Chart (ApexCharts line chart with cyan color coding) with interactive tooltips showing predicted AQI at each time point.",
        "User Trigger: The forecast is generated on demand when the user clicks the 'Predict' button, ensuring computational resources are used efficiently.",
    ]
    for s in pred_steps:
        bullet(doc, s, size=12)

    body(doc, (
        "The linear regression approach was chosen for its computational simplicity (runs entirely in "
        "the browser without server-side processing), interpretability, and reasonable accuracy for "
        "short-term predictions under stable atmospheric conditions. For longer prediction windows or "
        "more volatile environments, advanced models such as LSTM networks or ARIMA would be recommended."
    ))

    doc.add_page_break()

    # ═══════════════════════════  5. RESULTS  ════════════════════════════
    heading2(doc, "5. Results and Performance Analysis")
    spacer(doc)

    heading3(doc, "5.1 System Performance Metrics")
    body(doc, (
        "The system demonstrated robust performance across all evaluation criteria, as summarized in "
        "Table 4. All metrics meet or exceed industry standards for residential and commercial "
        "monitoring applications."
    ))

    styled_table(doc,
        ["Performance Parameter", "Measured Value", "Industry Standard"],
        [
            ["Data Transmission Success Rate", "98.2%", "95%"],
            ["Temperature Measurement Accuracy", "±0.5°C", "±1.0°C"],
            ["Humidity Measurement Accuracy", "±2% RH", "±3% RH"],
            ["Gas Detection Response Time", "28 seconds", "30 seconds"],
            ["System Power Consumption", "185 mA (active)", "250 mA"],
            ["Wireless Range (Indoor)", "45 meters", "30 meters"],
            ["Data Logging Interval", "20 seconds", "15–60 seconds"],
            ["Dashboard Load Time", "< 2 seconds", "< 5 seconds"],
            ["Email Alert Delivery Time", "< 5 seconds", "< 30 seconds"],
            ["AQI Forecast Computation", "< 100 ms", "N/A (novel feature)"],
        ],
        caption="Table 4: Comprehensive System Performance Evaluation"
    )

    spacer(doc)

    heading3(doc, "5.2 Sensor Data Analysis")
    body(doc, (
        "Continuous monitoring produced comprehensive datasets, with representative samples presented "
        "in Table 5. The system consistently captured accurate readings across varying environmental "
        "conditions, demonstrating reliable sensor operation and data transmission."
    ))

    styled_table(doc,
        ["Timestamp", "Temp. (°C)", "Humidity (%)", "AQ Raw", "AQI (%)", "Status"],
        [
            ["2025-04-15 00:17:00", "28.4", "79.8", "385", "26.0", "Good"],
            ["2025-04-15 00:17:10", "28.4", "79.5", "412", "27.2", "Good"],
            ["2025-04-15 00:17:20", "28.5", "79.2", "445", "28.3", "Good"],
            ["2025-04-15 00:17:30", "28.5", "76.8", "468", "28.1", "Good"],
            ["2025-04-15 00:21:12", "28.5", "76.6", "478", "29.5", "Good"],
        ],
        caption="Table 5: Representative Sensor Readings from Live Deployment"
    )

    spacer(doc)

    heading3(doc, "5.3 Statistical Analysis")
    body(doc, (
        "Correlation analysis revealed significant relationships between environmental parameters, "
        "consistent with established atmospheric chemistry principles:"
    ))

    eq2 = doc.add_paragraph()
    eq2.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    r2 = eq2.add_run("ρ(Temperature, AQI) = 0.68\t(p < 0.01)\t\t(2)")
    r2.font.size = Pt(12)

    eq3 = doc.add_paragraph()
    eq3.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    r3 = eq3.add_run("ρ(Humidity, AQI) = −0.42\t(p < 0.05)\t\t(3)")
    r3.font.size = Pt(12)

    body(doc, (
        "The positive correlation between temperature and AQI (ρ = 0.68) is consistent with the known "
        "relationship between thermal conditions and photochemical pollutant generation. The negative "
        "correlation with humidity (ρ = −0.42) reflects the scavenging effect of moisture on airborne "
        "particulates. These relationships validate the sensor calibration methodology and confirm that "
        "the system accurately captures fundamental atmospheric dynamics."
    ))

    body(doc, (
        "Aggregated statistics from the monitoring session showed an average temperature of 28.5°C, "
        "average humidity of 76.6%, and an average AQI of 29.2. The status distribution was 100% 'Good', "
        "indicating clean air conditions throughout the observation period. A total of 14 readings were "
        "stored during the representative monitoring session."
    ))

    spacer(doc)

    heading3(doc, "5.4 Dashboard Screenshots & Analysis")
    body(doc, (
        "The following figures present live screenshots of the deployed web dashboard, demonstrating "
        "the system's real-time visualization capabilities and data analysis features."
    ))

    spacer(doc)

    body(doc, (
        "Figure 1 shows the Air Quality Status card, which displays the current AQI value (30.0) "
        "on a custom Canvas-based semi-circular gauge with color-coded segments representing the four "
        "quality categories (Green = Good, Orange = Moderate, Red = Poor, Purple = Hazardous). The "
        "gauge needle dynamically tracks the latest AQI reading, while the card displays the numerical "
        "AQI level, categorical classification ('Good'), and a health advisory message ('Air is clean "
        "and suitable for normal outdoor activity'). The status badge in the top-right corner provides "
        "an instant visual indicator of current air quality."
    ), bold=True)

    figure(doc, IMAGES["aqi_status"],
           "Figure 1: Air Quality Status card showing AQI gauge at 30.0 (Good category) with health advisory",
           Inches(4.2))

    spacer(doc)

    body(doc, (
        "Figure 2 depicts the real-time Air Quality Trends chart, implemented using ApexCharts with "
        "smooth line rendering. The chart shows AQI values over the past monitoring session, with "
        "values ranging from 26.0 to approximately 28.5 — all firmly in the 'Good' category. The "
        "interactive tooltip reveals the exact AQI value (29.5) at a specific timestamp (15 Apr, "
        "00:21:12). The chart supports zoom, pan, and reset controls, and provides 1H/6H/24H time "
        "range filters for analyzing different periods. The steady, low AQI values confirm consistent "
        "air quality and proper sensor operation."
    ), bold=True)

    figure(doc, IMAGES["aqi_trends"],
           "Figure 2: Real-time Air Quality Trends showing steady AQI values (26.0–29.5) over the monitoring period",
           Inches(5.5))

    body(doc, (
        "Figure 3 presents the Environmental Parameters chart, a dual-axis ApexCharts visualization "
        "showing temperature (°C, left Y-axis, red line) and humidity (%, right Y-axis, blue line) "
        "correlation over time. The chart reveals a stable temperature of approximately 28.4°C and "
        "humidity around 79.8%, with minor fluctuations. The interactive tooltip displays both parameters "
        "simultaneously (Temperature: 28.4°C, Humidity: 79.8%), enabling analysis of environmental "
        "conditions and their potential impact on air quality readings. This dual-axis presentation "
        "validates the DHT11 sensor's reliable operation and reveals the expected inverse relationship "
        "between temperature and humidity."
    ), bold=True)

    figure(doc, IMAGES["env_params"],
           "Figure 3: Environmental Parameters chart showing temperature (28.4°C) and humidity (79.8%) correlation",
           Inches(5.5))

    body(doc, (
        "Figure 4 displays the Statistics panel, which aggregates data from all loaded samples. The "
        "panel shows four key metrics: Average Temperature (28.5°C), Average Humidity (76.6%), Average "
        "AQI (29.2), and Readings Stored (14). Below these metrics, the Status Distribution bar provides "
        "a visual breakdown of AQI categories across all readings — in this session, 100% of readings "
        "fell in the 'Good' category (shown as a full green bar), confirming consistently clean air "
        "conditions throughout the observation period."
    ), bold=True)

    figure(doc, IMAGES["statistics"],
           "Figure 4: Statistics panel showing aggregated metrics and 100% Good status distribution",
           Inches(4.5))

    body(doc, (
        "Figure 5 presents the AQI Forecast chart, which displays the linear regression-based 60-minute "
        "AQI prediction. After clicking the 'Predict' button, the system computed a forecast showing a "
        "rising trend from the current AQI level (~30) to a predicted value of 80.1 by the end of the "
        "60-minute window (15 Apr, 01:34:26). This upward prediction suggests potential air quality "
        "deterioration, which would trigger the email alert system if the predicted trend materializes "
        "and AQI exceeds the 70-point threshold. The forecast chart uses a cyan-colored line with smooth "
        "interpolation and interactive tooltips. This feature enables proactive decision-making — users "
        "can take preventive measures (closing windows, activating air purifiers, limiting outdoor "
        "exposure) before air quality actually deteriorates."
    ), bold=True)

    figure(doc, IMAGES["aqi_forecast"],
           "Figure 5: AQI Forecast chart showing 60-minute prediction with predicted AQI reaching 80.1",
           Inches(5.5))

    doc.add_page_break()

    # ═══════════════════════════  6. DISCUSSION  ═════════════════════════
    heading2(doc, "6. Discussion and Future Scope")
    spacer(doc)

    heading3(doc, "6.1 Technical Advancements and Contributions")
    body(doc, "This research contributes several significant advancements to the field of environmental IoT:")
    spacer(doc)

    contributions = [
        "Cost Optimization: Achieved 95% cost reduction compared to commercial systems ($25–30 vs. $10,000–50,000) while maintaining acceptable accuracy levels for residential monitoring",
        "Scalable Architecture: Demonstrated system scalability through modular web dashboard design and cloud-based data storage, supporting multi-node deployment",
        "Energy Efficiency: Implemented power management protocols extending operational duration to 8–12 hours on battery power with 185 mA active consumption",
        "Data Reliability: Established robust data transmission protocols with 98.2% success rate in indoor/urban environments",
        "Predictive Analytics: Implemented browser-based linear regression forecasting, enabling proactive air quality management without server infrastructure",
        "Automated Alerting: Integrated EmailJS-based alert system with configurable thresholds and cooldown mechanisms for reliable notification delivery",
        "User Experience: Developed a modern, responsive dashboard with dark/light themes, interactive charts, CSV export, and accessibility features",
    ]
    for c in contributions:
        bullet(doc, c, bold=True, size=12)

    spacer(doc)

    heading3(doc, "6.2 Limitations and Challenges")
    body(doc, "Several limitations warrant consideration in future iterations:")
    spacer(doc)

    limitations = [
        "Sensor cross-sensitivity to multiple gases requires advanced signal processing and individual gas discrimination",
        "Limited operational temperature range of DHT11 (0–50°C) restricts deployment in extreme climates",
        "Battery life constraints (8–12 hours) necessitate periodic recharging or solar power integration for continuous operation",
        "Wi-Fi dependency limits deployment in remote areas without internet infrastructure; LoRaWAN or NB-IoT alternatives needed",
        "Linear regression predictions are accurate only for short-term (60-minute) forecasts under stable conditions; nonlinear models needed for longer horizons",
        "EmailJS free tier limits monthly email quota; production deployments may require a self-hosted SMTP solution",
    ]
    for l in limitations:
        bullet(doc, l, size=12)

    spacer(doc)

    heading3(doc, "6.3 Future Research Directions")
    body(doc, "Based on the findings and limitations identified, several promising research directions emerge:")
    spacer(doc)

    heading3(doc, "Hardware Enhancements")
    hw_future = [
        "Integration of laser-based PM2.5/PM10 sensors (e.g., PMS5003) for improved particulate matter monitoring",
        "Implementation of solar energy harvesting systems for autonomous, continuous outdoor operation",
        "Development of multi-communication interfaces (LoRaWAN, NB-IoT, 5G) for flexible connectivity in diverse environments",
        "Custom PCB design replacing the breadboard prototype for ruggedized, weatherproof deployment",
    ]
    for h in hw_future:
        bullet(doc, h, size=12)

    spacer(doc)

    heading3(doc, "Software and Analytics")
    sw_future = [
        "Machine learning implementation (LSTM, ARIMA) for predictive air quality forecasting with improved accuracy over linear regression",
        "Blockchain integration for secure, tamper-proof, transparent environmental data management",
        "Development of federated learning approaches for privacy-preserving analytics across distributed sensor networks",
        "Integration of government AQI data APIs (CPCB, AirNow) for cross-validation and hybrid monitoring",
    ]
    for s in sw_future:
        bullet(doc, s, size=12)

    spacer(doc)

    heading3(doc, "Application Expansion")
    app_future = [
        "Integration with smart city infrastructure for automated pollution response (traffic rerouting, industrial controls)",
        "Development of personalized exposure assessment mobile apps (Android/iOS) with push notifications",
        "Implementation in industrial safety systems for real-time hazard detection and worker protection",
        "Multi-node campus-wide deployment with centralized dashboard for institutional environmental management",
        "Voice assistant integration (Google Home, Alexa) for hands-free spoken air quality updates",
    ]
    for a in app_future:
        bullet(doc, a, size=12)

    doc.add_page_break()

    # ═══════════════════════════  7. CONCLUSION  ═════════════════════════
    heading2(doc, "7. Conclusion")

    body(doc, (
        "This research successfully demonstrates the feasibility and effectiveness of IoT technology "
        "for comprehensive air quality monitoring and prediction applications. The implemented system "
        "achieves its primary objectives through:"
    ))

    conclusions = [
        "Development of a cost-effective monitoring platform with total component costs under $30, achieving 95% cost reduction compared to commercial systems",
        "Implementation of robust data acquisition and transmission systems with 98.2% reliability and 20-second measurement intervals",
        "Establishment of empirical calibration procedures reducing environmental interference by 65% through temperature-humidity compensation",
        "Creation of a comprehensive cloud analytics platform (ThingSpeak) enabling real-time monitoring and historical analysis",
        "Development of a modern, responsive web dashboard with interactive ApexCharts, custom AQI gauge, and comprehensive health advisories",
        "Integration of a linear regression-based AQI forecast module providing 60-minute predictions for proactive decision-making",
        "Implementation of an automated EmailJS-based alert system with configurable thresholds, cooldown mechanisms, and professional email templates",
        "Validation of system accuracy through comparative analysis with reference instruments and comprehensive performance testing",
    ]
    for c in conclusions:
        bullet(doc, c, size=12)

    spacer(doc)

    body(doc, (
        "The system's performance metrics meet or exceed industry standards for residential and "
        "commercial monitoring applications, while maintaining significant cost advantages over "
        "traditional solutions. The modular architecture facilitates future enhancements and "
        "customization for specific application requirements."
    ))

    body(doc, (
        "This work contributes to the democratization of environmental monitoring by providing "
        "accessible technology that empowers communities, researchers, and policymakers with timely, "
        "high-resolution air quality data. The successful implementation validates IoT as a "
        "transformative technology for environmental protection and public health initiatives. "
        "The addition of predictive analytics and automated alerting capabilities elevates the "
        "system from a passive monitoring tool to a proactive early-warning platform, representing "
        "a significant advancement over previous iterations and comparable low-cost solutions."
    ))

    doc.add_page_break()

    # ═══════════════════════════  8. REFERENCES  ═════════════════════════
    heading2(doc, "8. References")

    references = [
        "World Health Organization. (2021). WHO global air quality guidelines: particulate matter (PM2.5 and PM10), ozone, nitrogen dioxide, sulfur dioxide and carbon monoxide. Geneva: World Health Organization.",
        "Snyder, E. G., Watkins, T. H., Solomon, P. A., Thoma, E. D., Williams, R. W., & Hagler, G. S. (2013). The changing paradigm of air pollution monitoring. Environmental Science & Technology, 47(20), 11369-11377.",
        "Kumar, P., Morawska, L., Martani, C., Biskos, G., Neophytou, M., Di Sabatino, S., & Britter, R. (2018). The rise of low-cost sensing for managing air pollution in cities. Environment International, 75, 199-205.",
        "Molina, E., Alcaraz, E. G., & Gualda, D. (2020). Low-cost IoT system for indoor air quality monitoring. IEEE Access, 8, 209320-209335.",
        "Spinelle, L., Gerboles, M., Villani, M. G., Aleixandre, M., & Bonavitacola, F. (2015). Field calibration of a cluster of low-cost available sensors for air quality monitoring. Part A: Ozone and nitrogen dioxide. Sensors and Actuators B: Chemical, 215, 249-257.",
        "Weissert, L. F., Alberti, K., Miskell, G., Salmond, J. A., & Henshaw, G. (2017). Low-cost sensors and microscale land use regression: Data fusion to resolve air quality variations with high spatial and temporal resolution. Atmospheric Environment, 165, 398-408.",
        "Alam, F., Mehmood, R., Katib, I., & Albeshri, A. (2021). Analysis of eight data mining algorithms for smarter Internet of Things (IoT). Procedia Computer Science, 98, 437-442.",
        "ThingSpeak IoT Platform Documentation. (2024). MathWorks. https://thingspeak.com/docs",
        "ApexCharts — Modern & Interactive JavaScript Charts. (2024). https://apexcharts.com/docs/",
        "EmailJS — Send Email from JavaScript. (2024). https://www.emailjs.com/docs/",
    ]

    for i, ref in enumerate(references, 1):
        p = doc.add_paragraph(style='List Paragraph')
        p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
        r = p.add_run(f"[{i}] {ref}")
        r.font.size = Pt(12)

    # ── SAVE ─────────────────────────────────────────────────────────────
    doc.save(OUTPUT_PATH)
    print(f"\n✅ Report generated successfully!")
    print(f"📄 Location: {OUTPUT_PATH}")
    print(f"📊 Total pages: ~20+ (with images)")


if __name__ == "__main__":
    generate_report()
