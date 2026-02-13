import SnakeGame from "@/components/SnakeGame";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 flex flex-col items-center justify-center">
      <h1 className="text-3xl font-bold text-white mb-6 font-mono">Snake</h1>
      <SnakeGame />
    </main>
  );
}
