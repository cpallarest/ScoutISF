"use client";

import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface MetadataFormProps {
  teams: any[];
  competitions: any[];
  data: any;
  onSave: (data: any) => void;
}

export function MetadataForm({ teams, competitions, data, onSave }: MetadataFormProps) {
  const { register, handleSubmit, setValue, watch } = useForm({
    defaultValues: data
  });

  const onSubmit = (formData: any) => {
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="match_date">Match Date</Label>
          <Input id="match_date" type="date" {...register("match_date", { required: true })} />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="competition_id">Competition</Label>
          <Select 
            onValueChange={(value) => setValue("competition_id", value)} 
            defaultValue={data.competition_id}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select competition" />
            </SelectTrigger>
            <SelectContent>
              {competitions.map((comp) => (
                <SelectItem key={comp.id} value={comp.id}>
                  {comp.name} ({comp.season})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="home_team_id">Home Team</Label>
          <Select 
            onValueChange={(value) => setValue("home_team_id", value)} 
            defaultValue={data.home_team_id}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select home team" />
            </SelectTrigger>
            <SelectContent>
              {teams.map((team) => (
                <SelectItem key={team.id} value={team.id}>
                  {team.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="away_team_id">Away Team</Label>
          <Select 
            onValueChange={(value) => setValue("away_team_id", value)} 
            defaultValue={data.away_team_id}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select away team" />
            </SelectTrigger>
            <SelectContent>
              {teams.map((team) => (
                <SelectItem key={team.id} value={team.id}>
                  {team.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="home_score">Home Score</Label>
          <Input id="home_score" type="number" min="0" {...register("home_score", { valueAsNumber: true })} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="away_score">Away Score</Label>
          <Input id="away_score" type="number" min="0" {...register("away_score", { valueAsNumber: true })} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="halftime_home_score">HT Home Score</Label>
          <Input id="halftime_home_score" type="number" min="0" {...register("halftime_home_score", { valueAsNumber: true })} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="halftime_away_score">HT Away Score</Label>
          <Input id="halftime_away_score" type="number" min="0" {...register("halftime_away_score", { valueAsNumber: true })} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="venue">Venue</Label>
          <Input id="venue" {...register("venue")} placeholder="Stadium name" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="referee">Referee</Label>
          <Input id="referee" {...register("referee")} placeholder="Referee name" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="conditions">Conditions</Label>
          <Input id="conditions" {...register("conditions")} placeholder="Weather, pitch state..." />
        </div>

        <div className="space-y-2">
          <Label htmlFor="home_system">Home System</Label>
          <Input id="home_system" {...register("home_system")} placeholder="e.g. 4-3-3" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="away_system">Away System</Label>
          <Input id="away_system" {...register("away_system")} placeholder="e.g. 4-4-2" />
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit">Next: Tactical Field</Button>
      </div>
    </form>
  );
}
