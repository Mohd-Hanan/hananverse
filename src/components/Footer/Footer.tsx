import React, { useState, useRef, useEffect, useCallback } from "react";

interface FooterProps {
  name?: string;
  githubUrl?: string;
}

export const Footer: React.FC<FooterProps> = ({
  name = "Muhammed Hanan P P",
  githubUrl = "https://github.com/Mohd-Hanan",
}) => {
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>("");
  const [isToastOpen, setIsToastOpen] = useState<boolean>(false);

  const copyTimerRef = useRef<number | null>(null);
  const toastTimerRef = useRef<number | null>(null);

  const currentYear = new Date().getFullYear();

  const triggerToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setIsToastOpen(true);

    if (toastTimerRef.current) {
      window.clearTimeout(toastTimerRef.current);
    }

    toastTimerRef.current = window.setTimeout(() => {
      setIsToastOpen(false);
    }, 2800);
  }, []);

  const fallbackCopy = useCallback(
    (text: string, successMsg: string) => {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand("copy");
        triggerToast(successMsg);
      } catch {
        triggerToast(`Profile URL: ${text}`);
      }
      document.body.removeChild(textarea);
    },
    [triggerToast],
  );

  const copyToClipboard = useCallback(
    (text: string, successMsg: string) => {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard
          .writeText(text)
          .then(() => triggerToast(successMsg))
          .catch(() => fallbackCopy(text, successMsg));
      } else {
        fallbackCopy(text, successMsg);
      }
    },
    [fallbackCopy, triggerToast],
  );

  const handleCopy = () => {
    copyToClipboard(githubUrl, `✓ Copied GitHub profile URL: ${githubUrl}`);

    setIsCopied(true);
    if (copyTimerRef.current) {
      window.clearTimeout(copyTimerRef.current);
    }
    copyTimerRef.current = window.setTimeout(() => {
      setIsCopied(false);
    }, 2000);
  };

  useEffect(() => {
    return () => {
      if (copyTimerRef.current) window.clearTimeout(copyTimerRef.current);
      if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    };
  }, []);

  return (
    <>
      <footer id="footer">
        <p id="footer-name">
          © {currentYear} {name}
        </p>

        <div id="links" className="hero-links">
          {githubUrl && (
            <a href={githubUrl} target="_blank" rel="noopener noreferrer">
              GitHub ↗
            </a>
          )}
          <button
            type="button"
            className="copy-btn"
            id="copy-github-btn"
            title="Copy GitHub profile URL"
            aria-label="Copy GitHub profile URL to clipboard"
            onClick={handleCopy}
          >
            <span id="copy-btn-icon">{isCopied ? "✓" : "⎘"}</span>{" "}
            <span id="copy-btn-text">
              {isCopied ? "Copied!" : "Copy GitHub URL"}
            </span>
          </button>
        </div>
      </footer>

      <p className="credit">Built for FOSSSoC-S1 Portfolio Week · FOSS TKMCE</p>

      {/* Toast Notification */}
      <div
        id="toast"
        className={`toast ${isToastOpen ? "show" : ""}`}
        role="status"
        aria-live="polite"
      >
        {toastMessage}
      </div>
    </>
  );
};
