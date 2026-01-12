import { createClient } from "@/supabase/server";
import { ReportEditor } from "@/components/reports/report-editor";
import { redirect } from "next/navigation";

export default async function EditReportPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return redirect("/sign-in");

  const [
    { data: teams }, 
    { data: competitions },
    { data: report }
  ] = await Promise.all([
    supabase.from("teams").select("*").order("name"),
    supabase.from("competitions").select("*").order("name"),
    supabase.from("reports").select("*").eq("id", params.id).single()
  ]);

  if (!report) return <div>Report not found</div>;

  return (
    <div className="container mx-auto px-4 sm:px-6 py-8">
      <ReportEditor teams={teams || []} competitions={competitions || []} userId={user.id} initialData={report} />
    </div>
  );
}
