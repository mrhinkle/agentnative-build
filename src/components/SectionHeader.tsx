interface Props {
  label?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
  dark?: boolean;
  as?: "h2" | "h1";
}

export default function SectionHeader({ label, title, description, align = "left", className = "", dark = false }: Props) {
  return (
    <div className={`mb-10 ${align === "center" ? "text-center" : "text-left"} ${className}`}>
      {label && <p className="label-mono text-[#f44800] mb-3">{label}</p>}
      <h2 className={`font-heading text-3xl md:text-4xl lg:text-5xl font-bold leading-tight ${dark ? "text-white" : "text-[#0A0F1C]"}`}>{title}</h2>
      {description && (
        <p className={`mt-4 text-base md:text-lg max-w-2xl leading-relaxed ${dark ? "text-white/50" : "text-[#0A0F1C]/60"} ${align === "center" ? "mx-auto" : ""}`}>{description}</p>
      )}
    </div>
  );
}
