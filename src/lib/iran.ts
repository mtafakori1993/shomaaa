// Province codes as defined by WooCommerce core for country IR.
export const IR_STATES: Record<string, string> = {
  ABZ: "البرز", ADL: "اردبیل", EAZ: "آذربایجان شرقی", WAZ: "آذربایجان غربی", BHR: "بوشهر", CHB: "چهارمحال و بختیاری",
  FRS: "فارس", GIL: "گیلان", GLS: "گلستان", HDN: "همدان", HRZ: "هرمزگان", ILM: "ایلام", ESF: "اصفهان", KRN: "کرمان",
  KRH: "کرمانشاه", NKH: "خراسان شمالی", RKH: "خراسان رضوی", SKH: "خراسان جنوبی", KHZ: "خوزستان", KBD: "کهگیلویه و بویراحمد",
  KRD: "کردستان", LRS: "لرستان", MKZ: "مرکزی", MZN: "مازندران", GZN: "قزوین", QHM: "قم", SMN: "سمنان", SBN: "سیستان و بلوچستان",
  THR: "تهران", YZD: "یزد", ZJN: "زنجان",
};
export const IR_STATE_OPTIONS = Object.entries(IR_STATES)
  .map(([value, label]) => ({ value, label }))
  .sort((a, b) => a.label.localeCompare(b.label, "fa"));
