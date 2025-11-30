import dynamic from "next/dynamic";

const MapView = dynamic(() => import("../../components/MapView"), { ssr: false });

export const metadata = { title: "Map & Directions • PAIO TravelBiz" };

export default function MapPage() {
  return <MapView />;
}