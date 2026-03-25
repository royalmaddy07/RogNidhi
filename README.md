# RogNidhi (रोगनिधि) - Your Digital Health Treasury

[cite_start]**RogNidhi** is an AI-powered, lifelong medical information treasury designed to solve the critical problem of fragmented medical histories[cite: 33, 34]. [cite_start]By leveraging advanced extraction and organization tools, RogNidhi centralizes scattered health data—from handwritten prescriptions to digital lab reports—into a single, secure, and organized chronological timeline[cite: 35, 41, 59].

---

## 🏥 The Problem: Fragmented Care
[cite_start]Currently, a patient’s medical history is often scattered across paper files, PDFs, and incompatible electronic systems[cite: 13]. This fragmentation leads to:
* [cite_start]**Redundant Testing:** Lack of accessible history results in repeated diagnostic tests[cite: 17].
* [cite_start]**Delayed Diagnoses:** Doctors waste precious time piecing together incomplete records instead of delivering care[cite: 16, 17].
* [cite_start]**Patient Burden:** Individuals struggle to remember years of complex medical details and test results[cite: 14, 15].

## ✨ Our Solution: RogNidhi
[cite_start]RogNidhi acts as a secure "treasury" for all health-related documents, providing an intelligent interface for both patients and healthcare providers[cite: 34, 123].

### Key Features
#### For Patients
* [cite_start]**Unified Storage:** One secure location for blood tests, prescriptions, vaccination records, and insurance documents[cite: 48, 50, 53, 55, 56].
* [cite_start]**Automatic Organization:** AI extracts test names, values, and dates to build a chronological health timeline and easy-to-read trend graphs[cite: 58, 59].
* [cite_start]**Instant Sharing:** Share a complete, organized summary with doctors with a single click[cite: 60, 61].
* [cite_start]**Lifelong Accessibility:** Access your history anywhere, whether you change cities or switch doctors[cite: 62, 63].

#### For Doctors & Healthcare Providers
* [cite_start]**AI Clinical Summaries:** Receive automated summaries of a patient’s history to save time during consultations[cite: 38, 66, 68].
* [cite_start]**Precision Data:** Search for specific details within a patient’s extensive medical record[cite: 39].
* [cite_start]**Direct Integration:** Labs and hospitals can push reports directly to a patient’s profile via API[cite: 69, 70, 131].

---

## 🛠 Tech Stack

### **1. [cite_start]Presentation Layer** [cite: 80, 85]
* **Mobile:** Flutter + Dart (iOS, Android, Offline Support, Document Scanning)[cite: 81, 88].
* [cite_start]**Web:** React.js + TypeScript (Doctor/Admin Portal, Patient Dashboard)[cite: 82, 86, 87].

### **2. [cite_start]Backend & API Layer** [cite: 89, 91]
* **Framework:** Django[cite: 89, 91].
* [cite_start]**Modules:** Auth, User, Document, AI Pipeline, Notification, and Audit Modules[cite: 90, 92, 94, 96, 98].

### **3. [cite_start]Data & Storage** [cite: 99, 101]
* **Primary Database:** MySQL (Users, Profiles, Permissions, Sharing Records)[cite: 99, 103, 107].

### **4. [cite_start]AI & ML Layer** [cite: 108, 112]
* **Summarization:** LangChain[cite: 109, 113].
* [cite_start]**Models:** PyTorch and Transformers[cite: 110, 114].
* [cite_start]**OCR:** Tesseract / EasyOCR (for extracting data from images/PDFs)[cite: 111, 116].

---

## ⚙️ Workflow
1. [cite_start]**Input:** Users upload PDFs/Photos or labs sync reports via API[cite: 122, 130, 131].
2. [cite_start]**AI Processing:** System performs OCR and Named Entity Recognition to identify medical terms and build trends[cite: 134, 136, 137, 139].
3. [cite_start]**Storage:** Data is kept in an end-to-end encrypted, lifelong treasury[cite: 140, 142, 143].
4. [cite_start]**Access:** Patients view their trends, and doctors receive instant clinical summaries upon granted access[cite: 141, 144, 145].

---

## 🚀 Future Scope
* **Active Clinical Network:** Moving from passive storage to a network connecting patients and facilities[cite: 151, 152].
* [cite_start]**Health Assistant:** Proactive AI-based health guidance leveraging accumulated data[cite: 153].
* [cite_start]**Comprehensive Care:** Integration of appointment management and a platform touching every aspect of healthcare delivery[cite: 153, 154].

---

## [cite_start]👥 The Team: TLE [cite: 4]
[cite_start]**Institution:** NIT Jalandhar [cite: 9]
* **Yash Patel** (2nd Year) [cite: 5]
* [cite_start]**Aditya Soni** (2nd Year) [cite: 6]
* [cite_start]**Ashima Sood** (2nd Year) [cite: 7]
* **Udayveer Singh** (2nd Year) [cite: 8]

*Developed for **HackMol 7.0***[cite: 1, 3].