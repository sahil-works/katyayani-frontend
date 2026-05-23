import Link from "next/link";
import CollectionsContent from "../../components/CollectionsContent";

export const metadata = {
  title: "Collections | Katyayani Designer Hub",
  description: "Browse all collections at Katyayani Designer Hub.",
};

export default function CollectionsPage() {
  return (
    <main className="min-h-[calc(100vh-96px)] bg-white">
      <div className="mx-auto max-w-[1320px] px-6 pt-5 pb-18 lg:px-10">
        <div className="text-[14px] text-[#5c5c5c]">
          <Link href="/" className="hover:text-black">
            Home
          </Link>
          <span className="mx-2 text-[#9c9c9c]">/</span>
          <span>Collections</span>
        </div>

        <div className="mt-9">
          <CollectionsContent />
        </div>
      </div>
    </main>
  );
}
