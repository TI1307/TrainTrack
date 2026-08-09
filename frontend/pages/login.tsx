// frontend/pages/login.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../src/context/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState<{ type: "success" | "error" | null; message: string }>({
    type: null,
    message: "",
  });
  const [usernameError, setUsernameError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setUsernameError("");
    setPasswordError("");
    setNotification({ type: null, message: "" });

    let hasError = false;
    if (!username.trim()) {
      setUsernameError("اسم المستخدم مطلوب");
      hasError = true;
    }
    if (!password) {
      setPasswordError("كلمة المرور مطلوبة");
      hasError = true;
    } else if (password.length < 6) {
      setPasswordError("كلمة المرور يجب أن تكون 6 أحرف على الأقل");
      hasError = true;
    }
    if (hasError) return;

    setIsLoading(true);
    try {
      await login(username, password);
      setNotification({ type: "success", message: "تم تسجيل الدخول بنجاح! جاري التحويل..." });
      setTimeout(() => navigate("/"), 800);
    } catch (err: unknown) {
      // Extract the backend's detail message from Axios errors (e.g. 401 with { detail: "..." })
      type AxiosLike = { response?: { data?: { detail?: string } } };
      const axiosDetail = (err as AxiosLike)?.response?.data?.detail;
      const msg = axiosDetail ?? (err instanceof Error ? err.message : "حدث خطأ. يرجى المحاولة مرة أخرى.");
      setNotification({ type: "error", message: msg });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;900&display=swap');

        html, body {
          margin: 0;
          padding: 0;
          min-height: 100vh;
        }

        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .spinner {
          display: inline-block;
          width: 18px;
          height: 18px;
          border: 3px solid rgba(255,255,255,0.3);
          border-radius: 50%;
          border-top-color: white;
          animation: spin 0.6s linear infinite;
        }
        .tt-input {
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }
        .tt-input:focus {
          outline: none;
          border-color: #3B82F6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.25);
        }
        .tt-input.error {
          border-color: #ef4444;
        }
        .tt-button:hover:not(:disabled) {
          background: #1d4ed8;
        }
      `}</style>

      <div style={styles.card}>
        <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
          <h1 style={styles.title}>TrainTrack Admin</h1>
          <p style={styles.subtitle}>سجل الدخول إلى لوحة إدارة القطارات</p>
        </div>

        {notification.type && (
          <div style={{ ...styles.notification, background: notification.type === "success" ? "#10b981" : "#ef4444" }}>
            <span>{notification.message}</span>
            <button onClick={() => setNotification({ type: null, message: "" })} style={styles.closeButton}>
              ✕
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div style={styles.formGroup}>
            <label style={styles.label}>اسم المستخدم</label>
            <input
              className={`tt-input${usernameError ? " error" : ""}`}
              type="text"
              placeholder="أدخل اسم المستخدم "
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                setUsernameError("");
              }}
              style={styles.input}
            />
            {usernameError && <div style={styles.errorMessage}>{usernameError}</div>}
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>كلمة المرور</label>
            <input
              className={`tt-input${passwordError ? " error" : ""}`}
              type="password"
              placeholder="أدخل كلمة المرور "
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setPasswordError("");
              }}
              style={styles.input}
            />
            {passwordError && <div style={styles.errorMessage}>{passwordError}</div>}
          </div>

          <button
            className="tt-button"
            type="submit"
            style={{ ...styles.loginButton, ...(isLoading ? styles.loginButtonDisabled : {}) }}
            disabled={isLoading}
          >
            {isLoading ? (
              <span style={styles.loadingText}>
                <span className="spinner"></span>
                جاري تسجيل الدخول...
              </span>
            ) : (
              "تسجيل الدخول"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "1rem",
    fontFamily: "'Tajawal', sans-serif",
    background: "radial-gradient(circle at 30% 20%, #101E3B 0%, #0A1428 55%, #060B18 100%)",
    direction: "rtl",
    overflow: "auto",
  },
  card: {
    width: "100%",
    maxWidth: "550px",
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(148, 163, 184, 0.25)",
    borderRadius: "16px",
    padding: "2rem",
    boxSizing: "border-box",
    backdropFilter: "blur(10px)",
    WebkitBackdropFilter: "blur(10px)",
  },
  title: {
    fontSize: "1.5rem",
    fontWeight: 800,
    color: "#F8FAFC",
    margin: 0,
  },
  subtitle: {
    color: "#94A3B8",
    marginTop: "0.25rem",
    marginBottom: "0.5rem",
    fontSize: "0.875rem",
  },
  formGroup: {
    marginBottom: "1.25rem",
  },
  label: {
    display: "block",
    fontSize: "0.875rem",
    fontWeight: 500,
    color: "#CBD5E1",
    marginBottom: "0.375rem",
  },
  input: {
    width: "100%",
    padding: "0.625rem 1rem",
    border: "1px solid rgba(148, 163, 184, 0.35)",
    borderRadius: "8px",
    fontSize: "0.875rem",
    background: "rgba(255,255,255,0.03)",
    color: "#F8FAFC",
    boxSizing: "border-box",
  },
  loginButton: {
    width: "100%",
    padding: "0.75rem",
    background: "#2563eb",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "0.95rem",
    fontWeight: 600,
    cursor: "pointer",
    marginTop: "0.5rem",
  },
  loginButtonDisabled: {
    opacity: 0.7,
    cursor: "not-allowed",
  },
  loadingText: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.5rem",
  },
  errorMessage: {
    color: "#f87171",
    fontSize: "0.75rem",
    marginTop: "0.25rem",
  },
  notification: {
    color: "white",
    padding: "0.75rem 1rem",
    borderRadius: "8px",
    marginBottom: "1rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    fontSize: "0.875rem",
    animation: "slideDown 0.3s ease-out",
  },
  closeButton: {
    background: "none",
    border: "none",
    color: "white",
    cursor: "pointer",
    fontSize: "1.125rem",
    padding: "0 0.25rem",
    opacity: 0.8,
  },
};