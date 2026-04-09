"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { supabaseBrowser } from "@/lib/supabaseClient";
import { Tables } from "@/database.types";

type Hotel = Tables<"hotels">;

type HotelContextType = {
  hotels: Hotel[];
  selectedHotel: Hotel | null;
  setSelectedHotel: (hotel: Hotel | null) => void;
  loadingHotels: boolean;
  refreshHotels: () => Promise<void>;
};

const HotelContext = createContext<HotelContextType | null>(null);

export function HotelProvider({ children }: { children: ReactNode }) {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [selectedHotel, setSelectedHotelState] = useState<Hotel | null>(null);
  const [loadingHotels, setLoadingHotels] = useState(true);

  const refreshHotels = useCallback(async () => {
    const { data } = await supabaseBrowser.from("hotels").select("*").order("created_at");
    const list = (data ?? []) as Hotel[];
    setHotels(list);

    // Re-validate the stored hotel still exists
    const storedId = typeof window !== "undefined" ? localStorage.getItem("selectedHotelId") : null;
    if (storedId) {
      const found = list.find((h) => h.id === storedId) ?? null;
      setSelectedHotelState(found);
    } else if (list.length === 1) {
      // Auto-select if there's only one hotel
      setSelectedHotelState(list[0]);
      localStorage.setItem("selectedHotelId", list[0].id);
    }

    setLoadingHotels(false);
  }, []);

  useEffect(() => {
    refreshHotels();
  }, [refreshHotels]);

  const setSelectedHotel = (hotel: Hotel | null) => {
    setSelectedHotelState(hotel);
    if (hotel) {
      localStorage.setItem("selectedHotelId", hotel.id);
    } else {
      localStorage.removeItem("selectedHotelId");
    }
  };

  return (
    <HotelContext.Provider value={{ hotels, selectedHotel, setSelectedHotel, loadingHotels, refreshHotels }}>
      {children}
    </HotelContext.Provider>
  );
}

export function useHotel() {
  const ctx = useContext(HotelContext);
  if (!ctx) throw new Error("useHotel must be used within HotelProvider");
  return ctx;
}
