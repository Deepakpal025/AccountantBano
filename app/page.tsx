import Link from "next/link";
import {
  ArrowUpRight,
  Check,
  BookOpen,
  ShieldCheck,
  MessageCircle,
  FileText,
  Users,
  Infinity as InfinityIcon,
  ArrowRight,
} from "lucide-react";
import { PublicNav } from "@/components/ui";
export const dynamic = "force-dynamic";
const curriculum = [
  "Accounting Basics",
  "Debit & Credit",
  "Journal Entries",
  "Ledger",
  "Trial Balance",
  "GST Basics",
  "Tally",
  "Practical Accounting",
  "Interview Preparation",
];
export default function Home() {
  return (
    <>
      <PublicNav />
      <main className="landing">
        <section className="hero">
          <div>
            <p className="eyebrow">
              <span className="line" /> THE PRACTICAL ACCOUNTING ACADEMY
            </p>
            <h1>
              Accounting seekho.
              <br />
              Skill banao.
              <br />
              <span>Career banao.</span>
            </h1>
            <p className="hero-description">
              Beginner se practical accountant banne tak ka structured learning
              platform. Build real skills, one clear lesson at a time.
            </p>
            <div className="hero-actions">
              <Link className="button" href="/register">
                Join the academy <ArrowUpRight size={19} />
              </Link>
              <Link className="button secondary" href="/login">
                Continue learning <ArrowRight size={18} />
              </Link>
            </div>
            <div className="hero-facts">
              <span>
                <Check size={17} /> Beginner friendly
              </span>
              <span>
                <Check size={17} /> Learn at your pace
              </span>
              <span>
                <Check size={17} /> Lifetime access available
              </span>
            </div>
          </div>
          <div className="curriculum-panel">
            <div className="curriculum-top">
              <BookOpen size={27} />
              <span>
                YOUR PATH TO
                <br />
                <strong>Practical accounting</strong>
              </span>
              <span className="badge">9 topics</span>
            </div>
            <ol>
              {curriculum.map((title, i) => (
                <li key={title}>
                  <span>{String(i + 1).padStart(2, "0")}</span>
                  <strong>{title}</strong>
                  <ArrowUpRight size={16} />
                </li>
              ))}
            </ol>
            <div className="curriculum-foot">
              <ShieldCheck size={19} />
              <span>
                Private lessons. Personal progress.
                <br />
                <strong>A learning space that’s yours.</strong>
              </span>
            </div>
          </div>
        </section>
        <section className="benefits">
          <p className="eyebrow">MORE THAN VIDEO LESSONS</p>
          <h2>Everything you need to keep moving.</h2>
          <div className="benefit-grid">
            {[
              [
                BookOpen,
                "Practical learning",
                "Understand the why. Practice the how. Build a foundation you can use at work.",
              ],
              [
                FileText,
                "Notes that stay with you",
                "Revisit key concepts with module-wise notes and downloadable resources.",
              ],
              [
                MessageCircle,
                "Room for every doubt",
                "Ask your questions and get replies from your instructor in one place.",
              ],
              [
                Users,
                "A community behind you",
                "Learn alongside premium students and stay close to academy updates.",
              ],
            ].map(([Icon, title, description]) => {
              const I = Icon as typeof BookOpen;
              return (
                <article key={String(title)}>
                  <I size={25} />
                  <h3>{String(title)}</h3>
                  <p>{String(description)}</p>
                </article>
              );
            })}
          </div>
        </section>
        <section className="join-strip">
          <div>
            <p className="eyebrow">YOUR NEXT CHAPTER STARTS HERE</p>
            <h2>Make accounting your advantage.</h2>
            <p>
              Create your account. Contact the academy to arrange course access.
            </p>
          </div>
          <Link href="/register" className="button white">
            Create student account <ArrowUpRight size={18} />
          </Link>
        </section>
      </main>
      <footer className="public-footer">
        <span>© {new Date().getFullYear()} ACCOUNTANT BANO</span>
        <nav>
          <Link href="/about">About</Link>
          <Link href="/contact">Support</Link>
          <Link href="/admin/login">Admin login</Link>
        </nav>
      </footer>
    </>
  );
}
