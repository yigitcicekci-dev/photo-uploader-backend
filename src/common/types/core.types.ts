export enum AppLanguages {
  Turkish = 'tr_TR',
  English = 'en_US',
}

export const AppLanguageLabels: Record<
  AppLanguages,
  { label: string; short: string }
> = {
  [AppLanguages.Turkish]: { label: 'Türkçe', short: 'tr' },
  [AppLanguages.English]: { label: 'English', short: 'en' },
};

export const AppLanguageConvert: Record<string, AppLanguages> = (() => {
  const map: Record<string, AppLanguages> = {};

  for (const [enumKey, meta] of Object.entries(AppLanguageLabels)) {
    const full = enumKey;
    const short = meta.short;

    map[short] = enumKey as AppLanguages;
    map[full] = enumKey as AppLanguages;
  }

  return map;
})();
