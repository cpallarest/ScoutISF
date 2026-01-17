import { createClient } from "@/supabase/server";
import { Plus } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { format } from "date-fns";

export default async function FeaturedFieldsPage() {
  const supabase = createClient();
  const { data: user } = await supabase.auth.getUser();

  const { data: fields } = await supabase
    .from("featured_fields")
    .select("*")
    .eq("user_id", user.user?.id || "")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Featured Fields</h1>
        <Link href="/dashboard/featured/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Featured Field
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {fields?.map((field) => (
          <Link key={field.id} href={`/dashboard/featured/${field.id}`}>
            <Card className="hover:bg-accent/50 transition-colors cursor-pointer h-full">
              <CardHeader>
                <CardTitle>{field.name}</CardTitle>
                <CardDescription>System: {field.system}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground">
                  Created {format(new Date(field.created_at), "PPP")}
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
        {fields?.length === 0 && (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            No featured fields found. Create one to get started.
          </div>
        )}
      </div>
    </div>
  );
}
