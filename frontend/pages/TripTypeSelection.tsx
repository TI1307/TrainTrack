import { Link } from "react-router-dom";

export default function TripType() {
    const tripsType = [
        { title: "قطار بين الولايات", subtitle: "رحلات طويلة بين المدن", link: "/intraWilaya" },
        { title: "قطار داخل ولاية", subtitle: "تنقل يومي داخل ولايتك", link: "/interWilaya" },
    ];

    return (
        <div style={styles.page}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;900&display=swap');

                .tt-card {
                    transition: transform 0.35s cubic-bezier(0.16,1,0.3,1), border-color 0.35s ease, box-shadow 0.35s ease;
                }
                .tt-card:hover, .tt-card:focus-visible {
                    transform: translateY(-6px);
                    border-color: rgba(56, 189, 248, 0.6);
                    box-shadow: 0 20px 40px -12px rgba(14, 116, 199, 0.45);
                    outline: none;
                }
                @media (prefers-reduced-motion: reduce) {
                    .tt-card { transition: none !important; }
                }
            `}</style>

            <div style={styles.container}>
                <h1 style={styles.mainTitle}>نوع الرحلة</h1>
                <p style={styles.subtitle}>حدد نوع القطار</p>

                <div style={styles.trip_container}>
                    {tripsType.map((trip) => (
                        <Link to={trip.link} key={trip.title} style={styles.link}>
                            <div className="tt-card" style={styles.trip} tabIndex={0}>
                                <h2 style={styles.tripTitle}>{trip.title}</h2>
                                <p style={styles.tripSubtitle}>{trip.subtitle}</p>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}

const styles: Record<string, React.CSSProperties> = {
    page: {
        minHeight: "100vh",
        width: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "radial-gradient(circle at 30% 20%, #101E3B 0%, #0A1428 55%, #060B18 100%)",
        fontFamily: "'Tajawal', sans-serif",
        padding: "24px",
        boxSizing: "border-box",
    },
    container: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        width: "100%",
        maxWidth: "720px",
    },
    eyebrow: {
        color: "#22D3EE",
        fontSize: "clamp(12px, 1.5vw, 14px)",
        fontWeight: 700,
        letterSpacing: "2px",
        marginBottom: "10px",
    },
    mainTitle: {
        color: "#F8FAFC",
        fontSize: "clamp(32px, 6vw, 52px)",
        fontWeight: 900,
        margin: 0,
        textAlign: "center",
        letterSpacing: "-0.5px",
    },
    subtitle: {
        color: "#94A3B8",
        fontSize: "clamp(14px, 2vw, 17px)",
        fontWeight: 400,
        marginTop: "12px",
        marginBottom: "48px",
        textAlign: "center",
    },
    trip_container: {
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        gap: "clamp(20px, 4vw, 40px)",
        width: "100%",
    },
    trip: {
        width: "clamp(220px, 30vw, 280px)",
        minHeight: "150px",
        borderRadius: "16px",
        border: "1px solid rgba(148, 163, 184, 0.25)",
        background: "rgba(255,255,255,0.04)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: "24px 20px",
        boxSizing: "border-box",
        cursor: "pointer",
    },
    tripTitle: {
        color: "#F8FAFC",
        fontSize: "clamp(17px, 2.2vw, 20px)",
        fontWeight: 700,
        margin: 0,
        textAlign: "center",
    },
    tripSubtitle: {
        color: "#94A3B8",
        fontSize: "13px",
        fontWeight: 400,
        marginTop: "6px",
        textAlign: "center",
    },
    link: {
        textDecoration: "none",
    },
};