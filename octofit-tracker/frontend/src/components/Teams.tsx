import { useJsonResource } from '../api/useJsonResource.js';
import { CapabilityCard } from './CapabilityCard.js';

type Team = { name: string; mascot?: string; members?: unknown[] };

export default function Teams() {
  const { status, data } = useJsonResource<{ teams: Team[] }>('/api/teams');
  const teams = data?.teams ?? [];

  return (
    <CapabilityCard
      title="Equipes"
      description="Gerencie equipes e integrantes."
      status={status}
      isEmpty={teams.length === 0}
      emptyMessage="Sem equipes cadastradas ainda."
    >
      <table className="table">
        <thead>
          <tr><th scope="col">Equipe</th><th scope="col">Mascote</th><th scope="col">Integrantes</th></tr>
        </thead>
        <tbody>
          {teams.map((team, index) => (
            <tr key={index}><td>{team.name}</td><td>{team.mascot ?? '—'}</td><td>{team.members?.length ?? 0}</td></tr>
          ))}
        </tbody>
      </table>
    </CapabilityCard>
  );
}
