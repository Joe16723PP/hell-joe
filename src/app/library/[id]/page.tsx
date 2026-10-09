import { ExerciseLibraryMove } from "@/components/exercise-screen";
import { LibraryMove } from "@/components/move-screen";
import { getExercise } from "@/lib/exercise";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (getExercise(id)) return <ExerciseLibraryMove id={id} />;
  return <LibraryMove stretchId={id} />;
}
