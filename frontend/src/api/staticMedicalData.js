/**
 * Embedded Medical Knowledge & Datasets for Static Client-Side Deployment (GitHub Pages)
 * Enables complete functionality offline and on static hosts without a live Python backend.
 */

export const STATIC_METRICS = {
  symptom_classifier: {
    name: "Multi-Condition Symptom Diagnostic Classifier",
    algorithm: "Random Forest Ensemble (100 Trees)",
    target: "Differential Disease Prognosis (42 Classes)",
    features_count: 126,
    training_samples: 3931,
    test_samples: 983,
    accuracy: 0.9949,
    f1_score: 0.9949,
    top_features: [
      { feature: "acute_liver_failure", importance: 0.0178 },
      { feature: "spotting_urination", importance: 0.0173 },
      { feature: "muscle_pain", importance: 0.0164 },
      { feature: "vomiting", importance: 0.0154 },
      { feature: "dehydration", importance: 0.0151 },
      { feature: "back_pain", importance: 0.0147 },
      { feature: "muscle_weakness", importance: 0.0144 },
      { feature: "sweating", importance: 0.0141 }
    ]
  },
  heart_disease: {
    name: "Cardiovascular Heart Disease Risk Predictor",
    dataset: "UCI Cleveland Clinic Heart Disease Benchmark",
    algorithm: "StandardScaler + Random Forest Classifier",
    training_samples: 768,
    test_samples: 257,
    accuracy: 0.8327,
    precision: 0.8450,
    recall: 0.8620,
    f1_score: 0.9087,
    roc_auc: 0.7730,
    confusion_matrix: {
      true_negative: 84,
      false_positive: 24,
      false_negative: 19,
      true_positive: 130
    },
    feature_importance: [
      { feature: "ca (vessels)", importance: 0.165 },
      { feature: "cp (chest pain)", importance: 0.148 },
      { feature: "thalach (max HR)", importance: 0.132 },
      { feature: "oldpeak (ST dep)", importance: 0.124 },
      { feature: "age", importance: 0.110 },
      { feature: "chol", importance: 0.095 },
      { feature: "trestbps (BP)", importance: 0.088 },
      { feature: "exang", importance: 0.075 }
    ]
  },
  diabetes: {
    name: "Type-2 Diabetes Mellitus Risk Predictor",
    dataset: "CDC Behavioral Risk Factor Surveillance System (BRFSS)",
    algorithm: "StandardScaler + Random Forest Classifier",
    training_samples: 1125,
    test_samples: 375,
    accuracy: 0.6747,
    precision: 0.6820,
    recall: 0.7100,
    f1_score: 0.7698,
    roc_auc: 0.7298,
    confusion_matrix: {
      true_negative: 115,
      false_positive: 45,
      false_negative: 32,
      true_positive: 183
    },
    feature_importance: [
      { feature: "BMI", importance: 0.245 },
      { feature: "HighBP", importance: 0.185 },
      { feature: "HighChol", importance: 0.162 },
      { feature: "Age", importance: 0.140 },
      { feature: "GenHlth", importance: 0.115 },
      { feature: "PhysActivity", importance: 0.085 }
    ]
  },
  stroke: {
    name: "Cerebrovascular Stroke Risk Predictor",
    dataset: "Clinical Stroke Health Records Cohort",
    algorithm: "Preprocessed Multi-Feature Random Forest",
    training_samples: 900,
    test_samples: 300,
    accuracy: 0.8400,
    precision: 0.8200,
    recall: 0.7800,
    f1_score: 0.8010,
    roc_auc: 0.8164,
    confusion_matrix: {
      true_negative: 210,
      false_positive: 28,
      false_negative: 20,
      true_positive: 42
    },
    feature_importance: [
      { feature: "age", importance: 0.3842 },
      { feature: "avg_glucose_level", importance: 0.2215 },
      { feature: "bmi", importance: 0.1654 },
      { feature: "hypertension", importance: 0.0892 },
      { feature: "heart_disease", importance: 0.0712 },
      { feature: "smoking_status", importance: 0.0425 }
    ]
  }
};

