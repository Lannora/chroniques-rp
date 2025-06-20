import CreateCharacterForm from "@/app/components/CreateCharacterForm";

export default function CreateCharacterPage() {
  return (
    <main className="flex min-h-screen flex-col items-center p-8 bg-gray-900 text-white">
      <h1 className="text-4xl font-bold mb-8">Nouveau Personnage</h1>
      <CreateCharacterForm />
    </main>
  );
}