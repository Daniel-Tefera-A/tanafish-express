"use client";
import { MapPin, LocateFixed } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { Button } from "./ui";

/**
 * Lightweight location pinning: uses the browser Geolocation API and shows a Google Maps
 * embed when NEXT_PUBLIC_GOOGLE_MAPS_KEY is set. For a draggable pin, swap the iframe for
 * @react-google-maps/api <GoogleMap><Marker draggable/></GoogleMap> (loaded lazily to keep the
 * initial bundle small on 3G).
 */
export function LocationPicker({
  value,
  onChange,
}: {
  value?: { lat: number; lng: number };
  onChange: (v: { lat: number; lng: number }) => void;
}) {
  const { t } = useI18n();
  const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY;
  const center = value ?? { lat: 11.5936, lng: 37.3908 }; // Bahir Dar

  const locate = () =>
    navigator.geolocation?.getCurrentPosition(
      (p) => onChange({ lat: p.coords.latitude, lng: p.coords.longitude }),
      () => onChange(center),
      { enableHighAccuracy: true, timeout: 8000 }
    );

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-sm font-medium text-lake-700">
          <MapPin size={16} /> {t("pinOnMap")}
        </span>
        <Button type="button" size="sm" variant="outline" onClick={locate}>
          <LocateFixed size={14} /> GPS
        </Button>
      </div>
      <div className="grid h-44 place-items-center overflow-hidden rounded-xl border border-lake-100 bg-lake-50">
        {key ? (
          <iframe
            title="map"
            loading="lazy"
            className="h-full w-full"
            src={`https://www.google.com/maps/embed/v1/place?key=${key}&q=${center.lat},${center.lng}&zoom=16`}
          />
        ) : (
          <div className="text-center text-sm text-lake-500">
            <MapPin className="mx-auto mb-1 text-lime-600" />
            {value ? `${value.lat.toFixed(5)}, ${value.lng.toFixed(5)}` : "Tap GPS to drop a pin"}
            <div className="text-xs text-lake-300">Add NEXT_PUBLIC_GOOGLE_MAPS_KEY for the live map</div>
          </div>
        )}
      </div>
    </div>
  );
}
