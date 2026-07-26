// 肿瘤检测项目映射表
// 编号规则: PT-XXX (Pet Tumor)
// 数据来源: 宠物肿瘤检测画册

export type DetectionCategory = "ihc" | "ngs" | "excluded";

export interface DetectionItem {
  code: string;
  name: string;
  description: string;
  price: number;
  turnaround: string;
  category: DetectionCategory;
  reason: string; // 推荐理由，≤20字，只描述"这个检测看什么"
}

export interface TumorDetectionMap {
  tumorType: string;
  tumorName: string;
  applicableSpecies: ("dog" | "cat")[];
  detections: DetectionItem[];
}

// ========== 犬猫通用检测项目 ==========

const COMMON_DETECTIONS: Record<string, DetectionItem> = {
  pathology: {
    code: "PT-001",
    name: "组织病理学检查",
    description: "肿瘤组织切片HE染色，明确肿瘤性质、类型及恶性程度分级",
    price: 800,
    turnaround: "5-7个工作日",
    category: "excluded",
    reason: "",
  },
  cytology: {
    code: "PT-002",
    name: "细针穿刺细胞学检查",
    description: "微创采样，初步判断肿瘤细胞来源及良恶性",
    price: 400,
    turnaround: "2-3个工作日",
    category: "excluded",
    reason: "",
  },
  immunohistochemistry: {
    code: "PT-003",
    name: "免疫组织化学（IHC）panel",
    description: "通过特定抗体标记辅助鉴别肿瘤亚型及组织来源",
    price: 1200,
    turnaround: "7-10个工作日",
    category: "ihc",
    reason: "看肿瘤来源和增殖活性",
  },
  ultrasound: {
    code: "PT-004",
    name: "腹部/体表超声检查",
    description: "评估肿瘤大小、边界、血供及腹腔脏器转移情况",
    price: 500,
    turnaround: "当日出报告",
    category: "excluded",
    reason: "",
  },
  xray: {
    code: "PT-005",
    name: "X线摄影（胸部/骨骼）",
    description: "评估肺部转移灶及骨骼受累情况",
    price: 350,
    turnaround: "当日出报告",
    category: "excluded",
    reason: "",
  },
  ct: {
    code: "PT-006",
    name: "CT 断层扫描",
    description: "精准评估肿瘤范围、侵袭深度及远处转移",
    price: 2500,
    turnaround: "1-2个工作日",
    category: "excluded",
    reason: "",
  },
  bloodRoutine: {
    code: "PT-007",
    name: "血常规 + 生化全项",
    description: "评估全身健康状况、脏器功能及有无副肿瘤综合征",
    price: 450,
    turnaround: "当日出报告",
    category: "excluded",
    reason: "",
  },
  coagulation: {
    code: "PT-008",
    name: "凝血功能检测",
    description: "评估出凝血风险，术前必查项目",
    price: 300,
    turnaround: "当日出报告",
    category: "excluded",
    reason: "",
  },
};

// ========== 犬特异性检测 ==========

const DOG_SPECIFIC_DETECTIONS: Record<string, DetectionItem> = {
  mastCellGrading: {
    code: "PT-101",
    name: "肥大细胞瘤 Patnaik 分级",
    description: "评估肥大细胞瘤分化程度（I-III级），指导预后及治疗方案",
    price: 900,
    turnaround: "5-7个工作日",
    category: "excluded",
    reason: "",
  },
  cKitMutation: {
    code: "PT-102",
    name: "c-KIT 基因突变检测",
    description: "检测c-KIT基因内部串联重复（ITD）突变，指导TKI靶向用药",
    price: 1500,
    turnaround: "7-10个工作日",
    category: "ngs",
    reason: "查c-kit突变是否适合靶向",
  },
  lymphomaImmuno: {
    code: "PT-103",
    name: "淋巴瘤免疫分型（B/T细胞）",
    description: "通过CD3/CD20/CD79a标记区分B细胞/T细胞淋巴瘤",
    price: 1100,
    turnaround: "5-7个工作日",
    category: "ihc",
    reason: "判断B/T细胞来源",
  },
  pcrClonality: {
    code: "PT-104",
    name: "PARR 克隆性检测",
    description: "PCR检测淋巴细胞抗原受体基因重排，辅助淋巴瘤诊断",
    price: 1300,
    turnaround: "7-10个工作日",
    category: "ngs",
    reason: "PARR检测淋巴细胞克隆性",
  },
  alkp: {
    code: "PT-105",
    name: "血清碱性磷酸酶（ALP）",
    description: "骨肉瘤预后指标，ALP升高提示预后较差",
    price: 200,
    turnaround: "当日出报告",
    category: "excluded",
    reason: "",
  },
  melanomaIhc: {
    code: "PT-106",
    name: "黑色素瘤 IHC（Melan-A/PNL2/S100）",
    description: "黑色素瘤特异性免疫组化标记panel，确诊及鉴别无色素型",
    price: 1300,
    turnaround: "7-10个工作日",
    category: "ihc",
    reason: "黑色素瘤标志物鉴别",
  },
  hemangioIhc: {
    code: "PT-107",
    name: "血管肉瘤 IHC（CD31/Factor VIII）",
    description: "血管内皮标记物，鉴别血管肉瘤与其他软组织肉瘤",
    price: 1300,
    turnaround: "7-10个工作日",
    category: "ihc",
    reason: "血管内皮标记物鉴别",
  },
};

