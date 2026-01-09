"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Upload, AlertCircle, CheckCircle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export function ImportReportsCard() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<any>(null);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setResult(null);
      setProgress(0);
    }
  };

  const handleImport = async () => {
    if (!file) return;

    setLoading(true);
    setProgress(10); // Start progress

    try {
      const formData = new FormData();
      formData.append("file", file);

      // Simulate progress for UX since we don't have real streaming progress from the API yet
      const interval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 5, 90));
      }, 500);

      const response = await fetch("/api/import/reports", {
        method: "POST",
        body: formData,
      });

      clearInterval(interval);
      setProgress(100);

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Import failed");
      }

      setResult(data);
      toast({
        title: "Import Successful",
        description: `Imported ${data.importedReports} reports and ${data.importedEvaluations} evaluations.`,
        variant: "default",
      });
    } catch (error: any) {
      toast({
        title: "Import Failed",
        description: error.message,
        variant: "destructive",
      });
      setResult({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto border-none bg-card/50">
      <CardHeader>
        <CardTitle className="text-2xl font-display">Import Reports (CSV)</CardTitle>
        <CardDescription>
          Upload a CSV file to bulk import historical scouting reports.
          The file must use semicolon (;) separators.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="file">CSV File</Label>
          <div className="flex gap-4">
            <Input
              id="file"
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              disabled={loading}
              className="file:text-foreground"
            />
          </div>
        </div>

        {loading && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Processing...</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} />
          </div>
        )}

        {result && result.success && (
          <Alert className="bg-green-500/10 border-green-500/20 text-green-500">
            <CheckCircle className="h-4 w-4" />
            <AlertTitle>Success</AlertTitle>
            <AlertDescription>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Reports created: {result.importedReports}</li>
                <li>Players created: {result.importedPlayers}</li>
                <li>Evaluations added: {result.importedEvaluations}</li>
                {result.errors.length > 0 && (
                  <li className="text-amber-500">
                    {result.errors.length} warnings (check console or below)
                  </li>
                )}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {result && result.errors && result.errors.length > 0 && (
          <div className="max-h-60 overflow-y-auto p-4 bg-destructive/10 rounded-md text-sm">
            <h4 className="font-semibold text-destructive mb-2 flex items-center gap-2">
              <AlertCircle className="h-4 w-4" /> Import Warnings/Errors
            </h4>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              {result.errors.map((err: string, i: number) => (
                <li key={i}>{err}</li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleImport} 
          disabled={!file || loading} 
          className="w-full sm:w-auto"
        >
          {loading ? (
            <>Processing...</>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" /> Start Import
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
