import { createClient } from "@/supabase/server";
import { ImportReportsCard } from "@/components/import/import-reports-card";
import { redirect } from "next/navigation";

export default async function ImportPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in");
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-display tracking-tight text-foreground">Import Data</h1>
        <p className="text-muted-foreground mt-1">
          Bulk import tools for historical data migration.
        </p>
      </div>

      <ImportReportsCard />
    </div>
  );
}
