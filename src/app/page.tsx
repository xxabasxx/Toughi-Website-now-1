import ClientOnly from "@/components/ClientOnly";
import ToughiApp from "@/components/ToughiApp";

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <ClientOnly>
      <ToughiApp />
    </ClientOnly>
  );
}
