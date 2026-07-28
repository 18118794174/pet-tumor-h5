"use client";

import { useState, useMemo, type FormEvent } from "react";
import {
  getTumorsBySpecies,
  type TumorDetectionMap,
} from "@/lib/detection-map";
import {
  cityGroups,
  hasHospitals,
  getHospitalsByCity,
} from "@/lib/cities";
import { supabase } from "@/lib/supabase";

// ==================== 类型定义 ====================

type ScreenIndex = 0 | 1 | 2 | 3 | 4;

interface BasicInfo {
  petName: string;
  species: "dog" | "cat" | "";
  breed: string;
  age: string;
  city: string;
  hospitalName: string;
  phone: string;
  agreed: boolean;
  tumorTypeOther: string;
}

// ==================== 常量 ====================

const SPECIES_OPTIONS = [
  { value: "", label: "请选择宠物种类" },
  { value: "dog", label: "🐶 狗狗" },
  { value: "cat", label: "🐱 猫咪" },
];

const TEST_OPTIONS = [
  { key: "pathology_confirmed", label: "病理确诊（组织病理学）" },
  { key: "ihc", label: "IHC已做" },
  { key: "ngs", label: "NGS / 基因检测已做" },
  { key: "imaging", label: "影像（B超/CT）" },
  { key: "blood_biochem", label: "血常规/生化" },
  { key: "none", label: "什么都没做，刚确诊" },
];

const EXPECTATION_OPTIONS = [
  { key: "targeted_drug", label: "想了解有没有靶向药可以用" },
  { key: "immunotherapy", label: "想了解有没有免疫疗法（PD-1/PD-L1）机会" },
  { key: "clinical_trial", label: "想了解临床试验或新药招募" },
  { key: "cost", label: "想了解不同检测大概多少钱、值不值得做" },
  { key: "learn", label: "想多了解一下这个肿瘤的基础信息和临床研究进展（新增）" },
  { key: "booking", label: "想直接预约采样送检" },
];

const SCREEN_TITLES = [
  "填写基本信息",
  "选择肿瘤类型",
  "已做过的检查",
  "治疗期望",
  "检测方案与科普",
];

// ==================== 屏2 肿瘤科普安抚语 ====================

const TUMOR_TYPE_OTHER = "tumor_other";

interface TumorInfo {
  type: string;
  label: string;
  comfortTitle: string;
  comfortContent: string;
}

