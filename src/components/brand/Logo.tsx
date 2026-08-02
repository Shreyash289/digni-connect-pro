import logoAsset from "@/assets/carevia-logo.png.asset.json";

export function Logo({ className = "h-9 w-auto" }: { className?: string }) {
  return <img src={logoAsset.url} alt="CAREVIA" className={className} />;
}
