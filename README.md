# RogNidhi (रोगनिधि) 🩺
**Your Digital Health Treasury**

RogNidhi is an AI-powered personal health record system designed to centralize fragmented medical histories. From handwritten prescriptions to digital lab reports, RogNidhi organizes your lifelong medical data into a secure, searchable, and chronological timeline.

---

## 🚩 The Problem
A patient's medical history is often scattered across paper files, PDFs, and incompatible electronic systems. This fragmentation leads to:
* **Redundant Tests:** Frequent repeats of diagnostic procedures due to missing records.
* **Delayed Diagnoses:** Doctors waste time piecing together incomplete histories.
* **Patient Stress:** Individuals struggle to remember complex medical details over many years.
* **Medical Errors:** Incomplete information can lead to clinical oversights.

## 💡 Our Solution
RogNidhi acts as a lifelong treasury for medical information, providing a seamless interface for patients, doctors, and diagnostic labs.

### Key Features

#### 👤 For Patients
* **One Place for Everything:** Store blood tests, pathology reports, prescriptions, vaccination records, and insurance documents.
* **Automatic Organization:** AI reads uploaded reports to extract key values and dates, building a visual health timeline.
* **Trend Analysis:** View easy-to-read graphs of your health metrics over time.
* **Lifelong Access:** Your data stays with you, even if you change cities or doctors.

#### 👨‍⚕️ For Doctors
* **AI Clinical Summaries:** Get an instant, organized summary of a patient's entire history.
* **Granular Search:** Quickly find specific details from past consultations or lab results.
* **Consent-Based Access:** View records only when the patient grants temporary access.

#### 🔬 For Hospitals & Labs
* **Direct Sync:** Labs can push reports directly to a patient’s profile via API.
* **Instant Notifications:** Patients are notified the moment their results are ready and their timeline is updated.

---

## 🛠 Tech Stack

### **Presentation Layer**
* **Mobile:** Flutter + Dart (Cross-platform iOS/Android, Document Scanning, Offline Support)
* **Web:** React.js + TypeScript (Doctor/Admin Portal, Patient Dashboard)

### **Backend API Layer**
* **Framework:** Django
* **Modules:** Auth, User Management, Document Processing, AI Pipeline, Audit Logs

### **Data Layer**
* **Database:** MySQL (Primary storage for profiles, permissions, and sharing records)

### **AI & ML Layer**
* **Summarization:** LangChain
* **ML Frameworks:** PyTorch and Transformers
* **OCR:** Tesseract / EasyOCR (For data extraction from images and PDFs)

---

## ⚙️ How It Works (Workflow)
1.  **Input:** Patient uploads photos/PDFs or labs sync via API.
2.  **AI Processing:** System uses OCR and Named Entity Recognition to identify medical terms and extract data.
3.  **Secure Treasury:** Information is stored in an end-to-end encrypted environment.
4.  **Output:** Patients view trends; Doctors receive AI-generated clinical summaries upon request.

---

## 🚀 Future Scope
* **Active Clinical Network:** Connecting patients and doctors in a real-time health ecosystem.
* **AI Health Assistant:** Leveraging historical data to provide proactive, intelligent health guidance.
* **Appointment Management:** Integrated scheduling for consultations and follow-ups.

---

## 👥 Team TLE (NIT Jalandhar)
* **Yash Patel** - 2nd Year
* **Aditya Soni** - 2nd Year
* **Ashima Sood** - 2nd Year
* **Udayveer Singh** - 2nd Year

*Created for **HackMol 7.0***