function getTumorInfoList(species: "dog" | "cat" | ""): TumorInfo[] {
  if (species === "dog") {
    return [
      {
        type: "mammary_dog",
        label: "乳腺肿瘤",
        comfortTitle: "🐾 关于犬乳腺肿瘤",
        comfortContent:
          "犬乳腺肿瘤是未绝育母犬最常见的肿瘤之一，约50%为良性、50%为恶性。早发现、早手术切除是目前最有效的处理方式。请不必过度焦虑，许多犬只在规范治疗后仍能保持良好的生活质量。建议尽快带宝贝到肿瘤专科进一步评估，我们会全程陪伴您。",
      },
      {
        type: "mast_cell",
        label: "肥大细胞瘤",
        comfortTitle: "🐾 关于肥大细胞瘤",
        comfortContent:
          "肥大细胞瘤是犬最常见的皮肤肿瘤之一，多数为低级别、可通过完整手术切除治愈。少数高级别需要额外治疗，但近年靶向药物进展显著。每只犬的情况不同，病理分级是关键一步，请让专科医生为您制定个体化方案。",
      },
      {
        type: "lymphoma_dog",
        label: "淋巴瘤",
        comfortTitle: "🐾 关于犬淋巴瘤",
        comfortContent:
          "犬淋巴瘤对化疗敏感，多数犬只可获得数月至一年以上的高质量缓解期。它不是「放弃」的信号——现代兽医肿瘤学有多种方案可以帮助您的伙伴。请记住，化疗在犬只中的耐受性远好于人类，脱发等严重副作用极少见。",
      },
      {
        type: "osteosarcoma",
        label: "骨肉瘤",
        comfortTitle: "🐾 关于骨肉瘤",
        comfortContent:
          "骨肉瘤是犬最常见的原发性骨肿瘤，常见于大型犬的四肢。虽然性质较凶猛，但通过手术联合化疗的综合方案，许多犬只仍可获得有意义的延长生存时间。疼痛管理是第一要务——如果您发现宝贝跛行或不愿活动，请尽早就诊。",
      },
      {
        type: "hemangiosarcoma",
        label: "血管肉瘤",
        comfortTitle: "🐾 关于血管肉瘤",
        comfortContent:
          "血管肉瘤是一种来源于血管内皮的恶性肿瘤，脾脏和心脏最常见。早期发现至关重要——如果宝贝出现突然虚弱、牙龈苍白等症状请立即就医。虽然具有挑战性，但手术联合化疗可为许多犬只争取宝贵的高质量时光。",
      },
      {
        type: "melanoma_dog",
        label: "黑色素瘤",
        comfortTitle: "🐾 关于犬黑色素瘤",
        comfortContent:
          "犬黑色素瘤的良恶性与发生部位密切相关——口腔黑色素瘤多为恶性，皮肤黑色素瘤多为良性。近年来犬黑色素瘤疫苗（Oncept®）为部分患犬提供了新的治疗选择。准确诊断需要病理加免疫组化，请耐心配合检查。",
      },
      {
        type: "scc_dog",
        label: "鳞状细胞癌",
        comfortTitle: "🐾 关于鳞状细胞癌",
        comfortContent:
          "鳞状细胞癌发生于皮肤或黏膜上皮，多数生长相对缓慢、转移率较低。完整手术切除通常是最关键的治疗手段。每个病例的侵袭深度和位置不同，预后差异较大——请交给专科医生全面评估，不要用网上的极端案例吓自己。",
      },
      {
        type: "soft_tissue_sarc_dog",
        label: "软组织肉瘤",
        comfortTitle: "🐾 关于软组织肉瘤",
        comfortContent:
          "软组织肉瘤是一个大家族，包括纤维肉瘤、脂肪肉瘤等多种类型。多数为局部侵袭性生长但转移率较低，完整手术切除（干净切缘）是治疗的基石。影像学评估对手术规划极其重要——请务必在手术前完成CT或MRI检查。",
      },
      {
        type: TUMOR_TYPE_OTHER,
        label: "其他（请输入具体肿瘤类型）",
        comfortTitle: "",
        comfortContent: "",
      },
    ];
  }

  if (species === "cat") {
    return [
      {
        type: "mammary_cat",
        label: "乳腺肿瘤",
        comfortTitle: "🐾 关于猫乳腺肿瘤",
        comfortContent:
          "猫乳腺肿瘤与犬有很大不同——猫的乳腺肿瘤恶性率高达85%以上，因此需要更加积极的诊断和治疗态度。早期绝育可显著降低发病率。如果您的猫咪尚未绝育，建议在治疗肿瘤的同时考虑绝育手术，这对预后可能有积极影响。",
      },
      {
        type: "lymphoma_cat",
        label: "淋巴瘤",
        comfortTitle: "🐾 关于猫淋巴瘤",
        comfortContent:
          "猫淋巴瘤与FeLV/FIV病毒感染密切相关，因此病毒检测是第一步。好消息是，猫淋巴瘤对化疗同样敏感，许多猫只在治疗期间维持良好的生活状态。胃肠道淋巴瘤是最常见的类型，部分低级别肠病型淋巴瘤通过口服药物即可长期管理。",
      },
      {
        type: "scc_cat",
        label: "鳞状细胞癌",
        comfortTitle: "🐾 关于猫鳞状细胞癌",
        comfortContent:
          "猫口腔鳞状细胞癌是猫最常见的口腔恶性肿瘤，具有一定侵袭性。早期发现和准确的影像学评估（CT/MRI）对确定手术范围至关重要。虽然具有挑战性，但综合治疗（手术+放疗+/-化疗）正不断进步。疼痛和进食困难是需要优先管理的症状。",
      },
      {
        type: "fibrosarcoma",
        label: "纤维肉瘤",
        comfortTitle: "🐾 关于纤维肉瘤",
        comfortContent:
          "猫纤维肉瘤通常表现为皮下坚实肿块，生长速度不一。这类肿瘤以局部侵袭性强为特点，但转移率相对较低。首次手术的切缘状态对预后影响极大——「第一次手术是最好的一次手术」，请务必选择有肿瘤外科经验的医生。",
      },
      {
        type: "injection_sarcoma",
        label: "注射部位肉瘤",
        comfortTitle: "🐾 关于注射部位肉瘤",
        comfortContent:
          "注射部位肉瘤（FISS）是与疫苗或药物注射相关的局部肉瘤，发生率很低但需要重视。这并不意味着不该打疫苗——疫苗保护远大于微小风险。治疗需要积极的外科切除，通常建议在注射后出现持续肿块超过3个月时进一步检查。",
      },
      {
        type: "mast_cell_cat",
        label: "肥大细胞瘤",
        comfortTitle: "🐾 关于猫肥大细胞瘤",
        comfortContent:
          "猫肥大细胞瘤与犬有很大不同，皮肤型多为良性、手术切除后预后良好。内脏型（脾脏/肠道）则需要更全面的评估。绝大多数皮肤型肥大细胞瘤猫咪在手术后不需要额外治疗，请保持乐观心态。",
      },
      {
        type: TUMOR_TYPE_OTHER,
        label: "其他（请输入具体肿瘤类型）",
        comfortTitle: "",
        comfortContent: "",
      },
    ];
  }

  // species not selected or "other" — show combined list
  return [
    {
      type: "mammary_general",
      label: "乳腺肿瘤",
      comfortTitle: "🐾 关于乳腺肿瘤",
      comfortContent:
        "乳腺肿瘤是犬猫常见的肿瘤类型。犬约50%为良性，猫则恶性率较高。早发现早手术是目前最有效的处理方式。无论是犬还是猫，早期绝育均可显著降低发病率。请带宝贝到肿瘤专科进一步评估。",
    },
    {
      type: "mast_cell",
      label: "肥大细胞瘤",
      comfortTitle: "🐾 关于肥大细胞瘤",
      comfortContent:
        "肥大细胞瘤在犬猫中表现不同：犬常见于皮肤（大部分低级别可手术治愈），猫皮肤型多为良性。病理分级决定了后续治疗方向。请不必过度焦虑，多数病例可控可治。",
    },
    {
      type: "lymphoma_general",
      label: "淋巴瘤",
      comfortTitle: "🐾 关于淋巴瘤",
      comfortContent:
        "淋巴瘤是犬猫常见的造血系统肿瘤，对化疗敏感。现代兽医肿瘤学有多种方案，多数患宠可获得高质量缓解期。犬猫化疗耐受性远好于人类，请放心与兽医讨论治疗方案。",
    },
    {
      type: "osteosarcoma",
      label: "骨肉瘤",
      comfortTitle: "🐾 关于骨肉瘤",
      comfortContent:
        "骨肉瘤主要见于大型犬的四肢。虽然性质较凶猛，但通过手术联合化疗的综合方案，许多犬只仍可获得有意义的延长生存时间。疼痛管理是第一要务，早发现早干预。",
    },
    {
      type: "scc_general",
      label: "鳞状细胞癌",
      comfortTitle: "🐾 关于鳞状细胞癌",
      comfortContent:
        "鳞状细胞癌发生于皮肤或黏膜上皮。犬多数生长缓慢，猫口腔型侵袭性较强。完整手术切除是关键。每个病例情况不同，请让专科医生全面评估，不必被网上信息吓到。",
    },
    {
      type: "soft_tissue_sarc",
      label: "软组织肉瘤",
      comfortTitle: "🐾 关于软组织肉瘤",
      comfortContent:
        "软组织肉瘤是一大类肿瘤的总称，多数为局部侵袭但转移率低。首次手术的切缘状态对预后至关重要——请选择有肿瘤外科经验的医生，并在术前完成充分的影像学评估。",
    },
      {
        type: TUMOR_TYPE_OTHER,
        label: "其他（请输入具体肿瘤类型）",
        comfortTitle: "",
        comfortContent: "",
      },
  ];
}

