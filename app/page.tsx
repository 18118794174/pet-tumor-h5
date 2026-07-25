"use client";

import { useState, type FormEvent } from "react";

interface FormData {
  species: string;
  breed: string;
  age: string;
  tumorLocation: string;
  biopsy: string;
  phone: string;
  city: string;
}

const INITIAL_FORM: FormData = {
  species: "",
  breed: "",
  age: "",
  tumorLocation: "",
  biopsy: "",
  phone: "",
  city: "",
};

const SPECIES_OPTIONS = [
  { value: "", label: "请选择" },
  { value: "dog", label: "狗" },
  { value: "cat", label: "猫" },
  { value: "other", label: "其他" },
];

const TUMOR_LOCATION_OPTIONS = [
  { value: "", label: "请选择" },
  { value: "skin", label: "皮肤" },
  { value: "mammary", label: "乳腺" },
  { value: "oral", label: "口腔" },
  { value: "abdominal", label: "腹腔" },
  { value: "bone", label: "骨骼" },
  { value: "lymph", label: "淋巴结" },
  { value: "other", label: "其他" },
];

const BIOPSY_OPTIONS = ["已做", "未做", "不清楚"];

const ADVICE_TEXT =
  "您好，根据您填写的信息，建议先完成病理活检明确诊断，再进行基因检测更有针对性。如需进一步了解，可添加企业微信咨询。";

export default function Home() {
  const [form, setForm] = useState<FormData>(INITIAL_FORM);
  const [showAdvice, setShowAdvice] = useState(false);

  const updateField = (field: keyof FormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setShowAdvice(true);
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-lg">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 sm:text-3xl">
            宠物肿瘤分诊
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            请填写以下信息，获取初步分诊建议
          </p>
        </div>

        {/* Form Card */}
        <form
          onSubmit={handleSubmit}
          className="space-y-5 rounded-2xl bg-white p-6 shadow-lg shadow-gray-200/50 ring-1 ring-gray-100 sm:p-8"
        >
          {/* 1. 宠物种类 */}
          <div>
            <label
              htmlFor="species"
              className="block text-sm font-semibold text-gray-700"
            >
              宠物种类 <span className="text-red-500">*</span>
            </label>
            <select
              id="species"
              required
              value={form.species}
              onChange={(e) => updateField("species", e.target.value)}
              className="mt-1.5 block w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 text-base transition focus:border-green-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-100"
            >
              {SPECIES_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* 2. 品种 */}
          <div>
            <label
              htmlFor="breed"
              className="block text-sm font-semibold text-gray-700"
            >
              品种 <span className="text-xs font-normal text-gray-400">（选填）</span>
            </label>
            <input
              id="breed"
              type="text"
              placeholder="例如：金毛、英短"
              value={form.breed}
              onChange={(e) => updateField("breed", e.target.value)}
              className="mt-1.5 block w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 placeholder:text-gray-400 transition focus:border-green-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-100"
            />
          </div>

          {/* 3. 年龄 */}
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
                min="0"
                max="50"
                step="0.5"
                placeholder="例如：5"
                value={form.age}
                onChange={(e) => updateField("age", e.target.value)}
                className="block w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 pr-14 text-gray-900 placeholder:text-gray-400 transition focus:border-green-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-100"
              />
              <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-sm text-gray-400">
                岁
              </span>
            </div>
          </div>

          {/* 4. 肿块位置 */}
          <div>
            <label
              htmlFor="tumorLocation"
              className="block text-sm font-semibold text-gray-700"
            >
              肿块位置 <span className="text-red-500">*</span>
            </label>
            <select
              id="tumorLocation"
              required
              value={form.tumorLocation}
              onChange={(e) => updateField("tumorLocation", e.target.value)}
              className="mt-1.5 block w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 transition focus:border-green-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-100"
            >
              {TUMOR_LOCATION_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* 5. 是否已做病理活检 */}
          <fieldset>
            <legend className="block text-sm font-semibold text-gray-700">
              是否已做病理活检 <span className="text-red-500">*</span>
            </legend>
            <div className="mt-2 flex flex-wrap gap-3">
              {BIOPSY_OPTIONS.map((option) => (
                <label
                  key={option}
                  className={`flex cursor-pointer items-center rounded-xl border px-4 py-2.5 text-sm font-medium transition ${
                    form.biopsy === option
                      ? "border-green-500 bg-green-50 text-green-700"
                      : "border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="biopsy"
                    value={option}
                    checked={form.biopsy === option}
                    onChange={(e) => updateField("biopsy", e.target.value)}
                    className="sr-only"
                    required
                  />
                  {option}
                </label>
              ))}
            </div>
          </fieldset>

          {/* 6. 联系电话 */}
          <div>
            <label
              htmlFor="phone"
              className="block text-sm font-semibold text-gray-700"
            >
              联系电话 <span className="text-red-500">*</span>
            </label>
            <input
              id="phone"
              type="tel"
              required
              pattern="1[3-9]\d{9}"
              maxLength={11}
              placeholder="请输入11位手机号"
              value={form.phone}
              onChange={(e) => updateField("phone", e.target.value)}
              className="mt-1.5 block w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 placeholder:text-gray-400 transition focus:border-green-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-100"
            />
          </div>

          {/* 7. 所在城市 */}
          <div>
            <label
              htmlFor="city"
              className="block text-sm font-semibold text-gray-700"
            >
              所在城市 <span className="text-red-500">*</span>
            </label>
            <input
              id="city"
              type="text"
              required
              placeholder="例如：北京"
              value={form.city}
              onChange={(e) => updateField("city", e.target.value)}
              className="mt-1.5 block w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 placeholder:text-gray-400 transition focus:border-green-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-100"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full rounded-2xl bg-green-500 py-3.5 text-base font-bold text-white shadow-lg shadow-green-200 transition active:scale-[0.98] active:bg-green-600 sm:hover:bg-green-600"
          >
            获取分诊建议
          </button>
        </form>

        {/* Advice Section */}
        {showAdvice && (
          <div className="mt-6 animate-fade-in rounded-2xl border border-green-200 bg-green-50 p-6 shadow-md">
            <div className="mb-3 flex items-center gap-2">
              <span className="text-xl">💡</span>
              <h2 className="text-lg font-bold text-green-800">分诊建议</h2>
            </div>
            <p className="leading-relaxed text-gray-700">{ADVICE_TEXT}</p>
          </div>
        )}

        {/* Footer */}
        <p className="mt-8 text-center text-xs text-gray-400">
          本分诊建议仅供参考，不能替代专业兽医诊断
        </p>
      </div>
    </main>
  );
}