// ========== 猫特异性检测 ==========

const CAT_SPECIFIC_DETECTIONS: Record<string, DetectionItem> = {
  felvFiv: {
    code: "PT-201",
    name: "FeLV/FIV 病毒检测",
    description: "猫白血病病毒/猫免疫缺陷病毒检测，淋巴瘤患猫必查",
    price: 350,
    turnaround: "当日出报告",
    category: "excluded",
    reason: "",
  },
  injectionSarcIhc: {
    code: "PT-202",
    name: "注射部位肉瘤 IHC panel",
    description: "鉴别纤维肉瘤/骨外骨肉瘤等，评估切缘状态",
    price: 1300,
    turnaround: "7-10个工作日",
    category: "ihc",
    reason: "鉴别肉瘤亚型与切缘",
  },
  catMammaryIhc: {
    code: "PT-203",
    name: "猫乳腺肿瘤 IHC（ER/PR/HER2）",
    description: "猫乳腺肿瘤激素受体及HER2表达评估",
    price: 1200,
    turnaround: "7-10个工作日",
    category: "ihc",
    reason: "乳腺肿瘤激素受体评估",
  },
  catOralScc: {
    code: "PT-204",
    name: "猫口腔鳞状细胞癌侵袭评估",
    description: "CT/MRI评估下颌骨侵袭深度，指导手术范围",
    price: 2500,
    turnaround: "1-2个工作日",
    category: "excluded",
    reason: "",
  },
};

// ========== 肿瘤类型 — 检测项目映射 ==========

