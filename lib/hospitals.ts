// 合作医院数据 — 深圳地区

export interface Hospital {
  id: string;
  name: string;
  district: string;
  address: string;
  phone: string;
  hours: string;
  specialties: string[];
  coordinates: {
    lat: number;
    lng: number;
  };
}

export const SHENZHEN_HOSPITALS: Hospital[] = [
  {
    id: "sz-001",
    name: "瑞鹏宠物医院深圳中心医院",
    district: "南山区",
    address: "深圳市南山区粤海街道科技园南路18号",
    phone: "0755-86712345",
    hours: "09:00-21:00（节假日不休）",
    specialties: ["肿瘤专科", "影像诊断", "软组织外科", "肿瘤内科"],
    coordinates: { lat: 22.5362, lng: 113.9526 },
  },
  {
    id: "sz-002",
    name: "芭比堂动物医院深圳总院",
    district: "福田区",
    address: "深圳市福田区莲花街道红荔西路6001号",
    phone: "0755-83215678",
    hours: "09:00-22:00（节假日不休）",
    specialties: ["肿瘤科", "病理诊断", "微创手术", "化疗"],
    coordinates: { lat: 22.5482, lng: 114.0545 },
  },
  {
    id: "sz-003",
    name: "深圳联合宠物医院中心分院",
    district: "罗湖区",
    address: "深圳市罗湖区南湖街道深南东路2001号",
    phone: "0755-82230987",
    hours: "08:30-20:30（节假日不休）",
    specialties: ["肿瘤专科", "CT/MRI影像", "外科手术", "康复理疗"],
    coordinates: { lat: 22.5376, lng: 114.1207 },
  },
  {
    id: "sz-004",
    name: "瑞派宠物医院深圳总院",
    district: "宝安区",
    address: "深圳市宝安区新安街道创业一路88号",
    phone: "0755-27884567",
    hours: "09:00-21:00（节假日不休）",
    specialties: ["肿瘤筛查", "超声诊断", "细胞学检查", "姑息治疗"],
    coordinates: { lat: 22.5689, lng: 113.8831 },
  },
  {
    id: "sz-005",
    name: "派特宠物医院深圳总院",
    district: "龙岗区",
    address: "深圳市龙岗区龙城街道龙翔大道7188号",
    phone: "0755-28915432",
    hours: "09:00-20:00（周三休）",
    specialties: ["肿瘤内科", "化疗", "靶向治疗", "营养支持"],
    coordinates: { lat: 22.7175, lng: 114.2464 },
  },
];

/** 按城市分组的合作医院（key 为城市名） */
export const hospitalsByCity: Record<string, Hospital[]> = {
  深圳: SHENZHEN_HOSPITALS,
};

/** 按区筛选医院 */
export function getHospitalsByDistrict(district: string): Hospital[] {
  return SHENZHEN_HOSPITALS.filter((h) => h.district === district);
}

/** 根据ID获取医院 */
export function getHospitalById(id: string): Hospital | undefined {
  return SHENZHEN_HOSPITALS.find((h) => h.id === id);
}

/** 获取所有行政区 */
export function getAllDistricts(): string[] {
  return Array.from(new Set(SHENZHEN_HOSPITALS.map((h) => h.district)));
}
