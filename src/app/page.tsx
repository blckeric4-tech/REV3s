const noticeCss = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

  * { margin: 0; padding: 0; box-sizing: border-box; }

  html, body { height: 100%; }

  .notice-body {
    background: #000;
    color: #fff;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px;
    position: relative;
    overflow: hidden;
  }

  .notice-body::before {
    content: "";
    position: absolute;
    inset: 0;
    background-image:
      linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px);
    background-size: 48px 48px;
    pointer-events: none;
  }

  .notice-body::after {
    content: "";
    position: absolute;
    inset: 0;
    background: radial-gradient(circle at 50% 40%, rgba(255,255,255,0.08), transparent 60%);
    pointer-events: none;
  }

  .card {
    position: relative;
    max-width: 520px;
    width: 100%;
    text-align: center;
    padding: 64px 44px;
    border: 1px solid rgba(255,255,255,0.18);
    border-radius: 2px;
    background: linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0));
    backdrop-filter: blur(2px);
    animation: fadeIn 0.9s ease-out;
  }

  .card::before,
  .card::after {
    content: "";
    position: absolute;
    width: 14px;
    height: 14px;
    border: 1px solid #fff;
  }
  .card::before { top: -1px; left: -1px; border-right: none; border-bottom: none; }
  .card::after  { bottom: -1px; right: -1px; border-left: none; border-top: none; }

  .icon {
    width: 46px;
    height: 46px;
    margin: 0 auto 28px;
    border: 1px solid rgba(255,255,255,0.5);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .icon svg { width: 20px; height: 20px; stroke: #fff; }

  .eyebrow {
    font-size: 0.7rem;
    letter-spacing: 0.3em;
    text-transform: uppercase;
    color: rgba(255,255,255,0.45);
    margin-bottom: 18px;
    font-weight: 500;
  }

  h1 {
    font-size: 2rem;
    font-weight: 600;
    letter-spacing: -0.01em;
    margin-bottom: 8px;
    line-height: 1.25;
  }

  h1 span {
    font-weight: 300;
    color: rgba(255,255,255,0.75);
  }

  .divider {
    width: 40px;
    height: 1px;
    background: rgba(255,255,255,0.3);
    margin: 28px auto;
  }

  p {
    font-size: 1rem;
    line-height: 1.7;
    color: rgba(255,255,255,0.72);
    font-weight: 300;
    letter-spacing: 0.01em;
  }

  .footer-note {
    margin-top: 36px;
    font-size: 0.7rem;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: rgba(255,255,255,0.3);
  }

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @media (max-width: 480px) {
    .card { padding: 48px 28px; }
    h1 { font-size: 1.6rem; }
  }
`;

export default function HomePage() {
  return (
    <div className="notice-body">
      <style>{noticeCss}</style>
      <div className="card">
        <div className="icon">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
        </div>
        <div className="eyebrow">Status</div>
        <h1>
          You are welcome, <span>rav3s</span>
        </h1>
        <div className="divider"></div>
        <p>We are really sorry to tell you that you website is now down. according to that your free plan has ended.</p>
        <div className="footer-note">System Notice</div>
      </div>
    </div>
  );
}
