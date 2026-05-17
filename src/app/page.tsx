import Link from "next/link"

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex flex-col items-center justify-center px-6 py-12 text-center">
      <div className="max-w-3xl rounded-3xl border border-white/10 bg-white/5 p-10 shadow-2xl shadow-black/20 backdrop-blur-lg">
        <p className="text-sm uppercase tracking-[0.3em] text-primary-300">Welcome to KARUM Store</p>
        <h1 className="mt-6 text-4xl font-semibold sm:text-5xl">Your inventory, simplified and beautiful.</h1>
        <p className="mt-4 text-base leading-8 text-slate-300 sm:text-lg">
          Discover a powerful inventory management experience for your store. Sign in to manage products, categories, sales and more from one elegant dashboard.
        </p>

        <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-center">
          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-primary/90 sm:px-8"
          >
            Login
          </Link>
          <Link
            href="/register"
            className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-slate-100 transition hover:bg-white/10 sm:px-8"
          >
            Register
          </Link>
        </div>
      </div>
    </div>
  )
}