// ==================== 屏5 科普摘要内容 ====================

interface EducationContent {
  overview: string;
  diagnosisPath: string[];
  comfortMessage: string;
  dailyTips: string[];
}

function getEducationContent(species: "dog" | "cat" | ""): EducationContent {
  if (species === "dog") {
    return {
      overview:
        "犬肿瘤的诊断通常从详细的体格检查和病史问询开始，结合影像学（超声、X线等）评估肿瘤范围和有无转移，最终通过细胞学或组织病理学明确肿瘤类型和恶性程度。现代兽医肿瘤学提供手术、化疗、放疗、靶向治疗、免疫治疗等多种手段，许多犬肿瘤可以获得良好控制。犬只对化疗的耐受性通常远好于人类，80%以上不会出现严重副作用。",
      diagnosisPath: [
        "第一步：临床检查 — 兽医进行全身体格检查，触诊肿瘤大小、质地、活动度",
        "第二步：血液检查 — 血常规+生化评估全身状况和脏器功能",
        "第三步：影像学检查 — 超声/X线/CT评估肿瘤范围和有无转移",
        "第四步：细胞学/病理学 — 穿刺或活检明确肿瘤类型和恶性分级",
        "第五步：制定个体化治疗计划 — 根据以上结果综合制定方案",
      ],
      comfortMessage:
        "亲爱的宠物主人，知道您的宝贝可能面临肿瘤诊断，我们理解您此刻的担忧与不安。请相信，现代兽医肿瘤学已经取得了长足进步，许多肿瘤不再是「绝症」的代名词。您能主动为宝贝寻求信息和帮助，已经是最好的第一步。无论接下来的路程如何，请记得您不是一个人——专业的兽医团队会和您并肩作战。",
      dailyTips: [
        "记录肿瘤大小变化（可每周拍照对比），帮助兽医判断生长速度",
        "保持正常饮食，如食欲下降可咨询兽医是否需要营养补充",
        "避免用力按压或摩擦肿瘤部位，防止出血或破溃",
        "观察有无疼痛表现（跛行、不愿被触碰、异常叫声等），及时反馈兽医",
        "维持常规免疫和驱虫，整体健康状态是抗肿瘤治疗的重要基础",
      ],
    };
  }

  if (species === "cat") {
    return {
      overview:
        "猫肿瘤的诊断与犬类似，但有几个关键差异：猫乳腺肿瘤恶性率远高于犬（>85% vs ~50%），因此需要更积极的诊疗态度；猫淋巴瘤与FeLV/FIV感染密切相关，病毒检测是必需步骤；猫对化疗的耐受性也很好，但需要注意其独特的药物代谢特点。猫肿瘤治疗特别强调营养支持和应激管理，因为猫对环境和饮食变化更为敏感。",
      diagnosisPath: [
        "第一步：临床检查 + 病毒筛查 — 全身体检，猫必须做FeLV/FIV检测",
        "第二步：血液检查 — 血常规+生化，重点关注肾脏功能（猫化疗药物选择的关键）",
        "第三步：影像学检查 — 超声/X线/CT评估肿瘤范围",
        "第四步：细胞学/病理学 — 明确肿瘤类型和分级",
        "第五步：个体化方案 — 考虑猫的年龄、性格、家庭护理能力综合制定",
      ],
      comfortMessage:
        "亲爱的猫咪家长，猫咪是出了名的「忍者」——善于隐藏不适，这让肿瘤的早期发现变得困难，但您能注意到异常并寻求帮助，已经走在了正确的道路上。猫肿瘤治疗在过去十年进步巨大，化疗的副作用管理也越来越成熟。请温柔对待自己和您的猫咪，这段路我们陪您一起走。",
      dailyTips: [
        "密切观察食欲和体重变化 — 猫禁食超过48小时有脂肪肝风险",
        "保持猫砂盆清洁，观察排便排尿是否正常",
        "为猫咪提供安静、低压力的休息空间",
        "不要突然更换猫粮品牌，如需调整请在兽医指导下逐步过渡",
        "注意猫咪的理毛行为和活动量变化，这些都是健康状况的「晴雨表」",
      ],
    };
  }

  // generic fallback
  return {
    overview:
      "宠物肿瘤的诊断通常从详细的体格检查开始，结合影像学评估肿瘤范围和有无转移，最终通过病理学明确肿瘤类型和恶性程度。现代兽医肿瘤学提供手术、化疗、放疗等多种手段，许多肿瘤可以获得良好控制。犬猫对化疗的耐受性通常好于人类认知，请与专科兽医充分沟通，制定最适合的方案。",
    diagnosisPath: [
      "第一步：全身体格检查",
      "第二步：血液学检查",
      "第三步：影像学检查（超声/X线/CT）",
      "第四步：细胞学或组织病理学检查",
      "第五步：综合制定个体化治疗计划",
    ],
    comfortMessage:
      "亲爱的宠物主人，知道您的伙伴可能面临肿瘤诊断，我们理解您此刻的心情。请相信现代兽医肿瘤学的进步，许多肿瘤已有成熟的应对方案。您为宝贝积极寻求信息，已经是最好的一步。",
    dailyTips: [
      "定期观察肿瘤大小变化",
      "保持正常饮食和作息",
      "避免按压或摩擦肿瘤部位",
      "及时向兽医反馈任何异常变化",
    ],
  };
}

