export default function Header() {
  return (
    <nav>
      <div className="nav-logo">☕ Study<span>Spot</span></div>
      <ul className="nav-links">
        <li><a href="#features">Features</a></li>
        <li><a href="#how">How it works</a></li>
        <li><a href="#score">StudyScore</a></li>
        <li><a href="#cta" className="nav-cta">Get Started</a></li>
      </ul>
    </nav>
  );
}