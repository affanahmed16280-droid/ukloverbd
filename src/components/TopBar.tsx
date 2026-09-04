export default function TopBar() {
  return (
    <div
      className="border-b"
      style={{ backgroundColor: "var(--cream)", borderColor: "var(--cream-darker)" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-8 text-xs"
          style={{ color: "var(--text-muted)", fontFamily: "var(--font-sans)" }}>
          {/* Left */}
          <div className="flex items-center gap-3">
            <span>01959-524393</span>
            <span style={{ color: "var(--cream-darker)" }}>|</span>
            <span>ORDER VIA CALL OR WHATSAPP</span>
          </div>
          {/* Center */}
          <div className="hidden sm:block font-medium tracking-wider uppercase text-[10px]"
            style={{ color: "var(--plum)" }}>
            FREE DELIVERY IN DHAKA ON ORDERS OVER ৳5,000
          </div>
          {/* Right */}
          <div className="flex items-center gap-3 text-[10px] font-semibold tracking-widest uppercase"
            style={{ color: "var(--plum)" }}>
            <span>BDT ৳</span>
            <span style={{ color: "var(--cream-darker)" }}>|</span>
            <span style={{ color: "var(--text-muted)" }}>GBP £</span>
          </div>
        </div>
      </div>
    </div>
  );
}