// ==================== 子组件 ====================

/** 顶部进度条 */
function ProgressBar({ current }: { current: ScreenIndex }) {
  return (
    <div className="mb-6 flex items-center gap-1.5">
      {[0, 1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className={`h-1.5 flex-1 rounded-full transition-colors duration-500 ${
            i <= current ? "bg-green-500" : "bg-gray-200"
          }`}
        />
      ))}
    </div>
  );
}

/** 科普安抚弹窗 */
function ComfortModal({
  info,
  onClose,
}: {
  info: TumorInfo;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center animate-fade-in"
      onClick={onClose}
    >
      {/* backdrop */}
      <div className="absolute inset-0 bg-black/40" />
      {/* sheet */}
      <div
        className="relative z-10 mx-4 mb-4 sm:mb-0 w-full max-w-md animate-slide-up rounded-2xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3 flex items-start justify-between">
          <h3 className="text-lg font-bold text-gray-900">{info.comfortTitle}</h3>
          <button
            onClick={onClose}
            className="-mr-1 -mt-1 ml-3 flex h-8 w-8 items-center justify-center rounded-full text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
            aria-label="关闭"
          >
            ✕
          </button>
        </div>
        <p className="leading-relaxed text-gray-600">{info.comfortContent}</p>
        <button
          onClick={onClose}
          className="mt-5 w-full rounded-xl bg-green-500 py-2.5 text-sm font-semibold text-white transition active:bg-green-600"
        >
          我知道了
        </button>
      </div>
    </div>
  );
}

// ==================== 主组件 ====================

const INITIAL_BASIC: BasicInfo = {
  petName: "",
  species: "",
  breed: "",
  age: "",
  city: "",
  hospitalName: "",
  phone: "",
  agreed: false,
  tumorTypeOther: "",
};

