// DeepSeek Prompt 模板
// mode.education 控制是否输出 education（科普安抚）字段

export interface PromptData {
  petName: string;
  species: "dog" | "cat" | "other";
  selectedTumors: string[];
  selectedTests: string[];
  selectedExpectations: string[];
  city: string;
  phone: string;
}

export interface PromptMode {
  /** 是否输出科普安抚内容（屏5展示） */
  education?: boolean;
}

const SPECIES_LABEL: Record<string, string> = {
  dog: "犬",
  cat: "猫",
  other: "其他",
};

function buildUserContext(data: PromptData): string {
  const lines: string[] = [];

  lines.push(`## 宠物基本信息`);
  lines.push(`- 宠物名：${data.petName || "未填写"}`);
  lines.push(`- 种类：${SPECIES_LABEL[data.species] || data.species}`);
  if (data.selectedTumors.length > 0) {
    lines.push(`- 疑似肿瘤类型：${data.selectedTumors.join("、")}`);
  }
  lines.push(`- 所在城市：${data.city}`);

  if (data.selectedTests.length > 0) {
    lines.push(``);
    lines.push(`## 已完成的检查`);
    lines.push(`- ${data.selectedTests.join("、")}`);
  }

  if (data.selectedExpectations.length > 0) {
    lines.push(``);
    lines.push(`## 主人的治疗期望与关注点`);
    data.selectedExpectations.forEach((exp) => lines.push(`- ${exp}`));
  }

  return lines.join("\n");
}

export function buildSystemPrompt(mode: PromptMode = {}): string {
  let prompt = `你是一位资深的小动物肿瘤专科兽医顾问，拥有10年以上的临床经验。你正在协助宠物主人初步了解宠物的肿瘤情况。

## 你的角色定位
- 你提供的是**科普教育和分诊引导**，不替代临床诊断
- 语言温暖、专业、有同理心，使用通俗易懂的中文
- 不推荐具体药品品牌或商业产品
- 在给出建议时，强调以主治兽医的临床判断为准

## 输出格式要求
请严格按以下JSON格式输出（不要包含markdown代码块标记）：

{
  "triageSummary": "简要分诊总结（2-3句话，涵盖最可能的肿瘤类型方向和紧急程度评估）",
  "recommendedNextSteps": [
    "具体建议1",
    "具体建议2",
    "具体建议3"
  ],
  "riskFactors": [
    "相关风险因素1（如果有）",
    "相关风险因素2（如果有）"
  ],
  "warningSigns": [
    "需要立即就医的警示信号1",
    "需要立即就医的警示信号2"
  ]`;

  if (mode.education) {
    prompt += `,
  "education": {
    "tumorOverview": "关于用户所选肿瘤类型的通俗科普介绍（150-250字，区分犬猫差异）",
    "diagnosisFlow": "常规诊断流程说明（按先后顺序列出步骤）",
    "comfortMessage": "给宠物主人的安抚寄语（温暖、有支持感，80-120字）",
    "faq": [
      {"question": "常见问题1", "answer": "通俗解答1"},
      {"question": "常见问题2", "answer": "通俗解答2"},
      {"question": "常见问题3", "answer": "通俗解答3"}
    ],
    "dailyCareTips": [
      "日常护理建议1",
      "日常护理建议2",
      "日常护理建议3"
    ]
  }`;
  }

  prompt += `
}

## 重要原则
1. 所有医学建议必须注明"请以主治兽医诊断为准"
2. 如果信息不足以做出判断，请明确指出需要补充哪些信息
3. 不要给出确定的诊断结论，仅提供可能性分析
4. 语气温暖但不夸大，如实传达预后信息
5. 如涉及紧急情况（如出血、呼吸困难等），优先建议立即就医`;

  return prompt;
}

export function buildPrompt(data: PromptData, mode: PromptMode = {}): string {
  const systemPrompt = buildSystemPrompt(mode);
  const userContext = buildUserContext(data);

  const fullPrompt = `${systemPrompt}

---

以下是宠物主人的咨询信息，请据此提供专业的分析和建议：

${userContext}

---

请基于以上信息，输出JSON格式的分析结果。`;

  return fullPrompt;
}

/**
 * 用于直接调用 DeepSeek API 的 messages 数组
 */
export function buildDeepSeekMessages(
  data: PromptData,
  mode: PromptMode = {},
): Array<{ role: "system" | "user"; content: string }> {
  return [
    { role: "system", content: buildSystemPrompt(mode) },
    { role: "user", content: buildUserContext(data) },
  ];
}
