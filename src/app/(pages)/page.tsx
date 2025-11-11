import { HomeGallery } from "@/components/sections/HomeGallery";
import { getAllWorkData } from "@/data/artists";

export const revalidate = 0; // Disable caching for admin updates

export default function HomePage() {
  const works = getAllWorkData();

  return <HomeGallery works={works} />;
}

