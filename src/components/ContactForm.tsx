'use client';

import { useState, useTransition } from 'react';
import { submitContact } from '@/app/actions/submitContact';

export default function ContactForm() {
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{ success: boolean; message: string } | null>(null);

  const handleSubmit = async (formData: FormData) => {
    setFeedback(null);
    startTransition(async () => {
      const result = await submitContact(formData);
      setFeedback(result);
      if (result.success) {
        // Reset form on success
        const form = document.getElementById('contact-form') as HTMLFormElement;
        form?.reset();
      }
    });
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <form id="contact-form" action={handleSubmit} className="space-y-5">
        {/* Nom */}
        <div className="group">
          <label htmlFor="nom" className="block text-sm font-medium text-slate-400 mb-2 tracking-wide">
            Nom
          </label>
          <input
            type="text"
            id="nom"
            name="nom"
            required
            disabled={isPending}
            placeholder="Votre nom"
            className="w-full px-4 py-3 rounded-xl bg-slate-900/50 border border-slate-700/50 
                     text-white placeholder-slate-500 
                     focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20
                     transition-all duration-300 backdrop-blur-sm
                     disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>

        {/* Email */}
        <div className="group">
          <label htmlFor="email" className="block text-sm font-medium text-slate-400 mb-2 tracking-wide">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            required
            disabled={isPending}
            placeholder="votre@email.com"
            className="w-full px-4 py-3 rounded-xl bg-slate-900/50 border border-slate-700/50 
                     text-white placeholder-slate-500 
                     focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20
                     transition-all duration-300 backdrop-blur-sm
                     disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>

        {/* Message */}
        <div className="group">
          <label htmlFor="message" className="block text-sm font-medium text-slate-400 mb-2 tracking-wide">
            Message
          </label>
          <textarea
            id="message"
            name="message"
            rows={4}
            required
            disabled={isPending}
            placeholder="Décrivez votre projet..."
            className="w-full px-4 py-3 rounded-xl bg-slate-900/50 border border-slate-700/50 
                     text-white placeholder-slate-500 resize-none
                     focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20
                     transition-all duration-300 backdrop-blur-sm
                     disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isPending}
          className="relative w-full py-3.5 rounded-xl font-medium tracking-wide
                   bg-gradient-to-r from-cyan-500 via-blue-500 to-violet-500
                   text-white shadow-lg shadow-cyan-500/25
                   hover:shadow-cyan-500/40 hover:scale-[1.02]
                   active:scale-[0.98]
                   transition-all duration-300
                   disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100
                   overflow-hidden group"
        >
          <span className={`transition-opacity duration-200 ${isPending ? 'opacity-0' : 'opacity-100'}`}>
            Envoyer le message
          </span>
          {isPending && (
            <span className="absolute inset-0 flex items-center justify-center">
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="ml-2">Envoi en cours...</span>
            </span>
          )}
        </button>

        {/* Feedback Message */}
        {feedback && (
          <div
            className={`p-4 rounded-xl text-sm font-medium text-center backdrop-blur-sm
                      transition-all duration-300 animate-fadeIn
                      ${feedback.success 
                        ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400' 
                        : 'bg-red-500/10 border border-red-500/30 text-red-400'
                      }`}
          >
            {feedback.message}
          </div>
        )}
      </form>
    </div>
  );
}