export const TUMOR_DETECTION_MAP: TumorDetectionMap[] = [
  // ---- 犬肿瘤 ----
  {
    tumorType: "mammary_dog",
    tumorName: "乳腺肿瘤（犬）",
    applicableSpecies: ["dog"],
    detections: [
      COMMON_DETECTIONS.ultrasound,
      COMMON_DETECTIONS.xray,
      COMMON_DETECTIONS.pathology,
      COMMON_DETECTIONS.immunohistochemistry,
      COMMON_DETECTIONS.bloodRoutine,
      COMMON_DETECTIONS.coagulation,
    ],
  },
  {
    tumorType: "mast_cell",
    tumorName: "肥大细胞瘤",
    applicableSpecies: ["dog"],
    detections: [
      COMMON_DETECTIONS.cytology,
      COMMON_DETECTIONS.pathology,
      DOG_SPECIFIC_DETECTIONS.mastCellGrading,
      DOG_SPECIFIC_DETECTIONS.cKitMutation,
      COMMON_DETECTIONS.ultrasound,
      COMMON_DETECTIONS.bloodRoutine,
    ],
  },
  {
    tumorType: "lymphoma_dog",
    tumorName: "淋巴瘤（犬）",
    applicableSpecies: ["dog"],
    detections: [
      COMMON_DETECTIONS.cytology,
      COMMON_DETECTIONS.pathology,
      DOG_SPECIFIC_DETECTIONS.lymphomaImmuno,
      DOG_SPECIFIC_DETECTIONS.pcrClonality,
      COMMON_DETECTIONS.ultrasound,
      COMMON_DETECTIONS.xray,
      COMMON_DETECTIONS.bloodRoutine,
    ],
  },
  {
    tumorType: "osteosarcoma",
    tumorName: "骨肉瘤",
    applicableSpecies: ["dog"],
    detections: [
      COMMON_DETECTIONS.xray,
      COMMON_DETECTIONS.ct,
      COMMON_DETECTIONS.pathology,
      DOG_SPECIFIC_DETECTIONS.alkp,
      COMMON_DETECTIONS.bloodRoutine,
    ],
  },
  {
    tumorType: "hemangiosarcoma",
    tumorName: "血管肉瘤",
    applicableSpecies: ["dog"],
    detections: [
      COMMON_DETECTIONS.ultrasound,
      COMMON_DETECTIONS.ct,
      COMMON_DETECTIONS.pathology,
      DOG_SPECIFIC_DETECTIONS.hemangioIhc,
      COMMON_DETECTIONS.bloodRoutine,
      COMMON_DETECTIONS.coagulation,
    ],
  },
  {
    tumorType: "melanoma_dog",
    tumorName: "黑色素瘤（犬）",
    applicableSpecies: ["dog"],
    detections: [
      COMMON_DETECTIONS.cytology,
      COMMON_DETECTIONS.pathology,
      DOG_SPECIFIC_DETECTIONS.melanomaIhc,
      COMMON_DETECTIONS.xray,
      COMMON_DETECTIONS.ultrasound,
    ],
  },
  {
    tumorType: "scc_dog",
    tumorName: "鳞状细胞癌（犬）",
    applicableSpecies: ["dog"],
    detections: [
      COMMON_DETECTIONS.pathology,
      COMMON_DETECTIONS.ct,
      COMMON_DETECTIONS.xray,
      COMMON_DETECTIONS.bloodRoutine,
    ],
  },
  {
    tumorType: "soft_tissue_sarc_dog",
    tumorName: "软组织肉瘤（犬）",
    applicableSpecies: ["dog"],
    detections: [
      COMMON_DETECTIONS.pathology,
      COMMON_DETECTIONS.immunohistochemistry,
      COMMON_DETECTIONS.ct,
      COMMON_DETECTIONS.bloodRoutine,
    ],
  },
  // ---- 猫肿瘤 ----
  {
    tumorType: "mammary_cat",
    tumorName: "乳腺肿瘤（猫）",
    applicableSpecies: ["cat"],
    detections: [
      COMMON_DETECTIONS.ultrasound,
      COMMON_DETECTIONS.xray,
      COMMON_DETECTIONS.pathology,
      CAT_SPECIFIC_DETECTIONS.catMammaryIhc,
      COMMON_DETECTIONS.bloodRoutine,
      COMMON_DETECTIONS.coagulation,
    ],
  },
  {
    tumorType: "lymphoma_cat",
    tumorName: "淋巴瘤（猫）",
    applicableSpecies: ["cat"],
    detections: [
      CAT_SPECIFIC_DETECTIONS.felvFiv,
      COMMON_DETECTIONS.cytology,
      COMMON_DETECTIONS.pathology,
      DOG_SPECIFIC_DETECTIONS.lymphomaImmuno,
      DOG_SPECIFIC_DETECTIONS.pcrClonality,
      COMMON_DETECTIONS.ultrasound,
      COMMON_DETECTIONS.bloodRoutine,
    ],
  },
  {
    tumorType: "scc_cat",
    tumorName: "鳞状细胞癌（猫）",
    applicableSpecies: ["cat"],
    detections: [
      COMMON_DETECTIONS.pathology,
      CAT_SPECIFIC_DETECTIONS.catOralScc,
      COMMON_DETECTIONS.xray,
      COMMON_DETECTIONS.bloodRoutine,
    ],
  },
  {
    tumorType: "fibrosarcoma",
    tumorName: "纤维肉瘤",
    applicableSpecies: ["cat"],
    detections: [
      COMMON_DETECTIONS.pathology,
      COMMON_DETECTIONS.immunohistochemistry,
      COMMON_DETECTIONS.ct,
      COMMON_DETECTIONS.bloodRoutine,
    ],
  },
  {
    tumorType: "injection_sarcoma",
    tumorName: "注射部位肉瘤",
    applicableSpecies: ["cat"],
    detections: [
      COMMON_DETECTIONS.pathology,
      CAT_SPECIFIC_DETECTIONS.injectionSarcIhc,
      COMMON_DETECTIONS.ct,
      COMMON_DETECTIONS.bloodRoutine,
    ],
  },
  {
    tumorType: "mast_cell_cat",
    tumorName: "肥大细胞瘤（猫）",
    applicableSpecies: ["cat"],
    detections: [
      COMMON_DETECTIONS.cytology,
      COMMON_DETECTIONS.pathology,
      COMMON_DETECTIONS.ultrasound,
      COMMON_DETECTIONS.bloodRoutine,
    ],
  },
];

// ========== 辅助函数 ==========

/** 根据瘤种类型获取检测计划 */
export function getDetectionsByTumor(tumorType: string): TumorDetectionMap | undefined {
  return TUMOR_DETECTION_MAP.find((t) => t.tumorType === tumorType);
}

/** 根据物种筛选可选的肿瘤类型 */
export function getTumorsBySpecies(species: "dog" | "cat"): TumorDetectionMap[] {
  return TUMOR_DETECTION_MAP.filter((t) => t.applicableSpecies.includes(species));
}

/** 计算检测计划总价 */
export function getTotalPrice(detections: DetectionItem[]): number {
  return detections.reduce((sum, d) => sum + d.price, 0);
}

/** 筛选仅 IHC + NGS */
export function filterIhcNgs(detections: DetectionItem[]): DetectionItem[] {
  return detections.filter((d) => d.category === "ihc" || d.category === "ngs");
}
