
import LoginButton from "./components/LoginButton";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-900 text-white">
      <div className="text-center">
        <h1 className="text-4xl font-bold">Bienvenue sur Chronique RP</h1>
        <p className="mt-2 text-lg text-gray-300">
          Connectez-vous pour commencer à écrire l'histoire de votre personnage.
        </p>
      </div>
      <div className="mt-8">
        <LoginButton />
      </div>
    </main>
  );
}
