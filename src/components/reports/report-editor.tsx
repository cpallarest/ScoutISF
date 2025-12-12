"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MetadataForm } from "./metadata-form";
import { TacticalField } from "./tactical-field";
import { PlayerEvaluation } from "./player-evaluation";
import { createClient } from "../../../supabase/client";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";

interface ReportEditorProps {
  teams: any[];
  competitions: any[];
  userId: string;
  initialData?: any;
}

export function ReportEditor({ teams, competitions, userId, initialData }: ReportEditorProps) {
  const [step, setStep] = useState("metadata");
  const [reportId, setReportId] = useState(initialData?.id || null);
  const [reportData, setReportData] = useState(initialData || {
    match_date: new Date().toISOString().split('T')[0],
    home_team_id: "",
    away_team_id: "",
    competition_id: "",
    home_score: 0,
    away_score: 0,
    status: "draft",
    lineup_data: []
  });
  const [saving, setSaving] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const supabase = createClient();

  const handleSave = async (data: any, nextStep?: string) => {
    setSaving(true);
    try {
      const dataToSave = { ...reportData, ...data, user_id: userId };
      
      let result;
      if (reportId) {
        result = await supabase.from("reports").update(dataToSave).eq("id", reportId).select().single();
      } else {
        result = await supabase.from("reports").insert(dataToSave).select().single();
      }

      if (result.error) throw result.error;

      setReportData(result.data);
      setReportId(result.data.id);

      if (nextStep) {
        setStep(nextStep);
      } else {
        toast({ title: "Saved", description: "Report saved successfully" });
      }
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    await handleSave({ status: "published" });
    router.push("/dashboard/reports");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold font-display">
          {initialData ? "Edit Report" : "New Report"}
        </h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.back()}>Cancel</Button>
          <Button onClick={() => handleSave(reportData)} disabled={saving}>
            {saving ? "Saving..." : "Save Draft"}
          </Button>
          <Button variant="default" className="bg-primary text-primary-foreground" onClick={handlePublish}>
            Publish
          </Button>
        </div>
      </div>

      <Tabs value={step} onValueChange={setStep} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="metadata">1. Match Metadata</TabsTrigger>
          <TabsTrigger value="tactical" disabled={!reportId}>2. Tactical Field</TabsTrigger>
          <TabsTrigger value="evaluation" disabled={!reportId}>3. Player Evaluation</TabsTrigger>
        </TabsList>
        
        <TabsContent value="metadata" className="mt-6">
          <Card>
            <CardContent className="pt-6">
              <MetadataForm 
                teams={teams} 
                competitions={competitions} 
                data={reportData} 
                onSave={(data) => handleSave(data, "tactical")} 
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="tactical" className="mt-6">
          <Card>
            <CardContent className="pt-6">
              <TacticalField 
                data={reportData} 
                onSave={(data) => handleSave({ lineup_data: data }, "evaluation")} 
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="evaluation" className="mt-6">
          <Card>
            <CardContent className="pt-6">
              <PlayerEvaluation 
                reportId={reportId} 
                onComplete={() => router.push("/dashboard/reports")}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
