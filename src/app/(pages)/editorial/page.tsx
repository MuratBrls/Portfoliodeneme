import { getAllWorkData } from "@/data/artists";
import { EditorialClient } from "./EditorialClient";

export const revalidate = 0;

export default function EditorialPage() {
  const works = getAllWorkData();
  return <EditorialClient works={works} />;
}
