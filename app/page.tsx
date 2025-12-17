import Image from "next/image";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-200 font-sans">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-slate-900/60 backdrop-blur sm:items-start rounded-3xl border border-slate-800">
        <Image
          className="dark:invert"
          src="/next.svg"
          alt="Next.js logo"
          width={100}
          height={20}
          priority
        />
        <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left">
          <h1 className="max-w-xs text-3xl font-semibold leading-10 tracking-tight text-neon-cyan">
            AI Matcher Frontend
          </h1>
          <p className="max-w-md text-lg leading-8 text-slate-300">
            Your neon-dark dashboard will live here. We&apos;ll plug in auth,
            jobs, and candidate matching next.
          </p>
        </div>
      </main>
    </div>
  );
}