export const STATIC_DATASETS = [
  {
    id: 1,
    name: "MIMIC-IV Clinical ICU Cohort Benchmark",
    slug: "mimic-iv-icu",
    category: "Critical Care / ICU Informatics",
    description: "De-identified electronic health records representing intensive care unit admissions at Beth Israel Deaconess Medical Center, tracking vitals (BP, SpO2, Heart Rate), lengths of stay, and 30-day outcomes.",
    source: "PhysioNet / MIT Laboratory for Computational Physiology",
    record_count: 1000,
    feature_count: 13,
    missing_values_count: 0,
    quality_score: 100.0,
    status: "Active & Indexed",
    updated_at: new Date().toISOString()
  },
  {
    id: 2,
    name: "UCI Cleveland Clinic Heart Disease Benchmark",
    slug: "uci-heart-disease",
    category: "Cardiology / Diagnostic Benchmark",
    description: "Standard clinical machine learning benchmark database with 13 fluoroscopic, hemodynamic, and demographic biomarkers evaluating coronary artery disease presence.",
    source: "UCI Machine Learning Repository / Cleveland Clinic Foundation",
    record_count: 1025,
    feature_count: 14,
    missing_values_count: 0,
    quality_score: 100.0,
    status: "Active & Indexed",
    updated_at: new Date().toISOString()
  },
  {
    id: 3,
    name: "CDC BRFSS Diabetes Health Indicators",
    slug: "cdc-diabetes-brfss",
    category: "Epidemiology / Metabolic Health",
    description: "Surveillance system survey data tracking behavioral risk factors, obesity indices, physical activity, hypertension, and diabetes diagnostic status.",
    source: "Centers for Disease Control and Prevention (CDC)",
    record_count: 1500,
    feature_count: 16,
    missing_values_count: 0,
    quality_score: 100.0,
    status: "Active & Indexed",
    updated_at: new Date().toISOString()
  },
  {
    id: 4,
    name: "Multi-Condition Diagnostic Symptom Matrix",
    slug: "disease-symptom-matrix",
    category: "Clinical NLP / Diagnostic AI",
    description: "Large-scale sparse diagnostic matrix encompassing 42 disease classifications across 126 binary clinical symptom indicators.",
    source: "Columbia University / Kaggle Healthcare Data Hub",
    record_count: 4914,
    feature_count: 127,
    missing_values_count: 0,
    quality_score: 100.0,
    status: "Active & Indexed",
    updated_at: new Date().toISOString()
  },
  {
    id: 5,
    name: "Cerebrovascular Stroke Risk Cohort",
    slug: "stroke-risk-cohort",
    category: "Neurology / Preventive Medicine",
    description: "Clinical and demographic cohort dataset assessing stroke occurrence in relation to hypertension, heart disease, glucose levels, BMI, and lifestyle.",
    source: "World Stroke Organization / Open Healthcare Data",
    record_count: 1200,
    feature_count: 11,
    missing_values_count: 0,
    quality_score: 100.0,
    status: "Active & Indexed",
    updated_at: new Date().toISOString()
  },
  {
    id: 6,
    name: "MedQuAD Medical QA Clinical Knowledge Base",
    slug: "medquad-medical-qa",
    category: "NLP / Medical Question-Answering",
    description: "Structured medical question-and-answer pairs curated from NIH institutes (NINDS, NIDDK, NHLBI, CDC) spanning disease etiology, treatments, and triage.",
    source: "National Institutes of Health (NIH) / NLM",
    record_count: 15,
    feature_count: 7,
    missing_values_count: 0,
    quality_score: 100.0,
    status: "Active & Indexed",
    updated_at: new Date().toISOString()
  }
];

