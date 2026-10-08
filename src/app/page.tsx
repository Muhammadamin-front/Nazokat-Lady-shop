import Shop from "@/components/Shop";
import { seedCatalog } from "@/data/seed";

export default function Page() {
  return <Shop seed={seedCatalog()} />;
}
