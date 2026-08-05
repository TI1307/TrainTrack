// frontend/pages/login.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";


export default function UserInvetation() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState<{ type: "success" | "error" | null; message: string }>({
    type: null,
    message: "",
  });
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");

  const validateEmail = (value: string) => value.includes("@") && value.includes(".");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setEmailError("");
    setPasswordError("");
    setConfirmPasswordError("");
    setNotification({ type: null, message: "" });

    let hasError = false;
    if (!email) {
      setEmailError("البريد الإلكتروني مطلوب");
      hasError = true;
    } else if (!validateEmail(email)) {
      setEmailError("يرجى إدخال بريد إلكتروني صحيح");
      hasError = true;
    }
    if (!password) {
      setPasswordError("كلمة المرور مطلوبة");
      hasError = true;
    } else if (password.length < 6) {
      setPasswordError("كلمة المرور يجب أن تكون 6 أحرف على الأقل");
      hasError = true;
    }
    if (!confirmPassword) {
      setConfirmPasswordError("تأكيد كلمة المرور مطلوب");
       hasError = true;
    } else if (password !== confirmPassword) {
      setConfirmPasswordError("يرجى إدخال نفس كلمة المرور");
      hasError = true;
    }
    if (hasError) return;
    setIsLoading(true);
   
  };

  return (
    <div style={styles.container}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;900&display=swap');

        /* Fix: Ensure body and html cover full viewport */
        html, body {
          margin: 0;
          padding: 0;
          min-height: 100vh;
          min-height: 100dvh; /* For dynamic viewport height on mobile */
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
        <h1 style={styles.title}>  TrainTrack مرحباً بك في </h1>
        <p style={styles.subtitle}>  يرجى ادخال كلمة المرور لتفعيل حسابك</p>

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
            <label style={styles.label}>البريد الإلكتروني</label>
            <input
              className={`tt-input${emailError ? " error" : ""}`}
              type="email"
              placeholder="example@email.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setEmailError("");
              }}
              style={styles.input}
            />
            {emailError && <div style={styles.errorMessage}>{emailError}</div>}
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>كلمة المرور</label>
            <input
              className={`tt-input${passwordError ? " error" : ""}`}
              type="password"
              placeholder="أدخل كلمة المرور"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setPasswordError("");
              }}
              style={styles.input}
            />
            {passwordError && <div style={styles.errorMessage}>{passwordError}</div>}
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>تاكيد كلمة المرور </label>
            <input
              className={`tt-input${confirmPasswordError ? " error" : ""}`}
              type="password"
              placeholder="يرجى تاكيد كلمة المرور"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                setConfirmPasswordError("");
              }}
              style={styles.input}
            />
            {confirmPasswordError && <div style={styles.errorMessage}>{confirmPasswordError}</div>}
          </div>

          <div style={styles.options}>
            <button type="button" style={styles.forgotButton}>
              نسيت كلمة المرور؟
            </button>
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
    position: "fixed", // Fix: Use fixed positioning to cover entire viewport
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
    backgroundAttachment: "fixed", // Ensure gradient covers everything
    overflow: "auto", // Allow scrolling if needed
  },
  card: {
    width: "100%",
    maxWidth: "600px",
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(148, 163, 184, 0.25)",
    borderRadius: "16px",
    padding: "2rem",
    boxSizing: "border-box",
    backdropFilter: "blur(10px)", // Optional: adds glass effect
    WebkitBackdropFilter: "blur(10px)", // For Safari
  },
  title: {
    fontSize: "1.5rem",
    fontWeight: 700,
    color: "#F8FAFC",
    margin: 0,
    textAlign: "center",
  },
  subtitle: {
    color: "#94A3B8",
    marginTop: "0.25rem",
    marginBottom: "1.5rem",
    fontSize: "0.875rem",
    textAlign: "center",
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
  options: {
    display: "flex",
    justifyContent: "flex-end",
    marginBottom: "1.5rem",
  },
  forgotButton: {
    fontSize: "0.875rem",
    color: "#3B82F6",
    background: "none",
    border: "none",
    cursor: "pointer",
    fontWeight: 500,
  },
  loginButton: {
    width: "100%",
    padding: "0.625rem",
    background: "#2563eb",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "0.875rem",
    fontWeight: 600,
    cursor: "pointer",
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