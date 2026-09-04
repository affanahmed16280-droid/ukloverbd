export default function TopBar() {
  return (
    <div
      className="border-b"
      style={{ backgroundColor: "var(--cream)", borderColor: "var(--cream-darker)" }}
    >
      <div className="max-w-[1400px] mx-auto px-6 sm:px-8 lg:px-12">
        <div className="flex items-center justify-between h-9 text-[10px] tracking-wide"
          style={{ color: "var(--text-muted)", fontFamily: "var(--font-sans)" }}>
          {/* Left */}
          <div className="flex items-center gap-4">
            <span>01959-524393</span>
            <span style={{ color: "var(--cream-darker)" }}>/</span>
            <span className="uppercase tracking-widest font-semibold">ORDER VIA CALL OR WHATSAPP</span>
          </div>
          {/* Center */}
          <div className="hidden md:block font-bold tracking-widest uppercase text-[10px]"
            style={{ color: "var(--plum)" }}>
            FREE DELIVERY IN DHAKA ON ORDERS OVER ৳5,000
          </div>
          {/* Right */}
          <div className="flex items-center gap-4 text-[10px] font-bold tracking-[0.2em] uppercase"
            style={{ color: "var(--plum)" }}>
            <span>BDT ৳</span>
            <span style={{ color: "var(--cream-darker)" }}>|</span>
            <span style={{ color: "var(--text-muted)", fontWeight: 500 }}>GBP £</span>
          </div>
        </div>
      </div>
    </div>
  );
}
