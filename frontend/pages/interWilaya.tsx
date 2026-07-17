import { useState } from "react";
import { Link } from "react-router-dom";

export default function InterWilaya() {
    const [search, setSearch] = useState("");

    const TrainInWilaya = [
        { id: 1, title: "الجزائر",  link: "/wilaya/1" },
        { id: 2, title: "وهران", link: "/wilaya/2" },
        { id: 3, title: "بليدة", link: "/wilaya/3" },
        { id: 4, title: "بومرداس", link: "/wilaya/4" },
        { id: 5, title: "عنابة",  link: "/wilaya/5" },
    ];

    const filtered = TrainInWilaya.filter((w) => w.title.includes(search.trim()));

    return (
        <div style={styles.page}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;900&display=swap');

                .tt-search {
                    transition: border-color 0.2s ease, box-shadow 0.2s ease;
                }
                .tt-search:focus {
                    outline: none;
                    border-color: #3B82F6;
                    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.25);
                }
                .tt-wilaya-card {
                    transition: transform 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease;
                }
                .tt-wilaya-card:hover, .tt-wilaya-card:focus-visible {
                    transform: translateY(-4px);
                    border-color: rgba(56, 189, 248, 0.6);
                    box-shadow: 0 14px 30px -10px rgba(14, 116, 199, 0.4);
                    outline: none;
                }
            `}</style>

            <div style={styles.container}>
                <h1 style={styles.mainTitle}>اختر الولاية</h1>
                <p style={styles.subtitle}>اختر الولاية لعرض إحصائيات القطارات والمحطات</p>

                <input
                    className="tt-search"
                    type="text"
                    placeholder="ابحث عن ولاية..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    style={styles.searchInput}
                />

                <div style={styles.wilayas_container}>
                    {filtered.map((wilaya) => (
                        <Link to={wilaya.link} key={wilaya.id} style={styles.link}>
                            <div className="tt-wilaya-card" style={styles.card} tabIndex={0}>
                                <h2 style={styles.wilayaTitle}>{wilaya.title}</h2>
                                
                            </div>
                        </Link>
                    ))}

                    {filtered.length === 0 && <p style={styles.noResults}>لا توجد نتائج</p>}
                </div>
            </div>
        </div>
    );
}

const styles: Record<string, React.CSSProperties> = {
    page: {
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "24px",
        boxSizing: "border-box",
        fontFamily: "'Tajawal', sans-serif",
        background: "radial-gradient(circle at 30% 20%, #101E3B 0%, #0A1428 55%, #060B18 100%)",
    },
    container: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        width: "100%",
        maxWidth: "800px",
    },
    mainTitle: {
        color: "#F8FAFC",
        fontSize: "clamp(28px, 5vw, 42px)",
        fontWeight: 900,
        margin: 0,
        textAlign: "center",
    },
    subtitle: {
        color: "#94A3B8",
        fontSize: "0.95rem",
        marginTop: "10px",
        marginBottom: "24px",
        textAlign: "center",
    },
    searchInput: {
        width: "100%",
        maxWidth: "360px",
        padding: "0.65rem 1rem",
        border: "1px solid rgba(148, 163, 184, 0.35)",
        borderRadius: "10px",
        fontSize: "0.9rem",
        background: "rgba(255,255,255,0.03)",
        color: "#F8FAFC",
        boxSizing: "border-box",
        marginBottom: "36px",
        fontFamily: "'Tajawal', sans-serif",
        textAlign: "center",
    },
    wilayas_container: {
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        gap: "20px",
        width: "100%",
    },
    link: {
        textDecoration: "none",
    },
    card: {
        width: "200px",
        minHeight: "110px",
        borderRadius: "14px",
        border: "1px solid rgba(148, 163, 184, 0.25)",
        background: "rgba(255,255,255,0.04)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: "18px",
        boxSizing: "border-box",
        cursor: "pointer",
    },
    wilayaTitle: {
        color: "#F8FAFC",
        fontSize: "1.1rem",
        fontWeight: 700,
        margin: 0,
        marginBottom: "10px",
        textAlign: "center",
    },
    statsRow: {
        display: "flex",
        gap: "8px",
        flexWrap: "wrap",
        justifyContent: "center",
    },
    statBadge: {
        fontSize: "0.7rem",
        color: "#3B82F6",
        background: "rgba(59, 130, 246, 0.12)",
        padding: "3px 8px",
        borderRadius: "20px",
        whiteSpace: "nowrap",
    },
    noResults: {
        color: "#94A3B8",
        fontSize: "0.9rem",
    },
};