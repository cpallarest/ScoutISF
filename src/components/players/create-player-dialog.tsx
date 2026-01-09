"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Plus, AlertTriangle } from "lucide-react";
import { createClient } from "@/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";

export function CreatePlayerDialog({
  onPlayerCreated,
}: {
  onPlayerCreated?: (player: any) => void;
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [dob, setDob] = useState("");
  const [nationality, setNationality] = useState("");
  const [foot, setFoot] = useState(""); // <- sin <string>
  const [position, setPosition] = useState("");

  const [checking, setChecking] = useState(false);
  const [duplicates, setDuplicates] = useState<any[]>([]);
  const [showDuplicates, setShowDuplicates] = useState(false);

  const supabase = createClient();
  const { toast } = useToast();
  const router = useRouter();

  const checkDuplicates = async () => {
    if (!name) return;
    setChecking(true);

    const { data } = await supabase
      .from("players")
      .select("*")
      .ilike("name", `%${name}%`)
      .limit(5);

    setChecking(false);

    if (data && data.length > 0) {
      setDuplicates(data);
      setShowDuplicates(true);
    } else {
      createPlayer();
    }
  };

  const createPlayer = async () => {
    // Normaliza foot para evitar valores raros
    const normalizedFoot =
      foot === "Left" || foot === "Right" || foot === "Both" ? foot : null;

    const { data, error } = await supabase
      .from("players")
      .insert({
        name,
        dob: dob || null,
        nationality: nationality || null,
        foot: normalizedFoot,
        position: position || null,
      })
      .select()
      .single();

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    toast({ title: "Success", description: "Player created successfully" });
    setOpen(false);
    resetForm();

    if (onPlayerCreated) {
      onPlayerCreated(data);
    } else {
      router.refresh();
    }
  };

  const resetForm = () => {
    setName("");
    setDob("");
    setNationality("");
    setFoot("");
    setPosition("");
    setDuplicates([]);
    setShowDuplicates(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        setOpen(val);
        if (!val) resetForm();
      }}
    >
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create Player
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Player</DialogTitle>
        </DialogHeader>

        {!showDuplicates ? (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>
                Full Name <span className="text-red-500">*</span>
              </Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Lionel Messi"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Date of Birth</Label>
                <Input
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Nationality</Label>
                <Input
                  value={nationality}
                  onChange={(e) => setNationality(e.target.value)}
                  placeholder="e.g. Argentina"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Position</Label>
                <Input
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  placeholder="e.g. Forward"
                />
              </div>
              <div className="space-y-2">
                <Label>Dominant Foot</Label>
                <Select value={foot} onValueChange={setFoot}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select foot" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Right">Right</SelectItem>
                    <SelectItem value="Left">Left</SelectItem>
                    <SelectItem value="Both">Both</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button
              onClick={checkDuplicates}
              disabled={!name || checking}
              className="w-full mt-4"
            >
              {checking ? "Checking..." : "Create Player"}
            </Button>
          </div>
        ) : (
          <div className="space-y-4 py-4">
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-md p-4 flex gap-3 items-start">
              <AlertTriangle className="h-5 w-5 text-yellow-500 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-yellow-500">
                  Possible Duplicates Found
                </h4>
                <p className="text-sm text-muted-foreground mt-1">
                  We found existing players with similar names. Please check if
                  the player already exists.
                </p>
              </div>
            </div>

            <div className="border rounded-md divide-y max-h-[200px] overflow-y-auto">
              {duplicates.map((p) => (
                <div
                  key={p.id}
                  className="p-3 flex justify-between items-center"
                >
                  <div>
                    <div className="font-medium">{p.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {p.position || "No position"} •{" "}
                      {p.nationality || "No nationality"}
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setOpen(false);
                      resetForm();
                    }}
                  >
                    Use Existing
                  </Button>
                </div>
              ))}
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button variant="ghost" onClick={() => setShowDuplicates(false)}>
                Back
              </Button>
              <Button onClick={createPlayer}>Create Anyway</Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
