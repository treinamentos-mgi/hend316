import { useJsonResource } from '../api/useJsonResource.js';
import { CapabilityCard } from './CapabilityCard.js';

type Entry = { teamName: string; totalPoints: number; rank: number };

export default function Leaderboard() {
  const { status, data } = useJsonResource<{ leaderboard: Entry[] }>('/api/leaderboard');
  const entries = data?.leaderboard ?? [];

  return (
    <CapabilityCard
      title="Placar"
      description="Compare a pontuação total das equipes."
      status={status}
      isEmpty={entries.length === 0}
      emptyMessage="Sem placar disponível até o momento."
    >
      <table className="table">
        <thead>
          <tr><th scope="col">Posição</th><th scope="col">Equipe</th><th scope="col">Pontos</th></tr>
        </thead>
        <tbody>
          {entries.map((entry) => (
            <tr key={entry.rank}><td>{entry.rank}</td><td>{entry.teamName}</td><td>{entry.totalPoints}</td></tr>
          ))}
        </tbody>
      </table>
    </CapabilityCard>
  );
}
