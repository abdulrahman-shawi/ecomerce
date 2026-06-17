"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

interface Settings {
  siteName: string;
  companyEmail: string;
  companyPhone: string;
  siteCurrency: string;
  usdToTryRate: number;
  facebookUrl: string;
  instagramUrl: string;
  logo: string;
  primaryColor: string;
  secondaryColor: string;
  topBannerText: string;
}

interface SettingsContextValue extends Settings {
  loading: boolean;
}

const defaultSettings: Settings = {
  siteName: "SKYNOVA",
  companyEmail: "",
  companyPhone: "",
  siteCurrency: "USD",
  usdToTryRate: 0,
  facebookUrl: "",
  instagramUrl: "",
  logo: "",
  primaryColor: "#10b981",
  secondaryColor: "#0f766e",
  topBannerText: "",
};

const SettingsContext = createContext<SettingsContextValue>({
  ...defaultSettings,
  loading: true,
});

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data: Partial<Settings>) => {
        setSettings({ ...defaultSettings, ...data });
      })
      .catch(() => {
        setSettings(defaultSettings);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <SettingsContext.Provider value={{ ...settings, loading }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  return useContext(SettingsContext);
}
