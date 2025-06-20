"use client";

import { supabase } from '@/lib/supabaseClient';

export default function LoginButton() {

    async function signInWithDiscord() {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'discord',
            options: {
                redirectTo: `${location.origin}/auth/callback`,
            }
        });

        if (error) {
            console.error("Erreur lors de la connexion Discord", error);
        }
    }

    return (
        <button 
            onClick={signInWithDiscord}
            className="rounded-lg bg-blue-600 px-6 py-3 font-bold text-white transition hover:bg-blue-700"
        >
            Se connecter avec Discord
        </button>
    );
}