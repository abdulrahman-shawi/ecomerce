"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";

export type CountryCode = "TR" | "SY";

interface RegionContextType {
  country: CountryCode;
  setCountry: (country: CountryCode) => void;
  isDetecting: boolean;
}

const VALID_COUNTRIES: CountryCode[] = ["SY"];
const DEFAULT_COUNTRY: CountryCode = "SY";

function isValidCountry(value: string | undefined | null): value is CountryCode {
  return !!value && VALID_COUNTRIES.includes(value as CountryCode);
}

async function detectCountryByIp(): Promise<CountryCode> {
  return DEFAULT_COUNTRY;
}

const RegionContext = createContext<RegionContextType | undefined>(undefined);

export function RegionProvider({ children }: { children: ReactNode }) {
  const [country, setCountryState] = useState<CountryCode>(DEFAULT_COUNTRY);
  const [isDetecting, setIsDetecting] = useState(true);

  const applyCountry = useCallback((next: CountryCode) => {
    const normalizedCountry = isValidCountry(next) ? next : DEFAULT_COUNTRY;
    setCountryState(normalizedCountry);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      const detected = await detectCountryByIp();
      if (!cancelled) {
        applyCountry(detected);
        setIsDetecting(false);
      }
    }

    init();

    return () => {
      cancelled = true;
    };
  }, [applyCountry]);

  const setCountry = useCallback(
    (_next: CountryCode) => {
      applyCountry(DEFAULT_COUNTRY);
    },
    [applyCountry]
  );

  return (
    <RegionContext.Provider value={{ country, setCountry, isDetecting }}>
      {children}
    </RegionContext.Provider>
  );
}

export function useRegion() {
  const context = useContext(RegionContext);
  if (!context) throw new Error("useRegion must be used within RegionProvider");
  return context;
}
