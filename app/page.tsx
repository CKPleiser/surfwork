import { getActiveJobs } from "./actions/jobs";
import { HomeClient } from "./HomeClient";

export default async function HomePage() {
  const jobs = await getActiveJobs();

  return <HomeClient initialJobs={jobs} />;
}
