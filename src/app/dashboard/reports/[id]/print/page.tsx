import { createClient } from "@/supabase/server";
import { redirect } from "next/navigation";

export default async function PrintReportPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return redirect("/sign-in");

  const { data: report } = await supabase.from("reports").select(`
    *,
    home_team:teams!reports_home_team_id_fkey(*),
    away_team:teams!reports_away_team_id_fkey(*),
    competition:competitions(*),
    report_players(*, player:players(*))
  `).eq("id", params.id).single();

  if (!report) return <div>Report not found</div>;

  return (
    <div className="bg-white text-black min-h-screen p-8 max-w-[210mm] mx-auto print:p-0 print:max-w-none font-sans">
      <script dangerouslySetInnerHTML={{ __html: 'window.print();' }} />
      
      {/* Header */}
      <div className="border-b-2 border-black pb-4 mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-bold uppercase tracking-tighter">ScoutPro Report</h1>
          <p className="text-sm text-gray-600 mt-1">Generated on {new Date().toLocaleDateString()}</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold">{report.home_team?.name} vs {report.away_team?.name}</div>
          <div className="text-sm text-gray-600">{new Date(report.match_date).toLocaleDateString()} • {report.competition?.name}</div>
        </div>
      </div>

      {/* Match Info */}
      <div className="grid grid-cols-4 gap-4 mb-8 border-b border-gray-200 pb-8">
        <div>
          <div className="text-xs uppercase text-gray-500 font-bold">Score</div>
          <div className="text-xl font-mono">{report.home_score} - {report.away_score}</div>
          <div className="text-xs text-gray-500 mt-1">HT: {report.halftime_home_score} - {report.halftime_away_score}</div>
        </div>
        <div>
          <div className="text-xs uppercase text-gray-500 font-bold">Competition</div>
          <div className="text-lg">{report.competition?.name}</div>
          <div className="text-xs text-gray-500">{report.competition?.season}</div>
        </div>
        <div>
          <div className="text-xs uppercase text-gray-500 font-bold">Venue</div>
          <div className="text-lg">{report.venue || "-"}</div>
          <div className="text-xs text-gray-500">{report.conditions || "-"}</div>
        </div>
        <div>
          <div className="text-xs uppercase text-gray-500 font-bold">Referee</div>
          <div className="text-lg">{report.referee || "-"}</div>
          <div className="text-xs text-gray-500">Scout: {user.email}</div>
        </div>
      </div>

      {/* Systems */}
      <div className="grid grid-cols-2 gap-8 mb-8">
        <div>
          <div className="text-xs uppercase text-gray-500 font-bold mb-1">Home System</div>
          <div className="text-lg font-mono">{report.home_system || "-"}</div>
        </div>
        <div>
          <div className="text-xs uppercase text-gray-500 font-bold mb-1">Away System</div>
          <div className="text-lg font-mono">{report.away_system || "-"}</div>
        </div>
      </div>

      {/* Tactical Field */}
      <div className="mb-8 break-inside-avoid">
        <h2 className="text-xl font-bold mb-4 uppercase border-l-4 border-black pl-3">Tactical Lineups</h2>
        
        <div className="grid grid-cols-2 gap-4">
          {/* Home Team Pitch */}
          <div>
            <div className="text-sm font-bold mb-2 text-center">{report.home_team?.name}</div>
            <div className="aspect-[2/3] bg-green-50 rounded-lg relative overflow-hidden border border-black/10 print:border-black">
               {/* Pitch Markings */}
               <div className="absolute inset-4 border-2 border-green-800/20 rounded-sm"></div>
               <div className="absolute top-1/2 left-0 right-0 h-px bg-green-800/20"></div>
               <div className="absolute top-1/2 left-1/2 w-24 h-24 border-2 border-green-800/20 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
               
               {report.lineup_data?.home && (report.lineup_data.home as any[]).map((p: any) => (
                 <div 
                   key={p.id}
                   className="absolute flex flex-col items-center transform -translate-x-1/2 -translate-y-1/2"
                   style={{ left: `${p.x}%`, top: `${p.y}%` }}
                 >
                   <div className="w-5 h-5 bg-black text-white rounded-full flex items-center justify-center text-[10px] font-bold border border-white print:bg-black print:text-white">
                     {p.dorsal}
                   </div>
                   <div className="mt-0.5 bg-white/80 text-black text-[8px] px-1 rounded text-center font-bold border border-gray-200 whitespace-nowrap">
                     {p.name}
                   </div>
                 </div>
               ))}
            </div>
          </div>

          {/* Away Team Pitch */}
          <div>
            <div className="text-sm font-bold mb-2 text-center">{report.away_team?.name}</div>
            <div className="aspect-[2/3] bg-green-50 rounded-lg relative overflow-hidden border border-black/10 print:border-black">
               {/* Pitch Markings */}
               <div className="absolute inset-4 border-2 border-green-800/20 rounded-sm"></div>
               <div className="absolute top-1/2 left-0 right-0 h-px bg-green-800/20"></div>
               <div className="absolute top-1/2 left-1/2 w-24 h-24 border-2 border-green-800/20 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
               
               {report.lineup_data?.away && (report.lineup_data.away as any[]).map((p: any) => (
                 <div 
                   key={p.id}
                   className="absolute flex flex-col items-center transform -translate-x-1/2 -translate-y-1/2"
                   style={{ left: `${p.x}%`, top: `${p.y}%` }}
                 >
                   <div className="w-5 h-5 bg-white text-black rounded-full flex items-center justify-center text-[10px] font-bold border border-black print:bg-white print:text-black">
                     {p.dorsal}
                   </div>
                   <div className="mt-0.5 bg-white/80 text-black text-[8px] px-1 rounded text-center font-bold border border-gray-200 whitespace-nowrap">
                     {p.name}
                   </div>
                 </div>
               ))}
            </div>
          </div>
        </div>
      </div>

      {/* Player Evaluations */}
      <div className="break-inside-avoid">
        <h2 className="text-xl font-bold mb-4 uppercase border-l-4 border-black pl-3">Player Evaluations</h2>
        <table className="w-full text-sm text-left border-collapse">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b-2 border-black">
            <tr>
              <th className="px-4 py-3">Player</th>
              <th className="px-4 py-3">Pos</th>
              <th className="px-4 py-3">Grade</th>
              <th className="px-4 py-3">Verdict</th>
              <th className="px-4 py-3 w-1/2">Comments</th>
            </tr>
          </thead>
          <tbody>
            {report.report_players.map((rp: any) => (
              <tr key={rp.id} className="border-b border-gray-200">
                <td className="px-4 py-3 font-medium">
                  {rp.player.name}
                  <div className="text-xs text-gray-500">{rp.player.position}</div>
                </td>
                <td className="px-4 py-3 font-mono">{rp.position_in_match || "-"}</td>
                <td className="px-4 py-3 font-mono font-bold">{rp.grade || "-"}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded text-xs font-bold border ${
                    rp.verdict === 'Fichar' ? 'bg-black text-white border-black' :
                    rp.verdict === 'Interesante' ? 'bg-gray-200 text-black border-gray-400' :
                    'bg-white text-gray-500 border-gray-200'
                  }`}>
                    {rp.verdict || "-"}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-600">{rp.comment}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="mt-12 pt-4 border-t border-gray-200 text-center text-xs text-gray-400">
        Generated by ScoutPro Platform
      </div>
    </div>
  );
}