export default function Home() {
  // 当前屏
  const [screen, setScreen] = useState<ScreenIndex>(0);

  // 屏1：基础信息
  const [basic, setBasic] = useState<BasicInfo>(INITIAL_BASIC);

  // 屏2：选中的肿瘤类型
  const [selectedTumors, setSelectedTumors] = useState<string[]>([]);
  const [popupTumor, setPopupTumor] = useState<TumorInfo | null>(null);
  const [tumorTypeOther, setTumorTypeOther] = useState("");

  // 屏3：已做检查
  const [selectedTests, setSelectedTests] = useState<string[]>([]);

  // 屏4：治疗期望
  const [selectedExpectations, setSelectedExpectations] = useState<string[]>([]);

  // 屏5：是否已提交
  const [submitted, setSubmitted] = useState(false);

  // ---- 派生数据 ----
  const speciesForTumorList = basic.species || "";

  const tumorInfoList = useMemo(
    () => getTumorInfoList(speciesForTumorList),
    [speciesForTumorList],
  );

  const detectionMaps = useMemo(() => {
    if (basic.species === "dog" || basic.species === "cat") {
      return getTumorsBySpecies(basic.species);
    }
    return [];
  }, [basic.species]);

  const selectedDetectionMaps = useMemo(() => {
    return detectionMaps.filter((m) => selectedTumors.includes(m.tumorType));
  }, [detectionMaps, selectedTumors]);

  const education = useMemo(() => getEducationContent(basic.species), [basic.species]);

  // ---- 屏1：城市/医院选择 UI 状态 ----
  const [citySelect, setCitySelect] = useState(""); // "" | cityName | "__manual__"
  const [hospitalSelect, setHospitalSelect] = useState(""); // "" | hospitalId | "__manual__"
  const [manualCity, setManualCity] = useState("");
  const [manualHospital, setManualHospital] = useState("");

  // 派生 UI 模式
  const isManualCityMode = citySelect === "__manual__";
  const showHospitalDropdown =
    citySelect !== "" && citySelect !== "__manual__" && hasHospitals(citySelect);
  const showHospitalText =
    citySelect !== "" && citySelect !== "__manual__" && !hasHospitals(citySelect);
  const isManualHospitalMode =
    hospitalSelect === "__manual__";
  const showManualHospitalInput =
    isManualCityMode || showHospitalText || isManualHospitalMode;

  // 获取最终提交值
  const getFinalCity = () =>
    isManualCityMode ? manualCity : citySelect;
  const getFinalHospital = () => {
    if (isManualCityMode || showHospitalText || isManualHospitalMode) {
      return manualHospital;
    }
    return hospitalSelect;
  };

  // ---- 更新字段 ----
  const updateBasic = <K extends keyof BasicInfo>(field: K, value: BasicInfo[K]) => {
    setBasic((prev) => ({ ...prev, [field]: value }));
  };

  // ---- 屏1 校验 ----
  const screen0Valid =
    basic.petName.trim().length > 0 &&
    basic.species !== "" &&
    basic.breed.trim().length > 0 &&
    basic.age.trim().length > 0 &&
    parseFloat(basic.age) >= 0 &&
    parseFloat(basic.age) <= 30 &&
    citySelect !== "" &&
    (isManualCityMode ? manualCity.trim().length > 0 : true) &&
    /^1[3-9]\d{9}$/.test(basic.phone) &&
    basic.agreed;

  // ---- 导航 ----
  const goNext = () => {
    if (screen < 4) {
      setScreen((prev) => (prev + 1) as ScreenIndex);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const goBack = () => {
    if (screen > 0) {
      setScreen((prev) => (prev - 1) as ScreenIndex);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleSubmit = async (e?: FormEvent) => {
    if (e) e.preventDefault();
    const finalCity = getFinalCity();
    const finalHospital = getFinalHospital();
    // 将最终城市/医院值写入 basic，供屏5展示
    setBasic((prev) => ({
      ...prev,
      city: finalCity,
      hospitalName: finalHospital,
      tumorTypeOther: tumorTypeOther,
    }));

    // 写入 Supabase
    try {
      const { error } = await supabase.from("leads").insert({
        pet_name: String(basic.petName || ""),
        species: String(basic.species || ""),
        breed: String(basic.breed || ""),
        age: basic.age ? Number(basic.age) : null,
        city: finalCity,
        hospital_name: finalHospital || null,
        tumor_type: String(selectedTumors.join(", ") || ""),
        tumor_type_other: tumorTypeOther || null,
        done_tests: selectedTests,
        goals: selectedExpectations,
        phone: String(basic.phone || ""),
        consent: Boolean(basic.agreed),
      });
      if (error) {
        console.error("提交失败：", error.message);
      }
    } catch (err) {
      console.error("提交异常：", err);
    }

    setSubmitted(true);
    setScreen(4);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleRestart = () => {
    setBasic(INITIAL_BASIC);
    setSelectedTumors([]);
    setSelectedTests([]);
    setSelectedExpectations([]);
    setPopupTumor(null);
    setSubmitted(false);
    setScreen(0);
    setCitySelect("");
    setHospitalSelect("");
    setManualCity("");
    setManualHospital("");
    setTumorTypeOther("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ---- 屏2 肿瘤选择 ----
  const toggleTumor = (info: TumorInfo) => {
    setSelectedTumors((prev) => {
      if (prev.includes(info.type)) {
        if (info.type === TUMOR_TYPE_OTHER) {
          setTumorTypeOther("");
        }
        return prev.filter((t) => t !== info.type);
      }
      // 首次选中 → "其他"不弹科普窗
      if (info.type !== TUMOR_TYPE_OTHER) {
        setPopupTumor(info);
      }
      return [...prev, info.type];
    });
  };

  // ---- 屏3 检查选择 ----
  const toggleTest = (key: string) => {
    setSelectedTests((prev) => {
      if (key === "none") {
        // "未做任何检查"互斥
        return prev.includes("none") ? [] : ["none"];
      }
      const cleaned = prev.filter((k) => k !== "none");
      if (cleaned.includes(key)) {
        return cleaned.filter((k) => k !== key);
      }
      return [...cleaned, key];
    });
  };

  // ---- 屏4 期望选择 ----
  const toggleExpectation = (key: string) => {
    setSelectedExpectations((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
    );
  };

  // ==================== 渲染 ====================

  return (
    <main className="min-h-screen bg-gradient-to-b from-green-50/50 to-white px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-lg">
        {/* Header */}
        <div className="mb-4 text-center">
          <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 sm:text-3xl">
            🩺 宠物肿瘤精细化检测
          </h1>
          <p className="mt-1.5 text-sm text-gray-500">
            {SCREEN_TITLES[screen]}
          </p>
        </div>

        {/* Progress */}
        <ProgressBar current={screen} />

        {/* ======== 屏1：基础信息 ======== */}
        {screen === 0 && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (screen0Valid) goNext();
            }}
            className="animate-fade-in space-y-4 rounded-2xl bg-white p-6 shadow-lg ring-1 ring-gray-100 sm:p-8"
          >
            {/* 宠物名 */}
            <div>
              <label className="block text-sm font-semibold text-gray-700">
                宠物名字 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="例如：豆豆、咪咪"
                value={basic.petName}
                onChange={(e) => updateBasic("petName", e.target.value)}
                className="mt-1.5 block w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 placeholder:text-gray-400 transition focus:border-green-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-100"
              />
            </div>

            {/* 种类 */}
            <div>
              <label className="block text-sm font-semibold text-gray-700">
                宠物种类 <span className="text-red-500">*</span>
              </label>
              <div className="mt-1.5 grid grid-cols-2 gap-3">
                {SPECIES_OPTIONS.filter((o) => o.value !== "").map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() =>
                      updateBasic(
                        "species",
                        opt.value as "dog" | "cat",
                      )
                    }
                    className={`rounded-xl border px-4 py-3 text-sm font-semibold transition ${
                      basic.species === opt.value
                        ? "border-green-500 bg-green-50 text-green-700"
                        : "border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 品种 */}
            <div>
              <label
                htmlFor="breed"
                className="block text-sm font-semibold text-gray-700"
              >
                品种 <span className="text-red-500">*</span>
              </label>
              <input
                id="breed"
                type="text"
                required
                placeholder="如：金毛、布偶、比熊"
                value={basic.breed}
                onChange={(e) => updateBasic("breed", e.target.value)}
                className="mt-1.5 block w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 placeholder:text-gray-400 transition focus:border-green-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-100"
              />
            </div>

            {/* 年龄 */}
            <div>
              <label
                htmlFor="age"
                className="block text-sm font-semibold text-gray-700"
              >
                年龄 <span className="text-red-500">*</span>
              </label>
              <div className="relative mt-1.5">
                <input
                  id="age"
                  type="number"
                  required
                  min={0}
                  max={30}
                  step={0.5}
                  placeholder="岁"
                  value={basic.age}
                  onChange={(e) => updateBasic("age", e.target.value)}
                  className="block w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 pr-14 text-gray-900 placeholder:text-gray-400 transition focus:border-green-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-100"
                />
                <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-sm text-gray-400">
                  岁
                </span>
              </div>
            </div>

            {/* 城市 */}
            <div>
              <label
                htmlFor="city-select"
                className="block text-sm font-semibold text-gray-700"
              >
                所在城市 <span className="text-red-500">*</span>
              </label>
              <select
                id="city-select"
                value={citySelect}
                onChange={(e) => {
                  const v = e.target.value;
                  setCitySelect(v);
                  setHospitalSelect("");
                  setManualCity("");
                  setManualHospital("");
                }}
                className="mt-1.5 block w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 text-base transition focus:border-green-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-100"
              >
                <option value="">请选择城市</option>
                {cityGroups.map((group) => (
                  <optgroup key={group.tier} label={group.tier}>
                    {group.cities.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </optgroup>
                ))}
                <option value="__manual__">其他（手动输入）</option>
              </select>
            </div>

            {/* 手动输入城市（选"其他"时） */}
            {isManualCityMode && (
              <div className="animate-fade-in">
                <label className="block text-sm font-semibold text-gray-700">
                  请输入城市名 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="请输入您所在的城市"
                  value={manualCity}
                  onChange={(e) => setManualCity(e.target.value)}
                  className="mt-1.5 block w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 placeholder:text-gray-400 transition focus:border-green-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-100"
                />
              </div>
            )}

            {/* 有合作医院 → 医院下拉 */}
            {showHospitalDropdown && (
              <div className="animate-fade-in">
                <label
                  htmlFor="hospital-select"
                  className="block text-sm font-semibold text-gray-700"
                >
                  就诊医院{" "}
                  <span className="text-xs font-normal text-gray-400">
                    （选填）
                  </span>
                </label>
                <select
                  id="hospital-select"
                  value={hospitalSelect}
                  onChange={(e) => setHospitalSelect(e.target.value)}
                  className="mt-1.5 block w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 text-base transition focus:border-green-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-100"
                >
                  <option value="">请选择就诊医院</option>
                  {getHospitalsByCity(citySelect).map((h) => (
                    <option key={h.id} value={h.id}>
                      {h.name}（{h.district}）
                    </option>
                  ))}
                  <option value="__manual__">其他（手动输入）</option>
                </select>
              </div>
            )}

            {/* 无合作医院 → 医院文本框 */}
            {showHospitalText && (
              <div className="animate-fade-in">
                <label className="block text-sm font-semibold text-gray-700">
                  您在哪家医院确诊的？{" "}
                  <span className="text-xs font-normal text-gray-400">
                    （选填）
                  </span>
                </label>
                <input
                  type="text"
                  placeholder="您在哪家医院确诊的？（选填）"
                  value={manualHospital}
                  onChange={(e) => setManualHospital(e.target.value)}
                  className="mt-1.5 block w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 placeholder:text-gray-400 transition focus:border-green-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-100"
                />
              </div>
            )}

            {/* 医院"其他"手动输入 */}
            {isManualHospitalMode && !isManualCityMode && !showHospitalText && (
              <div className="animate-fade-in">
                <label className="block text-sm font-semibold text-gray-700">
                  请输入医院名称
                </label>
                <input
                  type="text"
                  placeholder="请输入就诊医院名称"
                  value={manualHospital}
                  onChange={(e) => setManualHospital(e.target.value)}
                  className="mt-1.5 block w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 placeholder:text-gray-400 transition focus:border-green-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-100"
                />
              </div>
            )}

            {/* 手动城市下的医院输入 */}
            {isManualCityMode && (
              <div className="animate-fade-in">
                <label className="block text-sm font-semibold text-gray-700">
                  就诊医院{" "}
                  <span className="text-xs font-normal text-gray-400">
                    （选填）
                  </span>
                </label>
                <input
                  type="text"
                  placeholder="请输入就诊医院名称"
                  value={manualHospital}
                  onChange={(e) => setManualHospital(e.target.value)}
                  className="mt-1.5 block w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 placeholder:text-gray-400 transition focus:border-green-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-100"
                />
              </div>
            )}

            {/* 手机号 */}
            <div>
              <label className="block text-sm font-semibold text-gray-700">
                手机号 <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                required
                pattern="1[3-9]\d{9}"
                maxLength={11}
                placeholder="请输入11位手机号"
                value={basic.phone}
                onChange={(e) => updateBasic("phone", e.target.value)}
                className="mt-1.5 block w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 placeholder:text-gray-400 transition focus:border-green-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-100"
              />
            </div>

            {/* 同意勾选 */}
            <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-gray-100 bg-gray-50 p-3 transition hover:bg-gray-100">
              <input
                type="checkbox"
                required
                checked={basic.agreed}
                onChange={(e) => updateBasic("agreed", e.target.checked)}
                className="mt-0.5 h-5 w-5 rounded accent-green-500"
              />
              <span className="text-xs leading-relaxed text-gray-500">
                我已阅读并同意《用户协议》和《隐私政策》，了解本分诊建议仅供参考，不能替代专业兽医诊断
              </span>
            </label>

            <button
              type="submit"
              disabled={!screen0Valid}
              className="w-full rounded-2xl bg-green-500 py-3.5 text-base font-bold text-white shadow-lg shadow-green-200 transition active:scale-[0.98] active:bg-green-600 disabled:cursor-not-allowed disabled:opacity-40 sm:hover:bg-green-600"
            >
              下一步：选择肿瘤类型
            </button>
          </form>
        )}

        {/* ======== 屏2：肿瘤类型选择 ======== */}
        {screen === 1 && (
          <div className="animate-fade-in space-y-4 rounded-2xl bg-white p-6 shadow-lg ring-1 ring-gray-100 sm:p-8">
            <p className="text-sm text-gray-500">
              请选择您宠物疑似或已确诊的肿瘤类型（可多选），选择后查看科普介绍。
            </p>
            <div className="grid grid-cols-1 gap-2.5">
              {tumorInfoList.map((info) => {
                const isSelected = selectedTumors.includes(info.type);
                return (
                  <button
                    key={info.type}
                    type="button"
                    onClick={() => toggleTumor(info)}
                    className={`flex items-center justify-between rounded-xl border px-4 py-3.5 text-left text-sm font-medium transition ${
                      isSelected
                        ? "border-green-400 bg-green-50 text-green-800"
                        : "border-gray-200 bg-gray-50 text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    <span>{info.label}</span>
                    {isSelected && (
                      <span className="text-green-500 text-lg leading-none">
                        ✓
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
            {selectedTumors.includes(TUMOR_TYPE_OTHER) && (
              <div className="animate-fade-in">
                <label className="block text-sm font-semibold text-gray-700">
                  请输入具体肿瘤类型
                </label>
                <input
                  type="text"
                  placeholder="请输入具体肿瘤类型"
                  value={tumorTypeOther}
                  onChange={(e) => setTumorTypeOther(e.target.value)}
                  className="mt-1.5 block w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 placeholder:text-gray-400 transition focus:border-green-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-100"
                />
              </div>
            )}
            {selectedTumors.length > 0 && (
              <p className="text-xs text-gray-400">
                已选择 {selectedTumors.length} 种肿瘤类型
              </p>
            )}

            {/* 按钮组 */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={goBack}
                className="flex-1 rounded-2xl border border-gray-200 bg-white py-3 text-sm font-semibold text-gray-600 transition active:bg-gray-50"
              >
                上一步
              </button>
              <button
                type="button"
                onClick={goNext}
                disabled={selectedTumors.length === 0}
                className="flex-1 rounded-2xl bg-green-500 py-3 text-sm font-bold text-white shadow-lg shadow-green-200 transition active:scale-[0.98] active:bg-green-600 disabled:cursor-not-allowed disabled:opacity-40 sm:hover:bg-green-600"
              >
                下一步：已做检查
              </button>
            </div>
          </div>
        )}

        {/* ======== 屏3：已做检查 ======== */}
        {screen === 2 && (
          <div className="animate-fade-in space-y-4 rounded-2xl bg-white p-6 shadow-lg ring-1 ring-gray-100 sm:p-8">
            <p className="text-sm text-gray-500">
              请选择宠物已经做过的检查（可多选），帮助我们了解已有的诊断基础。
            </p>
            <div className="grid grid-cols-1 gap-2.5">
              {TEST_OPTIONS.map((opt) => {
                const isSelected = selectedTests.includes(opt.key);
                return (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => toggleTest(opt.key)}
                    className={`flex items-center justify-between rounded-xl border px-4 py-3.5 text-left text-sm font-medium transition ${
                      isSelected
                        ? "border-blue-400 bg-blue-50 text-blue-800"
                        : "border-gray-200 bg-gray-50 text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    <span>{opt.label}</span>
                    {isSelected && (
                      <span className="text-blue-500 text-lg leading-none">
                        ✓
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* 按钮组 */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={goBack}
                className="flex-1 rounded-2xl border border-gray-200 bg-white py-3 text-sm font-semibold text-gray-600 transition active:bg-gray-50"
              >
                上一步
              </button>
              <button
                type="button"
                onClick={goNext}
                className="flex-1 rounded-2xl bg-green-500 py-3 text-sm font-bold text-white shadow-lg shadow-green-200 transition active:scale-[0.98] active:bg-green-600 sm:hover:bg-green-600"
              >
                下一步：治疗期望
              </button>
            </div>
          </div>
        )}

        {/* ======== 屏4：治疗期望 ======== */}
        {screen === 3 && (
          <div className="animate-fade-in space-y-4 rounded-2xl bg-white p-6 shadow-lg ring-1 ring-gray-100 sm:p-8">
            <p className="text-sm text-gray-500">
              请选择您对治疗的期望和关注方向（可多选）。
            </p>
            <div className="grid grid-cols-1 gap-2.5">
              {EXPECTATION_OPTIONS.map((opt) => {
                const isSelected = selectedExpectations.includes(opt.key);
                const isLearn = opt.key === "learn";
                return (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => toggleExpectation(opt.key)}
                    className={`flex items-center justify-between rounded-xl border px-4 py-3.5 text-left text-sm font-medium transition ${
                      isSelected
                        ? isLearn
                          ? "border-purple-400 bg-purple-50 text-purple-800"
                          : "border-amber-400 bg-amber-50 text-amber-800"
                        : "border-gray-200 bg-gray-50 text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    <span>{opt.label}</span>
                    {isSelected && (
                      <span
                        className={`text-lg leading-none ${
                          isLearn ? "text-purple-500" : "text-amber-500"
                        }`}
                      >
                        ✓
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* 按钮组 */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={goBack}
                className="flex-1 rounded-2xl border border-gray-200 bg-white py-3 text-sm font-semibold text-gray-600 transition active:bg-gray-50"
              >
                上一步
              </button>
              <button
                type="button"
                onClick={() => handleSubmit()}
                className="flex-1 rounded-2xl bg-green-500 py-3 text-sm font-bold text-white shadow-lg shadow-green-200 transition active:scale-[0.98] active:bg-green-600 sm:hover:bg-green-600"
              >
                提交并查看方案
              </button>
            </div>
          </div>
        )}

        {/* ======== 屏5：检测方案 + 科普摘要 ======== */}
        {screen === 4 && (
          <div className="animate-fade-in space-y-5">
            {/* 提交成功提示 */}
            <div className="rounded-2xl border border-green-200 bg-green-50 p-5 text-center">
              <span className="text-3xl">✅</span>
              <h2 className="mt-2 text-lg font-bold text-green-800">
                信息已提交
              </h2>
              <p className="mt-1 text-sm text-green-600">
                以下是基于您选择生成的检测方案和科普摘要
              </p>
            </div>

            {/* 宠物一句话总结 */}
            <div className="rounded-xl bg-white px-5 py-3 text-center text-sm font-medium text-gray-600 shadow-sm ring-1 ring-gray-100">
              {[
                basic.petName || "宝贝",
                basic.age ? `${basic.age}岁` : null,
                basic.breed,
                basic.species === "dog" ? "犬" : basic.species === "cat" ? "猫" : null,
                basic.city,
              ]
                .filter(Boolean)
                .join(" · ")}
            </div>

            {/* 感谢语 */}
            <p className="text-center text-xs text-gray-500">
              🙏 感谢您选择我们，为毛孩子寻求更精准的检测方案。
            </p>
            {/* 联系承诺 */}
            <p className="text-center text-xs text-gray-500">
              根据您的需要，我们将于24小时内与您联系，沟通具体细节，请保持手机畅通。
            </p>
            {/* 免责声明 */}
            <p className="text-center text-[11px] text-gray-400 leading-relaxed">
              以上为第三方检测项目说明，不替代执业兽医诊断。具体治疗方案请与主治医生讨论。
            </p>

            {/* ---- 科普摘要 ---- */}
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-lg font-bold text-gray-900">
                📘 科普摘要{basic.species === "dog" ? "（犬）" : basic.species === "cat" ? "（猫）" : ""}
              </h3>

              {/* 概述 */}
              <div className="mb-4">
                <h4 className="mb-1.5 text-sm font-bold text-gray-700">
                  肿瘤诊断概览
                </h4>
                <p className="text-sm leading-relaxed text-gray-600">
                  {education.overview}
                </p>
              </div>

              {/* 诊断路径 */}
              <div className="mb-4">
                <h4 className="mb-2 text-sm font-bold text-gray-700">
                  常规诊断路径
                </h4>
                <ol className="space-y-1.5">
                  {education.diagnosisPath.map((step, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-sm text-gray-600"
                    >
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-100 text-[11px] font-bold text-green-700">
                        {i + 1}
                      </span>
                      {step}
                    </li>
                  ))}
                </ol>
              </div>

              {/* 安抚语 */}
              <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-4">
                <p className="text-sm leading-relaxed text-amber-800">
                  💛 {education.comfortMessage}
                </p>
              </div>

              {/* 日常护理 */}
              <div>
                <h4 className="mb-2 text-sm font-bold text-gray-700">
                  日常护理建议
                </h4>
                <ul className="space-y-1.5">
                  {education.dailyTips.map((tip, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-sm text-gray-600"
                    >
                      <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-green-400" />
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* 免责声明 */}
            <p className="text-center text-xs text-gray-400">
              以上方案和科普内容仅供参考，具体诊疗请以主治兽医临床判断为准。
            </p>

            {/* 重新开始 */}
            <button
              type="button"
              onClick={handleRestart}
              className="w-full rounded-2xl border-2 border-green-300 bg-white py-3 text-sm font-bold text-green-600 transition active:bg-green-50"
            >
              🔄 重新开始新的分诊
            </button>
          </div>
        )}
      </div>

      {/* ======== 屏2肿瘤科普弹窗 ======== */}
      {popupTumor && (
        <ComfortModal info={popupTumor} onClose={() => setPopupTumor(null)} />
      )}
    </main>
  );
}
