import { useState, useEffect, useRef } from "react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import logoImg from "../../imports/image-8.png";
import img0 from '../../imports/image.png'
import img1 from '../../imports/image-1.png'
import img2 from '../../imports/image-2.png'
import img4 from '../../imports/image-4.png'
import img6 from '../../imports/image-6.png'
// ─── Color tokens aligned with TripMate design system ───
// Primary: #1B3F6E (dark navy)
// Accent:  #2D7DD2 (bright blue)
// Teal:    #3DBAC2
// White / off-white backgrounds

const NAV_LINKS = [
  { label: "Tính năng", href: "#features" },
  { label: "Màn hình", href: "#screens" },
  { label: "Cách hoạt động", href: "#how" },
  { label: "Nhóm", href: "#team" },
];

// ─── Scroll-reveal hook ───
function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.12 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return { ref, visible };
}

// ─── Section wrapper with reveal animation ───
function RevealSection({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const { ref, visible } = useReveal();
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(32px)",
        transition: `opacity 0.7s ease ${delay}ms, transform 0.7s ease ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

// ─── Phone Mockup wrapper ───
function PhoneMockup({ src, alt, className = "" }: { src: string; alt: string; className?: string }) {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      {/* Phone shell */}
      <div
        style={{
          width: 220,
          height: 440,
          borderRadius: 36,
          background: "#111827",
          boxShadow: "0 30px 60px rgba(0,0,0,0.35), inset 0 0 0 2px rgba(255,255,255,0.08)",
          overflow: "hidden",
          position: "relative",
        }}
      >
        {/* Notch */}
        <div style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", width: 80, height: 22, background: "#111827", zIndex: 10, borderRadius: "0 0 14px 14px" }} />
        <img src={src} alt={alt} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top" }} />
      </div>
    </div>
  );
}

// ─── Feature card ───
function FeatureCard({ icon, title, description, color }: { icon: string; title: string; description: string; color: string }) {
  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 20,
        padding: "28px 24px",
        boxShadow: "0 4px 24px rgba(27,63,110,0.08)",
        borderTop: `4px solid ${color}`,
        transition: "transform 0.25s, box-shadow 0.25s",
      }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(-6px)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 12px 36px rgba(27,63,110,0.15)"; }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(0)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 24px rgba(27,63,110,0.08)"; }}
    >
      <div style={{ fontSize: 36, marginBottom: 14 }}>{icon}</div>
      <h3 style={{ color: "#1B3F6E", marginBottom: 8, fontFamily: "'Roboto', sans-serif" }}>{title}</h3>
      <p style={{ color: "#5A6B80", fontSize: 14, lineHeight: 1.7, margin: 0 }}>{description}</p>
    </div>
  );
}

// ─── Step card ───
function StepCard({ number, title, description, color }: { number: string; title: string; description: string; color: string }) {
  return (
    <div style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>
      <div style={{ minWidth: 52, height: 52, borderRadius: 16, background: color, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 20, fontWeight: 700, fontFamily: "'Roboto', sans-serif", flexShrink: 0, boxShadow: `0 4px 16px ${color}55` }}>{number}</div>
      <div>
        <h4 style={{ color: "#1B3F6E", marginBottom: 4, fontFamily: "'Roboto', sans-serif" }}>{title}</h4>
        <p style={{ color: "#5A6B80", fontSize: 14, lineHeight: 1.7, margin: 0 }}>{description}</p>
      </div>
    </div>
  );
}

export function LandingPage() {
  const [navScrolled, setNavScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handler = () => setNavScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const scrollTo = (id: string) => {
    setMenuOpen(false);
    const el = document.querySelector(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div
      style={{
        fontFamily: "'Roboto', sans-serif",
        background: "#F7F9FC",
        color: "#1B3F6E",
        overflowX: "hidden",
      }}
    >
      {/* ═══════════════ NAVBAR ═══════════════ */}
      <nav
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          background: navScrolled ? "rgba(255,255,255,0.95)" : "transparent",
          backdropFilter: navScrolled ? "blur(12px)" : "none",
          boxShadow: navScrolled ? "0 2px 20px rgba(27,63,110,0.1)" : "none",
          transition: "all 0.35s ease",
          padding: "0 24px",
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            height: 68,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center" }}>
            <img
              src={logoImg}
              alt="TripMate"
              style={{
                height: 48,
                width: "auto",
                filter: navScrolled ? "none" : "brightness(0) invert(1)",
              }}
            />
          </div>

          {/* Desktop nav */}
          <div
            className="hidden md:flex"
            style={{ gap: 32, alignItems: "center" }}
          >
            {NAV_LINKS.map((l) => (
              <button
                key={l.href}
                onClick={() => scrollTo(l.href)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: navScrolled ? "#5A6B80" : "rgba(255,255,255,0.85)",
                  fontSize: 15,
                  fontWeight: 500,
                  transition: "color 0.2s",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.color = navScrolled
                    ? "#1B3F6E"
                    : "#fff")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.color = navScrolled
                    ? "#5A6B80"
                    : "rgba(255,255,255,0.85)")
                }
              >
                {l.label}
              </button>
            ))}
            <a
              href="#figma"
              onClick={(e) => {
                e.preventDefault();
                scrollTo("#figma");
              }}
              style={{
                background: "linear-gradient(135deg, #2D7DD2, #1B3F6E)",
                color: "#fff",
                padding: "9px 22px",
                borderRadius: 12,
                fontSize: 14,
                fontWeight: 600,
                textDecoration: "none",
                boxShadow: "0 4px 14px rgba(45,125,210,0.35)",
                transition: "opacity 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
            >
              Xem Figma
            </a>
          </div>

          {/* Mobile hamburger */}
          <button
            className="flex md:hidden"
            onClick={() => setMenuOpen(!menuOpen)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: navScrolled ? "#1B3F6E" : "#fff",
              fontSize: 22,
            }}
          >
            ☰
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div
            style={{
              background: "#fff",
              padding: "12px 24px 20px",
              boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
            }}
          >
            {NAV_LINKS.map((l) => (
              <button
                key={l.href}
                onClick={() => scrollTo(l.href)}
                style={{
                  display: "block",
                  width: "100%",
                  textAlign: "left",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#5A6B80",
                  fontSize: 16,
                  padding: "10px 0",
                  borderBottom: "1px solid #F0F2F5",
                }}
              >
                {l.label}
              </button>
            ))}
            <button
              onClick={() => scrollTo("#figma")}
              style={{
                marginTop: 12,
                width: "100%",
                background: "linear-gradient(135deg, #2D7DD2, #1B3F6E)",
                color: "#fff",
                border: "none",
                padding: "12px",
                borderRadius: 12,
                fontSize: 15,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Xem Figma
            </button>
          </div>
        )}
      </nav>

      {/* ═══════════════ HERO ═══════════════ */}
      <section
        style={{
          minHeight: "100vh",
          position: "relative",
          display: "flex",
          alignItems: "center",
          overflow: "hidden",
          background:
            "linear-gradient(135deg, #0D2744 0%, #1B3F6E 50%, #2D5F9E 100%)",
        }}
      >
        {/* Background image overlay */}
        <div style={{ position: "absolute", inset: 0, zIndex: 0 }}>
          <img
            src="https://images.unsplash.com/photo-1772171754163-d80b50cc3cec?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxncm91cCUyMGZyaWVuZHMlMjB0cmF2ZWwlMjBhZHZlbnR1cmUlMjBtb3VudGFpbnN8ZW58MXx8fHwxNzc2MjAyOTEwfDA&ixlib=rb-4.1.0&q=80&w=1080"
            alt=""
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              opacity: 0.18,
            }}
          />
        </div>

        {/* Decorative circles */}
        <div
          style={{
            position: "absolute",
            top: -120,
            right: -120,
            width: 500,
            height: 500,
            borderRadius: "50%",
            background: "rgba(45,125,210,0.15)",
            zIndex: 1,
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -80,
            left: -80,
            width: 360,
            height: 360,
            borderRadius: "50%",
            background: "rgba(61,186,194,0.12)",
            zIndex: 1,
          }}
        />

        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            padding: "120px 24px 80px",
            width: "100%",
            position: "relative",
            zIndex: 2,
          }}
        >
          <div className="flex flex-col lg:flex-row items-center gap-12">
            {/* Left: text */}
            <div
              style={{ flex: 1, textAlign: "left" }}
              className="text-center lg:text-left"
            >
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  background: "rgba(255,255,255,0.1)",
                  border: "1px solid rgba(255,255,255,0.2)",
                  borderRadius: 100,
                  padding: "6px 16px",
                  marginBottom: 24,
                }}
              >
                <span
                  style={{ fontSize: 13, color: "#A8D4FF", fontWeight: 500 }}
                >
                  ✈️ &nbsp; Ứng dụng du lịch nhóm thông minh
                </span>
              </div>
              <h1
                style={{
                  fontFamily: "'Jakarta Sans', sans-serif",
                  color: "#fff",
                  fontSize: "clamp(36px, 5vw, 64px)",
                  fontWeight: 800,
                  lineHeight: 1.15,
                  marginBottom: 20,
                  letterSpacing: "-1px",
                }}
              >
                Du lịch thông minh,
                <br />
                <span
                  style={{
                    background: "linear-gradient(90deg, #3DBAC2, #6BDDEC)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  chi tiêu minh bạch
                </span>
              </h1>
              <p
                style={{
                  color: "rgba(255,255,255,0.75)",
                  fontSize: "clamp(15px, 2vw, 18px)",
                  lineHeight: 1.75,
                  marginBottom: 40,
                  maxWidth: 520,
                }}
              >
                TripMate giúp bạn và nhóm bạn lên kế hoạch chuyến đi, quản lý
                lịch trình, và chia sẻ chi phí một cách công bằng — tất cả trong
                một ứng dụng.
              </p>
              <div
                style={{ display: "flex", gap: 14, flexWrap: "wrap" }}
                className="justify-center lg:justify-start"
              >
                <button
                  onClick={() => scrollTo("#features")}
                  style={{
                    background: "linear-gradient(135deg, #2D7DD2, #3DBAC2)",
                    color: "#fff",
                    border: "none",
                    padding: "15px 32px",
                    borderRadius: 14,
                    fontSize: 16,
                    fontWeight: 700,
                    cursor: "pointer",
                    boxShadow: "0 6px 24px rgba(45,125,210,0.4)",
                    letterSpacing: "-0.2px",
                  }}
                >
                  Khám phá tính năng →
                </button>
                <a
                  href="https://www.figma.com/proto/mxwceUsPga9zHuH5JDVnaV/TripMate_Ass2?node-id=52-1898&p=f&viewport=394%2C-381%2C0.3&t=afdRBFg95p0Aeh64-1&scaling=min-zoom&content-scaling=fixed&page-id=1%3A4"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    background: "rgba(255,255,255,0.12)",
                    color: "#fff",
                    border: "1px solid rgba(255,255,255,0.25)",
                    padding: "15px 32px",
                    borderRadius: 14,
                    fontSize: 16,
                    fontWeight: 600,
                    textDecoration: "none",
                    display: "inline-block",
                    backdropFilter: "blur(8px)",
                  }}
                >
                  🎨 Xem Prototype
                </a>
              </div>

              {/* Stats */}
              <div
                style={{
                  display: "flex",
                  gap: 36,
                  marginTop: 52,
                  flexWrap: "wrap",
                }}
                className="justify-center lg:justify-start"
              >
                {[
                  { value: "4", label: "Core Features" },
                  { value: "20+", label: "Màn hình thiết kế" },
                  { value: "100%", label: "MVP Coverage" },
                ].map((s) => (
                  <div key={s.label}>
                    <div
                      style={{
                        color: "#fff",
                        fontFamily: "'Roboto', sans-serif",
                        fontWeight: 800,
                        fontSize: 30,
                        lineHeight: 1,
                      }}
                    >
                      {s.value}
                    </div>
                    <div
                      style={{
                        color: "rgba(255,255,255,0.55)",
                        fontSize: 13,
                        marginTop: 4,
                      }}
                    >
                      {s.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: phone mockups */}
            <div
              style={{ flex: "0 0 auto", position: "relative", height: 500 }}
              className="hidden lg:flex items-center"
            >
              {/* Back phone */}
              <div
                style={{
                  position: "absolute",
                  right: 0,
                  top: 40,
                  transform: "rotate(8deg)",
                  opacity: 0.7,
                }}
              >
                <div
                  style={{
                    width: 200,
                    height: 400,
                    borderRadius: 32,
                    background: "#111827",
                    boxShadow: "0 30px 60px rgba(0,0,0,0.5)",
                    overflow: "hidden",
                  }}
                >
                  <img
                    src="https://images.unsplash.com/photo-1594485770339-87069fe40467?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2aWV0bmFtJTIwZGElMjBsYXQlMjB0cmF2ZWwlMjBzY2VuZXJ5fGVufDF8fHx8MTc3NjI2NDQ0N3ww&ixlib=rb-4.1.0&q=80&w=400"
                    alt=""
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                </div>
              </div>
              {/* Front phone */}
              <div
                style={{
                  position: "relative",
                  zIndex: 2,
                  transform: "rotate(-4deg)",
                }}
              >
                <div
                  style={{
                    width: 220,
                    height: 440,
                    borderRadius: 36,
                    background: "#0F172A",
                    boxShadow:
                      "0 40px 80px rgba(0,0,0,0.6), inset 0 0 0 2px rgba(255,255,255,0.1)",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      background:
                        "linear-gradient(180deg, #1B3F6E 0%, #2D5F9E 100%)",
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: 24,
                    }}
                  >
                    <div
                      style={{
                        width: 80,
                        height: 80,
                        borderRadius: 20,
                        background: "rgba(255,255,255,0.9)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        marginBottom: 20,
                        overflow: "hidden",
                      }}
                    >
                      <img
                        src={logoImg}
                        alt="TripMate"
                        style={{ width: 72, height: 72, objectFit: "contain" }}
                      />
                    </div>
                    <div
                      style={{
                        color: "#fff",
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                        fontWeight: 800,
                        fontSize: 26,
                        marginBottom: 4,
                      }}
                    >
                      TripMate
                    </div>
                    <div
                      style={{
                        color: "rgba(255,255,255,0.6)",
                        fontSize: 11,
                        letterSpacing: 1.5,
                        textTransform: "uppercase",
                        marginBottom: 32,
                      }}
                    ></div>
                    <div
                      style={{
                        width: "100%",
                        height: 1,
                        background: "rgba(255,255,255,0.15)",
                        marginBottom: 24,
                      }}
                    />
                    <div
                      style={{
                        width: "100%",
                        background: "rgba(255,255,255,0.1)",
                        borderRadius: 12,
                        padding: "12px 16px",
                        marginBottom: 12,
                      }}
                    >
                      <div
                        style={{
                          color: "rgba(255,255,255,0.5)",
                          fontSize: 11,
                          marginBottom: 4,
                        }}
                      >
                        Email hoặc số điện thoại
                      </div>
                      <div
                        style={{ color: "rgba(255,255,255,0.3)", fontSize: 13 }}
                      >
                        example@email.com
                      </div>
                    </div>
                    <div
                      style={{
                        width: "100%",
                        background: "rgba(255,255,255,0.1)",
                        borderRadius: 12,
                        padding: "12px 16px",
                        marginBottom: 20,
                      }}
                    >
                      <div
                        style={{
                          color: "rgba(255,255,255,0.5)",
                          fontSize: 11,
                          marginBottom: 4,
                        }}
                      >
                        Mật khẩu
                      </div>
                      <div
                        style={{ color: "rgba(255,255,255,0.3)", fontSize: 13 }}
                      >
                        ••••••••
                      </div>
                    </div>
                    <div
                      style={{
                        width: "100%",
                        background: "linear-gradient(135deg, #2D7DD2, #3DBAC2)",
                        borderRadius: 12,
                        padding: "13px",
                        textAlign: "center",
                        color: "#fff",
                        fontWeight: 700,
                        fontSize: 14,
                      }}
                    >
                      Đăng nhập
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div
          style={{
            position: "absolute",
            bottom: 36,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 3,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 6,
          }}
        >
          <div
            style={{
              color: "rgba(255,255,255,0.45)",
              fontSize: 12,
              letterSpacing: 1.5,
              textTransform: "uppercase",
            }}
          >
            Cuộn xuống
          </div>
          <div
            style={{
              width: 1,
              height: 36,
              background: "rgba(255,255,255,0.3)",
            }}
          />
        </div>
      </section>

      {/* ═══════════════ PROBLEM STATEMENT ═══════════════ */}
      <section style={{ background: "#fff", padding: "96px 24px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <RevealSection>
            <div style={{ textAlign: "center", marginBottom: 60 }}>
              <span
                style={{
                  fontSize: 13,
                  color: "#2D7DD2",
                  fontWeight: 600,
                  letterSpacing: 1.5,
                  textTransform: "uppercase",
                }}
              >
                Vấn đề
              </span>
              <h2
                style={{
                  fontFamily: "'Roboto', sans-serif",
                  color: "#1B3F6E",
                  fontSize: "clamp(26px, 4vw, 44px)",
                  marginTop: 12,
                  marginBottom: 16,
                }}
              >
                Du lịch nhóm thường rắc rối hơn bạn nghĩ
              </h2>
              <p
                style={{
                  color: "#5A6B80",
                  maxWidth: 600,
                  margin: "0 auto",
                  fontSize: 17,
                  lineHeight: 1.75,
                }}
              >
                Mỗi chuyến đi nhóm đều đối mặt với những vấn đề cơ bản mà không
                có giải pháp toàn diện nào.
              </p>
            </div>
          </RevealSection>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                emoji: "📊",
                title: "Chi phí mù mờ",
                body: "Khó biết ai đã trả gì, ai còn nợ bao nhiêu. Tính toán thủ công dễ nhầm lẫn và gây mâu thuẫn trong nhóm.",
                color: "#FFF0F0",
                border: "#FF6B6B",
              },
              {
                emoji: "🗓️",
                title: "Lịch trình hỗn loạn",
                body: "Mỗi người giữ một phần lịch trình riêng. Không ai nắm toàn bộ kế hoạch, dẫn đến bỏ lỡ hoạt động quan trọng.",
                color: "#FFF7E6",
                border: "#FFA500",
              },
              {
                emoji: "👥",
                title: "Phối hợp kém hiệu quả",
                body: "Thông tin rải rác qua nhiều kênh chat, email. Không có nơi tập trung để cả nhóm cùng quản lý chuyến đi.",
                color: "#F0F4FF",
                border: "#2D7DD2",
              },
            ].map((card, i) => (
              <RevealSection key={card.title} delay={i * 120}>
                <div
                  style={{
                    background: card.color,
                    borderRadius: 20,
                    padding: "32px 28px",
                    borderLeft: `5px solid ${card.border}`,
                    height: "100%",
                  }}
                >
                  <div style={{ fontSize: 36, marginBottom: 14 }}>
                    {card.emoji}
                  </div>
                  <h3
                    style={{
                      color: "#1B3F6E",
                      fontFamily: "'Roboto', sans-serif",
                      marginBottom: 10,
                    }}
                  >
                    {card.title}
                  </h3>
                  <p
                    style={{
                      color: "#5A6B80",
                      fontSize: 15,
                      lineHeight: 1.7,
                      margin: 0,
                    }}
                  >
                    {card.body}
                  </p>
                </div>
              </RevealSection>
            ))}
          </div>

          {/* Solution callout */}
          <RevealSection delay={200}>
            <div
              style={{
                marginTop: 60,
                background: "linear-gradient(135deg, #1B3F6E, #2D7DD2)",
                borderRadius: 24,
                padding: "40px 48px",
                display: "flex",
                alignItems: "center",
                gap: 32,
                flexWrap: "wrap",
              }}
            >
              <div style={{ fontSize: 48, flexShrink: 0 }}>🧭</div>
              <div style={{ flex: 1, minWidth: 280 }}>
                <h3
                  style={{
                    color: "#fff",
                    fontFamily: "'Roboto', sans-serif",
                    fontSize: 22,
                    marginBottom: 8,
                  }}
                >
                  TripMate giải quyết tất cả trong một ứng dụng
                </h3>
                <p
                  style={{
                    color: "rgba(255,255,255,0.75)",
                    fontSize: 15,
                    lineHeight: 1.7,
                    margin: 0,
                  }}
                >
                  Từ lên kế hoạch, quản lý lịch trình, checklist đến chia tiền
                  thông minh — TripMate là người đồng hành hoàn hảo cho mọi
                  chuyến đi nhóm.
                </p>
              </div>
              <div style={{ color: "#3DBAC2", fontSize: 48, flexShrink: 0 }}>
                →
              </div>
            </div>
          </RevealSection>
        </div>
      </section>

      {/* ═══════════════ TARGET USERS ═══════════════ */}
      <section style={{ background: "#F7F9FC", padding: "96px 24px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <RevealSection>
            <div style={{ textAlign: "center", marginBottom: 56 }}>
              <span
                style={{
                  fontSize: 13,
                  color: "#2D7DD2",
                  fontWeight: 600,
                  letterSpacing: 1.5,
                  textTransform: "uppercase",
                }}
              >
                Người dùng mục tiêu
              </span>
              <h2
                style={{
                  fontFamily: "'Roboto', sans-serif",
                  color: "#1B3F6E",
                  fontSize: "clamp(26px, 4vw, 44px)",
                  marginTop: 12,
                  marginBottom: 12,
                }}
              >
                Dành cho những ai yêu thích du lịch nhóm
              </h2>
            </div>
          </RevealSection>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                emoji: "🎓",
                title: "Sinh viên",
                desc: "Những chuyến đi bụi cùng bạn bè, ngân sách hạn hẹp, cần chia tiền rõ ràng.",
                color: "#E8F4FF",
              },
              {
                emoji: "💼",
                title: "Nhân viên văn phòng",
                desc: "Team building, du lịch công ty, sự kiện nhóm cần tổ chức chuyên nghiệp.",
                color: "#E8FFF4",
              },
              {
                emoji: "👨‍👩‍👧‍👦",
                title: "Gia đình & Bạn bè",
                desc: "Chuyến đi gia đình, hội bạn thân tụ họp dịp lễ, Tết.",
                color: "#FFF4E8",
              },
              {
                emoji: "🏕️",
                title: "Người ưa phiêu lưu",
                desc: "Khám phá điểm mới, trekking, camping — quản lý checklist đồ đạc tiện lợi.",
                color: "#F4E8FF",
              },
            ].map((u, i) => (
              <RevealSection key={u.title} delay={i * 80}>
                <div
                  style={{
                    background: "#fff",
                    borderRadius: 20,
                    padding: "28px 22px",
                    textAlign: "center",
                    boxShadow: "0 4px 20px rgba(27,63,110,0.06)",
                    transition: "transform 0.25s",
                    cursor: "default",
                  }}
                  onMouseEnter={(e) =>
                    ((e.currentTarget as HTMLElement).style.transform =
                      "translateY(-6px)")
                  }
                  onMouseLeave={(e) =>
                    ((e.currentTarget as HTMLElement).style.transform =
                      "translateY(0)")
                  }
                >
                  <div
                    style={{
                      width: 64,
                      height: 64,
                      borderRadius: 18,
                      background: u.color,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 28,
                      margin: "0 auto 16px",
                    }}
                  >
                    {u.emoji}
                  </div>
                  <h4
                    style={{
                      color: "#1B3F6E",
                      fontFamily: "'Roboto', sans-serif",
                      marginBottom: 8,
                    }}
                  >
                    {u.title}
                  </h4>
                  <p
                    style={{
                      color: "#5A6B80",
                      fontSize: 13,
                      lineHeight: 1.6,
                      margin: 0,
                    }}
                  >
                    {u.desc}
                  </p>
                </div>
              </RevealSection>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ KEY FEATURES ═══════════════ */}
      <section
        id="features"
        style={{ background: "#fff", padding: "96px 24px" }}
      >
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <RevealSection>
            <div style={{ textAlign: "center", marginBottom: 60 }}>
              <span
                style={{
                  fontSize: 13,
                  color: "#2D7DD2",
                  fontWeight: 600,
                  letterSpacing: 1.5,
                  textTransform: "uppercase",
                }}
              >
                Tính năng MVP
              </span>
              <h2
                style={{
                  fontFamily: "'Roboto', sans-serif",
                  color: "#1B3F6E",
                  fontSize: "clamp(26px, 4vw, 44px)",
                  marginTop: 12,
                  marginBottom: 12,
                }}
              >
                4 tính năng cốt lõi của TripMate
              </h2>
              <p
                style={{
                  color: "#5A6B80",
                  maxWidth: 560,
                  margin: "0 auto",
                  fontSize: 16,
                  lineHeight: 1.7,
                }}
              >
                Thiết kế để giải quyết đúng những vấn đề phổ biến nhất khi du
                lịch theo nhóm.
              </p>
            </div>
          </RevealSection>

          {/* Feature 1: Trip Planning */}
          <div className="flex flex-col lg:flex-row items-center gap-16 mb-24">
            <RevealSection className="flex-1" delay={0}>
              <div style={{ position: "relative" }}>
                <div
                  style={{
                    background: "linear-gradient(135deg, #E8F4FF, #F0F7FF)",
                    borderRadius: 28,
                    padding: "40px 32px",
                    textAlign: "center",
                  }}
                >
                  <img
                    src="https://images.unsplash.com/photo-1773411155264-fab17d8c5140?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0cmF2ZWwlMjBwbGFubmluZyUyMG1hcCUyMGpvdXJuZXl8ZW58MXx8fHwxNzc2MjY0NDQ0fDA&ixlib=rb-4.1.0&q=80&w=600"
                    alt="Trip planning"
                    style={{
                      width: "100%",
                      maxWidth: 420,
                      height: 260,
                      objectFit: "cover",
                      borderRadius: 18,
                      boxShadow: "0 20px 48px rgba(27,63,110,0.2)",
                    }}
                  />
                  <div
                    style={{
                      position: "absolute",
                      bottom: -16,
                      right: 32,
                      background: "#fff",
                      borderRadius: 16,
                      padding: "12px 20px",
                      boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                    }}
                  >
                    <span style={{ fontSize: 20 }}>📅</span>
                    <div>
                      <div
                        style={{
                          color: "#1B3F6E",
                          fontSize: 13,
                          fontWeight: 700,
                        }}
                      >
                        Da Lat Summer 2025
                      </div>
                      <div style={{ color: "#5A6B80", fontSize: 11 }}>
                        28/06 - 04/07 · 6 thành viên
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </RevealSection>
            <RevealSection className="flex-1" delay={150}>
              <div>
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    background: "#E8F4FF",
                    borderRadius: 100,
                    padding: "5px 14px",
                    marginBottom: 20,
                  }}
                >
                  <span
                    style={{ color: "#2D7DD2", fontSize: 13, fontWeight: 600 }}
                  >
                    01 — Lên kế hoạch chuyến đi
                  </span>
                </div>
                <h2
                  style={{
                    fontFamily: "'Roboto', sans-serif",
                    color: "#1B3F6E",
                    fontSize: "clamp(22px, 3vw, 36px)",
                    marginBottom: 16,
                  }}
                >
                  Tạo chuyến đi và mời nhóm bạn tham gia
                </h2>
                <p
                  style={{
                    color: "#5A6B80",
                    fontSize: 16,
                    lineHeight: 1.75,
                    marginBottom: 28,
                  }}
                >
                  Tạo chuyến đi với tên, điểm đến, ngày khởi hành. Mời thành
                  viên qua số điện thoại hoặc chia sẻ link. Tất cả cùng nhau
                  theo dõi lịch trình và ngân sách theo thời gian thực.
                </p>
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 12 }}
                >
                  {[
                    "Tạo chuyến đi trong 3 bước đơn giản",
                    "Tìm kiếm và thêm điểm đến linh hoạt",
                    "Mời thành viên qua số điện thoại hoặc link",
                  ].map((f) => (
                    <div
                      key={f}
                      style={{ display: "flex", alignItems: "center", gap: 12 }}
                    >
                      <div
                        style={{
                          width: 22,
                          height: 22,
                          borderRadius: "50%",
                          background: "#2D7DD2",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        <span
                          style={{
                            color: "#fff",
                            fontSize: 12,
                            fontWeight: 700,
                          }}
                        >
                          ✓
                        </span>
                      </div>
                      <span style={{ color: "#374151", fontSize: 15 }}>
                        {f}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </RevealSection>
          </div>

          {/* Feature 2: Activities */}
          <div className="flex flex-col-reverse lg:flex-row items-center gap-16 mb-24">
            <RevealSection className="flex-1" delay={150}>
              <div>
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    background: "#E8FFF4",
                    borderRadius: 100,
                    padding: "5px 14px",
                    marginBottom: 20,
                  }}
                >
                  <span
                    style={{ color: "#10B981", fontSize: 13, fontWeight: 600 }}
                  >
                    02 — Quản lý lịch trình
                  </span>
                </div>
                <h2
                  style={{
                    fontFamily: "'Roboto', sans-serif",
                    color: "#1B3F6E",
                    fontSize: "clamp(22px, 3vw, 36px)",
                    marginBottom: 16,
                  }}
                >
                  Lập kế hoạch hoạt động chi tiết theo ngày
                </h2>
                <p
                  style={{
                    color: "#5A6B80",
                    fontSize: 16,
                    lineHeight: 1.75,
                    marginBottom: 28,
                  }}
                >
                  Thêm từng hoạt động theo ngày với địa điểm, thời gian, loại
                  hoạt động (tham quan, ăn uống, di chuyển…) và người tham gia
                  cụ thể trong nhóm.
                </p>
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 12 }}
                >
                  {[
                    "Phân loại hoạt động: Tham quan, Ăn uống, Di chuyển…",
                    "Chỉ định người tham gia cho từng hoạt động",
                    "Xem lịch trình theo từng ngày trực quan",
                  ].map((f) => (
                    <div
                      key={f}
                      style={{ display: "flex", alignItems: "center", gap: 12 }}
                    >
                      <div
                        style={{
                          width: 22,
                          height: 22,
                          borderRadius: "50%",
                          background: "#10B981",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        <span
                          style={{
                            color: "#fff",
                            fontSize: 12,
                            fontWeight: 700,
                          }}
                        >
                          ✓
                        </span>
                      </div>
                      <span style={{ color: "#374151", fontSize: 15 }}>
                        {f}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </RevealSection>
            <RevealSection className="flex-1" delay={0}>
              <div
                style={{
                  background: "linear-gradient(135deg, #E8FFF4, #F0FFF8)",
                  borderRadius: 28,
                  padding: "40px 32px",
                  textAlign: "center",
                }}
              >
                <img
                  src="https://images.unsplash.com/photo-1594485770339-87069fe40467?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2aWV0bmFtJTIwZGElMjBsYXQlMjB0cmF2ZWwlMjBzY2VuZXJ5fGVufDF8fHx8MTc3NjI2NDQ0N3ww&ixlib=rb-4.1.0&q=80&w=600"
                  alt="Activity planning"
                  style={{
                    width: "100%",
                    maxWidth: 420,
                    height: 260,
                    objectFit: "cover",
                    borderRadius: 18,
                    boxShadow: "0 20px 48px rgba(16,185,129,0.2)",
                  }}
                />
              </div>
            </RevealSection>
          </div>

          {/* Feature 3 + 4: Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                emoji: "✅",
                number: "03",
                title: "Checklist thông minh",
                desc: "Quản lý danh sách việc cần làm trước và trong chuyến đi. Phân loại đồ dùng chung, đồ cá nhân, việc làm. Giao nhiệm vụ cho từng thành viên với deadline rõ ràng.",
                items: [
                  "Phân loại: Đồ chung, Đồ cá nhân, Việc làm",
                  "Giao nhiệm vụ và theo dõi tiến độ",
                  "Theo dõi % hoàn thành chung của nhóm",
                ],
                color: "#2D7DD2",
                bg: "#E8F4FF",
                tag: "#2D7DD2",
              },
              {
                emoji: "💰",
                number: "04",
                title: "Chia tiền tự động",
                desc: "Ghi lại mọi khoản chi phí và tự động tính toán số tiền mỗi người cần trả hoặc được hoàn lại. Hỗ trợ chia đều và chia theo tỷ lệ.",
                items: [
                  "Chia đều hoặc chia chi tiết theo từng người",
                  "Tổng kết giao dịch cần thực hiện",
                  "Xuất báo cáo chi phí theo danh mục",
                ],
                color: "#F59E0B",
                bg: "#FFF7E6",
                tag: "#F59E0B",
              },
            ].map((f, i) => (
              <RevealSection key={f.number} delay={i * 120}>
                <div
                  style={{
                    background: "#fff",
                    borderRadius: 24,
                    padding: "36px 32px",
                    boxShadow: "0 4px 24px rgba(27,63,110,0.08)",
                    height: "100%",
                  }}
                >
                  <div
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 8,
                      background: f.bg,
                      borderRadius: 100,
                      padding: "5px 14px",
                      marginBottom: 20,
                    }}
                  >
                    <span
                      style={{ color: f.tag, fontSize: 13, fontWeight: 600 }}
                    >
                      {f.number} — {f.emoji} {f.title}
                    </span>
                  </div>
                  <h3
                    style={{
                      color: "#1B3F6E",
                      fontFamily: "'Roboto', sans-serif",
                      marginBottom: 12,
                    }}
                  >
                    {f.title}
                  </h3>
                  <p
                    style={{
                      color: "#5A6B80",
                      fontSize: 15,
                      lineHeight: 1.75,
                      marginBottom: 24,
                    }}
                  >
                    {f.desc}
                  </p>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 10,
                    }}
                  >
                    {f.items.map((it) => (
                      <div
                        key={it}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                        }}
                      >
                        <div
                          style={{
                            width: 20,
                            height: 20,
                            borderRadius: "50%",
                            background: f.color,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                          }}
                        >
                          <span
                            style={{
                              color: "#fff",
                              fontSize: 11,
                              fontWeight: 700,
                            }}
                          >
                            ✓
                          </span>
                        </div>
                        <span style={{ color: "#374151", fontSize: 14 }}>
                          {it}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </RevealSection>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ DESIGN SHOWCASE / SCREENS ═══════════════ */}
      <section
        id="screens"
        style={{
          background: "linear-gradient(180deg, #F7F9FC 0%, #EEF3FA 100%)",
          padding: "96px 24px",
        }}
      >
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <RevealSection>
            <div style={{ textAlign: "center", marginBottom: 56 }}>
              <span
                style={{
                  fontSize: 13,
                  color: "#2D7DD2",
                  fontWeight: 600,
                  letterSpacing: 1.5,
                  textTransform: "uppercase",
                }}
              >
                Thiết kế giao diện
              </span>
              <h2
                style={{
                  fontFamily: "'Roboto', sans-serif",
                  color: "#1B3F6E",
                  fontSize: "clamp(26px, 4vw, 44px)",
                  marginTop: 12,
                  marginBottom: 12,
                }}
              >
                Màn hình thiết kế từ Figma
              </h2>
              <p
                style={{
                  color: "#5A6B80",
                  maxWidth: 540,
                  margin: "0 auto",
                  fontSize: 16,
                  lineHeight: 1.7,
                }}
              >
                Giao diện hiện đại, nhất quán và thân thiện người dùng được
                thiết kế theo design system của TripMate.
              </p>
            </div>
          </RevealSection>

          {/* Screen groups */}
          {[
            {
              label: "Onboarding & Xác thực",
              desc: "Trải nghiệm mượt mà khi lần đầu sử dụng với 4 màn giới thiệu tính năng và màn đăng nhập / đăng ký.",
              src: img0,
            },
            {
              label: "Quản lý chuyến đi",
              desc: "Tạo chuyến đi theo 3 bước: thông tin cơ bản → điểm đến → thành viên. Dashboard hiển thị tổng quan lịch trình.",
              src: img1,
            },
            {
              label: "Hoạt động & Checklist",
              desc: "Quản lý lịch trình hoạt động chi tiết và checklist đồ dùng / việc làm phân loại rõ ràng.",
              src: img2,
            },
            {
              label: "Thành viên & Chi phí",
              desc: "Quản lý nhóm, thêm thành viên qua link hoặc SĐT. Ghi nhận và chia sẻ chi phí minh bạch.",
              src: img4,
            },
            {
              label: "Báo cáo tài chính",
              desc: "Tổng kết chi tiêu theo danh mục, biểu đồ trực quan và danh sách giao dịch cần thực hiện để hoàn tất.",
              src: img6,
            },
          ].map((screen, i) => (
            <RevealSection key={screen.label} delay={0} className="mb-12">
              <div
                style={{
                  background: "#fff",
                  borderRadius: 24,
                  overflow: "hidden",
                  boxShadow: "0 8px 32px rgba(27,63,110,0.08)",
                }}
              >
                <div
                  style={{
                    padding: "28px 32px",
                    borderBottom: "1px solid #F0F2F5",
                    display: "flex",
                    alignItems: "center",
                    gap: 16,
                    flexWrap: "wrap",
                  }}
                >
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 10,
                      background: "linear-gradient(135deg, #2D7DD2, #1B3F6E)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#fff",
                      fontFamily: "'Roboto', sans-serif",
                      fontWeight: 700,
                      fontSize: 14,
                      flexShrink: 0,
                    }}
                  >
                    {i + 1}
                  </div>
                  <div>
                    <div
                      style={{
                        color: "#1B3F6E",
                        fontFamily: "'Roboto', sans-serif",
                        fontWeight: 700,
                        fontSize: 16,
                      }}
                    >
                      {screen.label}
                    </div>
                    <div style={{ color: "#5A6B80", fontSize: 13 }}>
                      {screen.desc}
                    </div>
                  </div>
                </div>
                <div style={{ padding: "24px 32px", background: "#F8FAFC" }}>
                  <img
                    src={screen.src}
                    alt={screen.label}
                    style={{
                      width: "100%",
                      borderRadius: 16,
                      boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                    }}
                  />
                </div>
              </div>
            </RevealSection>
          ))}
        </div>
      </section>

      {/* ═══════════════ DESIGN SYSTEM ═══════════════ */}
      <section style={{ background: "#fff", padding: "96px 24px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <RevealSection>
            <div style={{ textAlign: "center", marginBottom: 60 }}>
              <span
                style={{
                  fontSize: 13,
                  color: "#2D7DD2",
                  fontWeight: 600,
                  letterSpacing: 1.5,
                  textTransform: "uppercase",
                }}
              >
                Design System
              </span>
              <h2
                style={{
                  fontFamily: "'Roboto', sans-serif",
                  color: "#1B3F6E",
                  fontSize: "clamp(26px, 4vw, 44px)",
                  marginTop: 12,
                  marginBottom: 12,
                }}
              >
                Hệ thống thiết kế nhất quán
              </h2>
              <p
                style={{
                  color: "#5A6B80",
                  maxWidth: 500,
                  margin: "0 auto",
                  fontSize: 16,
                }}
              >
                Màu sắc, typography và component được định nghĩa rõ ràng để đảm
                bảo giao diện đồng nhất.
              </p>
            </div>
          </RevealSection>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* Color Palette */}
            <RevealSection delay={0}>
              <div
                style={{
                  background: "#F8FAFC",
                  borderRadius: 20,
                  padding: "32px",
                }}
              >
                <h3
                  style={{
                    color: "#1B3F6E",
                    fontFamily: "'Roboto', sans-serif",
                    marginBottom: 20,
                    fontSize: 18,
                  }}
                >
                  🎨 Color Palette
                </h3>
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 12 }}
                >
                  {[
                    {
                      name: "Primary",
                      hex: "#266489",
                      desc: "CTA, main buttons",
                    },
                    {
                      name: "Secondary",
                      hex: "#27638A",
                      desc: "Secondary actions",
                    },
                    {
                      name: "Secondary Container",
                      hex: "#CAE6FF",
                      desc: "secondary chips, member tags, and light action backgrounds",
                    },

                    {
                      name: "Surface",
                      hex: "#F7F9FF",
                      desc: "Main background",
                      border: "F7F9FF",
                    },
                    {
                      name: "Surface Container",
                      hex: "#EBEEF3",
                      desc: "Background color for cards and content sections.",
                      border: "#EBEEF3",
                    },
                    {
                      name: "Tertiary",
                      hex: "#67548E",
                      desc: "selected states, check icons, and progress indicators",
                    },
                  ].map((c) => (
                    <div
                      key={c.hex}
                      style={{ display: "flex", alignItems: "center", gap: 14 }}
                    >
                      <div
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: 12,
                          background: c.hex,
                          border: c.border ? `1px solid ${c.border}` : "none",
                          flexShrink: 0,
                          boxShadow: `0 4px 12px ${c.hex}44`,
                        }}
                      />
                      <div>
                        <div
                          style={{
                            color: "#1B3F6E",
                            fontSize: 14,
                            fontWeight: 600,
                          }}
                        >
                          {c.name}{" "}
                          <span style={{ color: "#9CA3AF", fontWeight: 400 }}>
                            {c.hex}
                          </span>
                        </div>
                        <div style={{ color: "#9CA3AF", fontSize: 12 }}>
                          {c.desc}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </RevealSection>

            {/* Typography */}
            <RevealSection delay={120}>
              <div
                style={{
                  background: "#F8FAFC",
                  borderRadius: 20,
                  padding: "32px",
                }}
              >
                <h3
                  style={{
                    color: "#1B3F6E",
                    fontFamily: "'Roboto', sans-serif",
                    marginBottom: 20,
                    fontSize: 18,
                  }}
                >
                  🔤 Typography
                </h3>
                <div style={{ marginBottom: 24 }}>
                  <div
                    style={{
                      color: "#9CA3AF",
                      fontSize: 12,
                      marginBottom: 8,
                      textTransform: "uppercase",
                      letterSpacing: 1,
                    }}
                  >
                    Display / Heading
                  </div>
                  <div
                    style={{
                      fontFamily: "'Roboto', sans-serif",
                      color: "#1B3F6E",
                      fontWeight: 800,
                      fontSize: 28,
                      lineHeight: 1.2,
                    }}
                  >
                    Roboto
                  </div>
                  <div
                    style={{
                      fontFamily: "'Roboto', sans-serif",
                      color: "#5A6B80",
                      fontSize: 13,
                      marginTop: 2,
                    }}
                  >
                    Bold · SemiBold · Medium
                  </div>
                </div>
                <div>
                  <div
                    style={{
                      color: "#9CA3AF",
                      fontSize: 12,
                      marginBottom: 8,
                      textTransform: "uppercase",
                      letterSpacing: 1,
                    }}
                  >
                    Body / UI
                  </div>
                  <div
                    style={{
                      fontFamily: "'Roboto', sans-serif",
                      color: "#1B3F6E",
                      fontWeight: 500,
                      fontSize: 20,
                    }}
                  >
                    Roboto
                  </div>
                  <div
                    style={{
                      fontFamily: "'Roboto', sans-serif",
                      color: "#5A6B80",
                      fontSize: 13,
                      marginTop: 2,
                    }}
                  >
                    Regular · Medium · SemiBold
                  </div>
                </div>
                <div
                  style={{
                    marginTop: 28,
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                  }}
                >
                  {[
                    {
                      label: "H1",
                      size: "32px / 800",
                      sample: "Chào mừng đến với TripMate",
                    },
                    {
                      label: "H2",
                      size: "24px / 700",
                      sample: "Quản lý chuyến đi",
                    },
                    {
                      label: "H3",
                      size: "18px / 600",
                      sample: "Danh sách hoạt động",
                    },
                    {
                      label: "Body",
                      size: "16px / 400",
                      sample: "Nhập thông tin chuyến đi...",
                    },
                    {
                      label: "Caption",
                      size: "12px / 400",
                      sample: "28/06/2025 · 15:00",
                    },
                  ].map((t) => (
                    <div
                      key={t.label}
                      style={{
                        display: "flex",
                        alignItems: "baseline",
                        gap: 10,
                      }}
                    >
                      <span
                        style={{
                          color: "#2D7DD2",
                          fontSize: 11,
                          fontWeight: 700,
                          minWidth: 48,
                        }}
                      >
                        {t.label}
                      </span>
                      <span
                        style={{
                          color: "#9CA3AF",
                          fontSize: 11,
                          minWidth: 100,
                        }}
                      >
                        {t.size}
                      </span>
                      <span
                        style={{
                          color: "#374151",
                          fontSize: 13,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {t.sample}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </RevealSection>

            {/* Components */}
            <RevealSection delay={80}>
              <div
                style={{
                  background: "#F8FAFC",
                  borderRadius: 20,
                  padding: "32px",
                }}
              >
                <h3
                  style={{
                    color: "#1B3F6E",
                    fontFamily: "'Roboto', sans-serif",
                    marginBottom: 20,
                    fontSize: 18,
                  }}
                >
                  🧩 UI Components
                </h3>
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 16 }}
                >
                  {/* Buttons */}
                  <div>
                    <div
                      style={{
                        color: "#9CA3AF",
                        fontSize: 12,
                        marginBottom: 10,
                        textTransform: "uppercase",
                        letterSpacing: 1,
                      }}
                    >
                      Buttons
                    </div>
                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                      <button
                        style={{
                          background: "#266489",
                          color: "#fff",
                          border: "none",
                          padding: "10px 20px",
                          borderRadius: 26,
                          fontSize: 14,
                          fontWeight: 600,
                          cursor: "default",
                        }}
                      >
                        Primary
                      </button>
                      <button
                        style={{
                          background: "#C9E6FF",
                          color: "#fff",
                          border: "none",
                          padding: "10px 20px",
                          borderRadius: 26,
                          fontSize: 14,
                          fontWeight: 600,
                          cursor: "default",
                        }}
                      >
                        Disabled
                      </button>
                    </div>
                  </div>
                  {/* Chips */}
                  <div>
                    <div
                      style={{
                        color: "#CAE6FF",
                        fontSize: 12,
                        marginBottom: 10,
                        textTransform: "uppercase",
                        letterSpacing: 1,
                      }}
                    >
                      Category Tags
                    </div>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      {[
                        "🍽️ Ăn uống",
                        "🚗 Di chuyển",
                        "🏛️ Tham quan",
                        "😄 Vui chơi",
                      ].map((tag) => (
                        <span
                          key={tag}
                          style={{
                            background: "#E8F4FF",
                            color: "#2D7DD2",
                            borderRadius: 100,
                            padding: "5px 12px",
                            fontSize: 13,
                            fontWeight: 500,
                          }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  {/* Input */}
                  <div>
                    <div
                      style={{
                        color: "#9CA3AF",
                        fontSize: 12,
                        marginBottom: 10,
                        textTransform: "uppercase",
                        letterSpacing: 1,
                      }}
                    >
                      Input Field
                    </div>
                    <div
                      style={{
                        background: "#fff",
                        border: "1.5px solid #C9E6FF",
                        borderRadius: 17,
                        padding: "12px 16px",
                      }}
                    >
                      <div
                        style={{
                          color: "#9CA3AF",
                          fontSize: 12,
                          marginBottom: 2,
                        }}
                      >
                        Tên chuyến đi
                      </div>
                      <div style={{ color: "#1B3F6E", fontSize: 15 }}>
                        Da Lat Summer 2025
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </RevealSection>

            {/* Iconography & Spacing */}
            <RevealSection delay={160}>
              <div
                style={{
                  background: "#F8FAFC",
                  borderRadius: 20,
                  padding: "32px",
                }}
              >
                <h3
                  style={{
                    color: "#1B3F6E",
                    fontFamily: "'Roboto', sans-serif",
                    marginBottom: 20,
                    fontSize: 18,
                  }}
                >
                  📐 Iconography & Spacing
                </h3>
                <div style={{ marginBottom: 24 }}>
                  <div
                    style={{
                      color: "#9CA3AF",
                      fontSize: 12,
                      marginBottom: 12,
                      textTransform: "uppercase",
                      letterSpacing: 1,
                    }}
                  >
                    Icon Set (24px grid)
                  </div>
                  <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                    {[
                      "🧭",
                      "📅",
                      "✅",
                      "💰",
                      "👥",
                      "📍",
                      "🔔",
                      "👤",
                      "➕",
                      "🔍",
                      "📊",
                      "🏷️",
                    ].map((icon) => (
                      <div
                        key={icon}
                        style={{
                          width: 44,
                          height: 44,
                          borderRadius: 12,
                          background: "#fff",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 20,
                          boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                        }}
                      >
                        {icon}
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <div
                    style={{
                      color: "#9CA3AF",
                      fontSize: 12,
                      marginBottom: 12,
                      textTransform: "uppercase",
                      letterSpacing: 1,
                    }}
                  >
                    Border Radius
                  </div>
                  <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
                    {[
                      { r: 8, label: "sm" },
                      { r: 12, label: "md" },
                      { r: 16, label: "lg" },
                      { r: 24, label: "xl" },
                      { r: 100, label: "full" },
                    ].map(({ r, label }) => (
                      <div key={label} style={{ textAlign: "center" }}>
                        <div
                          style={{
                            width: 48,
                            height: 48,
                            background: "#2D7DD2",
                            borderRadius: r,
                            margin: "0 auto 6px",
                          }}
                        />
                        <div style={{ color: "#9CA3AF", fontSize: 11 }}>
                          {label}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </RevealSection>
          </div>
        </div>
      </section>

      {/* ═══════════════ HOW IT WORKS ═══════════════ */}
      <section
        id="how"
        style={{
          background: "linear-gradient(135deg, #0D2744 0%, #1B3F6E 100%)",
          padding: "96px 24px",
        }}
      >
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <RevealSection>
            <div style={{ textAlign: "center", marginBottom: 60 }}>
              <span
                style={{
                  fontSize: 13,
                  color: "#3DBAC2",
                  fontWeight: 600,
                  letterSpacing: 1.5,
                  textTransform: "uppercase",
                }}
              >
                Cách hoạt động
              </span>
              <h2
                style={{
                  fontFamily: "'Roboto', sans-serif",
                  color: "#fff",
                  fontSize: "clamp(26px, 4vw, 44px)",
                  marginTop: 12,
                  marginBottom: 12,
                }}
              >
                Bắt đầu chỉ trong 4 bước
              </h2>
            </div>
          </RevealSection>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                n: "1",
                emoji: "✈️",
                title: "Tạo chuyến đi",
                desc: "Nhập tên, điểm đến và thời gian chuyến đi.",
                color: "#2D7DD2",
              },
              {
                n: "2",
                emoji: "👥",
                title: "Mời thành viên",
                desc: "Thêm bạn bè qua số điện thoại hoặc chia sẻ link tham gia.",
                color: "#3DBAC2",
              },
              {
                n: "3",
                emoji: "🗓️",
                title: "Lên lịch hoạt động",
                desc: "Thêm từng hoạt động theo ngày, giao nhiệm vụ cho từng người.",
                color: "#10B981",
              },
              {
                n: "4",
                emoji: "💰",
                title: "Chia tiền thông minh",
                desc: "Ghi lại chi phí, app tự tính ai cần trả ai và bao nhiêu.",
                color: "#F59E0B",
              },
            ].map((step, i) => (
              <RevealSection key={step.n} delay={i * 100}>
                <div style={{ textAlign: "center" }}>
                  <div
                    style={{
                      width: 72,
                      height: 72,
                      borderRadius: 20,
                      background: step.color,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 30,
                      margin: "0 auto 16px",
                      boxShadow: `0 8px 24px ${step.color}55`,
                    }}
                  >
                    {step.emoji}
                  </div>
                  <div
                    style={{
                      color: "#fff",
                      fontFamily: "'Roboto', sans-serif",
                      fontWeight: 800,
                      fontSize: 36,
                      opacity: 0.2,
                      lineHeight: 1,
                      marginBottom: 8,
                    }}
                  >
                    0{step.n}
                  </div>
                  <h3
                    style={{
                      color: "#fff",
                      fontFamily: "'Roboto', sans-serif",
                      fontSize: 18,
                      marginBottom: 8,
                    }}
                  >
                    {step.title}
                  </h3>
                  <p
                    style={{
                      color: "rgba(255,255,255,0.65)",
                      fontSize: 14,
                      lineHeight: 1.7,
                    }}
                  >
                    {step.desc}
                  </p>
                </div>
              </RevealSection>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ LINKS SECTION ═══════════════ */}
      <section
        id="figma"
        style={{ background: "#F7F9FC", padding: "96px 24px" }}
      >
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <RevealSection>
            <div style={{ textAlign: "center", marginBottom: 60 }}>
              <span
                style={{
                  fontSize: 13,
                  color: "#2D7DD2",
                  fontWeight: 600,
                  letterSpacing: 1.5,
                  textTransform: "uppercase",
                }}
              >
                Tài nguyên dự án
              </span>
              <h2
                style={{
                  fontFamily: "'Roboto', sans-serif",
                  color: "#1B3F6E",
                  fontSize: "clamp(26px, 4vw, 44px)",
                  marginTop: 12,
                  marginBottom: 12,
                }}
              >
                Xem thiết kế đầy đủ
              </h2>
              <p
                style={{
                  color: "#5A6B80",
                  maxWidth: 480,
                  margin: "0 auto",
                  fontSize: 16,
                  lineHeight: 1.7,
                }}
              >
                Truy cập Figma prototype và Behance case study để xem toàn bộ
                thiết kế và quyết định UX.
              </p>
            </div>
          </RevealSection>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {[
              {
                icon: "🎨",
                platform: "Figma",
                title: "Xem bản thiết kế & Prototype",
                desc: "Toàn bộ màn hình, design system, components và interactive prototype của TripMate.",
                href: "https://www.figma.com/design/mxwceUsPga9zHuH5JDVnaV/TripMate_Ass2?node-id=149-641&m=dev&t=aOKbEryCW11NxbkB-1",
                btnLabel: "Mở Figma →",
                color: "#A259FF",
                bg: "linear-gradient(135deg, #F3E8FF, #FAF0FF)",
                btnBg: "#A259FF",
              },
              {
                icon: "📖",
                platform: "Behance",
                title: "Đọc case study thiết kế",
                desc: "Quá trình nghiên cứu, quyết định thiết kế, visual system và user journey được trình bày chi tiết.",
                href: "https://www.behance.net/gallery/247653325/TripMate-Behance-case-study",
                btnLabel: "Mở Behance →",
                color: "#1769FF",
                bg: "linear-gradient(135deg, #E8EFFF, #F0F4FF)",
                btnBg: "#1769FF",
              },
            ].map((link) => (
              <RevealSection key={link.platform} delay={0}>
                <div
                  style={{
                    background: link.bg,
                    borderRadius: 24,
                    padding: "40px 36px",
                    textAlign: "center",
                    boxShadow: "0 8px 32px rgba(27,63,110,0.08)",
                  }}
                >
                  <div style={{ fontSize: 48, marginBottom: 16 }}>
                    {link.icon}
                  </div>
                  <div
                    style={{
                      color: link.color,
                      fontSize: 13,
                      fontWeight: 700,
                      letterSpacing: 1.5,
                      textTransform: "uppercase",
                      marginBottom: 12,
                    }}
                  >
                    {link.platform}
                  </div>
                  <h3
                    style={{
                      color: "#1B3F6E",
                      fontFamily: "'Roboto', sans-serif",
                      marginBottom: 12,
                    }}
                  >
                    {link.title}
                  </h3>
                  <p
                    style={{
                      color: "#5A6B80",
                      fontSize: 15,
                      lineHeight: 1.7,
                      marginBottom: 28,
                    }}
                  >
                    {link.desc}
                  </p>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: "inline-block",
                      background: link.btnBg,
                      color: "#fff",
                      padding: "13px 28px",
                      borderRadius: 14,
                      fontSize: 15,
                      fontWeight: 700,
                      textDecoration: "none",
                      boxShadow: `0 6px 20px ${link.color}44`,
                      transition: "opacity 0.2s",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.opacity = "0.85")
                    }
                    onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
                  >
                    {link.btnLabel}
                  </a>
                </div>
              </RevealSection>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ TEAM ═══════════════ */}
      <section id="team" style={{ background: "#fff", padding: "96px 24px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <RevealSection>
            <div style={{ textAlign: "center", marginBottom: 56 }}>
              <span
                style={{
                  fontSize: 13,
                  color: "#2D7DD2",
                  fontWeight: 600,
                  letterSpacing: 1.5,
                  textTransform: "uppercase",
                }}
              >
                Nhóm thực hiện
              </span>
              <h2
                style={{
                  fontFamily: "'Roboto', sans-serif",
                  color: "#1B3F6E",
                  fontSize: "clamp(26px, 4vw, 44px)",
                  marginTop: 12,
                  marginBottom: 12,
                }}
              >
                Đội ngũ phát triển TripMate
              </h2>
              <p
                style={{
                  color: "#5A6B80",
                  maxWidth: 500,
                  margin: "0 auto",
                  fontSize: 16,
                }}
              >
                Assignment 2 — UI/UX Design, Prototype & Landing Page
              </p>
            </div>
          </RevealSection>

          <div className="flex flex-wrap justify-center gap-6">
            {[
              { name: "Thái Kim Long", role: "UI/UX Designer", initial: "L" },
              { name: "Dương Khả Cơ", role: "UI/UX Designer", initial: "C" },
              {
                name: "Nguyễn Vũ Quang Minh",
                role: "UI/UX Designer",
                initial: "M",
              },
              { name: "Vũ Ngọc Anh Thư", role: "UI/UX Designer", initial: "T" },
            ].map((m, i) => {
              const colors = ["#2D7DD2", "#3DBAC2", "#10B981", "#F59E0B"];
              return (
                <RevealSection key={m.name} delay={i * 80}>
                  <div
                    style={{
                      background: "#F8FAFC",
                      borderRadius: 20,
                      padding: "32px 28px",
                      textAlign: "center",
                      width: 200,
                    }}
                  >
                    <div
                      style={{
                        width: 64,
                        height: 64,
                        borderRadius: "50%",
                        background: colors[i],
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#fff",
                        fontFamily: "'Roboto', sans-serif",
                        fontWeight: 800,
                        fontSize: 24,
                        margin: "0 auto 14px",
                      }}
                    >
                      {m.initial}
                    </div>
                    <div
                      style={{
                        color: "#1B3F6E",
                        fontFamily: "'Roboto', sans-serif",
                        fontWeight: 700,
                      }}
                    >
                      {m.name}
                    </div>
                    <div
                      style={{ color: "#5A6B80", fontSize: 13, marginTop: 4 }}
                    >
                      {m.role}
                    </div>
                  </div>
                </RevealSection>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════ FOOTER ═══════════════ */}
      <footer style={{ background: "#0D2744", padding: "48px 24px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 12,
                  background: "rgba(255,255,255,0.9)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden",
                }}
              >
                <img
                  src={logoImg}
                  alt="TripMate"
                  style={{ width: 44, height: 44, objectFit: "contain" }}
                />
              </div>
              <div>
                <div
                  style={{
                    color: "#fff",
                    fontFamily: "'Roboto', sans-serif",
                    fontWeight: 700,
                    fontSize: 18,
                  }}
                >
                  TripMate
                </div>
                <div
                  style={{
                    color: "rgba(255,255,255,0.45)",
                    fontSize: 12,
                    letterSpacing: 1,
                  }}
                >
                  TRAVEL SMART, SPEND WISELY
                </div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 28 }}>
              {[
                { label: "Figma", href: "https://www.figma.com" },
                { label: "Behance", href: "https://www.behance.net" },
              ].map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: "rgba(255,255,255,0.6)",
                    fontSize: 14,
                    textDecoration: "none",
                    transition: "color 0.2s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.color = "rgba(255,255,255,0.6)")
                  }
                >
                  {link.label}
                </a>
              ))}
            </div>
            <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 13 }}>
              © 2025 TripMate · Assignment 2 – UI/UX Design
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
