import { Truck, ShieldCheck, MessageCircle, Star } from "lucide-react";

const features = [
  {
    icon: Truck,
    title: "Free Dhaka delivery",
    description: "Over ৳5,000",
  },
  {
    icon: ShieldCheck,
    title: "100% verified imports",
    description: "Every item batch-checked",
  },
  {
    icon: MessageCircle,
    title: "Order via WhatsApp / call",
    description: "01959-524393",
  },
  {
    icon: Star,
    title: "2,000+ verified reviews",
    description: "On Facebook",
  },
];

export default function FeaturesStrip() {
  return (
    <section
      id="features"
      className="border-t border-b"
      style={{
        backgroundColor: "var(--cream-dark)",
        borderColor: "var(--cream-darker)",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {features.map((f) => (
            <div key={f.title} className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5">
                <f.icon
                  size={16}
                  strokeWidth={1.5}
                  style={{ color: "var(--gold)" }}
                />
              </div>
              <div>
                <p
                  className="text-xs font-semibold leading-tight mb-0.5"
                  style={{ color: "var(--plum)", fontFamily: "var(--font-sans)" }}
                >
                  {f.title}
                </p>
                <p
                  className="text-[11px]"
                  style={{ color: "var(--text-muted)", fontFamily: "var(--font-sans)" }}
                >
                  {f.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