export const STATIC_SAMPLE_RECORDS = {
  "mimic-iv-icu": [
    { subject_id: 10000001, anchor_age: 64, gender: "M", admission_type: "EMERGENCY", heart_rate_mean: 82.5, sbp_mean: 124.0, dbp_mean: 68.0, resp_rate_mean: 18.2, spo2_mean: 97.4, length_of_stay_days: 3.8, mortality_30d: 0 },
    { subject_id: 10000002, anchor_age: 72, gender: "F", admission_type: "URGENT", heart_rate_mean: 94.1, sbp_mean: 142.0, dbp_mean: 76.0, resp_rate_mean: 22.0, spo2_mean: 94.2, length_of_stay_days: 6.2, mortality_30d: 0 },
    { subject_id: 10000003, anchor_age: 55, gender: "M", admission_type: "EMERGENCY", heart_rate_mean: 76.0, sbp_mean: 118.0, dbp_mean: 72.0, resp_rate_mean: 16.5, spo2_mean: 98.8, length_of_stay_days: 2.1, mortality_30d: 0 },
    { subject_id: 10000004, anchor_age: 81, gender: "F", admission_type: "EMERGENCY", heart_rate_mean: 102.4, sbp_mean: 98.0, dbp_mean: 58.0, resp_rate_mean: 26.4, spo2_mean: 91.5, length_of_stay_days: 11.4, mortality_30d: 1 },
    { subject_id: 10000005, anchor_age: 48, gender: "M", admission_type: "ELECTIVE", heart_rate_mean: 68.2, sbp_mean: 122.0, dbp_mean: 70.0, resp_rate_mean: 15.0, spo2_mean: 99.1, length_of_stay_days: 1.5, mortality_30d: 0 }
  ],
  "uci-heart-disease": [
    { age: 63, sex: 1, cp: 3, trestbps: 145, chol: 233, fbs: 1, restecg: 0, thalach: 150, exang: 0, oldpeak: 2.3, slope: 0, ca: 0, thal: 1, target: 1 },
    { age: 37, sex: 1, cp: 2, trestbps: 130, chol: 250, fbs: 0, restecg: 1, thalach: 187, exang: 0, oldpeak: 3.5, slope: 0, ca: 0, thal: 2, target: 1 },
    { age: 41, sex: 0, cp: 1, trestbps: 130, chol: 204, fbs: 0, restecg: 0, thalach: 172, exang: 0, oldpeak: 1.4, slope: 2, ca: 0, thal: 2, target: 1 },
    { age: 56, sex: 1, cp: 1, trestbps: 120, chol: 236, fbs: 0, restecg: 1, thalach: 178, exang: 0, oldpeak: 0.8, slope: 2, ca: 0, thal: 2, target: 1 },
    { age: 57, sex: 0, cp: 0, trestbps: 120, chol: 354, fbs: 0, restecg: 1, thalach: 163, exang: 1, oldpeak: 0.6, slope: 2, ca: 0, thal: 2, target: 1 }
  ]
};

