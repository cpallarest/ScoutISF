import { createClient } from "@/supabase/server";
import { redirect } from "next/navigation";
import { NewReportForm } from "@/components/reports/new-report-form";

export default async function NewReportPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return redirect("/sign-in");

  return (
    <div className="container mx-auto px-4 sm:px-6 py-8">
      <NewReportForm />
    </div>
  );
}
