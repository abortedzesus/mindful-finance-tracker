import { Link } from "react-router-dom";

function Home() {
  return (
    <div className="min-h-screen bg-[#050506] text-white overflow-hidden">
      <nav className="border-b border-[#161b22] px-8 md:px-12 py-5 flex items-center justify-between">
        <div>
          <h1
            className="text-4xl"
            style={{
              fontFamily:
                '"The Seasons", "Cormorant Garamond", "Times New Roman", serif',
            }}
          >
            Kakeibo
          </h1>
          <p className="text-slate-400 text-sm">
            家計簿 • Mindful Finance Tracker
          </p>
        </div>

        <div className="flex gap-3">
          <Link
            to="/login"
            className="px-5 py-2 rounded-full border border-slate-700 text-slate-300 hover:text-white hover:border-slate-500 transition"
          >
            Login
          </Link>
          <Link
            to="/signup"
            className="px-5 py-2 rounded-full bg-lime-400 text-black font-semibold hover:bg-lime-300 transition"
          >
            Sign Up
          </Link>
        </div>
      </nav>

      <main className="max-w-[1450px] mx-auto px-8 py-16">
        <section className="grid lg:grid-cols-2 gap-14 items-center">
          <div>
            <p className="text-lime-300 text-sm uppercase tracking-[0.25em] mb-5">
              Mindful money management
            </p>

            <h2
              className="text-6xl md:text-7xl leading-[0.95] tracking-tight"
              style={{
                fontFamily:
                  '"The Seasons", "Cormorant Garamond", "Times New Roman", serif',
              }}
            >
              Spend with intention.
              <br />
              Save with clarity.
            </h2>

            <p className="text-slate-400 text-lg mt-7 max-w-xl leading-relaxed">
              Kakeibo brings expenses, bills, savings goals, and insights into
              one calm dashboard — inspired by the Japanese method of mindful
              finance.
            </p>

            <div className="flex flex-wrap gap-4 mt-8">
              <Link
                to="/signup"
                className="px-7 py-3 rounded-full bg-lime-400 text-black font-semibold hover:bg-lime-300 transition"
              >
                Start Tracking
              </Link>

              <Link
                to="/login"
                className="px-7 py-3 rounded-full border border-slate-700 text-slate-300 hover:text-white hover:border-slate-500 transition"
              >
                Login
              </Link>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-10 bg-lime-400/10 blur-3xl rounded-full" />

            <div className="relative rounded-[2rem] border border-[#252a30] bg-[#111417] p-6 shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-slate-400 text-sm">Monthly Overview</p>
                  <h3 className="text-3xl font-semibold mt-1">₹12,000 saved</h3>
                </div>

                <div className="rounded-full bg-lime-400 text-black px-4 py-2 text-sm font-semibold">
                  +24%
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-5">
                <MiniStat label="Expenses" value="₹8,450" />
                <MiniStat label="Bills" value="3" />
                <MiniStat label="Goals" value="2" />
              </div>

              <div className="rounded-3xl bg-[#050506] border border-[#252a30] p-5">
                <div className="flex items-end gap-3 h-44">
                  <Bar h="35%" />
                  <Bar h="55%" />
                  <Bar h="45%" />
                  <Bar h="75%" active />
                  <Bar h="60%" />
                  <Bar h="85%" active />
                  <Bar h="50%" />
                </div>

                <div className="flex justify-between text-xs text-slate-500 mt-4">
                  <span>Mon</span>
                  <span>Tue</span>
                  <span>Wed</span>
                  <span>Thu</span>
                  <span>Fri</span>
                  <span>Sat</span>
                  <span>Sun</span>
                </div>
              </div>

              <div className="mt-5 rounded-3xl bg-[#050506] border border-[#252a30] p-5">
                <div className="flex justify-between mb-3">
                  <p className="text-slate-300">New Laptop</p>
                  <p className="text-lime-300">20%</p>
                </div>
                <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div className="h-full w-1/5 rounded-full bg-gradient-to-r from-lime-400 to-emerald-300" />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid md:grid-cols-3 gap-5 mt-24">
          <Feature
            number="01"
            title="Track Expenses"
            text="Log daily spending with categories, payment methods, dates, and notes."
          />
          <Feature
            number="02"
            title="Manage Bills"
            text="Add upcoming payments, mark bills as paid, and stay aware of pending dues."
          />
          <Feature
            number="03"
            title="Build Savings"
            text="Create savings goals and visually track your progress over time."
          />
        </section>

        <section className="mt-24 rounded-[2rem] border border-[#252a30] bg-[#111417] p-8 md:p-10 grid md:grid-cols-2 gap-8 items-center">
          <div>
            <h3
              className="text-4xl"
              style={{
                fontFamily:
                  '"The Seasons", "Cormorant Garamond", "Times New Roman", serif',
              }}
            >
              Inspired by Kakeibo.
            </h3>
            <p className="text-slate-400 mt-4 leading-relaxed">
              Kakeibo means household financial ledger. The idea is simple:
              record your money, reflect on your habits, and spend with more
              intention.
            </p>
          </div>

          <div className="grid gap-3">
            <Step title="Record" text="Add expenses, bills, and savings goals." />
            <Step title="Reflect" text="Use charts to understand spending patterns." />
            <Step title="Improve" text="Make better decisions month by month." />
          </div>
        </section>

        <section className="text-center mt-24 mb-10">
          <h3
            className="text-5xl"
            style={{
              fontFamily:
                '"The Seasons", "Cormorant Garamond", "Times New Roman", serif',
            }}
          >
            Ready to manage money mindfully?
          </h3>

          <Link
            to="/signup"
            className="inline-block mt-7 px-8 py-3 rounded-full bg-lime-400 text-black font-semibold hover:bg-lime-300 transition"
          >
            Create your account
          </Link>
        </section>
      </main>
    </div>
  );
}

function MiniStat({ label, value }) {
  return (
    <div className="rounded-2xl bg-[#050506] border border-[#252a30] p-4">
      <p className="text-slate-500 text-xs">{label}</p>
      <p className="text-white font-semibold mt-1">{value}</p>
    </div>
  );
}

function Bar({ h, active = false }) {
  return (
    <div
      className={`flex-1 rounded-full ${
        active
          ? "bg-gradient-to-t from-lime-500 to-lime-300"
          : "bg-slate-700"
      }`}
      style={{ height: h }}
    />
  );
}

function Feature({ number, title, text }) {
  return (
    <div className="rounded-[2rem] border border-[#252a30] bg-[#111417] p-7 hover:-translate-y-1 transition">
      <p className="text-lime-300 text-sm mb-6">{number}</p>
      <h3 className="text-2xl font-semibold">{title}</h3>
      <p className="text-slate-400 mt-3 leading-relaxed">{text}</p>
    </div>
  );
}

function Step({ title, text }) {
  return (
    <div className="rounded-2xl border border-[#252a30] bg-[#050506] p-5">
      <p className="text-white font-semibold">{title}</p>
      <p className="text-slate-400 text-sm mt-1">{text}</p>
    </div>
  );
}

export default Home;