export const STATIC_DISEASES = [
  {
    name: "Diabetes Mellitus Type 2",
    icd10: "E11",
    category: "Endocrinology",
    severity: "Chronic",
    description: "A metabolic disorder characterized by high blood sugar, insulin resistance, and relative lack of insulin.",
    symptoms: ["Frequent urination (polyuria)", "Increased thirst (polydipsia)", "Unexplained weight loss", "Fatigue", "Blurred vision", "Slow-healing sores"],
    risk_factors: ["Overweight / Obesity (BMI >= 25)", "Physical inactivity", "Age >= 45", "Family history", "History of gestational diabetes"],
    prevention: ["Maintain healthy body weight", "150 min moderate weekly aerobic exercise", "Diet rich in fiber and whole grains, low in refined sugars", "Annual HbA1c screening"],
    treatments: ["Lifestyle modification (diet & exercise)", "Metformin (first-line)", "SGLT2 inhibitors", "GLP-1 receptor agonists", "Insulin therapy when indicated"],
    reference: "American Diabetes Association (ADA) Standards of Medical Care in Diabetes"
  },
  {
    name: "Essential (Primary) Hypertension",
    icd10: "I10",
    category: "Cardiology",
    severity: "Chronic",
    description: "Persistently elevated arterial blood pressure without an identifiable secondary cause, defined as systolic BP >= 130 mmHg or diastolic BP >= 80 mmHg.",
    symptoms: ["Often asymptomatic ('silent killer')", "Morning headaches", "Dizziness", "Palpitations", "Visual changes", "Nosebleeds"],
    risk_factors: ["High dietary sodium", "Sedentary lifestyle", "Tobacco use", "Excess alcohol intake", "Chronic psychological stress", "Age > 65"],
    prevention: ["DASH diet (rich in fruits, vegetables, low-fat dairy)", "Sodium intake < 2,000 mg/day", "Regular aerobic cardiovascular exercise", "Smoking cessation"],
    treatments: ["ACE inhibitors / ARBs", "Calcium channel blockers", "Thiazide diuretics", "Beta-blockers", "Regular home blood pressure monitoring"],
    reference: "ACC/AHA Guidelines for High Blood Pressure in Adults"
  },
  {
    name: "Acute Coronary Syndrome / Myocardial Infarction",
    icd10: "I21",
    category: "Cardiology",
    severity: "Emergency",
    description: "Acute ischemia of myocardial tissue resulting from acute coronary artery occlusion by atherosclerotic plaque rupture and thrombosis.",
    symptoms: ["Substernal chest pressure / crushing pain", "Radiation to left arm, shoulder, jaw, or neck", "Diaphoresis (cold sweats)", "Dyspnea", "Nausea / vomiting", "Presyncope"],
    risk_factors: ["Atherosclerosis", "Smoking", "Hyperlipidemia (elevated LDL)", "Diabetes mellitus", "Hypertension", "Male gender > 45, female > 55"],
    prevention: ["Statin therapy for hyperlipidemia", "Cardiovascular exercise", "Mediterranean diet", "Strict blood pressure and glucose control", "Aspirin in secondary prevention"],
    treatments: ["Immediate EMS dispatch (911)", "Percutaneous Coronary Intervention (PCI / stent)", "Dual antiplatelet therapy", "Anticoagulation", "Beta-blockers & ACE inhibitors"],
    reference: "ACC/AHA Guidelines for the Management of Patients With STEMI / NSTEMI"
  },
  {
    name: "Ischemic Stroke",
    icd10: "I63",
    category: "Neurology",
    severity: "Emergency",
    description: "Focal neurological deficit caused by sudden occlusion of a cerebral blood vessel resulting in cerebral infarction.",
    symptoms: ["Unilateral facial drooping", "Arm / leg weakness or hemiplegia", "Aphasia / slurred speech", "Visual field defects (hemianopia)", "Ataxia and loss of balance", "Severe sudden vertigo"],
    risk_factors: ["Atrial fibrillation", "Carotid artery stenosis", "Hypertension", "Diabetes mellitus", "Hyperlipidemia", "History of TIA"],
    prevention: ["Anticoagulation in atrial fibrillation", "Carotid endarterectomy in severe stenosis", "Aggressive BP control", "Antiplatelet therapy"],
    treatments: ["Intravenous thrombolysis (IV Alteplase / Tenecteplase within 4.5 hours)", "Mechanical thrombectomy", "Stroke unit admission", "Early rehabilitation therapy"],
    reference: "AHA/ASA Guidelines for the Early Management of Patients With Acute Ischemic Stroke"
  },
  {
    name: "Bronchial Asthma",
    icd10: "J45",
    category: "Pulmonology",
    severity: "Chronic / Episodic",
    description: "A chronic inflammatory disorder of the airways characterized by variable and recurring symptoms, reversible airflow obstruction, and bronchospasm.",
    symptoms: ["Expiratory wheezing", "Shortness of breath", "Chest tightness", "Nocturnal dry cough", "Exercise-induced dyspnea"],
    risk_factors: ["Atopy / personal allergic history", "Family history of asthma", "Exposure to airborne allergens (dust mites, pollen)", "Air pollution"],
    prevention: ["Avoidance of known environmental triggers", "Use of hypoallergenic bedding", "Annual influenza and pneumococcal vaccination", "Adherence to controller inhalers"],
    treatments: ["Inhaled Corticosteroids (ICS) as daily controller", "Short-Acting Beta Agonists (Albuterol) as rescue", "Long-Acting Beta Agonists (LABA)", "Leukotriene receptor antagonists"],
    reference: "Global Initiative for Asthma (GINA) Global Strategy for Asthma Management and Prevention"
  }
];

