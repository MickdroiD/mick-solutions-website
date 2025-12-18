import ContactForm from '@/components/ContactForm';

export default function Home() {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-[#0a0f1c]">
      {/* Background gradient orbs */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-cyan-500/20 rounded-full blur-[128px] animate-pulse" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-violet-500/20 rounded-full blur-[128px] animate-pulse delay-1000" />
      
      {/* Grid pattern overlay */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)`,
          backgroundSize: '64px 64px'
        }}
      />

      {/* Main content */}
      <main className="relative z-10 text-center px-6 py-16 w-full max-w-4xl">
        {/* Logo mark */}
        <div className="mb-8 flex justify-center">
          <div className="relative">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-400 via-blue-500 to-violet-600 p-[2px]">
              <div className="w-full h-full rounded-2xl bg-[#0a0f1c] flex items-center justify-center">
                <span className="text-3xl font-black bg-gradient-to-br from-cyan-400 to-violet-500 bg-clip-text text-transparent">
                  M
                </span>
              </div>
            </div>
            <div className="absolute -inset-1 bg-gradient-to-br from-cyan-400 to-violet-600 rounded-2xl blur opacity-30 animate-pulse" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-5xl sm:text-7xl font-extralight tracking-tight text-white mb-4">
          <span className="font-light">Mick</span>
          <span className="font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-violet-500 bg-clip-text text-transparent">
            {" "}Solutions
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-lg sm:text-xl text-slate-400 font-light tracking-widest uppercase">
          Automation & Infrastructure DevOps
        </p>

        {/* Decorative line */}
        <div className="mt-10 flex items-center justify-center gap-3">
          <div className="h-px w-16 bg-gradient-to-r from-transparent to-cyan-500/50" />
          <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <div className="h-px w-16 bg-gradient-to-l from-transparent to-violet-500/50" />
        </div>

        {/* Contact Section */}
        <section className="mt-16">
          <h2 className="text-2xl sm:text-3xl font-light text-white mb-3">
            Me <span className="font-semibold bg-gradient-to-r from-cyan-400 to-violet-500 bg-clip-text text-transparent">contacter</span>
          </h2>
          <p className="text-slate-500 mb-8 max-w-md mx-auto">
            Un projet d&apos;automatisation ou d&apos;infrastructure ? Parlons-en.
          </p>
          
          <ContactForm />
        </section>

        {/* CTA hint */}
        <p className="mt-16 text-sm text-slate-500 tracking-wide">
          Site en construction — Plus de contenu à venir
        </p>
      </main>

      {/* Footer */}
      <footer className="absolute bottom-8 text-slate-600 text-xs tracking-wider">
        © 2025 Mick Solutions. Tous droits réservés.
      </footer>
    </div>
  );
}
