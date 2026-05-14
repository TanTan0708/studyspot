export default function Header() {
  return (
    <nav>
      <div className="nav-logo">
        <img src="/studySpotLogoBig.png" alt="StudySpot" style={{ height: "28px", width: "auto" }} />
        Study<span>Spot</span>
      </div>
      <ul className="nav-links">
        <li><a href="#features">Features</a></li>
        <li><a href="#how">How it works</a></li>
        <li><a href="#score">StudyScore</a></li>
        <li><a href="#cta" className="nav-cta">Get Started</a></li>
      </ul>
    </nav>
  );
}