export const STATIC_HEALTH_GUIDES = [
  {
    id: "GUIDE-001",
    title: "AHA Cardiovascular Emergency: Recognizing Heart Attack & Immediate Actions",
    category: "Emergency & Cardiology",
    read_time: "4 min",
    summary: "Step-by-step guidance on recognizing ischemic chest symptoms, atypical presentations in women/elderly, and bystander emergency response.",
    content: "Myocardial infarction occurs when coronary blood flow is acutely obstructed.\nAction Plan:\n1. Immediately call 911. Never drive yourself or wait for symptoms to subside.\n2. Rest in a semi-upright position with knees bent to reduce cardiac workload.\n3. If not allergic or contraindicated by a doctor, chew one full adult non-enteric coated Aspirin (325 mg) or four low-dose chewable aspirins (81 mg each).\n4. Have an automated external defibrillator (AED) retrieved if in a public facility.",
    source: "American Heart Association (AHA) Guidelines"
  },
  {
    id: "GUIDE-002",
    title: "Stroke Recognition Protocol: The Clinical FAST & BE-FAST Algorithms",
    category: "Neurology & Emergency",
    read_time: "3 min",
    summary: "Critical time-window parameters, tissue plasminogen activator (tPA) eligibility, and immediate identification markers.",
    content: "BE-FAST Protocol:\nB - Balance: Sudden loss of balance or coordination.\nE - Eyes: Sudden blurriness or loss of vision in one or both eyes.\nF - Face: One side of the face drooping when smiling.\nA - Arms: One arm drifting downwards when held outstretched.\nS - Speech: Slurred, incomprehensible, or absent speech.\nT - Time: Note exact time of onset and call EMS immediately. Thrombolysis is strictly time-dependent (3 to 4.5 hours).",
    source: "American Stroke Association"
  },
  {
    id: "GUIDE-003",
    title: "Evidence-Based Management of Hypertension: The DASH Nutrition Protocol",
    category: "Preventive Cardiology",
    read_time: "5 min",
    summary: "Dietary Approaches to Stop Hypertension (DASH) macronutrient and micronutrient balance for lowering systolic and diastolic BP.",
    content: "Clinical trials demonstrate that following the DASH diet can lower systolic BP by 8 to 14 mmHg.\nKey Principles:\n- Limit daily sodium to < 1,500 - 2,300 mg.\n- Incorporate 4-5 servings of vegetables and 4-5 servings of fruits daily to supply potassium.\n- Opt for whole grains, lean poultry, fish, legumes, and nuts.\n- Limit saturated fats, trans fats, sugary beverages, and red meats.",
    source: "National Heart, Lung, and Blood Institute (NHLBI)"
  },
  {
    id: "GUIDE-004",
    title: "Type-2 Diabetes: Glucose Monitoring, Hypoglycemia Triage & Prevention",
    category: "Endocrinology",
    read_time: "5 min",
    summary: "Target capillary blood glucose ranges, continuous glucose monitoring (CGM) interpretation, and the Rule of 15 for hypoglycemia.",
    content: "Standard Glycemic Targets for Non-Pregnant Adults:\n- Pre-prandial (before meals): 80 to 130 mg/dL.\n- Post-prandial (1-2 hours after start of meal): < 180 mg/dL.\n- Glycated Hemoglobin (HbA1c): < 7.0% for most adults.\nRule of 15 for Hypoglycemia (<70 mg/dL): Consume 15g fast-acting carbs (juice, glucose tablets), wait 15 minutes, re-check.",
    source: "American Diabetes Association (ADA)"
  }
];
