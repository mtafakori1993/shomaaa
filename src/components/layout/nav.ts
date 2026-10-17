export interface NavItem { label: string; href: string; children?: { label: string; href: string }[] }

export const NAV: NavItem[] = [
  { label: "مردانه", href: "/collections/men", children: [
    { label: "کت‌وشلوار مردانه", href: "/collections/men-suits" },
    { label: "کت، شلوار و پیراهن", href: "/collections/men-separates" },
  ] },
  { label: "زنانه", href: "/collections/women", children: [
    { label: "کت‌وشلوار و ست زنانه", href: "/collections/women-suits" },
    { label: "پوشاک رسمی و مجلسی", href: "/collections/women-formal" },
  ] },
  { label: "اکسسوری", href: "/collections/accessories" },
  { label: "تازه‌ها", href: "/collections/all?sort=date" },
  { label: "تخفیف‌ها", href: "/collections/all?onsale=1" },
  { label: "درباره شوما", href: "/about" },
];
