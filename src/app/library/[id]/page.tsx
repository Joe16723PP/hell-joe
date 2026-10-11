import { ExerciseLibraryMove } from "@/components/exercise-screen";
import { LibraryMove } from "@/components/move-screen";
import { STRETCHES } from "@/lib/catalog";
import { EXERCISE_MOVES, getExercise } from "@/lib/exercise";

export const dynamicParams = false;

export function generateStaticParams() {
  const ids = new Set([
    ...STRETCHES.map((stretch) => stretch.id),
    ...EXERCISE_MOVES.map((move) => move.id),
  ]);
  return [...ids].map((id) => ({ id }));
}

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (getExercise(id)) return <ExerciseLibraryMove id={id} />;
  return <LibraryMove stretchId={id} />;
}
